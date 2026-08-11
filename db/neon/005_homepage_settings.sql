create table if not exists public.homepage_settings (
  id smallint primary key default 1 check (id = 1),
  show_blog boolean not null default true,
  show_intro boolean not null default false,
  hero_variant text not null default 'classic' check (hero_variant in ('classic', 'apps')),
  updated_by_email text,
  updated_at timestamptz not null default now()
);

insert into public.homepage_settings (id, show_blog, show_intro, hero_variant)
values (1, true, false, 'classic')
on conflict (id) do nothing;
