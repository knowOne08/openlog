import { QdrantClient } from '@qdrant/js-client-rest';

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION = process.env.QDRANT_COLLECTION || 'openlog-metadata';

const client = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
});

async function upsertEmbedding(id, embedding, payload) {
    if (!QDRANT_URL || !QDRANT_API_KEY) {
        throw new Error('Missing Qdrant configuration');
    }

    try {
        const response = await client.upsert(COLLECTION, {
            points: [{
                id,
                vectors: {
                    "summary-vector": embedding
                },
                payload
            }]
        });

        return response;
    } catch (error) {
        console.error('❌ Error upserting embedding to Qdrant:', error);
        throw error;
    }
}

async function searchQdrant(queryVector, limit = 10, scoreThreshold = 0.7) {
    if (!QDRANT_URL || !QDRANT_API_KEY) {
        throw new Error('Missing Qdrant configuration');
    }

    try {
        const searchResult = await client.search(COLLECTION, {
            vector: {
                name: "summary-vector",
                vector: queryVector
            },
            limit: limit,
            params: {
                hnsw_ef: 128, // Increase search precision while maintaining speed
                exact: false  // Use approximate search for better performance
            },
            score_threshold: scoreThreshold, // Only return results above this similarity threshold
            with_payload: true, // Include the stored metadata
        });

        // Format and return the results
        return searchResult.map(hit => ({
            id: hit.id,
            score: hit.score,
            payload: hit.payload
        }));
    } catch (error) {
        console.error('❌ Error searching in Qdrant:', error);
        throw error;
    }
}

// Function to delete an embedding
async function deleteEmbedding(id) {
    try {
        await client.delete(COLLECTION, {
            points: [id]
        });
        return true;
    } catch (error) {
        console.error('❌ Error deleting embedding from Qdrant:', error);
        throw error;
    }
}

// Function to check collection health and optimize if needed
async function optimizeCollection() {
    try {
        const info = await client.getCollection(COLLECTION);
        if (info.optimizers_status?.segments_count > 50) {
            await client.updateCollection(COLLECTION, {
                optimizers_config: {
                    indexing_threshold: 20000, // Adjust based on your data size
                    memmap_threshold: 10000
                }
            });
        }
        return true;
    } catch (error) {
        console.error('❌ Error optimizing Qdrant collection:', error);
        return false;
    }
}

export {
    upsertEmbedding,
    searchQdrant,
    deleteEmbedding,
    optimizeCollection
};
