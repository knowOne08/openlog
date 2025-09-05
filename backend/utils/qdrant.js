import axios from 'axios';

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION = process.env.QDRANT_COLLECTION;

async function upsertEmbedding(id, embedding, payload) {
    if (QDRANT_URL.includes('cloud') && !QDRANT_API_KEY) {
        console.error('❌ QDRANT_API_KEY is required for Qdrant Cloud instance.');
        throw new Error('Missing Qdrant API key');
    }

    try {
        const response = await axios.put(
            `${QDRANT_URL}/collections/${COLLECTION}/points`,
            {
                points: [
                    {
                        id,
                        vectors: {
                            "summary-vector": embedding  // uses named vector here
                        },
                        payload,
                    },
                ],
            },
            {
                headers: {
                    'api-key': QDRANT_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Upsert response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error upserting embedding to Qdrant:', error.response?.data || error.message);
        throw error;
    }
}

export { upsertEmbedding };
