#!/usr/bin/env tsx
/**
 * Seed businesses from the template JSON file into Supabase.
 * 
 * Usage:
 *   npx tsx supabase/seed-businesses.ts
 * 
 * Or add to package.json scripts:
 *   "seed:businesses": "tsx supabase/seed-businesses.ts"
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface BusinessTemplate {
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  category_slug: string;
  subcategory_slug?: string;
  status: 'draft' | 'pending_review' | 'published' | 'suspended' | 'archived';
  price_level?: number;
  email?: string;
  phone?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city_slug: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  cover_image_url?: string;
  is_featured?: boolean;
  avg_rating?: number;
  review_count?: number;
  keywords?: string[];
  published_at?: string;
  created_by?: string | null;
  owners?: Array<{ profile_id: string | null; role: 'owner' | 'manager' | 'staff' }>;
  filter_slugs?: string[];
  images?: Array<{ url: string; alt_text?: string; sort_order: number }>;
  hours?: Array<{ day_of_week: number; open_minute: number | null; close_minute: number | null }>;
  offering_sections?: Array<{
    name: string;
    sort_order: number;
    offerings: Array<{
      name: string;
      description?: string;
      price_cents?: number;
      price_label?: string;
      tag?: string;
      image_url?: string;
      is_available?: boolean;
      sort_order: number;
    }>;
  }>;
  specials?: Array<{
    day_of_week?: number;
    name: string;
    description?: string;
    price_cents?: number;
    price_label?: string;
    starts_on?: string;
    ends_on?: string;
  }>;
  posts?: Array<{
    type: 'offer' | 'event' | 'update';
    title: string;
    body: string;
    badge?: string;
    published_at: string;
    expires_at?: string;
    author_id?: string | null;
  }>;
}

async function lookupCategoryId(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error looking up category ${slug}:`, error);
    return null;
  }

  return data?.id || null;
}

async function lookupCityId(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error looking up city ${slug}:`, error);
    return null;
  }

  return data?.id || null;
}

async function lookupFilterIds(slugs: string[]): Promise<string[]> {
  if (!slugs || slugs.length === 0) return [];

  const { data, error } = await supabase
    .from('filters')
    .select('id')
    .in('slug', slugs);

  if (error) {
    console.error('Error looking up filters:', error);
    return [];
  }

  return data.map(f => f.id);
}

async function seedBusiness(template: BusinessTemplate) {
  console.log(`\n📦 Seeding business: ${template.name}...`);

  // 1. Lookup category IDs
  const categoryId = await lookupCategoryId(template.category_slug);
  if (!categoryId) {
    console.error(`❌ Category not found: ${template.category_slug}`);
    return;
  }

  let subcategoryId = null;
  if (template.subcategory_slug) {
    subcategoryId = await lookupCategoryId(template.subcategory_slug);
    if (!subcategoryId) {
      console.error(`❌ Subcategory not found: ${template.subcategory_slug}`);
      return;
    }
  }

  // 2. Lookup city ID
  const cityId = await lookupCityId(template.city_slug);
  if (!cityId) {
    console.error(`❌ City not found: ${template.city_slug}`);
    return;
  }

  // 3. Check if business already exists
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', template.slug)
    .single();

  if (existingBusiness) {
    console.log(`⚠️  Business already exists: ${template.slug}, skipping...`);
    return;
  }

  // 4. Insert business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      slug: template.slug,
      name: template.name,
      tagline: template.tagline,
      description: template.description,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      status: template.status,
      price_level: template.price_level,
      email: template.email,
      phone: template.phone,
      website: template.website,
      address_line1: template.address_line1,
      address_line2: template.address_line2,
      city_id: cityId,
      postal_code: template.postal_code,
      lat: template.lat,
      lng: template.lng,
      cover_image_url: template.cover_image_url,
      is_featured: template.is_featured ?? false,
      avg_rating: template.avg_rating ?? 0,
      review_count: template.review_count ?? 0,
      keywords: template.keywords ?? [],
      published_at: template.published_at,
      created_by: template.created_by,
    })
    .select()
    .single();

  if (businessError) {
    console.error('❌ Error inserting business:', businessError);
    return;
  }

  console.log(`✅ Business created: ${business.id}`);

  // 5. Insert business owners (if provided and not null)
  if (template.owners && template.owners.length > 0) {
    const validOwners = template.owners.filter(o => o.profile_id !== null);
    if (validOwners.length > 0) {
      const { error: ownersError } = await supabase
        .from('business_owners')
        .insert(
          validOwners.map(owner => ({
            business_id: business.id,
            profile_id: owner.profile_id,
            role: owner.role,
          }))
        );

      if (ownersError) {
        console.error('❌ Error inserting owners:', ownersError);
      } else {
        console.log(`✅ Inserted ${validOwners.length} owner(s)`);
      }
    }
  }

  // 6. Insert business filters
  if (template.filter_slugs && template.filter_slugs.length > 0) {
    const filterIds = await lookupFilterIds(template.filter_slugs);
    if (filterIds.length > 0) {
      const { error: filtersError } = await supabase
        .from('business_filters')
        .insert(
          filterIds.map(filterId => ({
            business_id: business.id,
            filter_id: filterId,
          }))
        );

      if (filtersError) {
        console.error('❌ Error inserting filters:', filtersError);
      } else {
        console.log(`✅ Inserted ${filterIds.length} filter(s)`);
      }
    }
  }

  // 7. Insert business images
  if (template.images && template.images.length > 0) {
    const { error: imagesError } = await supabase
      .from('business_images')
      .insert(
        template.images.map(img => ({
          business_id: business.id,
          url: img.url,
          alt_text: img.alt_text,
          sort_order: img.sort_order,
        }))
      );

    if (imagesError) {
      console.error('❌ Error inserting images:', imagesError);
    } else {
      console.log(`✅ Inserted ${template.images.length} image(s)`);
    }
  }

  // 8. Insert business hours
  if (template.hours && template.hours.length > 0) {
    const { error: hoursError } = await supabase
      .from('business_hours')
      .insert(
        template.hours.map(hour => ({
          business_id: business.id,
          day_of_week: hour.day_of_week,
          open_minute: hour.open_minute,
          close_minute: hour.close_minute,
        }))
      );

    if (hoursError) {
      console.error('❌ Error inserting hours:', hoursError);
    } else {
      console.log(`✅ Inserted ${template.hours.length} hour(s)`);
    }
  }

  // 9. Insert offering sections and offerings
  if (template.offering_sections && template.offering_sections.length > 0) {
    for (const section of template.offering_sections) {
      const { data: sectionData, error: sectionError } = await supabase
        .from('business_offering_sections')
        .insert({
          business_id: business.id,
          name: section.name,
          sort_order: section.sort_order,
        })
        .select()
        .single();

      if (sectionError) {
        console.error('❌ Error inserting offering section:', sectionError);
        continue;
      }

      if (section.offerings && section.offerings.length > 0) {
        const { error: offeringsError } = await supabase
          .from('business_offerings')
          .insert(
            section.offerings.map(offering => ({
              business_id: business.id,
              section_id: sectionData.id,
              name: offering.name,
              description: offering.description,
              price_cents: offering.price_cents,
              price_label: offering.price_label,
              tag: offering.tag,
              image_url: offering.image_url,
              is_available: offering.is_available ?? true,
              sort_order: offering.sort_order,
            }))
          );

        if (offeringsError) {
          console.error('❌ Error inserting offerings:', offeringsError);
        } else {
          console.log(`✅ Inserted section "${section.name}" with ${section.offerings.length} offering(s)`);
        }
      }
    }
  }

  // 10. Insert specials
  if (template.specials && template.specials.length > 0) {
    const { error: specialsError } = await supabase
      .from('business_specials')
      .insert(
        template.specials.map(special => ({
          business_id: business.id,
          day_of_week: special.day_of_week,
          name: special.name,
          description: special.description,
          price_cents: special.price_cents,
          price_label: special.price_label,
          starts_on: special.starts_on,
          ends_on: special.ends_on,
        }))
      );

    if (specialsError) {
      console.error('❌ Error inserting specials:', specialsError);
    } else {
      console.log(`✅ Inserted ${template.specials.length} special(s)`);
    }
  }

  // 11. Insert posts
  if (template.posts && template.posts.length > 0) {
    const { error: postsError } = await supabase
      .from('business_posts')
      .insert(
        template.posts.map(post => ({
          business_id: business.id,
          author_id: post.author_id,
          type: post.type,
          title: post.title,
          body: post.body,
          badge: post.badge,
          published_at: post.published_at,
          expires_at: post.expires_at,
        }))
      );

    if (postsError) {
      console.error('❌ Error inserting posts:', postsError);
    } else {
      console.log(`✅ Inserted ${template.posts.length} post(s)`);
    }
  }

  console.log(`✅ Successfully seeded: ${template.name}`);
}

async function main() {
  console.log('🚀 Starting business seeding process...\n');

  // Read the template file
  const templatePath = join(__dirname, 'seed-businesses.template.json');
  const templateContent = readFileSync(templatePath, 'utf-8');
  const businesses: BusinessTemplate[] = JSON.parse(templateContent);

  console.log(`📋 Found ${businesses.length} business(es) to seed\n`);

  // Seed each business
  for (const business of businesses) {
    await seedBusiness(business);
  }

  console.log('\n✨ Seeding complete!');
}

main().catch(console.error);
