import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import pg from 'pg';
import bootstrap from './src/main.server';
import { BLOG_POSTS, MEETUP_EVENTS } from './src/app/content/content.seed';
import { PRODUCTS } from './src/app/shared/models/producs.data';

const SITE_URL = 'https://webaby.io';
const { Pool } = pg;
loadLocalEnv();
const pool = process.env['DATABASE_URL']
  ? new Pool({
      connectionString: process.env['DATABASE_URL'],
      ssl: { rejectUnauthorized: true },
    })
  : null;

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
};

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));

  // Można nadpisać zmienną środowiskową BROWSER_DIST gdy browser i server
  // są w różnych katalogach (np. Nginx serwuje z /var/www, Node z /opt)
  const browserDistFolder = process.env['BROWSER_DIST']
    ?? resolve(serverDistFolder, '../browser');

  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine({
    allowedHosts: ['webaby.io', 'www.webaby.io', 'localhost', '51.68.172.64'],
  });

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);
  server.use(express.json({ limit: '1mb' }));

  server.get('/api/blog-posts', async (_req, res, next) => {
    try {
      const posts = await readBlogPosts();
      res.json(posts);
    } catch (err) {
      next(err);
    }
  });

  server.get('/api/blog-posts/:slug', async (req, res, next) => {
    try {
      const post = await readBlogPost(req.params.slug);
      if (!post) {
        res.status(404).json({ message: 'Blog post not found' });
        return;
      }
      res.json(post);
    } catch (err) {
      next(err);
    }
  });

  server.post('/api/blog-posts', async (req, res, next) => {
    try {
      if (!isAdminRequest(req)) {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }
      const post = await createBlogPost(req.body);
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  });

  server.get('/api/events', async (_req, res, next) => {
    try {
      const events = await readEvents();
      res.json(events);
    } catch (err) {
      next(err);
    }
  });

  server.get('/api/events/:slug', async (req, res, next) => {
    try {
      const event = await readEvent(req.params.slug);
      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      res.json(event);
    } catch (err) {
      next(err);
    }
  });

  server.post('/api/events', async (req, res, next) => {
    try {
      if (!isAdminRequest(req)) {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }
      const event = await createEvent(req.body);
      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  });

  server.get('/api/event-signups', async (req, res, next) => {
    try {
      if (!isAdminRequest(req)) {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }
      const eventId = typeof req.query['eventId'] === 'string' ? req.query['eventId'] : undefined;
      const signups = await readSignups(eventId);
      res.json(signups);
    } catch (err) {
      next(err);
    }
  });

  server.post('/api/event-signups', async (req, res, next) => {
    try {
      const signup = await createSignup(req.body);
      res.status(201).json(signup);
    } catch (err) {
      next(err);
    }
  });

  server.get('/sitemap.xml', async (_req, res, next) => {
    try {
      res
        .type('application/xml')
        .set('Cache-Control', 'public, max-age=3600')
        .send(await generateSitemap());
    } catch (err) {
      next(err);
    }
  });

  // Statyki – fallback gdyby Nginx nie obsłużył
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
  }));

  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => {
        console.error('SSR render error:', err);
        next(err);
      });
  });

  return server;
}

function loadLocalEnv(): void {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[key] ??= value;
  }
}

function isAdminRequest(req: express.Request): boolean {
  const adminEmail = process.env['ADMIN_EMAIL']?.trim().toLowerCase();
  const requestEmail = req.header('x-admin-email')?.trim().toLowerCase();
  return Boolean(adminEmail && requestEmail && adminEmail === requestEmail);
}

function requirePool(): pg.Pool {
  if (!pool) throw new Error('DATABASE_URL is not configured');
  return pool;
}

async function readBlogPosts() {
  if (!pool) return BLOG_POSTS;
  const result = await pool.query(`
    select id, slug, title, excerpt, body, category, tags, author_name, published_at
    from public.blog_posts
    where status = 'published'
    order by published_at desc
  `);
  return result.rows.map(mapPost);
}

async function readBlogPost(slug: string) {
  if (!pool) return BLOG_POSTS.find((post) => post.slug === slug);
  const result = await pool.query(`
    select id, slug, title, excerpt, body, category, tags, author_name, published_at
    from public.blog_posts
    where slug = $1 and status = 'published'
    limit 1
  `, [slug]);
  return result.rows[0] ? mapPost(result.rows[0]) : undefined;
}

async function createBlogPost(input: {
  title?: string;
  excerpt?: string;
  body?: string[];
  category?: string;
  tags?: string[];
}) {
  const title = requiredText(input.title, 'title');
  const body = Array.isArray(input.body) ? input.body.map((item) => String(item).trim()).filter(Boolean) : [];
  if (!body.length) throw new Error('body is required');
  const slug = await uniqueSlug(title, 'blog_posts');
  const result = await requirePool().query(`
    insert into public.blog_posts (slug, title, excerpt, body, category, tags, author_name)
    values ($1, $2, $3, $4, $5, $6, 'Webaby Admin')
    returning id, slug, title, excerpt, body, category, tags, author_name, published_at
  `, [
    slug,
    title,
    requiredText(input.excerpt, 'excerpt'),
    body,
    requiredText(input.category ?? 'Webaby Notes', 'category'),
    Array.isArray(input.tags) ? input.tags : [],
  ]);
  return mapPost(result.rows[0]);
}

async function readEvents() {
  if (!pool) return MEETUP_EVENTS;
  const result = await pool.query(`
    select e.id, e.slug, e.title, e.summary, e.description, e.starts_at, e.location, e.capacity, e.tags,
      count(s.id)::int as signup_count
    from public.meetup_events e
    left join public.event_signups s on s.event_id = e.id
    group by e.id
    order by starts_at asc
  `);
  return result.rows.map(mapEvent);
}

async function readEvent(slug: string) {
  if (!pool) return MEETUP_EVENTS.find((event) => event.slug === slug);
  const result = await pool.query(`
    select e.id, e.slug, e.title, e.summary, e.description, e.starts_at, e.location, e.capacity, e.tags,
      count(s.id)::int as signup_count
    from public.meetup_events e
    left join public.event_signups s on s.event_id = e.id
    where e.slug = $1
    group by e.id
    limit 1
  `, [slug]);
  return result.rows[0] ? mapEvent(result.rows[0]) : undefined;
}

async function createEvent(input: {
  title?: string;
  summary?: string;
  description?: string[];
  startsAt?: string;
  location?: string;
  capacity?: number;
  tags?: string[];
}) {
  const title = requiredText(input.title, 'title');
  const description = Array.isArray(input.description) ? input.description.map((item) => String(item).trim()).filter(Boolean) : [];
  const slug = await uniqueSlug(title, 'meetup_events');
  const result = await requirePool().query(`
    insert into public.meetup_events (slug, title, summary, description, starts_at, location, capacity, tags)
    values ($1, $2, $3, $4, $5, $6, $7, $8)
    returning id, slug, title, summary, description, starts_at, location, capacity, tags, 0::int as signup_count
  `, [
    slug,
    title,
    requiredText(input.summary, 'summary'),
    description.length ? description : [requiredText(input.summary, 'summary')],
    requiredText(input.startsAt, 'startsAt'),
    requiredText(input.location ?? 'Online', 'location'),
    Math.max(1, Number(input.capacity) || 1),
    Array.isArray(input.tags) ? input.tags : [],
  ]);
  return mapEvent(result.rows[0]);
}

async function readSignups(eventId?: string) {
  const result = eventId
    ? await requirePool().query(`
        select event_id, name, email, created_at
        from public.event_signups
        where event_id = $1
        order by created_at desc
      `, [eventId])
    : await requirePool().query(`
        select event_id, name, email, created_at
        from public.event_signups
        order by created_at desc
      `);
  return result.rows.map(mapSignup);
}

async function createSignup(input: { eventId?: string; name?: string; email?: string }) {
  const result = await requirePool().query(`
    insert into public.event_signups (event_id, name, email)
    values ($1, $2, lower($3))
    on conflict (event_id, email)
    do update set name = excluded.name
    returning event_id, name, email, created_at
  `, [
    requiredText(input.eventId, 'eventId'),
    requiredText(input.name, 'name'),
    requiredText(input.email, 'email'),
  ]);
  return mapSignup(result.rows[0]);
}

async function uniqueSlug(title: string, table: 'blog_posts' | 'meetup_events'): Promise<string> {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'webaby-content';

  let slug = base;
  let counter = 2;
  while (await slugExists(slug, table)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

async function slugExists(slug: string, table: 'blog_posts' | 'meetup_events'): Promise<boolean> {
  const result = await requirePool().query(`select 1 from public.${table} where slug = $1 limit 1`, [slug]);
  return Boolean(result.rowCount);
}

function requiredText(value: unknown, name: string): string {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new Error(`${name} is required`);
  return text;
}

function mapPost(row: Record<string, any>) {
  const body = Array.isArray(row['body']) ? row['body'] : [];
  return {
    id: String(row['id']),
    slug: String(row['slug']),
    title: String(row['title']),
    excerpt: String(row['excerpt']),
    body,
    category: String(row['category']),
    tags: Array.isArray(row['tags']) ? row['tags'] : [],
    author: String(row['author_name']),
    publishedAt: new Date(row['published_at']).toISOString().slice(0, 10),
    readingMinutes: Math.max(2, Math.ceil(body.join(' ').split(/\s+/).filter(Boolean).length / 180)),
  };
}

function mapEvent(row: Record<string, any>) {
  return {
    id: String(row['id']),
    slug: String(row['slug']),
    title: String(row['title']),
    summary: String(row['summary']),
    description: Array.isArray(row['description']) ? row['description'] : [],
    startsAt: new Date(row['starts_at']).toISOString(),
    location: String(row['location']),
    capacity: Number(row['capacity']),
    tags: Array.isArray(row['tags']) ? row['tags'] : [],
    signupCount: Number(row['signup_count'] ?? 0),
  };
}

function mapSignup(row: Record<string, any>) {
  return {
    eventId: String(row['event_id']),
    name: String(row['name']),
    email: String(row['email']),
    createdAt: new Date(row['created_at']).toISOString(),
  };
}

async function generateSitemap(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const posts = await readBlogPosts();
  const events = await readEvents();
  const entries: SitemapEntry[] = [
    { loc: '/', lastmod: today, changefreq: 'weekly', priority: '1.0' },
    { loc: '/blog', lastmod: latestDate(posts.map((post) => post.publishedAt), today), changefreq: 'weekly', priority: '0.9' },
    { loc: '/events', lastmod: today, changefreq: 'weekly', priority: '0.75' },
    { loc: '/about', lastmod: today, changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', lastmod: today, changefreq: 'monthly', priority: '0.7' },
    ...PRODUCTS.map((product) => ({
      loc: `/products/${product.slug}`,
      lastmod: today,
      changefreq: 'monthly' as const,
      priority: product.slug === 'docuflow' || product.slug === 'planetlingua' ? '0.9' : '0.8',
    })),
    ...posts.map((post) => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.publishedAt,
      changefreq: 'monthly' as const,
      priority: '0.8',
    })),
    ...events.map((event) => ({
      loc: `/events/${event.slug}`,
      lastmod: today,
      changefreq: 'monthly' as const,
      priority: '0.72',
    })),
    { loc: '/privacy-policy', lastmod: today, changefreq: 'yearly', priority: '0.3' },
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => [
      '  <url>',
      `    <loc>${xml(`${SITE_URL}${entry.loc}`)}</loc>`,
      `    <lastmod>${xml(entry.lastmod)}</lastmod>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      '  </url>',
    ].join('\n')),
    '</urlset>',
  ].join('\n');
}

function latestDate(dates: string[], fallback: string): string {
  return dates.sort((a, b) => b.localeCompare(a))[0] ?? fallback;
}

function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
    console.log(`Browser dist: ${process.env['BROWSER_DIST'] ?? 'auto'}`);
  });
}

run();
