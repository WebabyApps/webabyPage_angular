import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MeetupEvent } from '../../content/content.models';
import { ContentService } from '../../content/content.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="content-page">
      <section class="section">
        <div class="container">
          <p class="eyebrow">Webaby Meetups</p>
          <h1>Events for builders of AI, mobile and web products</h1>
          <p class="lead">Join practical sessions about AI agents, Angular SSR, MCP servers and privacy-first mobile apps.</p>

          <div class="event-list">
            <article class="event-card" *ngFor="let event of events">
              <div>
                <p class="meta">{{ event.startsAt | date:'medium' }} · {{ event.location }}</p>
                <h2><a [routerLink]="['/events', event.slug]">{{ event.title }}</a></h2>
                <p>{{ event.summary }}</p>
                <div class="tag-row">
                  <span *ngFor="let tag of event.tags">{{ tag }}</span>
                </div>
              </div>
              <div class="event-side">
                <strong>{{ signupCount(event.id) }}/{{ event.capacity }}</strong>
                <span>signed up</span>
                <a [routerLink]="['/events', event.slug]" class="primary-link">Details</a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrls: ['./events-pages.scss'],
})
export class EventsListComponent {
  events: MeetupEvent[] = [];
  signupCounts: Record<string, number> = {};

  constructor(private readonly content: ContentService) {
    this.content.getEvents().subscribe((events) => {
      this.events = events;
      this.signupCounts = Object.fromEntries(events.map((event) => [event.id, event.signupCount ?? 0]));
    });
  }

  signupCount(eventId: string): number {
    return this.signupCounts[eventId] ?? 0;
  }
}
