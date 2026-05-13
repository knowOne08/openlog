// test-supabase-connection.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY/SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('uploads').select('*').limit(1);
    if (error) {
      console.error('Supabase error:', error);
      process.exit(2);
    }
    console.log('Supabase connection successful! Example row:', data?.[0] || '(no rows)');
    process.exit(0);
  } catch (err) {
    console.error('Network or unexpected error:', err);
    process.exit(3);
  }
}

testConnection();
