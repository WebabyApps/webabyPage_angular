import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { PRODUCTS } from '../shared/models/producs.data';
import { BLOG_POSTS, MEETUP_EVENTS } from '../content/content.seed';

type SeoConfig = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'event';
  keywords?: string;
  robots?: string;
  publishedAt?: string;
  startsAt?: string;
  location?: string;
};

const SITE_URL = 'https://webaby.io';
const SITE_NAME = 'Webaby';
const DEFAULT_IMAGE = `${SITE_URL}/assets/hero-bg.jpg`;

const productCopy: Record<string, { title: string; description: string; keywords: string }> = {
  docuflow: {
    title: 'DocuFlow | Documents, KSeF and rental workflows by Webaby',
    description: 'DocuFlow combines document workflow, KSeF invoice sync, reporting, payments and rental management in one workspace.',
    keywords: 'DocuFlow, KSeF, document workflow, invoicing, rental management, Webaby',
  },
  'bubble-world': {
    title: 'Bubble World | Word puzzle game by Webaby',
    description: 'Bubble World is a fast word puzzle experience from Webaby, built for playful learning and quick challenges.',
    keywords: 'Bubble World, word game, puzzle game, learning game, Webaby',
  },
  'basketball-shots': {
    title: 'Basketball Shots | Arcade basketball game by Webaby',
    description: 'Basketball Shots is a simple arcade hoops game where players aim, swipe and score.',
    keywords: 'Basketball Shots, basketball game, arcade game, mobile game, Webaby',
  },
  'system-of-equations': {
    title: 'System of Equations Trainer | Algebra practice by Webaby',
    description: 'Practice solving systems of linear equations step by step with an educational trainer from Webaby.',
    keywords: 'system of equations, algebra trainer, math app, education app, Webaby',
  },
  'abc-land': {
    title: 'ABC Land | Alphabet learning adventure by Webaby',
    description: 'ABC Land is a playful alphabet learning adventure designed to make early literacy feel like a game.',
    keywords: 'ABC Land, alphabet game, learning app, kids education, Webaby',
  },
  'lucky-draw': {
    title: 'Lucky Draw | Random picker app by Webaby',
    description: 'Lucky Draw helps groups spin, pick and celebrate random choices in a simple visual way.',
    keywords: 'Lucky Draw, random picker, raffle app, spinner app, Webaby',
  },
  'bibble-echo': {
    title: 'Bibble Echo | Mindful reflection app by Webaby',
    description: 'Bibble Echo offers a reflective, mindful digital experience from Webaby.',
    keywords: 'Bibble Echo, mindfulness app, reflection app, Webaby',
  },
  socialmigrateai: {
    title: 'Social Migrate AI | Move Facebook posts by Webaby',
    description: 'Social Migrate AI helps move Facebook posts in just a few clicks.',
    keywords: 'Social Migrate AI, Facebook posts migration, AI migration tool, Webaby',
  },
  'music-colours': {
    title: 'Music Colours | Rhythm color game by Webaby',
    description: 'Music Colours is a rhythm game where players catch the current color to the beat and progress through levels.',
    keywords: 'Music Colours, rhythm game, music game, color game, Webaby',
  },
  'free-ride': {
    title: 'FreeRide | Carpooling app by Webaby',
    description: 'FreeRide makes offering and booking rides easier with Google Maps support and AI-assisted route optimisation.',
    keywords: 'FreeRide, carpooling app, ride sharing, AI route optimisation, Webaby',
  },
  planetlingua: {
    title: 'PlanetLingua | Gamified language learning by Webaby',
    description: 'PlanetLingua turns daily language learning into 30-minute missions with planet travel and game-style progress.',
    keywords: 'PlanetLingua, language learning app, gamified learning, Webaby',
  },
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private initialized = false;

  constructor(
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null)
      )
      .subscribe(() => this.applyForUrl(this.router.url));
  }

  private applyForUrl(url: string): void {
    const path = this.cleanPath(url);
    const config = this.configForPath(path);
    const canonical = `${SITE_URL}${config.path}`;
    const image = config.image ?? DEFAULT_IMAGE;

    this.title.setTitle(config.title);
    this.setTag('description', config.description);
    this.setTag('robots', config.robots ?? 'index, follow, max-image-preview:large');
    this.setTag('keywords', config.keywords ?? 'Webaby, educational apps, learning games, software development, AI apps');
    this.setTag('theme-color', '#080b16');

    this.setProperty('og:site_name', SITE_NAME);
    this.setProperty('og:type', config.type === 'article' ? 'article' : config.type === 'product' ? 'product' : 'website');
    this.setProperty('og:title', config.title);
    this.setProperty('og:description', config.description);
    this.setProperty('og:url', canonical);
    this.setProperty('og:image', image);

    this.setTag('twitter:card', 'summary_large_image');
    this.setTag('twitter:title', config.title);
    this.setTag('twitter:description', config.description);
    this.setTag('twitter:image', image);

    this.setCanonical(canonical);
    this.setJsonLd(this.jsonLdFor(config, canonical, image));
  }

  private configForPath(path: string): SeoConfig {
    if (path === '/' || path === '') {
      return {
        title: 'Webaby | Playful learning apps, games and software',
        description: 'Webaby builds playful educational apps, learning games and useful digital products that blend creativity, technology and knowledge.',
        path: '/',
        image: DEFAULT_IMAGE,
        type: 'website',
      };
    }

    if (path === '/about') {
      return {
        title: 'About Webaby | Software, learning and playful technology',
        description: 'Learn about Webaby mission: building software, learning games and interactive tools that make knowledge engaging.',
        path,
      };
    }

    if (path === '/contact') {
      return {
        title: 'Contact Webaby | Software and product enquiries',
        description: 'Contact Webaby about software products, educational apps, games and technology projects.',
        path,
      };
    }

    if (path === '/blog') {
      return {
        title: 'Webaby Blog | AI agents, MCP, Angular SSR and app development',
        description: 'Read Webaby articles about AI agents, MCP servers, mobile AI, Angular SSR, SEO and modern web application development.',
        path,
        type: 'website',
        keywords: 'AI agents, MCP servers, Angular SSR, mobile AI, web apps, app development, Webaby blog',
      };
    }

    const blogSlug = this.blogSlug(path);
    if (blogSlug) {
      const post = BLOG_POSTS.find((item) => item.slug === blogSlug);
      if (post) {
        return {
          title: `${post.title} | Webaby Blog`,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          type: 'article',
          keywords: post.tags.join(', '),
          publishedAt: post.publishedAt,
        };
      }
    }

    if (path === '/events') {
      return {
        title: 'Webaby Events | AI, mobile and web meetups',
        description: 'Join Webaby meetups and workshops about AI agents, Angular SSR, mobile AI and modern application development.',
        path,
        type: 'website',
        keywords: 'AI meetups, Angular SSR workshop, MCP meetup, mobile AI event, Webaby events',
      };
    }

    const eventSlug = this.eventSlug(path);
    if (eventSlug) {
      const event = MEETUP_EVENTS.find((item) => item.slug === eventSlug);
      if (event) {
        return {
          title: `${event.title} | Webaby Events`,
          description: event.summary,
          path: `/events/${event.slug}`,
          type: 'event',
          keywords: event.tags.join(', '),
          startsAt: event.startsAt,
          location: event.location,
        };
      }
    }

    if (path === '/login' || path === '/profile') {
      return {
        title: 'Login | Webaby',
        description: 'Login to the Webaby account and admin area.',
        path: '/login',
        robots: 'noindex, nofollow',
      };
    }

    if (path === '/privacy-policy') {
      return {
        title: 'Privacy Policy | Webaby',
        description: 'Read the Webaby privacy policy for website and product users.',
        path,
      };
    }

    const productSlug = this.productSlug(path);
    if (productSlug) {
      const product = PRODUCTS.find((item) => item.slug === productSlug);
      const copy = productCopy[productSlug];

      return {
        title: copy?.title ?? `${this.titleize(productSlug)} | Webaby product`,
        description: copy?.description ?? `Explore ${this.titleize(productSlug)}, a Webaby product.`,
        path: `/products/${productSlug}`,
        image: product ? `${SITE_URL}/${product.img}` : DEFAULT_IMAGE,
        type: 'product',
        keywords: copy?.keywords,
      };
    }

    return {
      title: 'Webaby | Playful learning apps and software',
      description: 'Explore Webaby products, learning games, educational apps and software projects.',
      path: '/',
    };
  }

  private productSlug(path: string): string | null {
    const match = path.match(/^\/(?:products|tutorial)\/([^/]+)/);
    return match?.[1] ?? null;
  }

  private blogSlug(path: string): string | null {
    const match = path.match(/^\/blog\/([^/]+)/);
    return match?.[1] ?? null;
  }

  private eventSlug(path: string): string | null {
    const match = path.match(/^\/events\/([^/]+)/);
    return match?.[1] ?? null;
  }

  private cleanPath(url: string): string {
    const path = url.split('#')[0].split('?')[0] || '/';
    return path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  }

  private titleize(value: string): string {
    return value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private setTag(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setCanonical(href: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setJsonLd(data: unknown): void {
    const id = 'webaby-structured-data';
    let script = this.document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  private jsonLdFor(config: SeoConfig, canonical: string, image: string): unknown {
    const organization = {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/assets/logo.png`,
    };

    if (config.type === 'product') {
      return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: config.title.split('|')[0].trim(),
        description: config.description,
        url: canonical,
        image,
        applicationCategory: 'EducationalApplication',
        publisher: organization,
      };
    }

    if (config.type === 'article') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: config.title.split('|')[0].trim(),
        description: config.description,
        url: canonical,
        image,
        datePublished: config.publishedAt,
        author: organization,
        publisher: organization,
      };
    }

    if (config.type === 'event') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: config.title.split('|')[0].trim(),
        description: config.description,
        url: canonical,
        image,
        startDate: config.startsAt,
        location: {
          '@type': config.location?.toLowerCase().includes('online') ? 'VirtualLocation' : 'Place',
          name: config.location,
          url: canonical,
        },
        organizer: organization,
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
      };
    }

    return {
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          description: config.description,
          publisher: organization,
        },
      ],
    };
  }
}
