import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../content/content.models';
import { ContentService } from '../../content/content.service';
import { LocalizedRoutingService } from '../../i18n/localized-routing.service';

@Component({
  selector: 'app-blog-teaser',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="blog-teaser">
      <p class="section-lead">
        Praktyczne notatki o agentach AI, MCP, mobile AI, Angular SSR, SEO i nowoczesnym tworzeniu produktow.
      </p>

      <div class="teaser-list">
        <article class="teaser-row" *ngFor="let post of posts; let index = index">
          <button
            type="button"
            class="teaser-toggle"
            [attr.aria-expanded]="openIndex === index"
            (click)="toggle(index)"
          >
            <span>
              <strong>{{ post.title }}</strong>
              <small>{{ post.category }} · {{ post.readingMinutes }} min</small>
            </span>
            <span class="toggle-mark">{{ openIndex === index ? '−' : '+' }}</span>
          </button>

          <div class="teaser-panel" *ngIf="openIndex === index">
            <p>{{ post.excerpt }}</p>
            <div class="tag-row">
              <span *ngFor="let tag of post.tags">{{ tag }}</span>
            </div>
            <a [routerLink]="localized.path('blog', post.slug)" class="text-link">Czytaj artykul</a>
          </div>
        </article>
      </div>

      <div class="actions">
        <a [routerLink]="localized.path('blog')" class="primary-link">Wszystkie artykuly</a>
        <a [routerLink]="localized.path('events')" class="secondary-link">Meetupy i eventy</a>
      </div>
    </div>
  `,
  styleUrls: ['./blog-teaser.component.scss'],
})
export class BlogTeaserComponent {
  posts: BlogPost[] = [];
  openIndex = 0;

  constructor(private readonly content: ContentService, readonly localized: LocalizedRoutingService) {
    this.content.getFeaturedPosts(10).subscribe((posts) => {
      this.posts = posts;
    });
  }

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? -1 : index;
  }
}
