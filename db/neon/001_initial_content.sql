create extension if not exists pgcrypto;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  body text[] not null default '{}',
  category text not null default 'Webaby Notes',
  tags text[] not null default '{}',
  author_name text not null default 'Webaby Admin',
  image_url text,
  author_user_id text,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meetup_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  description text[] not null default '{}',
  starts_at timestamptz not null,
  location text not null default 'Online',
  capacity integer not null default 50 check (capacity > 0),
  tags text[] not null default '{}',
  created_by_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_signups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.meetup_events(id) on delete cascade,
  user_id text,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc);
create index if not exists blog_posts_tags_idx on public.blog_posts using gin (tags);
create index if not exists meetup_events_starts_at_idx on public.meetup_events (starts_at);
create index if not exists event_signups_event_id_idx on public.event_signups (event_id);

insert into public.blog_posts
  (slug, title, excerpt, body, category, tags, author_name, image_url, published_at)
values
  (
    'agentic-apps-2026',
    'Aplikacje agentowe w 2026: od chatbota do prawdziwego workflow',
    'Agenci AI wychodza poza okno chatu i zaczynaja obslugiwac konkretne procesy: planowanie, narzedzia, pamiec, zgody i telemetryke.',
    array[
      'Najciekawsze produkty AI nie sa juz tylko rozmowa z modelem. Coraz czesciej sa systemami workflow, w ktorych agent potrafi dobrac kontekst, wywolac narzedzie, poprosic o akceptacje i przekazac zadanie dalej.',
      'Dla aplikacji webowych i mobilnych oznacza to zmiane projektowania. Zamiast wielkiego pola tekstowego warto budowac male, pewne akcje, ktore usuwaja powtarzalna koordynacje.'
    ],
    'Agenci AI',
    array['AI agents', 'automatyzacja', 'product design'],
    'Webaby Labs',
    'assets/futere_technology.jpeg',
    '2026-06-02 00:00:00+00'
  ),
  (
    'mcp-servers-product-architecture',
    'Serwery MCP jako nowa warstwa integracji dla narzedzi AI',
    'Model Context Protocol pomaga laczyc modele AI z narzedziami, zasobami i promptami w bardziej przewidywalny sposob.',
    array[
      'MCP staje sie praktycznym mostem pomiedzy modelami jezykowymi a systemami biznesowymi. Zamiast pisac osobna integracje dla kazdego asystenta, zespol moze wystawic narzedzia i zasoby przez jeden serwer MCP.',
      'Architektonicznie warto traktowac MCP jak produkcyjne API: z autoryzacja, limitami, logami audytu i opisami narzedzi, ktore trudno zle zinterpretowac.'
    ],
    'MCP',
    array['MCP', 'integracje', 'AI tooling'],
    'Webaby Labs',
    'assets/software_development.jpeg',
    '2026-06-02 00:00:00+00'
  ),
  (
    'seo-for-ssr-angular-apps',
    'SEO dla Angular SSR: co naprawde ma znaczenie',
    'SSR daje crawlerom HTML, ale widocznosc zalezy tez od jakosci tresci, metadanych, linkow wewnetrznych i wydajnosci.',
    array[
      'Server-side rendering rozwiazuje wazny problem: roboty i podglady social media widza prawdziwy HTML. Ale sam SSR nie jest strategia pozycjonowania.',
      'Dobry setup SEO w Angularze obejmuje unikalne tytuly i opisy, canonicale, structured data, sitemap, dostepne naglowki, opisowe linki i szybkie strony.'
    ],
    'SEO',
    array['Angular', 'SSR', 'SEO'],
    'Webaby Labs',
    'assets/hero-bg.jpg',
    '2026-06-02 00:00:00+00'
  )
on conflict (slug) do nothing;
