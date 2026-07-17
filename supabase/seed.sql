-- ============================================================================
-- seed.sql
-- Predefined taxonomy (categories/subcategories), generic filters/amenities,
-- and a few starter cities. Safe to re-run (idempotent via ON CONFLICT).
--
-- Run this after the migrations, either via `supabase db reset`
-- (local dev, applies migrations + this file automatically) or by pasting it
-- into the Supabase SQL editor for a hosted project.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Top-level categories
-- (slugs for the first 10 intentionally match the current mock-data ids in
-- lib/data.ts so a future data migration is a simple slug -> id lookup.)
-- ----------------------------------------------------------------------------

insert into public.categories (slug, name, icon, sort_order) values
  ('restaurants',           'Restaurants',                'UtensilsCrossed', 10),
  ('cafe',                  'Cafés & Coffee',              'Coffee',          20),
  ('bakery',                'Bakeries',                    'Croissant',       30),
  ('bars-nightlife',        'Bars & Nightlife',            'Beer',            40),
  ('salon',                 'Hair & Beauty Salons',        'Scissors',        50),
  ('bookstore',             'Bookstores',                  'BookOpen',        60),
  ('gym',                   'Fitness & Gyms',              'Dumbbell',        70),
  ('florist',               'Florists',                    'Flower2',         80),
  ('yoga',                  'Yoga & Wellness',             'Sparkles',        90),
  ('petstore',              'Pet Stores & Services',       'PawPrint',        100),
  ('autoshop',              'Auto Repair & Services',      'Wrench',          110),
  ('retail-shopping',       'Retail & Shopping',           'ShoppingBag',     120),
  ('home-services',         'Home & Trade Services',       'Hammer',          130),
  ('professional-services', 'Professional Services',       'Briefcase',       140),
  ('health-medical',        'Health & Medical',            'Stethoscope',     150),
  ('education-training',    'Education & Training',        'GraduationCap',   160),
  ('arts-entertainment',    'Arts & Entertainment',        'Palette',         170),
  ('events-party',          'Events & Party Services',     'PartyPopper',     180),
  ('travel-lodging',        'Travel & Lodging',            'Hotel',           190),
  ('real-estate',           'Real Estate & Property',      'Building2',       200),
  ('tech-electronics',      'Technology & Electronics',    'Laptop',          210),
  ('community-nonprofit',   'Community & Nonprofit',       'HeartHandshake',  220)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Subcategories — inserted via a small helper CTE so each row just needs to
-- name its parent's slug instead of juggling ids by hand.
-- ----------------------------------------------------------------------------

with sub (parent_slug, slug, name, sort_order) as (
  values
    -- Restaurants
    ('restaurants', 'italian',       'Italian',           10),
    ('restaurants', 'american',      'American',          20),
    ('restaurants', 'plant-based',   'Plant-based',       30),
    ('restaurants', 'asian',         'Asian',             40),
    ('restaurants', 'mexican',       'Mexican',           50),
    ('restaurants', 'seafood',       'Seafood',           60),
    ('restaurants', 'pizza',         'Pizza',             70),
    ('restaurants', 'bbq',           'BBQ',               80),
    ('restaurants', 'fine-dining',   'Fine dining',       90),
    ('restaurants', 'fast-casual',   'Fast casual',       100),

    -- Cafés & Coffee
    ('cafe', 'coffee',     'Coffee & espresso',   10),
    ('cafe', 'breakfast',  'Breakfast & brunch',  20),
    ('cafe', 'pastries',   'Pastries',            30),
    ('cafe', 'tea-house',  'Tea house',           40),
    ('cafe', 'juice-bar',  'Juice & smoothie bar',50),

    -- Bakeries
    ('bakery', 'bread',     'Bread & loaves',   10),
    ('bakery', 'pastries',  'Pastries',         20),
    ('bakery', 'cakes',     'Cakes & custom',   30),
    ('bakery', 'donuts',    'Donuts',           40),

    -- Bars & Nightlife
    ('bars-nightlife', 'cocktail-bar', 'Cocktail bar', 10),
    ('bars-nightlife', 'brewery',      'Brewery',      20),
    ('bars-nightlife', 'wine-bar',     'Wine bar',     30),
    ('bars-nightlife', 'sports-bar',   'Sports bar',   40),
    ('bars-nightlife', 'nightclub',    'Nightclub',    50),

    -- Hair & Beauty Salons
    ('salon', 'hair',          'Hair & color',   10),
    ('salon', 'barber',        'Barbershop',     20),
    ('salon', 'nails',         'Nail salon',     30),
    ('salon', 'lashes-brows',  'Lashes & brows', 40),
    ('salon', 'makeup',        'Makeup studio',  50),

    -- Bookstores
    ('bookstore', 'new',    'New releases',    10),
    ('bookstore', 'used',   'Used & rare',     20),
    ('bookstore', 'travel', 'Travel & maps',   30),
    ('bookstore', 'comics', 'Comics & manga',  40),
    ('bookstore', 'kids',   'Kids & YA',       50),

    -- Fitness & Gyms
    ('gym', 'strength',          'Strength',            10),
    ('gym', 'classes',           'Group classes',       20),
    ('gym', 'crossfit',          'CrossFit & HIIT',     30),
    ('gym', 'martial-arts',      'Martial arts',        40),
    ('gym', 'personal-training', 'Personal training',   50),

    -- Florists
    ('florist', 'everyday',          'Everyday bouquets',    10),
    ('florist', 'events',            'Events & weddings',    20),
    ('florist', 'plants-succulents', 'Plants & succulents',  30),

    -- Yoga & Wellness
    ('yoga', 'yoga',              'Yoga & movement',   10),
    ('yoga', 'wellness',          'Wellness & spa',    20),
    ('yoga', 'massage-therapy',   'Massage therapy',   30),
    ('yoga', 'meditation',        'Meditation',        40),

    -- Pet Stores & Services
    ('petstore', 'supplies',   'Food & supplies',   10),
    ('petstore', 'outdoor',    'Outdoor gear',      20),
    ('petstore', 'grooming',   'Grooming',          30),
    ('petstore', 'boarding',   'Boarding & daycare',40),
    ('petstore', 'veterinary', 'Veterinary care',   50),

    -- Auto Repair & Services
    ('autoshop', 'repair',    'Repair & service',     10),
    ('autoshop', 'tires',     'Tires & maintenance',  20),
    ('autoshop', 'detailing', 'Detailing',            30),
    ('autoshop', 'car-wash',  'Car wash',             40),
    ('autoshop', 'body-shop', 'Body shop',            50),

    -- Retail & Shopping
    ('retail-shopping', 'clothing-apparel',   'Clothing & apparel',    10),
    ('retail-shopping', 'shoes',              'Shoes',                 20),
    ('retail-shopping', 'jewelry-accessories','Jewelry & accessories', 30),
    ('retail-shopping', 'electronics',        'Electronics',           40),
    ('retail-shopping', 'home-goods',         'Home goods',            50),
    ('retail-shopping', 'gifts-novelty',      'Gifts & novelty',       60),
    ('retail-shopping', 'thrift-vintage',     'Thrift & vintage',      70),
    ('retail-shopping', 'discount-store',     'Discount Store',        80),

    -- Home & Trade Services
    ('home-services', 'plumbing',     'Plumbing',            10),
    ('home-services', 'electrical',   'Electrical',          20),
    ('home-services', 'hvac',         'HVAC',                30),
    ('home-services', 'landscaping',  'Landscaping',         40),
    ('home-services', 'cleaning',     'Cleaning',            50),
    ('home-services', 'painting',     'Painting',            60),
    ('home-services', 'roofing',      'Roofing',             70),
    ('home-services', 'handyman',     'Handyman',            80),
    ('home-services', 'pest-control', 'Pest control',        90),

    -- Professional Services
    ('professional-services', 'legal',              'Legal',               10),
    ('professional-services', 'accounting-tax',     'Accounting & tax',    20),
    ('professional-services', 'insurance',          'Insurance',           30),
    ('professional-services', 'marketing-design',   'Marketing & design',  40),
    ('professional-services', 'notary',             'Notary',              50),
    ('professional-services', 'financial-planning', 'Financial planning',  60),

    -- Health & Medical
    ('health-medical', 'dentist',          'Dentist',           10),
    ('health-medical', 'chiropractor',     'Chiropractor',      20),
    ('health-medical', 'physical-therapy', 'Physical therapy',  30),
    ('health-medical', 'optometry',        'Optometry',         40),
    ('health-medical', 'urgent-care',      'Urgent care',       50),
    ('health-medical', 'mental-health',    'Mental health',     60),
    ('health-medical', 'pediatrics',       'Pediatrics',        70),

    -- Education & Training
    ('education-training', 'tutoring',           'Tutoring',              10),
    ('education-training', 'music-lessons',      'Music lessons',         20),
    ('education-training', 'language-classes',   'Language classes',     30),
    ('education-training', 'driving-school',     'Driving school',       40),
    ('education-training', 'childcare-daycare',  'Childcare & daycare',  50),
    ('education-training', 'test-prep',          'Test prep',            60),

    -- Arts & Entertainment
    ('arts-entertainment', 'art-gallery',        'Art gallery',        10),
    ('arts-entertainment', 'movie-theater',      'Movie theater',      20),
    ('arts-entertainment', 'live-music',         'Live music venue',   30),
    ('arts-entertainment', 'museum',             'Museum',             40),
    ('arts-entertainment', 'arcade-gaming',      'Arcade & gaming',    50),
    ('arts-entertainment', 'photography-studio', 'Photography studio',60),

    -- Events & Party Services
    ('events-party', 'event-venue',          'Event venue',           10),
    ('events-party', 'catering',             'Catering',              20),
    ('events-party', 'party-rentals',        'Party rentals',         30),
    ('events-party', 'photography-video',    'Photography & video',  40),
    ('events-party', 'dj-entertainment',     'DJ & entertainment',   50),

    -- Travel & Lodging
    ('travel-lodging', 'hotel-bnb',         'Hotel & B&B',        10),
    ('travel-lodging', 'vacation-rental',   'Vacation rental',    20),
    ('travel-lodging', 'travel-agency',     'Travel agency',      30),
    ('travel-lodging', 'tour-guide',        'Tours & guides',     40),

    -- Real Estate & Property
    ('real-estate', 'real-estate-agent',   'Real estate agent',    10),
    ('real-estate', 'property-management', 'Property management',  20),
    ('real-estate', 'home-inspection',     'Home inspection',      30),
    ('real-estate', 'moving-services',     'Moving services',      40),

    -- Technology & Electronics
    ('tech-electronics', 'computer-repair', 'Computer repair',   10),
    ('tech-electronics', 'phone-repair',    'Phone repair',      20),
    ('tech-electronics', 'electronics-store','Electronics store',30),
    ('tech-electronics', 'it-services',     'IT services',       40),
    ('tech-electronics', 'web-design',      'Web design',        50),

    -- Community & Nonprofit
    ('community-nonprofit', 'religious-organization', 'Religious organization', 10),
    ('community-nonprofit', 'nonprofit-charity',      'Nonprofit & charity',    20),
    ('community-nonprofit', 'community-center',       'Community center',      30),
    ('community-nonprofit', 'government-services',    'Government services',   40)
)
insert into public.categories (parent_id, slug, name, sort_order)
select c.id, sub.slug, sub.name, sub.sort_order
from sub
join public.categories c on c.slug = sub.parent_slug and c.parent_id is null
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Filters / amenities — global ones apply everywhere (category_id null);
-- scoped ones only show up for businesses in that top-level category.
-- ----------------------------------------------------------------------------

insert into public.filters (slug, label, group_name, sort_order) values
  ('free-wifi',              'Free WiFi',              'Amenities',    10),
  ('parking-available',      'Parking available',      'Amenities',    20),
  ('wheelchair-accessible',  'Wheelchair accessible',  'Accessibility',30),
  ('accepts-credit-cards',   'Accepts credit cards',   'Payment',      40),
  ('online-booking',         'Online booking',         'Amenities',    50),
  ('delivery-available',     'Delivery available',     'Amenities',    60),
  ('walk-ins-welcome',       'Walk-ins welcome',       'Amenities',    70),
  ('appointment-required',   'Appointment required',   'Amenities',    80),
  ('good-for-groups',        'Good for groups',        'Amenities',    90),
  ('open-late',              'Open late',              'Amenities',    100),
  ('family-friendly',        'Family friendly',        'Amenities',    110),
  ('pet-friendly',           'Pet friendly',           'Amenities',    120),
  ('locally-owned',          'Locally owned',          'About',        130),
  ('woman-owned',            'Woman-owned',            'About',        140),
  ('lgbtq-friendly',         'LGBTQ+ friendly',        'About',        150)
on conflict (slug) do nothing;

with scoped (category_slug, slug, label, group_name, sort_order) as (
  values
    ('restaurants', 'outdoor-seating',      'Outdoor seating',      'Amenities', 10),
    ('restaurants', 'takeout-available',    'Takeout available',    'Amenities', 20),
    ('restaurants', 'full-bar',             'Full bar',             'Amenities', 30),
    ('restaurants', 'vegan-options',        'Vegan options',        'Menu',      40),
    ('restaurants', 'gluten-free-options',  'Gluten-free options',  'Menu',      50),
    ('gym',         '24-7-access',          '24/7 access',          'Amenities', 10),
    ('gym',         'free-trial-class',     'Free trial class',     'Amenities', 20),
    ('petstore',    'on-site-grooming',     'On-site grooming',     'Amenities', 10),
    ('autoshop',    'loaner-cars',          'Loaner cars available','Amenities', 10),
    ('autoshop',    'same-day-service',     'Same-day service',     'Amenities', 20)
)
insert into public.filters (category_id, slug, label, group_name, sort_order)
select c.id, scoped.slug, scoped.label, scoped.group_name, scoped.sort_order
from scoped
join public.categories c on c.slug = scoped.category_slug and c.parent_id is null
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Starter cities (match the mock data in lib/data.ts)
-- ----------------------------------------------------------------------------

insert into public.cities (slug, name, region, country, lat, lng) values
  ('riverton',  'Riverton',  'NJ', 'US', 40.0, -74.0),
  ('oakdale',   'Oakdale',   'NJ', 'US', 40.1, -74.1),
  ('brookside', 'Brookside', 'NJ', 'US', 39.9, -73.9),
  ('brantford', 'Brantford', 'ON', 'CA', 43.1394, -80.2644)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Small-business service taxonomy (also in migrations/0009_small_business_services.sql)
-- ----------------------------------------------------------------------------

insert into public.categories (slug, name, icon, sort_order) values
  ('kids-family',    'Kids & Family Services', 'Baby',       225),
  ('pottery-crafts', 'Pottery & Crafts',       'Paintbrush', 235)
on conflict (slug) do nothing;

update public.categories
set name = 'Electrical repair'
where slug = 'electrical' and parent_id is not null;

update public.categories
set name = 'Tires & tire change'
where slug = 'tires' and parent_id is not null;

with sub (parent_slug, slug, name, sort_order) as (
  values
    ('home-services',    'decks-fences',       'Decks & fences',            95),
    ('events-party',     'birthday-parties',   'Birthday parties',          55),
    ('tech-electronics', 'electronics-repair', 'Electronics repair',        15),
    ('kids-family',      'kids-play',          'Play centres & soft play',  10),
    ('kids-family',      'kids-parties',       'Kids party venues',         20),
    ('kids-family',      'kids-classes',       'Kids classes & camps',      30),
    ('kids-family',      'kids-care',          'Babysitting & nanny',       40),
    ('pottery-crafts',   'pottery-studio',     'Pottery studio',            10),
    ('pottery-crafts',   'pottery-classes',    'Classes & workshops',       20),
    ('pottery-crafts',   'custom-pottery',     'Custom & commissions',      30)
)
insert into public.categories (parent_id, slug, name, sort_order)
select c.id, sub.slug, sub.name, sub.sort_order
from sub
join public.categories c on c.slug = sub.parent_slug and c.parent_id is null
on conflict (slug) do nothing;

with scoped (category_slug, slug, label, group_name, sort_order) as (
  values
    ('home-services',    'emergency-service',      'Emergency / same-day',       'Services',  10),
    ('home-services',    'free-estimates',         'Free estimates',             'Services',  20),
    ('home-services',    'licensed-insured',       'Licensed & insured',         'About',     30),
    ('home-services',    'residential-commercial', 'Residential & commercial',   'Services',  40),
    ('autoshop',         'mobile-service',         'Mobile / on-site service',   'Services',  30),
    ('kids-family',      'age-0-5',                'Ages 0–5',                   'Ages',      10),
    ('kids-family',      'age-6-12',               'Ages 6–12',                  'Ages',      20),
    ('kids-family',      'kids-party-packages',    'Party packages',             'Services',  30),
    ('kids-family',      'drop-in-welcome',        'Drop-in welcome',            'Amenities', 40),
    ('events-party',     'event-party-packages',   'Party packages',             'Services',  10),
    ('events-party',     'on-site-hosting',        'On-site hosting',            'Services',  20),
    ('events-party',     'custom-themes',          'Custom themes',              'Services',  30),
    ('tech-electronics', 'walk-in-repair',         'Walk-in repair',             'Services',  10),
    ('tech-electronics', 'data-recovery',          'Data recovery',              'Services',  20),
    ('tech-electronics', 'while-you-wait',         'While-you-wait service',     'Services',  30),
    ('pottery-crafts',   'open-studio',            'Open studio time',           'Amenities', 10),
    ('pottery-crafts',   'beginner-friendly',      'Beginner friendly',          'Amenities', 20),
    ('pottery-crafts',   'kids-welcome',           'Kids welcome',               'Amenities', 30)
)
insert into public.filters (category_id, slug, label, group_name, sort_order)
select c.id, scoped.slug, scoped.label, scoped.group_name, scoped.sort_order
from scoped
join public.categories c on c.slug = scoped.category_slug and c.parent_id is null
on conflict (slug) do nothing;
