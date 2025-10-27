import { supabaseClient } from '../config/db.js';
import { uploadFile, deleteFile } from '../utils/minio.js';
import { upsertEmbedding, searchQdrant, deleteEmbedding } from '../utils/qdrant.js';
import { v4 as uuidv4 } from 'uuid';

// Simulate summary, extraction, embedding generation with dummy functions
async function extractText(fileBuffer, mimetype) {
    return 'Extracted text from file...'; // Replace with your logic
}
async function generateSummary(text) {
    return 'This is an AI-generated summary of the file.'; // Replace with LLM call
}
async function generateEmbedding(summary) {
    return Array.from({ length: 512 }, () => Math.random()); // Replace with real embedding
}
// async function generateTags(summary) {
//     return ['example', 'tag']; // Replace with actual tag generation
// }

// async function handleFileMetaData({ title, description, file, ownerId, visibility, tags }) {
//     // 1. Upload file to MinIO
//     const objectName = `${Date.now()}_${file.originalname}`;
//     await uploadFile(file.buffer, objectName, file.mimetype);

//     // 2. Content extraction, summary, embedding, tags
//     const extracted_text = await extractText(file.buffer, file.mimetype);
//     const ai_summary = await generateSummary(extracted_text);
//     const embedding = await generateEmbedding(ai_summary);
//     // const tags = await generateTags(ai_summary);

//     // 3. Store metadata in Supabase
//     const { data: up, error } = await supabaseClient.from('uploads')
//         .insert([{
//             id: uuidv4(),
//             title,
//             description,
//             file_type: 'local_file',
//             file_path: objectName,
//             file_size: file.size,
//             mime_type: file.mimetype,
//             owner_id: ownerId,
//             visibility,
//             embeddings: embedding,
//             extracted_text,
//         }])
//         .select()
//         .single();

//     if (error || !up) {
//         throw new Error(error?.message || 'Failed to insert upload metadata into Supabase');
//     }

//     // 4. Store embeddings in Qdrant
//     await upsertEmbedding(up.id, embedding, { title, description, owner_id: ownerId, tags });

//     // 5. Store tags (simplified, not normalized)
//     tags = JSON.parse(tags || "[]");
//     console.log(tags);

//     for (const tag of tags) {
//         // Upsert the tag and immediately get the ID
//         const { data: tagData, error: tagError } = await supabaseClient
//             .from('tags')
//             .upsert({ name: tag })
//             .select('id')
//             .single();

//         if (tagError || !tagData) {
//             console.error(`Error upserting or retrieving tag: ${tag}`);
//             continue; // Skip this tag and continue with others
//         }

//         // Now insert the linking record
//         const { error: uploadTagError } = await supabaseClient
//             .from('upload_tags')
//             .upsert({ upload_id: up.id, tag_id: tagData.id });

//         if (uploadTagError) {
//             console.error(`Error linking tag to upload: ${uploadTagError.message}`);
//         }
//     }


//     return up;
// }

async function handleFileMetaData({ title, description, file, ownerId, visibility, tags }) {
    let uploadedObjectName = null;
    let supabaseRecord = null;

    try {
        // 1. Upload file to MinIO
        const objectName = `${Date.now()}_${file.originalname}`;
        await uploadFile(file.buffer, objectName, file.mimetype);
        uploadedObjectName = objectName;

        // 2. Content extraction, summary, embedding generation
        const extracted_text = await extractText(file.buffer, file.mimetype);
        const ai_summary = await generateSummary(extracted_text);
        const embedding = await generateEmbedding(ai_summary);

        // 3. Store metadata in Supabase
        const { data: up, error } = await supabaseClient.from('uploads')
            .insert([{
                id: uuidv4(),
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

        if (error || !up) {
            throw new Error(`Supabase Error: ${error?.message || 'Failed to insert upload metadata'}`);
        }
        supabaseRecord = up;

        // 4. Store embeddings in Qdrant
        await upsertEmbedding(up.id, embedding, { title, description, owner_id: ownerId, tags });

        // 5. Store tags
        tags = JSON.parse(tags || "[]");
        //     console.log(tags);

        for (const tag of tags) {
            // Upsert the tag and immediately get the ID
            const { data: tagData, error: tagError } = await supabaseClient
                .from('tags')
                .upsert({ name: tag })
                .select('id')
                .single();

            if (tagError || !tagData) {
                // Log error for troubleshooting
                console.error(`Error upserting or retrieving tag: ${tag}`);
                continue; // Skip this tag and continue with others
            }

            // Now insert the linking record
            const { error: uploadTagError } = await supabaseClient
                .from('upload_tags')
                .upsert({ upload_id: up.id, tag_id: tagData.id });

            if (uploadTagError) {
                // Log error for troubleshooting
                console.error(`Error linking tag to upload: ${uploadTagError.message}`);
            }
        };

        await Promise.all(tags);

        return up;

    } catch (error) {
        console.error('Upload failed:', error);

        // Rollback changes if any service failed
        try {
            if (uploadedObjectName) {
                // Delete from MinIO
                await deleteFile(uploadedObjectName);
            }

            if (supabaseRecord) {
                // Delete from Supabase
                await supabaseClient
                    .from('uploads')
                    .delete()
                    .match({ id: supabaseRecord.id });

                // Delete from Qdrant
                await deleteEmbedding(supabaseRecord.id);
            }
        } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError);
            throw new Error('Critical error: Failed to rollback changes. Data may be inconsistent.');
        }

        // Throw specific error based on where it failed
        if (error.message.includes('MinIO')) {
            throw new Error('Failed to upload file to storage');
        } else if (error.message.includes('Supabase')) {
            throw new Error('Failed to save metadata to database');
        } else if (error.message.includes('Qdrant')) {
            throw new Error('Failed to save search index');
        } else if (error.message.includes('Tag')) {
            throw new Error('Failed to save tags');
        }
        throw error;
    }
}

// async function handleLinkMetadata({ title, description, url, ownerId, visibility, tags }) {
//     // 1. Content/summary/embedding/tags from description and/or url
//     // Optionally: fetch page text from URL for deeper pipeline
//     const extracted_text = 'This will be implemented in future releases';  // Or fetch content from URL if needed
//     const ai_summary = await generateSummary(description);
//     const embedding = await generateEmbedding(ai_summary);
//     // const tags = await generateTags(ai_summary);

//     // 2. Store metadata in Supabase
//     const { data: up, error } = await supabaseClient.from('uploads')
//         .insert([{
//             id: uuidv4(),
//             title,
//             description,
//             file_type: 'link',
//             external_url: url,
//             file_size: null,
//             mime_type: null,
//             owner_id: ownerId,
//             visibility,
//             embeddings: embedding,
//             extracted_text,
//         }])
//         .select()
//         .single();

//     if (error || !up) {
//         throw new Error(error?.message || 'Failed to insert link metadata into Supabase');
//     }

//     // 3. Store embeddings in Qdrant
//     await upsertEmbedding(up.id, embedding, { title, description, owner_id: ownerId, tags });

//     // 4. Store tags (same loop as your existing logic)
//     console.log("file tags:", tags)

//     for (const tag of tags) {
//         const { data: tagData, error: tagError } = await supabaseClient
//             .from('tags')
//             .upsert({ name: tag })
//             .select('id')
//             .single();
//         if (tagError || !tagData) {
//             console.error(`Error upserting or retrieving tag: ${tag}`);
//             continue;
//         }
//         const { error: uploadTagError } = await supabaseClient
//             .from('upload_tags')
//             .upsert({ upload_id: up.id, tag_id: tagData.id });
//         if (uploadTagError) {
//             console.error(`Error linking tag to upload: ${uploadTagError.message}`);
//         }
//     }

//     return up;
// }

async function handleLinkMetadata({ title, description, url, ownerId, visibility, tags }) {
    let supabaseRecord = null;

    try {
        const extracted_text = 'This will be implemented in future releases';
        const ai_summary = await generateSummary(description);
        const embedding = await generateEmbedding(ai_summary);

        // Store metadata in Supabase
        const { data: up, error } = await supabaseClient.from('uploads')
            .insert([{
                id: uuidv4(),
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

        if (error || !up) {
            throw new Error(`Supabase Error: ${error?.message || 'Failed to insert link metadata'}`);
        }
        supabaseRecord = up;

        // Store embeddings in Qdrant
        await upsertEmbedding(up.id, embedding, { title, description, owner_id: ownerId, tags });

        // Store tags
        const tagPromises = tags.map(async (tag) => {
            const { data: tagData, error: tagError } = await supabaseClient
                .from('tags')
                .upsert({ name: tag })
                .select('id')
                .single();

            if (tagError || !tagData) {
                throw new Error(`Tag Error: Failed to upsert tag ${tag}`);
            }

            const { error: uploadTagError } = await supabaseClient
                .from('upload_tags')
                .upsert({ upload_id: up.id, tag_id: tagData.id });

            if (uploadTagError) {
                throw new Error(`Upload Tag Error: Failed to link tag ${tag}`);
            }
        });

        await Promise.all(tagPromises);

        return up;

    } catch (error) {
        console.error('Link upload failed:', error);

        // Rollback changes if any service failed
        try {
            if (supabaseRecord) {
                // Delete from Supabase
                await supabaseClient
                    .from('uploads')
                    .delete()
                    .match({ id: supabaseRecord.id });

                // Delete from Qdrant
                await deleteEmbedding(supabaseRecord.id);
            }
        } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError);
            throw new Error('Critical error: Failed to rollback changes. Data may be inconsistent.');
        }

        // Throw specific error based on where it failed
        if (error.message.includes('Supabase')) {
            throw new Error('Failed to save metadata to database');
        } else if (error.message.includes('Qdrant')) {
            throw new Error('Failed to save search index');
        } else if (error.message.includes('Tag')) {
            throw new Error('Failed to save tags');
        }
        throw error;
    }
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


/**
 * Search controller that handles both semantic and traditional search
 * @param {string} query - The search query
 * @param {string} type - The type of search: 'semantic', 'traditional', or 'hybrid'
 * @param {number} limit - Maximum number of results to return
 * @param {number} offset - Number of results to skip for pagination (default: 0)
 * @returns {Promise<Array|Object>} - Search results or paginated results object
 */
async function searchController(query, type = 'hybrid', limit = 10, offset = 0) {
    const results = [];

    try {
        // For semantic or hybrid search, get vector search results
        if (type === 'semantic' || type === 'hybrid') {
            const queryVector = await generateEmbedding(query);
            const semanticResults = await searchQdrant(queryVector, limit);
            results.push(...semanticResults);
        }

        // For traditional or hybrid search, get Supabase full-text search results
        if (type === 'traditional' || type === 'hybrid') {
            const searchStartTime = performance.now();

            // Get the tags associated with uploads
            const { data: tags, error: tagError } = await supabaseClient
                .from('upload_tags')
                .select(`
                    upload_id,
                    tags:tags(name)
                `);

            // Create a map of upload_id to tags
            const tagMap = new Map();
            tags?.forEach(({ upload_id, tags }) => {
                if (tags?.name) {
                    const existingTags = tagMap.get(upload_id) || [];
                    tagMap.set(upload_id, [...existingTags, tags.name]);
                }
            });

            // For traditional search with pagination, get total count first
            if (type === 'traditional') {
                // Get total count for pagination
                const { count, error: countError } = await supabaseClient
                    .from('uploads')
                    .select('*', { count: 'exact', head: true })
                    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

                if (countError) throw countError;

                // Get paginated results
                const { data: traditionalResults, error } = await supabaseClient
                    .from('uploads')
                    .select('id, title, description, file_type, file_path, external_url, created_at')
                    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                    .order('created_at', { ascending: false })
                    .range(offset, offset + limit - 1);

                if (error) throw error;

                const searchEndTime = performance.now();
                const searchLatency = searchEndTime - searchStartTime;
                // Log performance metrics
                console.debug(`Traditional search latency: ${searchLatency}ms`);

                const mappedResults = traditionalResults.map(doc => ({
                    id: doc.id,
                    score: 1, // Default score for traditional search
                    payload: {
                        title: doc.title,
                        description: doc.description,
                        file_type: doc.file_type,
                        file_path: doc.file_path,
                        external_url: doc.external_url,
                        created_at: doc.created_at,
                        tags: tagMap.get(doc.id) || [],
                        searchLatency
                    }
                }));

                // Return paginated results with metadata
                return {
                    data: mappedResults,
                    total: count,
                    hasMore: offset + limit < count,
                    currentPage: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(count / limit)
                };
            } else {
                // For hybrid search, get all results (no pagination)
                const { data: traditionalResults, error } = await supabaseClient
                    .from('uploads')
                    .select('id, title, description, file_type, file_path, external_url, created_at')
                    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error) throw error;

                const searchEndTime = performance.now();
                const searchLatency = searchEndTime - searchStartTime;

                results.push(...traditionalResults.map(doc => ({
                    id: doc.id,
                    score: 1, // Default score for traditional search
                    payload: {
                        title: doc.title,
                        description: doc.description,
                        file_type: doc.file_type,
                        file_path: doc.file_path,
                        external_url: doc.external_url,
                        created_at: doc.created_at,
                        tags: tagMap.get(doc.id) || [],
                        searchLatency
                    }
                })));
            }
        }

        // For hybrid search, merge and rank results
        if (type === 'hybrid') {
            // Remove duplicates and sort by score
            const uniqueResults = Array.from(new Map(
                results.map(item => [item.id, item])
            ).values());

            return uniqueResults
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
        }

        return results;
    } catch (error) {
        console.error('Search controller error:', error);
        throw error;
    }
}

export { handleFileMetaData, handleLinkMetadata, searchController, deleteTags };
