import { supabaseClient } from '../config/db.js';
import { uploadFile } from '../utils/minio.js';
import { upsertEmbedding } from '../utils/qdrant.js';
import { v4 as uuidv4 } from 'uuid';

// Simulate summary, extraction, embedding generation with dummy functions
async function extractText(fileBuffer, mimetype) {
    return 'Extracted text from file...'; // Replace with your logic
}
async function generateSummary(text) {
    return 'This is an AI-generated summary of the file.'; // Replace with LLM call
}
async function generateEmbedding(summary) {
    return Array.from({ length: 512 }, () => Math.random()); // Replace with real embedding
}
async function generateTags(summary) {
    return ['example', 'tag']; // Replace with actual tag generation
}

async function handleFileMetaData({ title, description, file, ownerId, visibility, tags }) {
    // 1. Upload file to MinIO
    const objectName = `${Date.now()}_${file.originalname}`;
    await uploadFile(file.buffer, objectName, file.mimetype);

    // 2. Content extraction, summary, embedding, tags
    const extracted_text = await extractText(file.buffer, file.mimetype);
    const ai_summary = await generateSummary(extracted_text);
    const embedding = await generateEmbedding(ai_summary);
    // const tags = await generateTags(ai_summary);

    // 3. Store metadata in Supabase
    const { data: up, error } = await supabaseClient.from('uploads')
        .insert([{
            id: uuidv4(),
            title,
            description,
            file_type: 'local_file',
            file_path: objectName,
            file_size: file.size,
            mime_type: file.mimetype,
            owner_id: ownerId,
            visibility,
            embeddings: embedding,
            extracted_text,
        }])
        .select()
        .single();

    if (error || !up) {
        throw new Error(error?.message || 'Failed to insert upload metadata into Supabase');
    }

    // 4. Store embeddings in Qdrant
    await upsertEmbedding(up.id, embedding, { title, description, owner_id: ownerId, tags });

    // 5. Store tags (simplified, not normalized)
    tags = JSON.parse(tags || "[]");
    console.log(tags);

    for (const tag of tags) {
        // Upsert the tag and immediately get the ID
        const { data: tagData, error: tagError } = await supabaseClient
            .from('tags')
            .upsert({ name: tag })
            .select('id')
            .single();

        if (tagError || !tagData) {
            console.error(`Error upserting or retrieving tag: ${tag}`);
            continue; // Skip this tag and continue with others
        }

        // Now insert the linking record
        const { error: uploadTagError } = await supabaseClient
            .from('upload_tags')
            .upsert({ upload_id: up.id, tag_id: tagData.id });

        if (uploadTagError) {
            console.error(`Error linking tag to upload: ${uploadTagError.message}`);
        }
    }


    return up;
}

async function handleLinkMetadata({ title, description, url, ownerId, visibility, tags }) {
    // 1. Content/summary/embedding/tags from description and/or url
    // Optionally: fetch page text from URL for deeper pipeline
    const extracted_text = 'This will be implemented in future releases';  // Or fetch content from URL if needed
    const ai_summary = await generateSummary(description);
    const embedding = await generateEmbedding(ai_summary);
    // const tags = await generateTags(ai_summary);

    // 2. Store metadata in Supabase
    const { data: up, error } = await supabaseClient.from('uploads')
        .insert([{
            id: uuidv4(),
            title,
            description,
            file_type: 'link',
            external_url: url,
            file_size: null,
            mime_type: null,
            owner_id: ownerId,
            visibility,
            embeddings: embedding,
            extracted_text,
        }])
        .select()
        .single();

    if (error || !up) {
        throw new Error(error?.message || 'Failed to insert link metadata into Supabase');
    }

    // 3. Store embeddings in Qdrant
    await upsertEmbedding(up.id, embedding, { title, description, owner_id: ownerId, tags });

    // 4. Store tags (same loop as your existing logic)
    console.log("file tags:", tags)

    for (const tag of tags) {
        const { data: tagData, error: tagError } = await supabaseClient
            .from('tags')
            .upsert({ name: tag })
            .select('id')
            .single();
        if (tagError || !tagData) {
            console.error(`Error upserting or retrieving tag: ${tag}`);
            continue;
        }
        const { error: uploadTagError } = await supabaseClient
            .from('upload_tags')
            .upsert({ upload_id: up.id, tag_id: tagData.id });
        if (uploadTagError) {
            console.error(`Error linking tag to upload: ${uploadTagError.message}`);
        }
    }

    return up;
}


export { handleFileMetaData, handleLinkMetadata };
