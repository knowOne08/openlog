import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({
    url: process.env.QRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

async function createCollection() {
    try {
        await client.createCollection('openlog-metadata', {
            vectors: {
                'summary-vector': {
                    size: 512,
                    distance: 'Cosine',
                }
            },
            // Optional HNSW index config for performance
            hnswConfig: {
                m: 16,
                efConstruction: 100,
            },
            // Enable payload storage on-disk for persistence
            onDiskPayload: true,
            // Optional: strict mode to enforce schema consistency
            strict: true,
        });
        console.log('Collection created successfully');
    } catch (err) {
        console.error('Error creating collection:', err);
    }
}

createCollection();