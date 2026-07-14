# Quick Start: Seeding Your Database

Follow these steps to seed your database with the base taxonomy and real business data.

> **New migration:** After pulling latest code, run `supabase/migrations/0007_customer_ratings.sql` in the Supabase SQL Editor (same as Step 1) so owner→customer ratings work in the inbox.

## Step 1: Run Base Seeds (Categories, Filters, Cities)

You need to run `seed.sql` first to create the base taxonomy. Here are your options:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://fuccrrsqvipenmxkofhj.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/seed.sql` in your code editor
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd+Enter)
8. Wait for "Success. No rows returned" message

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (one-time setup)
supabase link --project-ref fuccrrsqvipenmxkofhj

# Run the seed file
supabase db execute < supabase/seed.sql
```

### What This Creates

The `seed.sql` file creates:
- ✅ 22 top-level categories (restaurants, retail-shopping, etc.)
- ✅ 100+ subcategories (cafe, american, discount-store, etc.)
- ✅ 15+ filters/amenities (free-wifi, parking-available, etc.)
- ✅ 4 cities (Riverton, Oakdale, Brookside, **Brantford**)

## Step 2: Seed Businesses

Now run the TypeScript script to seed the 3 real Brantford businesses:

```bash
npm run seed:businesses
```

This will seed:
1. ✅ **Symposium Cafe Restaurant Brantford** - Family restaurant with breakfast & desserts
2. ✅ **Zander's Fire Grill & Brew Lounge** - Grill house with live music
3. ✅ **Brantford Surplus** - Discount retail store

Each business includes:
- Basic info (name, description, contact, location)
- Operating hours
- Menu/offerings
- Special deals
- Posts/updates
- Images
- Amenities/filters

## Step 3: Verify

Check your database in Supabase Dashboard:

1. Go to **Table Editor**
2. Select `businesses` table
3. You should see 3 new businesses with status "published"

## Troubleshooting

### "City not found: brantford"
- You need to run `seed.sql` first (Step 1)
- The city must exist in the `cities` table before seeding businesses

### "Category not found" or "Subcategory not found"
- You need to run `seed.sql` first (Step 1)
- Verify the category/subcategory slugs match those in `seed.sql`

### "Business already exists"
- The script is idempotent and will skip existing businesses
- To re-seed, delete the business from the `businesses` table first

### Permission errors
- Make sure you're using the correct Supabase URL and key
- For production, use `SUPABASE_SERVICE_ROLE_KEY` instead of the publishable key

## Next Steps

- Add more businesses by editing `seed-businesses.template.json`
- Update business info via the admin dashboard
- Add business images to `/public/businesses/` directory
- Configure business owners by adding user profile IDs

## Need Help?

See the full documentation in `SEEDING.md` for:
- Detailed template structure
- All available fields
- Advanced configuration
- Production deployment
