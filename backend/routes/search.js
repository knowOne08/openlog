import express from 'express';
import { searchController } from '../controllers/logic.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route POST /api/v1/search/query
 * @description Search across documents using semantic, traditional, or hybrid search
 * @access Public
 * @param {string} query - The search query
 * @param {string} type - Type of search: 'semantic', 'traditional', or 'hybrid' (default)
 * @param {number} limit - Maximum number of results to return (default: 10)
 * @returns {object} Results with matching documents and relevance scores
 */
router.post('/query', rateLimiter, async (req, res) => {
    try {
        const { query, type = 'hybrid', limit = 10 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const results = await searchController(query, type, limit);

        res.json({
            success: true,
            results
        });
    } catch (error) {
        // Log error server-side only, don't expose full error details to client
        console.error('Search error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error performing search'
        });
    }
});

/**
 * @route POST /api/v1/search/traditional
 * @description Traditional search across documents using title, description, and tags
 * @access Public
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return (default: 10)
 * @param {number} offset - Number of results to skip for pagination (default: 0)
 * @returns {object} Results with matching documents and pagination info
 */
router.post('/traditional', rateLimiter, async (req, res) => {
    try {
        const { query, limit = 10, offset = 0 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const results = await searchController(query, 'traditional', limit, offset);

        res.json({
            success: true,
            results: results.data || results,
            total: results.total || results.length,
            hasMore: results.hasMore || false
        });
    } catch (error) {
        // Log error server-side only, don't expose full error details to client
        console.error('Traditional search error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Error performing traditional search'
        });
    }
});

export default router;
