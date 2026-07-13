#!/usr/bin/env tsx
/**
 * Helper script to guide users through the seeding process
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function checkSetup() {
  console.log('\n🔍 Checking database setup...\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('❌ Missing Supabase credentials in .env.local');
    console.log('   Required: NEXT_PUBLIC_SUPABASE_URL');
    console.log('   Required: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    return false;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Check categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('count', { count: 'exact', head: true });

  if (catError || !categories) {
    console.log('❌ Categories table not accessible or empty');
    console.log('   You need to run seed.sql first!\n');
    return false;
  }

  // Check cities
  const { data: cities, error: cityError } = await supabase
    .from('cities')
    .select('slug')
    .eq('slug', 'brantford')
    .single();

  const hasBrantford = !cityError && cities;

  // Check businesses
  const { count: businessCount } = await supabase
    .from('businesses')
    .select('count', { count: 'exact', head: true });

  console.log('✅ Supabase connection successful!\n');
  console.log('📊 Current Database Status:\n');
  console.log(`   Categories: ${categories ? '✅ Loaded' : '❌ Not loaded'}`);
  console.log(`   Brantford City: ${hasBrantford ? '✅ Exists' : '❌ Missing'}`);
  console.log(`   Businesses: ${businessCount || 0} total\n`);

  if (!hasBrantford) {
    console.log('⚠️  You need to run seed.sql first!\n');
    return false;
  }

  return true;
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     Business Seeding Helper                       ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  const isReady = await checkSetup();

  if (!isReady) {
    console.log('📋 Setup Instructions:\n');
    console.log('Step 1: Run base seeds (categories, cities, filters)');
    console.log('        ');
    console.log('   Option A - Via Supabase Dashboard (Recommended):');
    console.log('   1. Go to https://fuccrrsqvipenmxkofhj.supabase.co');
    console.log('   2. Open SQL Editor');
    console.log('   3. Copy contents of supabase/seed.sql');
    console.log('   4. Paste and click Run\n');
    console.log('   Option B - Via Supabase CLI:');
    console.log('   $ supabase link --project-ref fuccrrsqvipenmxkofhj');
    console.log('   $ supabase db execute < supabase/seed.sql\n');
    console.log('Step 2: Seed businesses');
    console.log('   $ npm run seed:businesses\n');
  } else {
    console.log('✅ Your database is ready for business seeding!\n');
    console.log('Run the seeding script:\n');
    console.log('   $ npm run seed:businesses\n');
    console.log('This will seed 3 businesses:');
    console.log('   • Symposium Cafe Restaurant Brantford');
    console.log('   • Zander\'s Fire Grill & Brew Lounge');
    console.log('   • Brantford Surplus\n');
  }

  console.log('📚 For more details, see: supabase/QUICK-START.md\n');
}

main().catch(console.error);
