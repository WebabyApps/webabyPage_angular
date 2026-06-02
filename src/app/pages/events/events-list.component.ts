import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MeetupEvent } from '../../content/content.models';
import { ContentService } from '../../content/content.service';
import { LocalizedRoutingService } from '../../i18n/localized-routing.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="content-page">
      <section class="section">
        <div class="container">
          <p class="eyebrow">Meetupy Webaby</p>
          <h1>Wydarzenia dla tworcow AI, aplikacji mobilnych i webowych</h1>
          <p class="lead">Aktualnie nie ma zaplanowanych wydarzen. Admin moze dodac nowe meetupy z panelu logowania.</p>

          <div class="empty-state" *ngIf="!events.length">
            <h2>Brak aktywnych eventow</h2>
            <p>Wroc tu za jakis czas albo obserwuj blog, gdzie pojawia sie zapowiedzi nowych spotkan.</p>
          </div>

          <div class="event-list" *ngIf="events.length">
            <article class="event-card" *ngFor="let event of events">
              <div>
                <p class="meta">{{ event.startsAt | date:'medium' }} · {{ event.location }}</p>
                <h2><a [routerLink]="localized.path('events', event.slug)">{{ event.title }}</a></h2>
                <p>{{ event.summary }}</p>
                <div class="tag-row">
                  <span *ngFor="let tag of event.tags">{{ tag }}</span>
                </div>
              </div>
              <div class="event-side">
                <strong>{{ signupCount(event.id) }}/{{ event.capacity }}</strong>
                <span>zapisanych</span>
                <a [routerLink]="localized.path('events', event.slug)" class="primary-link">Szczegoly</a>
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

  constructor(private readonly content: ContentService, readonly localized: LocalizedRoutingService) {
    this.content.getEvents().subscribe((events) => {
      this.events = events;
      this.signupCounts = Object.fromEntries(events.map((event) => [event.id, event.signupCount ?? 0]));
    });
  }

  signupCount(eventId: string): number {
    return this.signupCounts[eventId] ?? 0;
  }
}
