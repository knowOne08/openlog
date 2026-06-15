import { Router } from 'express';
import { getFileUrl, deleteFile } from '../utils/minio.js';
import {
    deleteUpload,
    getUploadById,
    getUploadStats,
    listUploads,
} from '../utils/mysqlDb.js';
import { deleteEmbedding } from '../utils/qdrant.js';
import { deleteTags } from '../controllers/filesController.js';

const router = Router();

// GET /api/files/:fileId/download-url - Get presigned download URL
router.get('/:fileId/download-url', async (req, res) => {
    try {
        const { fileId } = req.params;
        const expirySeconds = Number.parseInt(req.query.expiry || '3600', 10);

        const fileRecord = await getUploadById(fileId);

        if (!fileRecord) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Only generate URL for actual files, not links
        if (fileRecord.file_type === 'link') {
            return res.status(400).json({
                success: false,
                error: 'Cannot generate download URL for links'
            });
        }

        if (!fileRecord.file_path) {
            return res.status(400).json({
                success: false,
                error: 'File path is missing'
            });
        }

        // Generate presigned URL
        const downloadUrl = await getFileUrl(fileRecord.file_path, Number.isFinite(expirySeconds) ? expirySeconds : 3600);

        res.json({
            success: true,
            data: {
                fileId,
                fileName: fileRecord.title,
                downloadUrl,
                expiresIn: Number.isFinite(expirySeconds) ? expirySeconds : 3600,
                mimeType: fileRecord.mime_type
            }
        });

    } catch (error) {
        console.error('Download URL generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate download URL'
        });
    }
});

// GET /api/files/:fileId/metadata - Get file metadata
router.get('/:fileId/metadata', async (req, res) => {
    try {
        const { fileId } = req.params;

        const fileRecord = await getUploadById(fileId);

        if (!fileRecord) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        const metadata = {
            id: fileRecord.id,
            title: fileRecord.title,
            description: fileRecord.description,
            fileType: fileRecord.file_type,
            size: fileRecord.file_size,
            mimeType: fileRecord.mime_type,
            visibility: fileRecord.visibility,
            createdAt: fileRecord.created_at,
            tags: fileRecord.tags || [],
            ...(fileRecord.file_type === 'link'
                ? { url: fileRecord.external_url }
                : { fileName: fileRecord.file_path }
            )
        };

        res.json({
            success: true,
            data: metadata
        });

    } catch (error) {
        console.error('Metadata retrieval error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve file metadata'
        });
    }
});

// GET /api/files/stats - Get file statistics
router.get('/stats', async (req, res) => {
    try {
        const { owner_id } = req.query;
        const stats = await getUploadStats(owner_id);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Stats retrieval error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve statistics'
        });
    }
});

// DELETE /api/files/:fileId - Delete file
router.delete('/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;

        const fileRecord = await getUploadById(fileId);

        if (!fileRecord) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Delete from MinIO if it's a file (not a link)
        if (fileRecord.file_type === 'local_file' && fileRecord.file_path) {
            try {
                await deleteFile(fileRecord.file_path);
            } catch (minioError) {
                console.error('MinIO deletion error:', minioError);
                // Continue with database cleanup even if MinIO deletion fails
            }
        }

        // Delete tags associations
        try {
            await deleteTags(fileId);
        } catch (tagError) {
            console.error('Tag deletion error:', tagError);
            // Continue with other deletions
        }

        // Delete from Qdrant
        try {
            await deleteEmbedding(fileId);
        } catch (qdrantError) {
            console.error('Qdrant deletion error:', qdrantError);
            // Continue with database deletion
        }

        // Delete from database
        const deleted = await deleteUpload(fileId);

        if (!deleted) {
            throw new Error('Database deletion failed');
        }

        res.json({
            success: true,
            message: `File "${fileRecord.title}" deleted successfully`
        });

    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete file'
        });
    }
});

// GET /api/files - List files with pagination
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type = 'all',
            visibility = 'all',
            owner_id,
            tag
        } = req.query;
        const uploadList = await listUploads({
            page,
            limit,
            type,
            visibility,
            ownerId: owner_id,
            tag,
        });

        res.json({
            success: true,
            data: {
                files: uploadList.files,
                pagination: uploadList.pagination,
            }
        });

    } catch (error) {
        console.error('File listing error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve files'
        });
    }
});

export default router;
