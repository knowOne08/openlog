import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Request password reset - sends reset email to user
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Result of password reset request
 */
async function requestPasswordReset(email) {
    try {
        console.log(`🔐 Password reset requested for: ${email}`);

        // Validate email
        if (!email || !email.includes('@')) {
            throw new Error('Valid email address is required');
        }

        // Send password reset email using Supabase Auth
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`,
        });

        if (error) {
            console.error('Supabase password reset error:', error);
            throw new Error(`Password reset failed: ${error.message}`);
        }

        console.log(`✅ Password reset email sent to: ${email}`);

        return {
            success: true,
            message: 'Password reset email sent successfully',
            email
        };

    } catch (error) {
        console.error('Password reset request error:', error);
        return {
            success: false,
            error: error.message || 'Failed to send password reset email'
        };
    }
}

/**
 * Update user password with reset token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password to set
 * @returns {Promise<Object>} - Result of password update
 */
async function updatePassword(token, newPassword) {
    try {
        console.log('🔐 Updating password with reset token');

        // Validate inputs
        if (!token) {
            throw new Error('Reset token is required');
        }

        if (!newPassword || newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        // Create a new Supabase client with the user's access token
        // This is necessary because password updates require an authenticated session
        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY, // Use anon key, not service key
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Set the session with the access token
        const { data: sessionData, error: sessionError } = await userSupabase.auth.setSession({
            access_token: token,
            refresh_token: token // In password reset flow, access token is enough
        });

        if (sessionError) {
            console.error('Session error:', sessionError);
            throw new Error(`Failed to authenticate with reset token: ${sessionError.message}`);
        }

        // Now update the password with the authenticated session
        const { data, error } = await userSupabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Password update error:', error);
            throw new Error(`Password update failed: ${error.message}`);
        }

        console.log('✅ Password updated successfully');

        return {
            success: true,
            message: 'Password updated successfully'
        };

    } catch (error) {
        console.error('Password update error:', error);
        return {
            success: false,
            error: error.message || 'Failed to update password'
        };
    }
}

/**
 * Change password for authenticated user
 * @param {string} userId - User ID from authenticated session
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to set
 * @returns {Promise<Object>} - Result of password change
 */
async function changePassword(userId, currentPassword, newPassword) {
    try {
        console.log('🔐 Changing password for user:', userId);

        // Validate inputs
        if (!userId || !currentPassword || !newPassword) {
            throw new Error('User ID, current password, and new password are required');
        }

        if (newPassword.length < 8) {
            throw new Error('New password must be at least 8 characters long');
        }

        if (currentPassword === newPassword) {
            throw new Error('New password must be different from current password');
        }

        // Get user's email from database
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError || !userData?.user?.email) {
            console.error('User fetch error:', userError);
            throw new Error('User not found');
        }

        const userEmail = userData.user.email;

        // Create a client to verify current password
        const verifyClient = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Verify current password by attempting to sign in
        const { data: signInData, error: signInError } = await verifyClient.auth.signInWithPassword({
            email: userEmail,
            password: currentPassword,
        });

        if (signInError) {
            console.error('Current password verification failed:', signInError);
            throw new Error('Current password is incorrect');
        }

        // Update password using admin API
        const { data, error } = await supabase.auth.admin.updateUserById(userId, {
            password: newPassword
        });

        if (error) {
            console.error('Password change error:', error);
            throw new Error(`Password change failed: ${error.message}`);
        }

        console.log('✅ Password changed successfully');

        return {
            success: true,
            message: 'Password changed successfully'
        };

    } catch (error) {
        console.error('Password change error:', error);
        return {
            success: false,
            error: error.message || 'Failed to change password'
        };
    }
}

export { requestPasswordReset, updatePassword, changePassword };
