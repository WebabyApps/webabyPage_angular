import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../content/content.models';
import { ContentService } from '../../content/content.service';

@Component({
  selector: 'app-blog-teaser',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="blog-teaser">
      <p class="section-lead">
        Practical notes about AI agents, MCP servers, mobile AI, Angular SSR, SEO and modern product development.
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
            <a [routerLink]="['/blog', post.slug]" class="text-link">Read full article</a>
          </div>
        </article>
      </div>

      <div class="actions">
        <a routerLink="/blog" class="primary-link">All articles</a>
        <a routerLink="/events" class="secondary-link">Meetups and events</a>
      </div>
    </div>
  `,
  styleUrls: ['./blog-teaser.component.scss'],
})
export class BlogTeaserComponent {
  posts: BlogPost[] = [];
  openIndex = 0;

  constructor(private readonly content: ContentService) {
    this.content.getFeaturedPosts(10).subscribe((posts) => {
      this.posts = posts;
    });
  }

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? -1 : index;
  }
}
