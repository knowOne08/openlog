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
import fetch from 'node-fetch';

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
async function searchController(query, type, limit = 10, offset = 0) {

    try {
        // Helper to get tags map
        async function getTagMap() {
            const { data: tags } = await supabaseClient
                .from('upload_tags')
                .select(`upload_id, tags:tags(name)`);
            const tagMap = new Map();
            tags?.forEach(({ upload_id, tags }) => {
                if (tags?.name) {
                    const existingTags = tagMap.get(upload_id) || [];
                    tagMap.set(upload_id, [...existingTags, tags.name]);
                }
            });
            return tagMap;
        }

        if (type === 'semantic') {
            // Fetch both semantic and traditional results, merge, dedupe, sort
            const queryVector = await generateEmbedding(query);
            // Use a higher threshold for semantic similarity (e.g., 0.5)
            const [semanticResultsRaw, tagMap] = await Promise.all([
                searchQdrant(queryVector, limit * 2, 0.5),
                getTagMap()
            ]);

            // Filter out low-score semantic results and normalize scores (0-1)
            const semanticResults = (semanticResultsRaw || [])
                .filter(r => typeof r.score === 'number' && r.score >= 0.5)
                .map(r => ({
                    ...r,
                    score: Math.max(0, Math.min(1, r.score)) // Clamp to [0,1]
                }));

            // Fetch traditional results (no pagination, just enough to merge)
            const { data: traditionalResults } = await supabaseClient
                .from('uploads')
                .select('id, title, description, file_type, file_path, external_url, created_at')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                .order('created_at', { ascending: false })
                .limit(limit);

            // Map traditional results to same format as semantic
            const mappedTraditional = (traditionalResults || []).map(doc => ({
                id: doc.id,
                score: 1, // Default score for traditional search
                payload: {
                    title: doc.title,
                    description: doc.description,
                    file_type: doc.file_type,
                    file_path: doc.file_path,
                    external_url: doc.external_url,
                    created_at: doc.created_at,
                    tags: tagMap.get(doc.id) || []
                }
            }));

            // Merge, dedupe by id, sort by score desc
            const allResults = [...semanticResults, ...mappedTraditional];
            const uniqueResults = Array.from(new Map(
                allResults.map(item => [item.id, item])
            ).values());
            return uniqueResults.sort((a, b) => b.score - a.score).slice(0, limit);
        }

        if (type === 'traditional') {
            const searchStartTime = performance.now();
            const tagMap = await getTagMap();

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

            const mappedResults = (traditionalResults || []).map(doc => ({
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
        }

        // fallback: empty
        return [];
    } catch (error) {
        console.error('Search controller error:', error);
        throw error;
    }
}

export { handleFileMetaData, handleLinkMetadata, searchController, deleteTags };
