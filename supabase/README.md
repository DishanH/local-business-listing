# Supabase Database Seeding

This directory contains everything you need to seed your Supabase database with taxonomy and business data.

## 📁 Files Overview

- **`seed.sql`** - Base taxonomy (categories, subcategories, filters, cities)
- **`seed-businesses.template.json`** - 3 real Brantford businesses ready to import
- **`seed-businesses.ts`** - Script to import businesses from JSON to Supabase
- **`seed-help.ts`** - Helper script to check database status and show instructions
- **`QUICK-START.md`** - Step-by-step setup guide
- **`SEEDING.md`** - Complete documentation and template reference

## 🚀 Quick Start

### 1. Check your setup
```bash
npm run seed:help
```

This will check if your database is ready and provide next steps.

### 2. Run base seeds
Open Supabase Dashboard → SQL Editor → Paste contents of `seed.sql` → Run

This creates:
- ✅ Categories (restaurants, retail, etc.)
- ✅ Subcategories (cafe, american, discount-store, etc.)
- ✅ Filters (wifi, parking, etc.)
- ✅ Cities including Brantford, ON

### 3. Seed businesses
```bash
npm run seed:businesses
```

This imports 3 complete businesses with:
- Business details
- Hours of operation
- Menus/offerings
- Specials
- Posts/updates
- Images
- Amenities

## 📦 What's Included

The template includes 3 real Brantford businesses:

1. **Symposium Cafe Restaurant Brantford**
   - Gourmet comfort food and legendary all-day breakfast
   - 58 King George Rd, Brantford, ON
   - Full menu with breakfast classics and desserts
   - 4.5★ rating

2. **Zander's Fire Grill & Brew Lounge**
   - Motorcycles, live music, and fire-grilled food
   - 190 King George Rd, Brantford, ON
   - Famous wings and beer-can chicken
   - 4.3★ rating

3. **Brantford Surplus**
   - Local discount retail and surplus destination
   - 655 Colborne St E, Brantford, ON
   - Camping gear, hardware, groceries
   - 4.7★ rating

## 🛠️ Available Scripts

```bash
# Check database status and show setup instructions
npm run seed:help

# Seed businesses from template JSON
npm run seed:businesses
```

## 📚 Documentation

- **Quick Start Guide**: `QUICK-START.md` - Follow this for step-by-step setup
- **Full Documentation**: `SEEDING.md` - Complete template reference and troubleshooting

## 🔧 Customization

To add more businesses:

1. Edit `seed-businesses.template.json`
2. Add new business objects following the template structure
3. Run `npm run seed:businesses`

See `SEEDING.md` for complete field documentation.

## ⚠️ Important Notes

- **Run `seed.sql` first** - Base taxonomy must exist before seeding businesses
- **Idempotent** - Safe to re-run, existing businesses will be skipped
- **Service Role Key** - For production, use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS

## 🆘 Need Help?

1. Run `npm run seed:help` to check your setup
2. Check `QUICK-START.md` for common issues
3. See `SEEDING.md` for detailed troubleshooting

## 🎯 Next Steps

After seeding:
1. Visit your business listings at `/business/[slug]`
2. Test the search functionality
3. Add business images to `/public/businesses/`
4. Configure business owners in the admin panel
5. Add more businesses to expand your directory
