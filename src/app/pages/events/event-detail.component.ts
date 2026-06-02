import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MeetupEvent } from '../../content/content.models';
import { AuthService } from '../../content/auth.service';
import { ContentService } from '../../content/content.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="content-page">
      <section class="section">
        <div class="container">
          <ng-container *ngIf="event; else notFound">
            <a routerLink="/events" class="back-link">Back to events</a>
            <div class="event-layout">
              <article>
                <p class="eyebrow">Webaby Meetup</p>
                <h1>{{ event.title }}</h1>
                <p class="lead">{{ event.summary }}</p>
                <p class="meta">{{ event.startsAt | date:'full' }} · {{ event.location }}</p>
                <div class="tag-row">
                  <span *ngFor="let tag of event.tags">{{ tag }}</span>
                </div>
                <div class="event-body">
                  <p *ngFor="let paragraph of event.description">{{ paragraph }}</p>
                </div>
              </article>

              <form class="signup-panel" (ngSubmit)="signup()">
                <h2>Sign up</h2>
                <p>{{ signedCount }}/{{ event.capacity }} places taken</p>
                <label>
                  Name
                  <input name="name" [(ngModel)]="name" required autocomplete="name" />
                </label>
                <label>
                  Email
                  <input name="email" [(ngModel)]="email" type="email" required autocomplete="email" />
                </label>
                <button type="submit">Join event</button>
                <p class="success" *ngIf="message">{{ message }}</p>
              </form>
            </div>
          </ng-container>

          <ng-template #notFound>
            <h1>Event not found</h1>
            <p class="lead">This meetup is not available yet.</p>
            <a routerLink="/events" class="primary-link">Go to events</a>
          </ng-template>
        </div>
      </section>
    </main>
  `,
  styleUrls: ['./events-pages.scss'],
})
export class EventDetailComponent {
  event?: MeetupEvent;
  name = '';
  email = '';
  message = '';
  signedCount = 0;

  constructor(
    route: ActivatedRoute,
    private readonly auth: AuthService,
    private readonly content: ContentService
  ) {
    const slug = route.snapshot.paramMap.get('slug') ?? '';
    this.content.getEvent(slug).subscribe((event) => {
      this.event = event;
      this.signedCount = event?.signupCount ?? 0;
    });
    const user = this.auth.currentUser;
    this.name = user?.name ?? '';
    this.email = user?.email ?? '';
  }

  signup(): void {
    if (!this.event || !this.name.trim() || !this.email.trim()) return;
    this.content.signup(this.event.id, this.name, this.email).subscribe({
      next: () => {
        this.signedCount += 1;
        this.message = 'You are signed up. We will send details before the event.';
      },
      error: () => {
        this.message = 'Signup failed. Please try again.';
      },
    });
  }
}
