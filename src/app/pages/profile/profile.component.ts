import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrentUser, AuthService } from '../../content/auth.service';
import { ContentService } from '../../content/content.service';
import { EventSignup, MeetupEvent } from '../../content/content.models';
import { LocalizedRoutingService } from '../../i18n/localized-routing.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="content-page">
      <section class="section">
        <div class="container">
          <p class="eyebrow">Login</p>
          <h1>{{ authMode === 'login' ? 'Login to Webaby' : 'Create Webaby account' }}</h1>
          <p class="lead">
            Sign in to manage event signups. Admin tools appear when the email matches the environment admin email.
          </p>

          <form class="panel login-panel" *ngIf="!user" (ngSubmit)="submitAuth()">
            <div class="auth-tabs" role="tablist" aria-label="Authentication mode">
              <button type="button" [class.active]="authMode === 'login'" (click)="authMode = 'login'">Login</button>
              <button type="button" [class.active]="authMode === 'signup'" (click)="authMode = 'signup'">Sign up</button>
            </div>

            <p class="hint">
              {{ authMode === 'login' ? 'Use your email to access your Webaby account.' : 'Create a lightweight Webaby account for meetups and future tools.' }}
            </p>

            <label *ngIf="authMode === 'signup'">
              Name
              <input name="authName" [(ngModel)]="loginName" autocomplete="name" required />
            </label>

            <label>
              Email
              <input name="authEmail" [(ngModel)]="loginEmail" type="email" required autocomplete="email" />
            </label>

            <button type="submit">{{ authMode === 'login' ? 'Login' : 'Create account' }}</button>

            <div class="auth-divider"><span>or</span></div>

            <button type="button" class="google-button" disabled aria-disabled="true">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.6 12.2c0-.8-.1-1.4-.2-2.1H12v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 2.8-4.1 2.8-7.1Z"/>
                <path d="M12 22c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.3-3.9H3.5v2.5C5.1 19.8 8.4 22 12 22Z"/>
                <path d="M6.7 14.2c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.7H3.5C2.8 9 2.4 10.5 2.4 12.2s.4 3.2 1.1 4.5l3.2-2.5Z"/>
                <path d="M12 6.3c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 3.3 14.6 2.4 12 2.4 8.4 2.4 5.1 4.5 3.5 7.7l3.2 2.5c.7-2.2 2.8-3.9 5.3-3.9Z"/>
              </svg>
              Google login - wkrótce
            </button>

            <p class="hint">Admin email from environment: {{ adminEmail }}</p>
          </form>

          <ng-container *ngIf="user">
            <div class="panel profile-head">
              <div>
                <p class="meta">{{ user.isAdmin ? 'Admin' : 'User' }}</p>
                <h2>{{ user.name }}</h2>
                <p>{{ user.email }}</p>
              </div>
              <button type="button" (click)="logout()">Logout</button>
            </div>

            <section class="admin-grid" *ngIf="user.isAdmin; else userEvents">
              <form class="panel" (ngSubmit)="addPost()">
                <h2>Add blog article</h2>
                <label>Title<input name="postTitle" [(ngModel)]="postTitle" required /></label>
                <label>Category<input name="postCategory" [(ngModel)]="postCategory" required /></label>
                <label>Excerpt<textarea name="postExcerpt" [(ngModel)]="postExcerpt" required rows="3"></textarea></label>
                <label>Tags<input name="postTags" [(ngModel)]="postTags" placeholder="AI, MCP, Angular" /></label>
                <label>Image URL<input name="postImageUrl" [(ngModel)]="postImageUrl" placeholder="assets/software_development.jpeg" /></label>
                <label>Body<textarea name="postBody" [(ngModel)]="postBody" required rows="9"></textarea></label>
                <button type="submit">Publish article</button>
              </form>

              <form class="panel" (ngSubmit)="addEvent()">
                <h2>Add meetup event</h2>
                <label>Title<input name="eventTitle" [(ngModel)]="eventTitle" required /></label>
                <label>Summary<textarea name="eventSummary" [(ngModel)]="eventSummary" required rows="3"></textarea></label>
                <label>Date<input name="eventStartsAt" [(ngModel)]="eventStartsAt" type="datetime-local" required /></label>
                <label>Location<input name="eventLocation" [(ngModel)]="eventLocation" required /></label>
                <label>Capacity<input name="eventCapacity" [(ngModel)]="eventCapacity" type="number" min="1" required /></label>
                <label>Tags<input name="eventTags" [(ngModel)]="eventTags" placeholder="AI agents, meetup" /></label>
                <label>Description<textarea name="eventDescription" [(ngModel)]="eventDescription" required rows="7"></textarea></label>
                <button type="submit">Create event</button>
              </form>

              <div class="panel wide">
                <h2>Recent signups</h2>
                <p *ngIf="!allSignups.length">No event signups yet.</p>
                <ul *ngIf="allSignups.length">
                  <li *ngFor="let signup of allSignups">
                    {{ signup.name }} · {{ signup.email }} · {{ eventTitleFor(signup.eventId) }}
                  </li>
                </ul>
                <p class="success" *ngIf="message">{{ message }}</p>
              </div>
            </section>

            <ng-template #userEvents>
              <div class="panel">
                <h2>Your meetups</h2>
                <p>Browse upcoming events and sign up with your profile email.</p>
                <a [routerLink]="localized.path('events')" class="primary-link">Open events</a>
              </div>
            </ng-template>
          </ng-container>
        </div>
      </section>
    </main>
  `,
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  user: CurrentUser | null = null;
  allSignups: EventSignup[] = [];
  events: MeetupEvent[] = [];
  adminEmail = this.auth.adminEmail;
  authMode: 'login' | 'signup' = 'login';
  loginName = '';
  loginEmail = '';
  message = '';

  postTitle = '';
  postCategory = 'AI';
  postExcerpt = '';
  postTags = '';
  postImageUrl = '';
  postBody = '';

  eventTitle = '';
  eventSummary = '';
  eventStartsAt = '';
  eventLocation = 'Online';
  eventCapacity = 50;
  eventTags = '';
  eventDescription = '';

  constructor(private readonly auth: AuthService, private readonly content: ContentService, readonly localized: LocalizedRoutingService) {
    this.user = this.auth.currentUser;
    this.auth.user$.subscribe((user) => {
      this.user = user;
      this.loadAdminData();
    });
  }

  submitAuth(): void {
    if (!this.loginEmail.trim()) return;
    if (this.authMode === 'signup' && !this.loginName.trim()) return;
    this.auth.login(this.loginEmail, this.loginName);
  }

  logout(): void {
    this.auth.logout();
  }

  addPost(): void {
    if (!this.postTitle.trim() || !this.postExcerpt.trim() || !this.postBody.trim()) return;
    this.content.addPost({
      title: this.postTitle,
      excerpt: this.postExcerpt,
      category: this.postCategory,
      tags: this.parseTags(this.postTags),
      imageUrl: this.postImageUrl.trim() || undefined,
      body: this.parseParagraphs(this.postBody),
    }, this.user?.email).subscribe({
      next: (post) => {
        this.message = `Published: ${post.title}`;
        this.postTitle = '';
        this.postExcerpt = '';
        this.postTags = '';
        this.postImageUrl = '';
        this.postBody = '';
      },
      error: () => {
        this.message = 'Could not publish article.';
      },
    });
  }

  addEvent(): void {
    if (!this.eventTitle.trim() || !this.eventSummary.trim() || !this.eventStartsAt.trim()) return;
    this.content.addEvent({
      title: this.eventTitle,
      summary: this.eventSummary,
      startsAt: new Date(this.eventStartsAt).toISOString(),
      location: this.eventLocation,
      capacity: Number(this.eventCapacity) || 1,
      tags: this.parseTags(this.eventTags),
      description: this.parseParagraphs(this.eventDescription || this.eventSummary),
    }, this.user?.email).subscribe({
      next: (event) => {
        this.message = `Created event: ${event.title}`;
        this.eventTitle = '';
        this.eventSummary = '';
        this.eventDescription = '';
        this.eventTags = '';
        this.loadAdminData();
      },
      error: () => {
        this.message = 'Could not create event.';
      },
    });
  }

  eventTitleFor(eventId: string): string {
    return this.events.find((event) => event.id === eventId)?.title ?? eventId;
  }

  private loadAdminData(): void {
    if (!this.user?.isAdmin) {
      this.allSignups = [];
      return;
    }
    this.content.getEvents().subscribe((events) => {
      this.events = events;
    });
    this.content.getSignups(undefined, this.user.email).subscribe((signups) => {
      this.allSignups = signups;
    });
  }

  private parseTags(value: string): string[] {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  private parseParagraphs(value: string): string[] {
    return value.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  }
}
