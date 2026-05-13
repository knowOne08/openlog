import { QdrantClient } from '@qdrant/js-client-rest';
import 'dotenv/config';

// Qdrant configuration from environment variables
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION;

// Initialize Qdrant client
const client = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
});

/**
 * Upsert (insert or update) an embedding into Qdrant
 * @param {string} id - Unique identifier for the point
 * @param {Array} embedding - Vector embedding array
 * @param {Object} payload - Additional metadata to store with the point
 * @returns {Promise<Object>} - Success result
 */
export async function upsertEmbedding(id, embedding, payload) {
    // Validate inputs
    if (!id || !embedding || !Array.isArray(embedding)) {
        throw new Error('Valid id and embedding array are required');
    }
    // Upsert the point into the collection
    await client.upsert(COLLECTION_NAME, {
        points: [{
            id,
            vector: embedding,
            payload,
        }]
    });
    return { success: true, id };
}

/**
 * Search for similar embeddings in Qdrant
 * @param {Array} queryVector - The query embedding vector
 * @param {number} limit - Maximum number of results to return
 * @param {number} scoreThreshold - Minimum similarity score threshold
 * @returns {Promise<Array>} - Array of search results with id, score, and payload
 */
export async function searchQdrant(queryVector, limit = 10, scoreThreshold = 0.7) {
    // Validate input
    if (!queryVector || !Array.isArray(queryVector)) {
        throw new Error('Valid query vector is required');
    }
    // Perform the search
    const result = await client.search(COLLECTION_NAME, {
        vector: queryVector,
        limit,
        score_threshold: scoreThreshold,
        with_payload: true,
    });
    // Map results to a simple format
    return result.map(r => ({
        id: r.id,
        score: r.score,
        payload: r.payload,
    }));
}

/**
 * Delete an embedding from Qdrant by id
 * @param {string} id - Unique identifier of the point to delete
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteEmbedding(id) {
    await client.delete(COLLECTION_NAME, { points: [id] });
    return { success: true, id };
}

/**
 * Get information about the Qdrant collection
 * @returns {Promise<Object>} - Collection info
 */
export async function getCollectionInfo() {
    return await client.getCollection(COLLECTION_NAME);
}

/**
 * Batch upsert operation for multiple points
 * @param {Array} operations - Array of points to upsert (each with id, vector, payload)
 * @returns {Promise<Object>} - Batch result
 */
export async function batchOperation(operations) {
    if (!Array.isArray(operations)) throw new Error('Valid operations array is required');
    await client.upsert(COLLECTION_NAME, { points: operations });
    return { success: true, count: operations.length };
}