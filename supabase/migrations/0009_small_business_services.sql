-- ============================================================================
-- 0009_small_business_services.sql
-- Adds small-business service categories / subcategories and related filters.
-- Safe to re-run (idempotent via ON CONFLICT).
--
-- Already existed (no insert needed for the parent concept):
--   home-services → plumbing, electrical
--   autoshop → tires  (label updated to "Tires & tire change")
--
-- New in this script:
--   Top-level: kids-family, pottery-crafts
--   Subcategories: decks-fences, birthday-parties, electronics-repair,
--                  kids play/party/classes/care, pottery studio/classes/custom
--   Filters scoped to home-services, kids-family, events-party, tech-electronics,
--                  pottery-crafts
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Top-level categories
-- ----------------------------------------------------------------------------

insert into public.categories (slug, name, icon, sort_order) values
  ('kids-family',    'Kids & Family Services', 'Baby',     225),
  ('pottery-crafts', 'Pottery & Crafts',       'Paintbrush', 235)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Clarify existing subcategory labels (no new rows)
-- ----------------------------------------------------------------------------

update public.categories
set name = 'Electrical repair'
where slug = 'electrical' and parent_id is not null;

update public.categories
set name = 'Tires & tire change'
where slug = 'tires' and parent_id is not null;

-- ----------------------------------------------------------------------------
-- New subcategories
-- ----------------------------------------------------------------------------

with sub (parent_slug, slug, name, sort_order) as (
  values
    -- Home & Trade Services
    ('home-services', 'decks-fences', 'Decks & fences', 95),

    -- Events & Party Services
    ('events-party', 'birthday-parties', 'Birthday parties', 55),

    -- Technology & Electronics
    ('tech-electronics', 'electronics-repair', 'Electronics repair', 15),

    -- Kids & Family Services
    ('kids-family', 'kids-play',     'Play centres & soft play', 10),
    ('kids-family', 'kids-parties',  'Kids party venues',        20),
    ('kids-family', 'kids-classes',  'Kids classes & camps',     30),
    ('kids-family', 'kids-care',     'Babysitting & nanny',      40),

    -- Pottery & Crafts
    ('pottery-crafts', 'pottery-studio',  'Pottery studio',       10),
    ('pottery-crafts', 'pottery-classes', 'Classes & workshops',  20),
    ('pottery-crafts', 'custom-pottery',  'Custom & commissions', 30)
)
insert into public.categories (parent_id, slug, name, sort_order)
select c.id, sub.slug, sub.name, sub.sort_order
from sub
join public.categories c on c.slug = sub.parent_slug and c.parent_id is null
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Service-oriented filters (scoped to top-level category)
-- ----------------------------------------------------------------------------

with scoped (category_slug, slug, label, group_name, sort_order) as (
  values
    -- Home & Trade Services
    ('home-services', 'emergency-service',     'Emergency / same-day',  'Services',  10),
    ('home-services', 'free-estimates',        'Free estimates',        'Services',  20),
    ('home-services', 'licensed-insured',      'Licensed & insured',    'About',     30),
    ('home-services', 'residential-commercial','Residential & commercial','Services',40),

    -- Auto (tire change / repair shops)
    ('autoshop', 'mobile-service', 'Mobile / on-site service', 'Services', 30),

    -- Kids & Family
    ('kids-family', 'age-0-5',           'Ages 0–5',            'Ages',      10),
    ('kids-family', 'age-6-12',          'Ages 6–12',           'Ages',      20),
    ('kids-family', 'kids-party-packages','Party packages',     'Services',  30),
    ('kids-family', 'drop-in-welcome',   'Drop-in welcome',     'Amenities', 40),

    -- Events / birthday parties
    ('events-party', 'event-party-packages', 'Party packages',   'Services', 10),
    ('events-party', 'on-site-hosting',      'On-site hosting',  'Services', 20),
    ('events-party', 'custom-themes',        'Custom themes',    'Services', 30),

    -- Tech / electronics repair
    ('tech-electronics', 'walk-in-repair',   'Walk-in repair',        'Services', 10),
    ('tech-electronics', 'data-recovery',    'Data recovery',         'Services', 20),
    ('tech-electronics', 'while-you-wait',   'While-you-wait service','Services', 30),

    -- Pottery & crafts
    ('pottery-crafts', 'open-studio',        'Open studio time',      'Amenities', 10),
    ('pottery-crafts', 'beginner-friendly',  'Beginner friendly',     'Amenities', 20),
    ('pottery-crafts', 'kids-welcome',       'Kids welcome',          'Amenities', 30)
)
insert into public.filters (category_id, slug, label, group_name, sort_order)
select c.id, scoped.slug, scoped.label, scoped.group_name, scoped.sort_order
from scoped
join public.categories c on c.slug = scoped.category_slug and c.parent_id is null
on conflict (slug) do nothing;
