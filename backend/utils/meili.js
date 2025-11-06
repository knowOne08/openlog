import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
    host: process.env.MEILISEARCH_URL,
    apiKey: process.env.MEILISEARCH_API_KEY,
});

const index = client.index('uploads');

// Initialize the index with proper settings
async function initializeMeiliSearchIndex() {
    try {
        // Ensure the index exists with correct primary key
        await client.createIndex('uploads', { primaryKey: 'id' });
        console.log('✅ MeiliSearch uploads index created/verified');
        
        // Configure searchable attributes for better search
        await index.updateSearchableAttributes([
            'title',
            'description', 
            'tags',
            'file_type',
            'mime_type'
        ]);
        
        // Configure filterable attributes
        await index.updateFilterableAttributes([
            'owner_id',
            'visibility',
            'file_type',
            'mime_type',
            'created_at'
        ]);
        
        console.log('✅ MeiliSearch index settings configured');
        
    } catch (error) {
        // Index might already exist, which is fine
        if (error.code !== 'index_already_exists') {
            console.error('❌ MeiliSearch initialization error:', error);
        } else {
            console.log('ℹ️ MeiliSearch uploads index already exists');
        }
    }
}

// Initialize on module load
initializeMeiliSearchIndex();

export { client, index };
