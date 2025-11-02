/**
 * Monitoring routes for OpenLog transaction system
 * Provides endpoints to view performance metrics and transaction details
 */

import { Router } from 'express';
import { 
    getPerformanceStats, 
    getTransactionDetails, 
    getTransactionHealth 
} from '../middleware/transactionMonitor.js';

const router = Router();

// GET /api/v1/monitor/health - Transaction system health check
router.get('/health', (req, res) => {
    try {
        const health = getTransactionHealth();
        const statusCode = health.status === 'healthy' ? 200 : 
                          health.status === 'degraded' ? 200 : 503;
        
        res.status(statusCode).json(health);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get health status',
            error: error.message
        });
    }
});

// GET /api/v1/monitor/stats - Performance statistics
router.get('/stats', (req, res) => {
    try {
        const stats = getPerformanceStats();
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get performance statistics',
            message: error.message
        });
    }
});

// GET /api/v1/monitor/transaction/:id - Get specific transaction details
router.get('/transaction/:id', (req, res) => {
    try {
        const { id } = req.params;
        const transaction = getTransactionDetails(id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
                transactionId: id
            });
        }
        
        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get transaction details',
            message: error.message
        });
    }
});

// GET /api/v1/monitor/dashboard - Simple monitoring dashboard data
router.get('/dashboard', (req, res) => {
    try {
        const stats = getPerformanceStats();
        const health = getTransactionHealth();
        
        const dashboard = {
            overview: {
                status: health.status,
                activeTransactions: stats.active.count,
                recentTransactions: stats.recent.count,
                successRate: stats.history.successRate + '%',
                avgResponseTime: stats.recent.avgDuration + 'ms'
            },
            metrics: {
                totalTransactions: stats.history.total,
                fileUploads: stats.history.fileUploads,
                linkUploads: stats.history.linkUploads,
                recentErrors: stats.recent.error,
                recentSuccess: stats.recent.success
            },
            health: {
                status: health.status,
                reason: health.reason || 'All systems operational',
                lastChecked: health.timestamp
            },
            activeTransactions: stats.active.transactions
        };
        
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            dashboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get dashboard data',
            message: error.message
        });
    }
});

export default router;
