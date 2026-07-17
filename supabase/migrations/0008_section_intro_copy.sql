-- ----------------------------------------------------------------------------
-- Lets owners override the copy shown under the public "Menu" and "Specials"
-- sections (previously a hardcoded, food-specific sentence for every
-- business). Null falls back to a category-aware default in the app layer.
-- ----------------------------------------------------------------------------

alter table public.businesses
  add column if not exists menu_intro text,
  add column if not exists specials_intro text;
