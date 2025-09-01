import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import { handleFileMetaData, handleLinkMetadata } from '../controllers/logic.js';

const upload = multer({ storage: memoryStorage() });
const router = Router();

// POST /api/upload
router.post('/file', upload.single('file'), async (req, res) => {
    try {
        console.log(req.body);
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
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/v1/upload/link
router.post('/link', async (req, res) => {
    try {
        const { title, description, url, owner_id, visibility } = req.body;
        tags = JSON.parse(req.body.tags || "[]");
        if (!title || !url || !owner_id || !visibility || !tags) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        console.log(tags);
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
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});


export default router;
