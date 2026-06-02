import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogPost } from '../../content/content.models';
import { ContentService } from '../../content/content.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="content-page">
      <section class="section">
        <div class="container">
          <ng-container *ngIf="post; else notFound">
            <a routerLink="/blog" class="back-link">Back to blog</a>
            <article class="article-detail">
              <p class="eyebrow">{{ post.category }}</p>
              <h1>{{ post.title }}</h1>
              <p class="lead">{{ post.excerpt }}</p>
              <p class="meta">By {{ post.author }} · {{ post.publishedAt }} · {{ post.readingMinutes }} min read</p>

              <div class="tag-row">
                <span *ngFor="let tag of post.tags">{{ tag }}</span>
              </div>

              <div class="article-body">
                <p *ngFor="let paragraph of post.body">{{ paragraph }}</p>
              </div>
            </article>

            <aside class="related" *ngIf="related.length">
              <h2>Related Webaby articles</h2>
              <div class="related-grid">
                <a *ngFor="let item of related" [routerLink]="['/blog', item.slug]">
                  <span>{{ item.category }}</span>
                  <strong>{{ item.title }}</strong>
                </a>
              </div>
            </aside>
          </ng-container>

          <ng-template #notFound>
            <h1>Article not found</h1>
            <p class="lead">This article is not available yet.</p>
            <a routerLink="/blog" class="primary-link">Go to blog</a>
          </ng-template>
        </div>
      </section>
    </main>
  `,
  styleUrls: ['./blog-pages.scss'],
})
export class BlogDetailComponent {
  post?: BlogPost;
  related: BlogPost[] = [];

  constructor(route: ActivatedRoute, private readonly content: ContentService) {
    const slug = route.snapshot.paramMap.get('slug') ?? '';
    this.content.getPost(slug).subscribe((post) => {
      this.post = post;
      if (!post) return;
      this.content.getPosts().subscribe((posts) => {
        this.related = posts
          .filter((item) => item.slug !== post.slug && (item.category === post.category || item.tags.some((tag) => post.tags.includes(tag))))
          .slice(0, 3);
      });
    });
  }
}
