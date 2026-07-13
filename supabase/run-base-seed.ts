#!/usr/bin/env tsx
/**
 * Run the base seed.sql file to populate categories, filters, and cities.
 * This must be run BEFORE seed-businesses.ts
 * 
 * Usage:
 *   npx tsx supabase/run-base-seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('🌱 Running base seed.sql...\n');

  // Read the seed.sql file
  const seedPath = join(__dirname, 'seed.sql');
  const seedSQL = readFileSync(seedPath, 'utf-8');

  // Split into individual statements (simple split by semicolon)
  // This is a basic approach - for complex SQL you might need a proper parser
  const statements = seedSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Skip comments and empty lines
    if (stmt.startsWith('--') || stmt.length < 10) continue;

    // Execute the statement
    const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' });

    if (error) {
      // Check if it's a "already exists" or "conflict" error (which is OK for idempotent seeds)
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate key') ||
          error.message.includes('conflict')) {
        console.log(`⚠️  Skipped (already exists): Statement ${i + 1}`);
      } else {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        errorCount++;
      }
    } else {
      successCount++;
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`\n💡 Now you can run: npm run seed:businesses`);
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  console.log('\n⚠️  Note: This script requires exec_sql RPC function.');
  console.log('    Please run seed.sql manually via Supabase Dashboard SQL Editor.');
  process.exit(1);
});
