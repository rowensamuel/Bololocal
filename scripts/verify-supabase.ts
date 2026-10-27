import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Target URL:', url);
console.log('Anon key length:', key.length);

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log('\n--- 1. PROBING DATABASE TABLES ---');
  const tables = [
    'languages',
    'profiles',
    'user_language_progress',
    'lesson_progress',
    'quiz_attempts',
    'timed_quiz_attempts',
    'user_achievements',
    'user_badges',
    'ai_conversations'
  ];

  let missingCount = 0;
  for (const table of tables) {
    try {
      const res = await supabase.from(table).select('*').limit(1);
      if (res.error) {
        console.log(`❌ Table [${table}]: Status ${res.status} - Code: ${res.error.code} - Message: ${res.error.message}`);
        if (res.error.code === 'PGRST205' || res.status === 404) {
          missingCount++;
        }
      } else {
        console.log(`✅ Table [${table}]: Accessible (HTTP ${res.status}) - Rows: ${res.data?.length}`);
      }
    } catch (err: any) {
      console.log(`💥 Table [${table}] query exception:`, err.message);
    }
  }

  console.log(`\nTable Probe Summary: ${tables.length - missingCount}/${tables.length} tables accessible.`);

  console.log('\n--- 2. PROBING SUPABASE AUTH ---');
  try {
    const testEmail = `verify_${Date.now()}@testbolo.com`;
    const testPassword = 'TestPassword123!';
    console.log(`Attempting auth.signUp for test account: ${testEmail}`);
    const signUpRes = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: `user_${Date.now()}`,
          native_language_id: 'en',
          learning_language_id: 'hi',
          role: 'user'
        }
      }
    });

    if (signUpRes.error) {
      console.log(`❌ Auth signUp error: ${signUpRes.error.message} (Status ${signUpRes.error.status})`);
    } else {
      console.log(`✅ Auth signUp succeeded! User ID: ${signUpRes.data.user?.id}, Email: ${signUpRes.data.user?.email}`);
      console.log(`   User Metadata:`, signUpRes.data.user?.user_metadata);
      console.log(`   Session: ${signUpRes.data.session ? 'Active session returned' : 'No session returned (email confirmation required by project settings)'}`);
    }
  } catch (authErr: any) {
    console.log('💥 Auth error:', authErr.message);
  }
}

main().catch(console.error);
