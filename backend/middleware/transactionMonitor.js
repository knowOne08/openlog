/**
 * Transaction monitoring middleware for OpenLog
 * Provides comprehensive monitoring and logging for upload transactions
 */

import { performance } from 'perf_hooks';

// In-memory transaction store (in production, consider using Redis)
const activeTransactions = new Map();
const transactionHistory = [];
const MAX_HISTORY_SIZE = 1000;

/**
 * Transaction performance metrics
 */
class TransactionMetrics {
    constructor(transactionId, type) {
        this.transactionId = transactionId;
        this.type = type; // 'file' | 'link'
        this.startTime = performance.now();
        this.steps = [];
        this.status = 'active';
        this.metadata = {};
        this.errors = [];
    }

    addStep(stepName, duration = null, metadata = {}) {
        const step = {
            name: stepName,
            timestamp: performance.now(),
            duration: duration || (performance.now() - this.startTime),
            metadata
        };
        this.steps.push(step);
        return step;
    }

    addError(error, stepName = null) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            step: stepName,
            timestamp: performance.now()
        };
        this.errors.push(errorInfo);
    }

    complete(status = 'success') {
        this.status = status;
        this.totalDuration = performance.now() - this.startTime;
        this.completedAt = new Date().toISOString();
        
        // Move to history
        transactionHistory.push({
            transactionId: this.transactionId,
            type: this.type,
            status: this.status,
            totalDuration: this.totalDuration,
            steps: this.steps.length,
            completedAt: this.completedAt,
            metadata: this.metadata,
            errors: this.errors.length
        });

        // Maintain history size
        if (transactionHistory.length > MAX_HISTORY_SIZE) {
            transactionHistory.shift();
        }

        // Remove from active transactions
        activeTransactions.delete(this.transactionId);
    }

    getMetrics() {
        return {
            transactionId: this.transactionId,
            type: this.type,
            status: this.status,
            totalDuration: this.totalDuration || (performance.now() - this.startTime),
            steps: this.steps,
            errors: this.errors,
            metadata: this.metadata
        };
    }
}

/**
 * Middleware to track transaction performance
 */
export function transactionMonitor(req, res, next) {
    // Only monitor upload endpoints
    if (!req.path.includes('/upload/')) {
        return next();
    }

    const transactionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionType = req.path.includes('/file') ? 'file' : 'link';
    
    const metrics = new TransactionMetrics(transactionId, transactionType);
    
    // Add file metadata if available
    if (req.file) {
        metrics.metadata.fileSize = req.file.size;
        metrics.metadata.mimetype = req.file.mimetype;
        metrics.metadata.filename = req.file.originalname;
    }
    
    if (req.body) {
        metrics.metadata.title = req.body.title;
        metrics.metadata.visibility = req.body.visibility;
        metrics.metadata.ownerId = req.body.owner_id;
    }

    // Store transaction
    activeTransactions.set(transactionId, metrics);
    
    // Add to request for access in routes
    req.transactionMetrics = metrics;
    req.transactionId = transactionId;

    // Override res.json to capture completion
    const originalJson = res.json.bind(res);
    res.json = function(data) {
        const status = res.statusCode >= 400 ? 'error' : 'success';
        metrics.complete(status);
        
        console.log(`📊 Transaction ${transactionId} completed: ${status} (${metrics.totalDuration.toFixed(2)}ms)`);
        
        return originalJson(data);
    };

    // Handle errors
    const originalSend = res.send.bind(res);
    res.send = function(data) {
        if (res.statusCode >= 400) {
            metrics.complete('error');
            console.log(`📊 Transaction ${transactionId} failed: ${res.statusCode} (${metrics.totalDuration.toFixed(2)}ms)`);
        }
        return originalSend(data);
    };

    next();
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
    const now = performance.now();
    const recentTransactions = transactionHistory.filter(t => 
        Date.now() - new Date(t.completedAt).getTime() < 300000 // Last 5 minutes
    );

    const stats = {
        active: {
            count: activeTransactions.size,
            transactions: Array.from(activeTransactions.values()).map(t => ({
                id: t.transactionId,
                type: t.type,
                duration: (now - t.startTime).toFixed(2) + 'ms',
                steps: t.steps.length
            }))
        },
        recent: {
            count: recentTransactions.length,
            success: recentTransactions.filter(t => t.status === 'success').length,
            error: recentTransactions.filter(t => t.status === 'error').length,
            avgDuration: recentTransactions.length > 0 
                ? (recentTransactions.reduce((sum, t) => sum + t.totalDuration, 0) / recentTransactions.length).toFixed(2)
                : 0
        },
        history: {
            total: transactionHistory.length,
            fileUploads: transactionHistory.filter(t => t.type === 'file').length,
            linkUploads: transactionHistory.filter(t => t.type === 'link').length,
            successRate: transactionHistory.length > 0 
                ? ((transactionHistory.filter(t => t.status === 'success').length / transactionHistory.length) * 100).toFixed(1)
                : 0
        }
    };

    return stats;
}

/**
 * Get transaction details by ID
 */
export function getTransactionDetails(transactionId) {
    // Check active transactions first
    if (activeTransactions.has(transactionId)) {
        return activeTransactions.get(transactionId).getMetrics();
    }

    // Check history
    const historical = transactionHistory.find(t => t.transactionId === transactionId);
    return historical || null;
}

/**
 * Health check for transaction system
 */
export function getTransactionHealth() {
    const now = Date.now();
    const activeCount = activeTransactions.size;
    const recentErrors = transactionHistory.filter(t => 
        t.status === 'error' && 
        now - new Date(t.completedAt).getTime() < 60000 // Last minute
    ).length;

    const health = {
        status: 'healthy',
        activeTransactions: activeCount,
        recentErrors: recentErrors,
        timestamp: new Date().toISOString()
    };

    // Determine health status
    if (activeCount > 20) {
        health.status = 'degraded';
        health.reason = 'High number of active transactions';
    } else if (recentErrors > 5) {
        health.status = 'unhealthy';
        health.reason = 'High error rate in recent transactions';
    }

    return health;
}

export { TransactionMetrics, activeTransactions, transactionHistory };
