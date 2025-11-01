import { Router } from "express";
import { getFileStream } from "../utils/minio.js";

const router = Router();

// GET /api/v1/download?file_path=...
router.get("/", async (req, res) => {
    const { file_path, filename, mime_type } = req.query;
    console.log(`[DOWNLOAD] Request received: file_path='${file_path}', filename='${filename}', mime_type='${mime_type}'`);
    if (!file_path) {
        return res.status(400).json({ error: "file_path query parameter is required" });
    }
    try {
        const fileStream = await getFileStream(file_path);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=\"${encodeURIComponent(file_path)}\"`
        );
        res.setHeader("Content-Type", mime_type || "application/octet-stream");
        fileStream.pipe(res);
    } catch (err) {
        console.error('[DOWNLOAD] Error:', err);
        res.status(500).json({ error: "Failed to download file" });
    }
});

export default router;
