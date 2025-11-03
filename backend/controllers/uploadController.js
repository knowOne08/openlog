import { supabaseClient } from '../config/db.js';
import { uploadFile, deleteFile } from '../utils/minio.js';
import { upsertEmbedding, deleteEmbedding } from '../utils/qdrant-skeleton.js';
import { v4 as uuidv4 } from 'uuid';
import { index as meiliIndex } from '../utils/meili.js';
import fetch from 'node-fetch';

// Simulate summary, extraction, embedding generation with dummy functions
async function extractText(fileBuffer, mimetype) {
    return 'This will be covered in future versions'; // Replace with your logic
}

async function generateSummary(text) {
    return 'This is an AI-generated summary of the file.'; // Replace with LLM call
}

/**
 * Calls the local Python embedding microservice to get a 768-dim embedding for the given text.
 * Handles chunking and averaging in the Python service.
 * @param {string} text - The text to embed (e.g., description)
 * @returns {Promise<number[]>} - 768-dim embedding array
 */
async function generateEmbedding(text) {
    const EMBED_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:8000/embed';
    try {
        const response = await fetch(EMBED_SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!response.ok) {
            throw new Error(`Embedding service error: ${response.status} ${await response.text()}`);
        }
        const data = await response.json();
        if (!data.embedding || !Array.isArray(data.embedding) || data.embedding.length !== 768) {
            throw new Error('Invalid embedding returned from service');
        }
        return data.embedding;
    } catch (err) {
        console.error('Embedding service call failed:', err);
        throw err;
    }
}

/**
 * Transactional file upload with comprehensive rollback mechanism
 * Handles failures across MinIO, Supabase, Qdrant, and tag operations
 */
async function handleFileMetaData({ title, description, file, ownerId, visibility, tags }) {
    // Transaction state tracking
    const transaction = {
        id: uuidv4(),
        steps: [],
        rollbackActions: [],
        startTime: Date.now(),
        stepTimes: {}
    };

    console.log(`🔄 Starting transaction ${transaction.id} for file: ${file.originalname}`);
    console.log(`📊 File size: ${(file.size / 1024).toFixed(2)}KB, Type: ${file.mimetype}`);

    try {
        // Step 1: Validate inputs
        const stepStart = Date.now();
        console.log('📋 [Step 1] Validating inputs...');

        // Enhanced validation with specific error messages
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            throw new Error('Validation Error: Title is required and must be a non-empty string');
        }

        if (!file || !file.buffer || !file.originalname) {
            throw new Error('Validation Error: Valid file is required');
        }

        if (!ownerId || typeof ownerId !== 'string' || ownerId.trim().length === 0) {
            throw new Error('Validation Error: Owner ID is required and must be a valid string');
        }

        // Validate owner_id format (should be UUID or specific format)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (ownerId !== 'test' && !uuidRegex.test(ownerId)) {
            throw new Error('Validation Error: Owner ID must be a valid UUID format or "test"');
        }

        if (!visibility || !['public', 'private'].includes(visibility)) {
            throw new Error('Validation Error: Visibility must be either "public" or "private"');
        }

        // Validate and parse tags
        let parsedTags = [];
        if (tags) {
            try {
                if (typeof tags === 'string') {
                    parsedTags = JSON.parse(tags);
                } else if (Array.isArray(tags)) {
                    parsedTags = tags;
                } else {
                    throw new Error('Tags must be a JSON string or array');
                }

                if (!Array.isArray(parsedTags)) {
                    throw new Error('Tags must be a valid JSON array');
                }

                // Validate each tag
                for (const tag of parsedTags) {
                    if (typeof tag !== 'string' || tag.trim().length === 0) {
                        throw new Error('Each tag must be a non-empty string');
                    }
                }
            } catch (tagError) {
                throw new Error(`Validation Error: Invalid tags format - ${tagError.message}`);
            }
        }

        transaction.steps.push('validation');
        transaction.stepTimes.validation = Date.now() - stepStart;
        console.log(`✅ Validation completed in ${transaction.stepTimes.validation}ms`);

        // Step 2: Generate AI content (non-destructive operations first)
        const aiStepStart = Date.now();
        console.log('🤖 [Step 2] Generating AI content...');
        const objectName = `${Date.now()}_${file.originalname}`;
        const extracted_text = await extractText(file.buffer, file.mimetype);
        const ai_summary = await generateSummary(extracted_text);
        const embedding = await generateEmbedding(ai_summary);

        transaction.steps.push('qudrant_metadata_processing');
        transaction.stepTimes.ai_processing = Date.now() - aiStepStart;
        console.log(`✅ AI content generated in ${transaction.stepTimes.ai_processing}ms`);

        // Step 3: Upload to MinIO
        const minioStepStart = Date.now();
        console.log('📤 [Step 3] Uploading to MinIO...');

        try {
            await uploadFile(file.buffer, objectName, file.mimetype);
        } catch (minioError) {
            console.error('MinIO upload error:', minioError);
            throw new Error(`MinIO Error: Failed to upload file - ${minioError.message}`);
        }

        transaction.steps.push('minio_upload');
        transaction.rollbackActions.push({
            action: 'delete_minio',
            data: { objectName }
        });
        transaction.stepTimes.minio_upload = Date.now() - minioStepStart;
        console.log(`✅ File uploaded to MinIO in ${transaction.stepTimes.minio_upload}ms: ${objectName}`);

        // Step 4: Create database record
        const dbStepStart = Date.now();
        console.log('💾 [Step 4] Creating database record...');
        const uploadId = uuidv4();
        const { data: supabaseRecord, error: supabaseError } = await supabaseClient
            .from('uploads')
            .insert([{
                id: uploadId,
                title,
                description,
                file_type: 'local_file',
                file_path: objectName,
                file_size: file.size,
                mime_type: file.mimetype,
                owner_id: ownerId,
                visibility,
                embeddings: embedding,
                extracted_text,
            }])
            .select()
            .single();

        if (supabaseError || !supabaseRecord) {
            throw new Error(`Database Error: ${supabaseError?.message || 'Failed to insert upload metadata'}`);
        }

        transaction.steps.push('database_insert');
        transaction.rollbackActions.push({
            action: 'delete_database',
            data: { uploadId: supabaseRecord.id }
        });
        transaction.stepTimes.database_insert = Date.now() - dbStepStart;
        console.log(`✅ Database record created in ${transaction.stepTimes.database_insert}ms: ${supabaseRecord.id}`);

        // Step 5: Store embeddings in Qdrant
        const qdrantStepStart = Date.now();
        console.log('🔍 [Step 5] Storing embeddings in Qdrant...');
        const qdrantResult = await upsertEmbedding(
            supabaseRecord.id,
            embedding,
            {
                title,
                description,
                owner_id: ownerId,
                tags: parsedTags,
                file_type: 'local_file',
                mime_type: file.mimetype
            }
        );

        transaction.steps.push('qdrant_upsert');
        transaction.rollbackActions.push({
            action: 'delete_qdrant',
            data: { uploadId: supabaseRecord.id }
        });
        transaction.stepTimes.qdrant_upsert = Date.now() - qdrantStepStart;
        console.log(`✅ Embeddings stored in Qdrant in ${transaction.stepTimes.qdrant_upsert}ms`);

        // Step 6: Process tags (with atomic operations)
        const tagsStepStart = Date.now();
        console.log('🏷️ [Step 6] Processing tags...');
        const tagOperations = [];

        if (parsedTags.length > 0) {
            for (const tagName of parsedTags) {
                try {
                    // Upsert tag
                    const { data: tagData, error: tagError } = await supabaseClient
                        .from('tags')
                        .upsert({ name: tagName.trim() })
                        .select('id')
                        .single();

                    if (tagError || !tagData) {
                        console.warn(`Warning: Failed to upsert tag "${tagName}": ${tagError?.message}`);
                        continue;
                    }

                    // Link tag to upload
                    const { error: linkError } = await supabaseClient
                        .from('upload_tags')
                        .upsert({
                            upload_id: supabaseRecord.id,
                            tag_id: tagData.id
                        });

                    if (linkError) {
                        console.warn(`Warning: Failed to link tag "${tagName}": ${linkError.message}`);
                        continue;
                    }

                    tagOperations.push({
                        tag_name: tagName,
                        tag_id: tagData.id,
                        upload_id: supabaseRecord.id
                    });

                } catch (tagError) {
                    console.warn(`Warning: Error processing tag "${tagName}": ${tagError.message}`);
                }
            }

            transaction.steps.push('tags_processed');
            transaction.rollbackActions.push({
                action: 'delete_tags',
                data: { uploadId: supabaseRecord.id }
            });
        }

        transaction.stepTimes.tags_processed = Date.now() - tagsStepStart;
        console.log(`✅ Processed ${tagOperations.length}/${parsedTags.length} tags in ${transaction.stepTimes.tags_processed}ms`);

        // Step 7: Transaction completion
        const totalTime = Date.now() - transaction.startTime;
        console.log(`🎉 Transaction ${transaction.id} completed successfully in ${totalTime}ms`);
        console.log(`📊 Step breakdown:`, transaction.stepTimes);
        console.log(`🔗 Steps completed: ${transaction.steps.join(' → ')}`);

        // Step 8: Index in MeiliSearch
        try {
            await meiliIndex.addDocuments([
                {
                    id: supabaseRecord.id,
                    title,
                    description,
                    file_type: 'local_file',
                    file_path: objectName,
                    file_size: file.size,
                    mime_type: file.mimetype,
                    owner_id: ownerId,
                    visibility,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    tags: parsedTags
                }
            ]);
            console.log(`🔎 Indexed file ${supabaseRecord.id} in MeiliSearch`);
        } catch (meiliError) {
            console.error(`MeiliSearch indexing failed for file ${supabaseRecord.id}:`, meiliError);
        }

        return {
            ...supabaseRecord,
            transaction_id: transaction.id,
            processed_tags: tagOperations.length,
            ai_summary,
            steps_completed: transaction.steps,
            performance: {
                total_time_ms: totalTime,
                step_times: transaction.stepTimes
            }
        };

    } catch (error) {
        const failureTime = Date.now() - transaction.startTime;
        console.error(`❌ Transaction ${transaction.id} failed after ${failureTime}ms at step: ${transaction.steps[transaction.steps.length - 1] || 'unknown'}`);
        console.error('Error details:', error.message);
        console.error('Step times before failure:', transaction.stepTimes);

        // Execute rollback operations in reverse order
        await executeRollback(transaction, 'file upload');

        // Throw categorized error
        throw categorizationError(error, transaction.steps);
    }
}

/**
 * Transactional link upload with comprehensive rollback mechanism
 */
async function handleLinkMetadata({ title, description, url, ownerId, visibility, tags }) {
    // Transaction state tracking
    const transaction = {
        id: uuidv4(),
        steps: [],
        rollbackActions: [],
        startTime: Date.now(),
        stepTimes: {}
    };

    console.log(`🔄 Starting link transaction ${transaction.id} for URL: ${url}`);

    try {
        // Step 1: Validate inputs
        const stepStart = Date.now();
        console.log('📋 [Step 1] Validating inputs...');
        if (!title || !url || !ownerId || !visibility) {
            throw new Error('Missing required fields: title, url, ownerId, or visibility');
        }

        const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags || "[]");
        if (!Array.isArray(parsedTags)) {
            throw new Error('Tags must be a valid JSON array');
        }

        transaction.steps.push('validation');
        transaction.stepTimes.validation = Date.now() - stepStart;
        console.log(`✅ Validation completed in ${transaction.stepTimes.validation}ms`);

        // Step 2: Generate AI content
        const aiStepStart = Date.now();
        console.log('🤖 [Step 2] Generating AI content...');
        const extracted_text = 'This will be implemented in future releases';
        const ai_summary = await generateSummary(description);
        const embedding = await generateEmbedding(ai_summary);

        transaction.steps.push('ai_processing');
        transaction.stepTimes.ai_processing = Date.now() - aiStepStart;
        console.log(`✅ AI content generated in ${transaction.stepTimes.ai_processing}ms`);

        // Step 3: Create database record
        const dbStepStart = Date.now();
        console.log('💾 [Step 3] Creating database record...');
        const uploadId = uuidv4();
        const { data: supabaseRecord, error: supabaseError } = await supabaseClient
            .from('uploads')
            .insert([{
                id: uploadId,
                title,
                description,
                file_type: 'link',
                external_url: url,
                file_size: null,
                mime_type: null,
                owner_id: ownerId,
                visibility,
                embeddings: embedding,
                extracted_text,
            }])
            .select()
            .single();

        if (supabaseError || !supabaseRecord) {
            throw new Error(`Database Error: ${supabaseError?.message || 'Failed to insert link metadata'}`);
        }

        transaction.steps.push('database_insert');
        transaction.rollbackActions.push({
            action: 'delete_database',
            data: { uploadId: supabaseRecord.id }
        });
        transaction.stepTimes.database_insert = Date.now() - dbStepStart;
        console.log(`✅ Database record created in ${transaction.stepTimes.database_insert}ms: ${supabaseRecord.id}`);

        // Step 4: Store embeddings in Qdrant
        const qdrantStepStart = Date.now();
        console.log('🔍 [Step 4] Storing embeddings in Qdrant...');
        await upsertEmbedding(
            supabaseRecord.id,
            embedding,
            {
                title,
                description,
                owner_id: ownerId,
                tags: parsedTags,
                file_type: 'link',
                external_url: url
            }
        );

        transaction.steps.push('qdrant_upsert');
        transaction.rollbackActions.push({
            action: 'delete_qdrant',
            data: { uploadId: supabaseRecord.id }
        });
        transaction.stepTimes.qdrant_upsert = Date.now() - qdrantStepStart;
        console.log(`✅ Embeddings stored in Qdrant in ${transaction.stepTimes.qdrant_upsert}ms`);

        // Step 5: Process tags
        const tagsStepStart = Date.now();
        console.log('🏷️ [Step 5] Processing tags...');
        const tagOperations = [];

        if (parsedTags.length > 0) {
            for (const tagName of parsedTags) {
                try {
                    const { data: tagData, error: tagError } = await supabaseClient
                        .from('tags')
                        .upsert({ name: tagName.trim() })
                        .select('id')
                        .single();

                    if (tagError || !tagData) {
                        console.warn(`Warning: Failed to upsert tag "${tagName}": ${tagError?.message}`);
                        continue;
                    }

                    const { error: linkError } = await supabaseClient
                        .from('upload_tags')
                        .upsert({
                            upload_id: supabaseRecord.id,
                            tag_id: tagData.id
                        });

                    if (linkError) {
                        console.warn(`Warning: Failed to link tag "${tagName}": ${linkError.message}`);
                        continue;
                    }

                    tagOperations.push({
                        tag_name: tagName,
                        tag_id: tagData.id,
                        upload_id: supabaseRecord.id
                    });

                } catch (tagError) {
                    console.warn(`Warning: Error processing tag "${tagName}": ${tagError.message}`);
                }
            }

            transaction.steps.push('tags_processed');
            transaction.rollbackActions.push({
                action: 'delete_tags',
                data: { uploadId: supabaseRecord.id }
            });
        }

        transaction.stepTimes.tags_processed = Date.now() - tagsStepStart;
        console.log(`✅ Processed ${tagOperations.length}/${parsedTags.length} tags in ${transaction.stepTimes.tags_processed}ms`);

        const totalTime = Date.now() - transaction.startTime;
        console.log(`🎉 Link transaction ${transaction.id} completed successfully in ${totalTime}ms`);
        console.log(`📊 Step breakdown:`, transaction.stepTimes);

        return {
            ...supabaseRecord,
            transaction_id: transaction.id,
            processed_tags: tagOperations.length,
            ai_summary,
            steps_completed: transaction.steps,
            performance: {
                total_time_ms: totalTime,
                step_times: transaction.stepTimes
            }
        };

    } catch (error) {
        const failureTime = Date.now() - transaction.startTime;
        console.error(`❌ Link transaction ${transaction.id} failed after ${failureTime}ms at step: ${transaction.steps[transaction.steps.length - 1] || 'unknown'}`);
        console.error('Error details:', error.message);
        console.error('Step times before failure:', transaction.stepTimes);

        await executeRollback(transaction, 'link upload');
        throw categorizationError(error, transaction.steps);
    }
}

/**
 * Execute rollback operations in reverse order with retry logic
 */
async function executeRollback(transaction, operationType) {
    if (transaction.rollbackActions.length === 0) {
        console.log(`ℹ️ No rollback actions needed for transaction ${transaction.id}`);
        return { success: true, actionsExecuted: 0, failures: [] };
    }

    const rollbackStartTime = Date.now();
    console.log(`🔄 Starting rollback for transaction ${transaction.id} (${operationType})`);
    console.log(`📋 Rollback actions: ${transaction.rollbackActions.length}`);

    // Execute rollback actions in reverse order
    const reversedActions = [...transaction.rollbackActions].reverse();
    const rollbackResults = {
        success: true,
        actionsExecuted: 0,
        failures: [],
        timings: {}
    };

    for (const [index, rollbackAction] of reversedActions.entries()) {
        const actionStartTime = Date.now();
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount <= maxRetries) {
            try {
                console.log(`🔄 [${index + 1}/${reversedActions.length}] Rolling back: ${rollbackAction.action} ${retryCount > 0 ? `(retry ${retryCount})` : ''}`);

                switch (rollbackAction.action) {
                    case 'delete_minio':
                        await deleteFile(rollbackAction.data.objectName);
                        console.log(`✅ MinIO file deleted: ${rollbackAction.data.objectName}`);
                        break;

                    case 'delete_database':
                        const { error: dbDeleteError } = await supabaseClient
                            .from('uploads')
                            .delete()
                            .eq('id', rollbackAction.data.uploadId);

                        if (dbDeleteError) {
                            throw new Error(`Database deletion failed: ${dbDeleteError.message}`);
                        }
                        console.log(`✅ Database record deleted: ${rollbackAction.data.uploadId}`);
                        break;

                    case 'delete_qdrant':
                        const qdrantResult = await deleteEmbedding(rollbackAction.data.uploadId);
                        if (!qdrantResult.success) {
                            throw new Error('Qdrant deletion returned unsuccessful status');
                        }
                        console.log(`✅ Qdrant embedding deleted: ${rollbackAction.data.uploadId}`);
                        break;

                    case 'delete_tags':
                        await deleteTags(rollbackAction.data.uploadId);
                        console.log(`✅ Tags deleted for upload: ${rollbackAction.data.uploadId}`);
                        break;

                    default:
                        console.warn(`⚠️ Unknown rollback action: ${rollbackAction.action}`);
                }

                const actionTime = Date.now() - actionStartTime;
                rollbackResults.timings[rollbackAction.action] = actionTime;
                rollbackResults.actionsExecuted++;
                break; // Success, exit retry loop

            } catch (rollbackError) {
                retryCount++;
                const actionTime = Date.now() - actionStartTime;

                if (retryCount > maxRetries) {
                    console.error(`❌ Rollback failed for action ${rollbackAction.action} after ${maxRetries} retries (${actionTime}ms):`, rollbackError.message);
                    rollbackResults.failures.push({
                        action: rollbackAction.action,
                        error: rollbackError.message,
                        retries: maxRetries,
                        totalTime: actionTime
                    });
                    rollbackResults.success = false;
                    break; // Give up on this action
                } else {
                    console.warn(`⚠️ Rollback attempt ${retryCount} failed for ${rollbackAction.action}, retrying... Error: ${rollbackError.message}`);
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                }
            }
        }
    }

    const rollbackTime = Date.now() - rollbackStartTime;

    if (rollbackResults.success) {
        console.log(`✅ Rollback completed successfully for transaction ${transaction.id} in ${rollbackTime}ms`);
        console.log(`📊 Rollback timings:`, rollbackResults.timings);
    } else {
        console.error(`⚠️ Rollback completed with failures for transaction ${transaction.id} after ${rollbackTime}ms`);
        console.error(`❌ Failed actions:`, rollbackResults.failures);
        console.log(`✅ Successful actions: ${rollbackResults.actionsExecuted}/${reversedActions.length}`);
    }

    return rollbackResults;
}

/**
 * Categorize and throw appropriate error based on transaction state
 */
function categorizationError(originalError, completedSteps) {
    const lastStep = completedSteps[completedSteps.length - 1];

    if (originalError.message.includes('MinIO') || lastStep === 'minio_upload') {
        throw new Error('Failed to upload file to storage');
    } else if (originalError.message.includes('Database') || originalError.message.includes('Supabase') || lastStep === 'database_insert') {
        throw new Error('Failed to save metadata to database');
    } else if (originalError.message.includes('Qdrant') || lastStep === 'qdrant_upsert') {
        throw new Error('Failed to save search index');
    } else if (originalError.message.includes('Tag') || lastStep === 'tags_processed') {
        throw new Error('Failed to save tags');
    } else if (lastStep === 'validation') {
        throw new Error(`Validation Error: ${originalError.message}`);
    } else if (lastStep === 'ai_processing') {
        throw new Error('Failed to process AI content');
    }

    // Default error
    throw originalError;
}

async function deleteTags(uploadId) {
    try {
        // First delete the upload_tags associations
        const { error: deleteTagsError } = await supabaseClient
            .from('upload_tags')
            .delete()
            .match({ upload_id: uploadId });

        if (deleteTagsError) {
            throw new Error(`Failed to delete upload tags: ${deleteTagsError.message}`);
        }
    } catch (error) {
        console.error('Tag deletion error:', error);
        throw new Error(`Tag Error: Failed to delete tags for upload ${uploadId}`);
    }
}

export { handleFileMetaData, handleLinkMetadata };
