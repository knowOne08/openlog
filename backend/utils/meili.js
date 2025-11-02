import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
    host: process.env.MEILISEARCH_URL,
    apiKey: process.env.MEILISEARCH_API_KEY,
});

const index = client.index('uploads');

export { client, index };
