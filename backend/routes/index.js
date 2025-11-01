// routes/index.js
import { Router } from 'express';

// Import all route modules
import authRoutes from './auth.js';
import uploadRoutes from './upload.js';
import searchRoutes from './search.js';
import filesRoutes from './files.js';
import testMinioRoutes from './test-minio.js';
import monitorRoutes from './monitor.js';

const router = Router();

// Mount all routes with their respective prefixes
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);
router.use('/files', filesRoutes);
router.use('/test', testMinioRoutes);
router.use('/monitor', monitorRoutes);

// API Documentation endpoint for the routes
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'OpenLog API v1',
        endpoints: {
            auth: {
                signup: 'POST /api/v1/auth/signup',
                login: 'POST /api/v1/auth/login',
                refresh: 'POST /api/v1/auth/refresh',
                logout: 'POST /api/v1/auth/logout',
                profile: 'GET /api/v1/auth/profile',
                changePassword: 'POST /api/v1/auth/change-password',
                admin: {
                    createMember: 'POST /api/v1/auth/admin/create-member',
                    getMembers: 'GET /api/v1/auth/admin/members',
                    updateMemberStatus: 'PUT /api/v1/auth/admin/members/:userId/status'
                }
            },
            upload: {
                file: 'POST /api/v1/upload/file',
                link: 'POST /api/v1/upload/link'
            },
            search: {
                query: 'POST /api/v1/search/query',
                suggestions: 'GET /api/v1/search/suggestions'
            },
            files: {
                list: 'GET /api/v1/files',
                stats: 'GET /api/v1/files/stats',
                metadata: 'GET /api/v1/files/:fileId/metadata',
                downloadUrl: 'GET /api/v1/files/:fileId/download-url',
                delete: 'DELETE /api/v1/files/:fileId'
            },
            monitor: {
                health: 'GET /api/v1/monitor/health',
                stats: 'GET /api/v1/monitor/stats',
                dashboard: 'GET /api/v1/monitor/dashboard',
                transaction: 'GET /api/v1/monitor/transaction/:id'
            },
            test: {
                minio: 'POST /api/v1/test/minio-upload',
                connection: 'GET /api/v1/test/connection'
            }
        },
        documentation: 'https://docs.openlog.com'
    });
});

export default router;
