// Check existing users and create test user if needed
import 'dotenv/config';
import { supabaseClient } from './config/db.js';
import { v4 as uuidv4 } from 'uuid';

async function setupTestUser() {
    console.log('🔍 Checking for existing users...');
    
    try {
        // Check if any users exist
        const { data: users, error } = await supabaseClient
            .from('user_profiles')
            .select('id, email')
            .limit(1);
            
        if (error) {
            console.error('Error checking users:', error.message);
            return null;
        }
        
        if (users && users.length > 0) {
            console.log('✅ Found existing user:', users[0].id);
            return users[0].id;
        }
        
        console.log('📝 No users found, creating test user...');
        
        // Create a test user
        const testUserId = uuidv4();
        const { data: newUser, error: createError } = await supabaseClient
            .from('user_profiles')
            .insert([{
                id: testUserId,
                email: 'test@example.com',
                username: 'testuser',
                full_name: 'Test User'
            }])
            .select()
            .single();
            
        if (createError) {
            console.error('Error creating test user:', createError.message);
            return null;
        }
        
        console.log('✅ Created test user:', newUser.id);
        return newUser.id;
        
    } catch (error) {
        console.error('Setup error:', error.message);
        return null;
    }
}

const userId = await setupTestUser();
if (userId) {
    console.log('🎯 Test user ID:', userId);
} else {
    console.log('❌ Failed to setup test user');
}

export { setupTestUser };
