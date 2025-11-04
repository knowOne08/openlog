import { supabaseClient } from '../config/db.js';

/**
 * Delete tags associated with an upload
 * @param {string} uploadId - The upload ID to delete tags for
 * @returns {Promise<void>}
 */
async function deleteTags(uploadId) {
    try {
        // First delete the upload_tags associations
        const { error: deleteTagsError } = await supabaseClient
            .from('upload_tags')
            .delete()
            .match({ upload_id: uploadId });

        if (deleteTagsError) {
            throw new Error(`Failed to delete upload tags: ${deleteTagsError.message}`);
        }

        console.log(`✅ Successfully deleted tags for upload: ${uploadId}`);
    } catch (error) {
        console.error('Tag deletion error:', error);
        throw new Error(`Tag Error: Failed to delete tags for upload ${uploadId}`);
    }
}

export { deleteTags };
