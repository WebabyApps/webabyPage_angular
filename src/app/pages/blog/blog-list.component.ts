import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../content/content.models';
import { ContentService } from '../../content/content.service';
import { LocalizedRoutingService } from '../../i18n/localized-routing.service';
import { HeroComponent } from '../../shared/hero/hero.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroComponent],
  template: `
    <main class="content-page content-page--with-hero">
      <app-hero
        title="Blog Webaby"
        subtitle="AI, aplikacje webowe, mobilne i nowoczesny development"
        ctaText="Czytaj artykuly"
        [ctaLink]="localized.path('blog')"
        ctaFragment="articles"
        [compact]="true">
      </app-hero>

      <section class="section content-section blog-live-section" id="articles">
        <div class="container">
          <p class="eyebrow">Blog Webaby</p>
          <h1 class="blog-typewriter">
            <span>AI, aplikacje webowe, mobilne i nowoczesny development</span>
          </h1>
          <p class="lead">
            Praktyczne artykuly o agentach AI, serwerach MCP, Angular SSR, mobile AI,
            SEO oraz architekturze nowoczesnych produktow cyfrowych.
          </p>

          <div class="topic-links" aria-label="Tematy bloga">
            <a *ngFor="let category of categories" [routerLink]="localized.path('blog')" [fragment]="categoryId(category)">
              {{ category }}
            </a>
          </div>

          <div class="article-grid">
            <article class="article-card" *ngFor="let post of posts" [attr.id]="categoryId(post.category)">
              <img class="article-cover" *ngIf="post.imageUrl" [src]="post.imageUrl" [alt]="post.title" loading="lazy" />
              <p class="meta">{{ post.category }} · {{ post.publishedAt }} · {{ post.readingMinutes }} min</p>
              <h2><a [routerLink]="localized.path('blog', post.slug)">{{ post.title }}</a></h2>
              <p>{{ post.excerpt }}</p>
              <div class="tag-row">
                <span *ngFor="let tag of post.tags">{{ tag }}</span>
              </div>
              <a class="text-link" [routerLink]="localized.path('blog', post.slug)">Czytaj artykul</a>
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

  constructor(private readonly content: ContentService, readonly localized: LocalizedRoutingService) {
    this.content.getPosts().subscribe((posts) => {
      this.posts = posts;
      this.categories = [...new Set(posts.map((post) => post.category))];
    });
  }

  categoryId(category: string): string {
    return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}
