import { supabaseClient } from '../config/db.js';
import { searchQdrant } from '../utils/qdrant-skeleton.js';
import { index as meiliIndex } from '../utils/meili.js';
import fetch from 'node-fetch';

/**
 * Calls the Hugging Face Inference API to get embeddings using mixedbread-ai/mxbai-embed-large-v1 model.
 * This model produces 1024-dimensional embeddings and supports retrieval-optimized prompts.
 * @param {string} text - The text to embed (e.g., description)
 * @returns {Promise<number[]>} - 1024-dim embedding array
 */
async function generateEmbedding(text) {
    const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/mixedbread-ai/mxbai-embed-large-v1';
    const HF_API_TOKEN = process.env.HF_API_TOKEN;
    
    if (!HF_API_TOKEN) {
        throw new Error('HF_API_TOKEN environment variable is required for embedding generation');
    }

    try {
        // Add retrieval prompt for better search performance
        const promptedText = `Represent this sentence for searching relevant passages: ${text}`;
        
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: promptedText,
                options: {
                    wait_for_model: true
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const embedding = await response.json();
        
        // HF Inference API returns a single array for single input, or array of arrays for multiple inputs
        let embeddingVector;
        
        if (Array.isArray(embedding)) {
            // If it's an array of arrays (multiple inputs), take the first one
            if (Array.isArray(embedding[0])) {
                embeddingVector = embedding[0];
            } else {
                // If it's a single array (single input), use it directly
                embeddingVector = embedding;
            }
        } else {
            throw new Error('Invalid embedding format returned from Hugging Face API');
        }
        
        // Validate embedding dimensions (mxbai-embed-large-v1 produces 1024-dim embeddings)
        if (!Array.isArray(embeddingVector) || embeddingVector.length !== 1024) {
            throw new Error(`Expected 1024-dimensional embedding array, got ${Array.isArray(embeddingVector) ? embeddingVector.length : 'non-array'} dimensions`);
        }

        return embeddingVector;
    } catch (err) {
        console.error('Hugging Face embedding generation failed:', err);
        throw new Error(`Embedding generation failed: ${err.message}`);
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
