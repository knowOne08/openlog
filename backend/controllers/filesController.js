import { deleteUploadTags } from '../utils/mysqlDb.js';

/**
 * Delete tags associated with an upload
 * @param {string} uploadId - The upload ID to delete tags for
 * @returns {Promise<void>}
 */
async function deleteTags(uploadId) {
    try {
        await deleteUploadTags(uploadId);

        console.log(`✅ Successfully deleted tags for upload: ${uploadId}`);
    } catch (error) {
        console.error('Tag deletion error:', error);
        throw new Error(`Tag Error: Failed to delete tags for upload ${uploadId}`);
    }
}

export { deleteTags };
