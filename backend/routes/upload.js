import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import { handleUploadMetadata } from '../controllers/logic.js';

const upload = multer({ storage: memoryStorage() });
const router = Router();

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { title, description, owner_id, visibility = 'private' } = req.body;
        if (!req.file) return res.status(400).json({ error: 'File missing' });
        const uploadRecord = await handleUploadMetadata({
            title,
            description,
            file: req.file,
            ownerId: owner_id,
            visibility,
        });
        res.json({ success: true, upload: uploadRecord });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
