// config/db.js
const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'JWT_SECRET'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Create Supabase client for regular user operations
const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY
);

// Database connection test
const testConnection = async () => {
    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful');
        console.log(`📊 Found ${data?.[0]?.count || 0} user profiles`);
        return true;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        return false;
    }
};

// Helper function to check if user is admin
const isUserAdmin = async (userId) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .single();

        return !error && data;
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
};

// Helper function to get user profile
const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error('Get user profile error:', error);
        throw error;
    }
};

// Helper function to update last login
const updateLastLogin = async (userId) => {
    try {
        await supabaseAdmin
            .from('user_profiles')
            .update({
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
    } catch (error) {
        console.error('Update last login error:', error);
        // Don't throw error for this non-critical operation
    }
};

module.exports = {
    supabaseAdmin,
    supabaseClient,
    testConnection,
    isUserAdmin,
    getUserProfile,
    updateLastLogin
};