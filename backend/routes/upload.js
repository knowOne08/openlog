import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import { handleFileMetaData, handleLinkMetadata } from '../controllers/logic.js';

const upload = multer({ storage: memoryStorage() });
const router = Router();

// POST /api/upload
router.post('/file', upload.single('file'), async (req, res) => {
    try {
        const { title, description, owner_id, visibility, tags } = req.body;
        if (!req.file) return res.status(400).json({ error: 'File missing' });
        const uploadRecord = await handleFileMetaData({
            title,
            description,
            file: req.file,
            ownerId: owner_id,
            visibility,
            tags: tags
        });
        res.json({ success: true, upload: uploadRecord });
    } catch (err) {
        // Log error server-side only, don't expose full error details to client
        console.error('File upload error:', err.message);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// POST /api/v1/upload/link
router.post('/link', async (req, res) => {
    try {
        const { title, description, url, owner_id, visibility, tags } = req.body;
        if (!title || !url || !owner_id || !visibility || !tags) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Save link metadata
        const linkRecord = await handleLinkMetadata({
            title,
            description,
            url,
            ownerId: owner_id,
            visibility,
            tags: tags,
        });
        res.json({ success: true, upload: linkRecord });
    } catch (err) {
        // Log error server-side only, don't expose full error details to client
        console.error('Link upload error:', err.message);
        res.status(500).json({ error: 'Link upload failed' });
    }
});


export default router;
