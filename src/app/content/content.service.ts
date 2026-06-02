import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { BLOG_POSTS, MEETUP_EVENTS } from './content.seed';
import { BlogPost, EventSignup, MeetupEvent } from './content.models';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly browser: boolean;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.browser = isPlatformBrowser(platformId);
  }

  getPosts(): Observable<BlogPost[]> {
    if (!this.browser) return of(this.seedPosts());
    return this.http.get<BlogPost[]>('/api/blog-posts').pipe(
      map((posts) => posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))),
      catchError(() => of(this.seedPosts()))
    );
  }

  getFeaturedPosts(limit = 10): Observable<BlogPost[]> {
    return this.getPosts().pipe(map((posts) => posts.slice(0, limit)));
  }

  getPost(slug: string): Observable<BlogPost | undefined> {
    if (!this.browser) return of(BLOG_POSTS.find((post) => post.slug === slug));
    return this.http.get<BlogPost>(`/api/blog-posts/${encodeURIComponent(slug)}`).pipe(
      catchError(() => of(BLOG_POSTS.find((post) => post.slug === slug)))
    );
  }

  addPost(input: Pick<BlogPost, 'title' | 'excerpt' | 'body' | 'category' | 'tags'>, adminEmail?: string): Observable<BlogPost> {
    if (!this.browser) throw new Error('Cannot add blog posts during SSR');
    return this.http.post<BlogPost>('/api/blog-posts', input, {
      headers: this.adminHeaders(adminEmail),
    });
  }

  getEvents(): Observable<MeetupEvent[]> {
    if (!this.browser) return of(this.seedEvents());
    return this.http.get<MeetupEvent[]>('/api/events').pipe(
      map((events) => events.sort((a, b) => a.startsAt.localeCompare(b.startsAt))),
      catchError(() => of(this.seedEvents()))
    );
  }

  getEvent(slug: string): Observable<MeetupEvent | undefined> {
    if (!this.browser) return of(MEETUP_EVENTS.find((event) => event.slug === slug));
    return this.http.get<MeetupEvent>(`/api/events/${encodeURIComponent(slug)}`).pipe(
      catchError(() => of(MEETUP_EVENTS.find((event) => event.slug === slug)))
    );
  }

  addEvent(input: Pick<MeetupEvent, 'title' | 'summary' | 'description' | 'startsAt' | 'location' | 'capacity' | 'tags'>, adminEmail?: string): Observable<MeetupEvent> {
    if (!this.browser) throw new Error('Cannot add events during SSR');
    return this.http.post<MeetupEvent>('/api/events', input, {
      headers: this.adminHeaders(adminEmail),
    });
  }

  getSignups(eventId?: string, adminEmail?: string): Observable<EventSignup[]> {
    if (!this.browser) return of([]);
    const params = eventId ? new HttpParams().set('eventId', eventId) : undefined;
    return this.http.get<EventSignup[]>('/api/event-signups', {
      headers: this.adminHeaders(adminEmail),
      params,
    }).pipe(catchError(() => of([])));
  }

  signup(eventId: string, name: string, email: string): Observable<EventSignup> {
    if (!this.browser) throw new Error('Cannot sign up during SSR');
    return this.http.post<EventSignup>('/api/event-signups', {
      eventId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });
  }

  private adminHeaders(adminEmail?: string): HttpHeaders {
    const email = adminEmail || environment.adminEmail;
    return new HttpHeaders({ 'x-admin-email': email });
  }

  private seedPosts(): BlogPost[] {
    return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  private seedEvents(): MeetupEvent[] {
    return [...MEETUP_EVENTS].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
}
