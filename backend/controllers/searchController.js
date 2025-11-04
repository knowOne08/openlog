import { supabaseClient } from '../config/db.js';
import { searchQdrant } from '../utils/qdrant-skeleton.js';
import { index as meiliIndex } from '../utils/meili.js';
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
                    updated_at: doc.updated_at,
                    tags: tagMap.get(doc.id) || [],
                    file_size: doc.file_size,
                    mime_type: doc.mime_type,
                    owner_id: doc.owner_id,
                    visibility: doc.visibility
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
            // Use Meilisearch for fast, multi-field search (title, description, tags)
            const searchStartTime = performance.now();
            const result = await meiliIndex.search(query, {
                limit,
                offset,
                attributesToHighlight: ['title', 'description', 'tags'],
            });
            const searchEndTime = performance.now();
            const searchLatency = searchEndTime - searchStartTime;
            const mappedResults = (result.hits || []).map(doc => ({
                id: doc.id,
                score: 1,
                payload: {
                    title: doc.title,
                    description: doc.description,
                    file_type: doc.file_type,
                    file_path: doc.file_path,
                    external_url: doc.external_url,
                    created_at: doc.created_at,
                    updated_at: doc.updated_at,
                    tags: doc.tags || [],
                    file_size: doc.file_size,
                    mime_type: doc.mime_type,
                    owner_id: doc.owner_id,
                    visibility: doc.visibility,
                    searchLatency
                }
            }));
            return {
                data: mappedResults,
                total: result.estimatedTotalHits || mappedResults.length,
                hasMore: offset + limit < (result.estimatedTotalHits || 0),
                currentPage: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil((result.estimatedTotalHits || 0) / limit)
            };
        }

        // fallback: empty
        return [];
    } catch (error) {
        console.error('Search controller error:', error);
        throw error;
    }
}

export { searchController };
