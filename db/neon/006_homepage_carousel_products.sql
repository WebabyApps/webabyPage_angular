alter table public.homepage_settings
  add column if not exists carousel_product_slugs text[] not null default array[
    'docuflow',
    'bubble-world',
    'basketball-shots',
    'system-of-equations',
    'abc-land',
    'lucky-draw',
    'bibble-echo',
    'socialmigrateai',
    'music-colours',
    'free-ride',
    'planetlingua'
  ]::text[];
