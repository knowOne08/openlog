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
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: 'Error performing search'
        });
    }
});

export default router;
