import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../content/content.models';
import { ContentService } from '../../content/content.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="content-page">
      <section class="section">
        <div class="container">
          <p class="eyebrow">Webaby Blog</p>
          <h1>AI, web, mobile and product development articles</h1>
          <p class="lead">
            A searchable content hub for modern application development, AI agents, MCP servers,
            Angular SSR, mobile AI and practical product architecture.
          </p>

          <div class="topic-links" aria-label="Blog topics">
            <a *ngFor="let category of categories" [routerLink]="['/blog']" [fragment]="categoryId(category)">
              {{ category }}
            </a>
          </div>

          <div class="article-grid">
            <article class="article-card" *ngFor="let post of posts" [attr.id]="categoryId(post.category)">
              <p class="meta">{{ post.category }} · {{ post.publishedAt }} · {{ post.readingMinutes }} min</p>
              <h2><a [routerLink]="['/blog', post.slug]">{{ post.title }}</a></h2>
              <p>{{ post.excerpt }}</p>
              <div class="tag-row">
                <span *ngFor="let tag of post.tags">{{ tag }}</span>
              </div>
              <a class="text-link" [routerLink]="['/blog', post.slug]">Open article</a>
            </article>
          </div>
        </div>
      </section>
    </main>
  `,
  styleUrls: ['./blog-pages.scss'],
})
export class BlogListComponent {
  posts: BlogPost[] = [];
  categories: string[] = [];

  constructor(private readonly content: ContentService) {
    this.content.getPosts().subscribe((posts) => {
      this.posts = posts;
      this.categories = [...new Set(posts.map((post) => post.category))];
    });
  }

  categoryId(category: string): string {
    return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}
