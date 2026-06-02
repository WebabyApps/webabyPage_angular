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
  (slug, title, excerpt, body, category, tags, author_name, published_at)
values
  (
    'agentic-apps-2026',
    'Agentic apps in 2026: from chatbot to product workflow',
    'AI agents are moving from chat windows into real workflows: planning, tool use, memory, approvals and product telemetry.',
    array[
      'The most useful AI products are no longer just chat interfaces. They are workflow systems where a model can decide what context it needs, call a tool, ask for approval, and hand work to another specialised agent.',
      'For mobile and web apps this changes product design. The best user experience is not an oversized text box. It is a small set of high-confidence actions that remove repeated coordination work while keeping the user in control.'
    ],
    'AI Agents',
    array['AI agents', 'product design', 'automation'],
    'Webaby Labs',
    '2026-06-02 00:00:00+00'
  ),
  (
    'mcp-servers-product-architecture',
    'MCP servers: the new integration layer for AI tools',
    'Model Context Protocol gives AI systems a standard way to work with tools, resources and prompts across products.',
    array[
      'Model Context Protocol is becoming a practical bridge between language models and external systems. Instead of writing one-off integrations for every assistant, teams can expose resources, prompts and tools through an MCP server.',
      'Treat MCP servers like production APIs. Add authentication, rate limits, audit logs, tool descriptions that are hard to misuse, and clear boundaries around sensitive operations.'
    ],
    'MCP',
    array['MCP', 'integration', 'tooling'],
    'Webaby Labs',
    '2026-06-02 00:00:00+00'
  ),
  (
    'seo-for-ssr-angular-apps',
    'SEO for Angular SSR apps: what actually matters',
    'SSR gives crawlers HTML, but rankings still depend on content quality, metadata, internal links and performance.',
    array[
      'Server-side rendering solves one important problem: crawlers and social previews can see real HTML. But SSR alone is not a ranking strategy.',
      'A strong Angular SEO setup includes unique titles and descriptions, canonical links, structured data, a sitemap, accessible headings, descriptive internal links and pages that load quickly.'
    ],
    'SEO',
    array['Angular', 'SSR', 'SEO'],
    'Webaby Labs',
    '2026-06-02 00:00:00+00'
  )
on conflict (slug) do nothing;

insert into public.meetup_events
  (slug, title, summary, description, starts_at, location, capacity, tags)
values
  (
    'ai-agents-for-products',
    'AI Agents for Real Products',
    'A practical meetup about designing agentic features for mobile and web apps.',
    array[
      'We will look at agent workflows, tool permissions, MCP servers and human-in-the-loop approvals.',
      'The session is aimed at founders, developers and product builders who want to add AI features without turning the app into a vague chatbot.'
    ],
    '2026-07-10 16:00:00+00',
    'Online',
    60,
    array['AI agents', 'MCP', 'product']
  )
on conflict (slug) do nothing;
