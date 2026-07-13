#!/bin/bash

# This script runs the seed.sql file to populate the base taxonomy
# Run this BEFORE running seed-businesses.ts

echo "🌱 Running base seed.sql..."

# Check if we have supabase CLI
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    supabase db execute < supabase/seed.sql
else
    echo ""
    echo "⚠️  Supabase CLI not found."
    echo ""
    echo "Please run the seed.sql file manually using one of these methods:"
    echo ""
    echo "1. Via Supabase Dashboard:"
    echo "   - Go to your Supabase project dashboard"
    echo "   - Open SQL Editor"
    echo "   - Copy/paste the contents of supabase/seed.sql"
    echo "   - Click 'Run'"
    echo ""
    echo "2. Install Supabase CLI and run:"
    echo "   npm install -g supabase"
    echo "   supabase link --project-ref your-project-ref"
    echo "   supabase db execute < supabase/seed.sql"
    echo ""
    exit 1
fi

echo "✅ Base seed complete!"
echo ""
echo "Now you can run: npm run seed:businesses"
