import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'openlog',
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
});

function toUploadModel(row, tags = []) {
    if (!row) return null;

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        file_type: row.file_type,
        file_path: row.file_path,
        external_url: row.external_url,
        file_size: row.file_size,
        mime_type: row.mime_type,
        visibility: row.visibility,
        created_at: row.created_at,
        updated_at: row.updated_at,
        owner_id: row.owner_id,
        extracted_text: row.extracted_text,
        embeddings: row.embeddings,
        tags,
    };
}

async function fetchUploadTags(uploadIds) {
    if (!uploadIds.length) return new Map();

    const placeholders = uploadIds.map(() => '?').join(', ');
    const [rows] = await pool.query(
        `SELECT ut.upload_id, t.name
     FROM upload_tags ut
     INNER JOIN tags t ON t.id = ut.tag_id
     WHERE ut.upload_id IN (${placeholders})
     ORDER BY t.name ASC`,
        uploadIds,
    );

    const tagMap = new Map();
    for (const row of rows) {
        const existing = tagMap.get(row.upload_id) || [];
        existing.push(row.name);
        tagMap.set(row.upload_id, existing);
    }
    return tagMap;
}

async function getUploadById(uploadId) {
    const [rows] = await pool.query(
        `SELECT id, title, description, file_type, file_path, external_url, file_size, mime_type, visibility, created_at, updated_at, owner_id, extracted_text, embeddings
     FROM uploads
     WHERE id = ?
     LIMIT 1`,
        [uploadId],
    );

    if (rows.length === 0) return null;

    const tagMap = await fetchUploadTags([uploadId]);
    return toUploadModel(rows[0], tagMap.get(uploadId) || []);
}

async function listUploads({ page = 1, limit = 20, type = 'all', visibility = 'all', ownerId, tag }) {
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [];
    const params = [];

    if (type !== 'all') {
        conditions.push('file_type = ?');
        params.push(type);
    }

    if (visibility !== 'all') {
        conditions.push('visibility = ?');
        params.push(visibility);
    }

    if (ownerId) {
        conditions.push('owner_id = ?');
        params.push(ownerId);
    }

    if (tag) {
        conditions.push(
            `id IN (
        SELECT ut.upload_id
        FROM upload_tags ut
        INNER JOIN tags t ON t.id = ut.tag_id
        WHERE t.name = ?
      )`,
        );
        params.push(tag);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total
     FROM uploads
     ${whereClause}`,
        params,
    );

    const totalFiles = Number(countRows[0]?.total || 0);

    const [rows] = await pool.query(
        `SELECT id, title, description, file_type, file_size, mime_type, visibility, created_at, updated_at, owner_id, file_path, external_url, extracted_text, embeddings
     FROM uploads
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
        [...params, Number(limit), offset],
    );

    const tagMap = await fetchUploadTags(rows.map((row) => row.id));
    const files = rows.map((row) => {
        const tags = tagMap.get(row.id) || [];
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            fileType: row.file_type,
            size: row.file_size,
            mimeType: row.mime_type,
            visibility: row.visibility,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            ownerId: row.owner_id,
            filePath: row.file_path,
            externalUrl: row.external_url,
            extractedText: row.extracted_text,
            embeddings: row.embeddings,
            tags,
        };
    });

    return {
        files,
        pagination: {
            currentPage: Number(page),
            totalPages: limit > 0 ? Math.ceil(totalFiles / Number(limit)) : 0,
            totalFiles,
            hasMore: offset + Number(limit) < totalFiles,
        },
    };
}

async function getUploadStats(ownerId) {
    const conditions = [];
    const params = [];

    if (ownerId) {
        conditions.push('owner_id = ?');
        params.push(ownerId);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
        `SELECT file_type, file_size, visibility
     FROM uploads
     ${whereClause}`,
        params,
    );

    return {
        totalFiles: rows.length,
        totalSize: rows.reduce((sum, row) => sum + Number(row.file_size || 0), 0),
        fileTypes: {
            local_file: rows.filter((row) => row.file_type === 'local_file').length,
            link: rows.filter((row) => row.file_type === 'link').length,
        },
        visibility: {
            public: rows.filter((row) => row.visibility === 'public').length,
            private: rows.filter((row) => row.visibility === 'private').length,
        },
    };
}

async function deleteUploadTags(uploadId) {
    await pool.query('DELETE FROM upload_tags WHERE upload_id = ?', [uploadId]);
}

async function deleteUpload(uploadId) {
    await deleteUploadTags(uploadId);
    const [result] = await pool.query('DELETE FROM uploads WHERE id = ?', [uploadId]);
    return result.affectedRows > 0;
}

async function getOrCreateTag(tagName) {
    const normalizedName = tagName.trim();
    if (!normalizedName) return null;

    const [existingRows] = await pool.query(
        'SELECT id, name FROM tags WHERE name = ? LIMIT 1',
        [normalizedName],
    );

    if (existingRows.length > 0) {
        return existingRows[0];
    }

    const id = crypto.randomUUID();
    await pool.query(
        'INSERT INTO tags (id, name, created_at) VALUES (?, ?, NOW())',
        [id, normalizedName],
    );

    return { id, name: normalizedName };
}

async function linkTagToUpload(uploadId, tagId) {
    await pool.query(
        'INSERT IGNORE INTO upload_tags (upload_id, tag_id) VALUES (?, ?)',
        [uploadId, tagId],
    );
}

async function listTagNamesForUpload(uploadId) {
    const tagMap = await fetchUploadTags([uploadId]);
    return tagMap.get(uploadId) || [];
}

async function searchUploadsByText(query, limit = 10, offset = 0) {
    const likeQuery = `%${query}%`;
    const [rows] = await pool.query(
        `SELECT id, title, description, file_type, file_path, external_url, file_size, mime_type, visibility, owner_id, created_at, updated_at
     FROM uploads
     WHERE title LIKE ? OR description LIKE ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
        [likeQuery, likeQuery, Number(limit), Number(offset)],
    );

    const tagMap = await fetchUploadTags(rows.map((row) => row.id));
    return rows.map((row) => ({
        id: row.id,
        score: 1,
        payload: {
            title: row.title,
            description: row.description,
            file_type: row.file_type,
            file_path: row.file_path,
            external_url: row.external_url,
            created_at: row.created_at,
            updated_at: row.updated_at,
            tags: tagMap.get(row.id) || [],
            file_size: row.file_size,
            mime_type: row.mime_type,
            owner_id: row.owner_id,
            visibility: row.visibility,
        },
    }));
}

export {
    pool,
    toUploadModel,
    getUploadById,
    listUploads,
    getUploadStats,
    deleteUploadTags,
    deleteUpload,
    getOrCreateTag,
    linkTagToUpload,
    listTagNamesForUpload,
    searchUploadsByText,
};
