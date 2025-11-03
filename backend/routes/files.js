import { Router } from 'express';
import { getFileUrl, deleteFile } from '../utils/minio.js';
import { supabaseClient } from '../config/db.js';
import { deleteEmbedding } from '../utils/qdrant.js';
import { deleteTags } from '../controllers/filesController.js';

const router = Router();

// GET /api/files/:fileId/download-url - Get presigned download URL
router.get('/:fileId/download-url', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { expiry = 3600 } = req.query; // Default 1 hour

        // Get file info from database
        const { data: fileRecord, error } = await supabaseClient
            .from('uploads')
            .select('file_path, title, mime_type, file_type')
            .eq('id', fileId)
            .single();

        if (error || !fileRecord) {
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

        // Generate presigned URL
        const downloadUrl = await getFileUrl(fileRecord.file_path, parseInt(expiry));

        res.json({
            success: true,
            data: {
                fileId,
                fileName: fileRecord.title,
                downloadUrl,
                expiresIn: parseInt(expiry),
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

        // Get file metadata from database with tags
        const { data: fileRecord, error } = await supabaseClient
            .from('uploads')
            .select(`
                id,
                title,
                description,
                file_type,
                file_path,
                external_url,
                file_size,
                mime_type,
                visibility,
                created_at,
                upload_tags!inner(
                    tags(name)
                )
            `)
            .eq('id', fileId)
            .single();

        if (error || !fileRecord) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Format tags
        const tags = fileRecord.upload_tags?.map(ut => ut.tags.name) || [];

        const metadata = {
            id: fileRecord.id,
            title: fileRecord.title,
            description: fileRecord.description,
            fileType: fileRecord.file_type,
            size: fileRecord.file_size,
            mimeType: fileRecord.mime_type,
            visibility: fileRecord.visibility,
            createdAt: fileRecord.created_at,
            tags,
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

// DELETE /api/files/:fileId - Delete file
router.delete('/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;

        // Get file info from database
        const { data: fileRecord, error } = await supabaseClient
            .from('uploads')
            .select('file_path, file_type, title')
            .eq('id', fileId)
            .single();

        if (error || !fileRecord) {
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
        const { error: dbError } = await supabaseClient
            .from('uploads')
            .delete()
            .eq('id', fileId);

        if (dbError) {
            throw new Error(`Database deletion failed: ${dbError.message}`);
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

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabaseClient
            .from('uploads')
            .select(`
                id,
                title,
                description,
                file_type,
                file_size,
                mime_type,
                visibility,
                created_at,
                owner_id,
                upload_tags(
                    tags(name)
                )
            `, { count: 'exact' });

        // Apply filters
        if (type !== 'all') {
            query = query.eq('file_type', type);
        }

        if (visibility !== 'all') {
            query = query.eq('visibility', visibility);
        }

        if (owner_id) {
            query = query.eq('owner_id', owner_id);
        }

        // Apply pagination
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        const { data: files, error, count } = await query;

        if (error) {
            throw new Error(error.message);
        }

        // Format response
        const formattedFiles = files.map(file => ({
            id: file.id,
            title: file.title,
            description: file.description,
            fileType: file.file_type,
            size: file.file_size,
            mimeType: file.mime_type,
            visibility: file.visibility,
            createdAt: file.created_at,
            ownerId: file.owner_id,
            tags: file.upload_tags?.map(ut => ut.tags?.name).filter(Boolean) || []
        }));

        res.json({
            success: true,
            data: {
                files: formattedFiles,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / parseInt(limit)),
                    totalFiles: count,
                    hasMore: offset + parseInt(limit) < count
                }
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

// GET /api/files/stats - Get file statistics
router.get('/stats', async (req, res) => {
    try {
        const { owner_id } = req.query;

        let query = supabaseClient
            .from('uploads')
            .select('file_type, file_size, visibility');

        if (owner_id) {
            query = query.eq('owner_id', owner_id);
        }

        const { data: files, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        const stats = {
            totalFiles: files.length,
            totalSize: files.reduce((sum, file) => sum + (file.file_size || 0), 0),
            fileTypes: {
                local_file: files.filter(f => f.file_type === 'local_file').length,
                link: files.filter(f => f.file_type === 'link').length
            },
            visibility: {
                public: files.filter(f => f.visibility === 'public').length,
                private: files.filter(f => f.visibility === 'private').length
            }
        };

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

export default router;
