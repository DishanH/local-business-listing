# Business Seeding Guide

This guide explains how to seed businesses into your Supabase database using the provided template and script.

## Prerequisites

1. **Supabase project set up** with migrations applied
2. **Environment variables** configured in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` for production)
3. **Base taxonomy seeded** (categories, subcategories, filters, cities) via `seed.sql`

## Step 1: Apply Base Seeds

First, make sure the base taxonomy is seeded. Run the `seed.sql` file in your Supabase SQL editor or via CLI:

```bash
# Using Supabase CLI (if you have it installed)
supabase db reset

# Or paste the contents of supabase/seed.sql into the Supabase SQL Editor
```

This will create:
- Categories (restaurants, retail-shopping, etc.)
- Subcategories (cafe, american, discount-store, etc.)
- Filters/amenities (free-wifi, parking-available, etc.)
- Cities (including Brantford, ON)

## Step 2: Install Dependencies

Install the `tsx` package to run TypeScript directly:

```bash
npm install
# or
pnpm install
# or
yarn install
```

## Step 3: Configure Environment

Ensure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

**Note:** For local development, the publishable key works fine. For production seeding, use the service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 4: Run the Seeding Script

Execute the seeding script:

```bash
npm run seed:businesses
# or
npx tsx supabase/seed-businesses.ts
```

The script will:
1. ✅ Read `seed-businesses.template.json`
2. ✅ Lookup category, subcategory, city, and filter IDs
3. ✅ Insert each business with all related data:
   - Business details
   - Business owners (if provided)
   - Filters/amenities
   - Images
   - Hours
   - Offering sections & offerings (menus)
   - Specials
   - Posts

## Template Structure

The `seed-businesses.template.json` file contains an array of business objects. Each business can have:

```typescript
{
  // Basic Info
  "slug": "unique-business-slug",
  "name": "Business Name",
  "tagline": "Short tagline",
  "description": "Full description",
  
  // Classification
  "category_slug": "restaurants",        // Required: references categories table
  "subcategory_slug": "cafe",            // Optional: references categories table
  "status": "published",                 // draft | pending_review | published | suspended | archived
  
  // Contact & Location
  "email": "contact@business.com",
  "phone": "+1-555-0100",
  "website": "https://business.com",
  "address_line1": "123 Main St",
  "address_line2": "Suite 100",
  "city_slug": "brantford",             // Required: references cities table
  "postal_code": "N3R 5K4",
  "lat": 43.1394,
  "lng": -80.2644,
  
  // Display
  "price_level": 2,                      // 1-4 ($-$$$$)
  "cover_image_url": "/businesses/cover.png",
  "is_featured": true,
  "avg_rating": 4.5,
  "review_count": 100,
  "keywords": ["keyword1", "keyword2"],
  
  // Metadata
  "published_at": "2026-07-01T12:00:00Z",
  "created_by": null,                    // Optional: profile UUID
  
  // Related Data
  "owners": [
    { "profile_id": null, "role": "owner" }
  ],
  "filter_slugs": ["free-wifi", "parking-available"],
  "images": [
    {
      "url": "/businesses/image.png",
      "alt_text": "Image description",
      "sort_order": 0
    }
  ],
  "hours": [
    {
      "day_of_week": 0,                  // 0=Sunday, 6=Saturday
      "open_minute": 480,                // 8:00 AM (8 * 60)
      "close_minute": 1080               // 6:00 PM (18 * 60)
    }
  ],
  "offering_sections": [
    {
      "name": "Section Name",
      "sort_order": 0,
      "offerings": [
        {
          "name": "Item Name",
          "description": "Item description",
          "price_cents": 1295,           // $12.95
          "price_label": null,           // Or "Starting at $12"
          "tag": "Popular",
          "image_url": null,
          "is_available": true,
          "sort_order": 0
        }
      ]
    }
  ],
  "specials": [
    {
      "day_of_week": 0,                  // Optional: null = any day
      "name": "Special Name",
      "description": "Special description",
      "price_cents": null,
      "price_label": "2-for-1",
      "starts_on": null,                 // Optional: "2026-07-01"
      "ends_on": null
    }
  ],
  "posts": [
    {
      "type": "update",                  // offer | event | update
      "title": "Post Title",
      "body": "Post content",
      "badge": "Event",
      "published_at": "2026-07-01T10:00:00Z",
      "expires_at": null,
      "author_id": null
    }
  ]
}
```

## Troubleshooting

### Error: Category not found
- Ensure `seed.sql` has been run first
- Check that the `category_slug` matches exactly (case-sensitive)

### Error: City not found
- Add your city to `seed.sql` first:
  ```sql
  insert into public.cities (slug, name, region, country, lat, lng) values
    ('your-city', 'Your City', 'ON', 'CA', 43.0, -80.0);
  ```

### Error: Subcategory not found
- Ensure the subcategory exists and is a child of the category
- Check the `seed.sql` file for available subcategories

### Business already exists
- The script will skip businesses that already exist (by slug)
- To re-seed, delete the existing business first

### RLS Policies Block Insertion
- Use the service role key (`SUPABASE_SERVICE_ROLE_KEY`) which bypasses RLS
- Or temporarily disable RLS on relevant tables (not recommended for production)

## Adding More Businesses

1. Edit `seed-businesses.template.json`
2. Add a new business object to the array
3. Run `npm run seed:businesses` again
4. Existing businesses will be skipped

## Production Deployment

For production seeding:

1. Get your service role key from Supabase dashboard
2. Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
3. Run the script on your server or CI/CD pipeline

⚠️ **Never commit the service role key to version control!**
