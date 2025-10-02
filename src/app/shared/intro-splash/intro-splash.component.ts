// intro-splash.component.ts
import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IntroSplashService } from './intro-splash.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

// ===== Config you can tweak =====
const MIN_SHOW_MS = 1800;
const AUTO_DISMISS_AFTER = 2600;
const DISMISS_ON_SCROLL = false;

@Component({
  selector: 'app-intro-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-splash.component.html',
  styleUrls: ['./intro-splash.component.scss']
})
export class IntroSplashComponent implements OnDestroy {
  private svc = inject(IntroSplashService);
  private router = inject(Router);

  visible = signal(false);
  playing = signal(false);

  private startedAt = 0;
  private autoTimer: any;
  private force = false;
  private sub: Subscription | null = null;

  constructor() {
    const url = new URL(window.location.href);
    this.force = url.searchParams.get('intro') === '1';

    // decide immediately for first paint
    this.decideAndMaybeShow();

    // also re-check on future navigations (SPA)
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.decideAndMaybeShow());

    // ESC to skip
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.dismiss(true);
    });

    // optional: hide on first scroll
    if (DISMISS_ON_SCROLL) {
      const onScroll = () => {
        if (!this.visible()) return;
        this.dismiss();
        window.removeEventListener('scroll', onScroll, { capture: true } as any);
      };
      setTimeout(() => {
        window.addEventListener('scroll', onScroll, { passive: true, capture: true });
      }, 600);
    }

    // (optional) particles — only if visible; your existing code can stay,
    // but make sure you gate it by `if (this.visible())` before animating.
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ----- helpers -----

  /** Works with both path and hash routing */
  private getCurrentPath(): string {
    const l = window.location;
    // Prefer hash if present and starts with "#/"
    const raw = (l.hash && l.hash.startsWith('#/')) ? l.hash.slice(1) : l.pathname;
    // strip querystring & trailing slash (except root)
    const pathOnly = raw.split('?')[0].split('#')[0];
    return pathOnly !== '/' ? pathOnly.replace(/\/+$/, '') : '/';
  }

  private isHomePath(path: string): boolean {
    // add more home aliases if you need (e.g. '/pl')
    return path === '/' || path === '' || path === '/home';
  }

  private decideAndMaybeShow() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const path = this.getCurrentPath();
    const isHome = this.isHomePath(path);

    const shouldShow = (this.force || (isHome && !this.svc.alreadySeen())) && !reduce;

    if (!shouldShow) {
      // ensure nothing from intro influences the page
      this.visible.set(false);
      this.playing.set(false);
      document.documentElement.classList.remove('intro-active', 'intro-lift');
      return;
    }

    // already visible? don't restart
    if (this.visible()) return;

    // show intro
    document.documentElement.classList.add('intro-active');
    this.visible.set(true);

    requestAnimationFrame(() => {
      this.startedAt = performance.now();
      this.playing.set(true);

      if (AUTO_DISMISS_AFTER > 0) {
        const wait = Math.max(AUTO_DISMISS_AFTER, MIN_SHOW_MS);
        this.autoTimer = setTimeout(() => this.dismiss(), wait);
      }
    });
  }

  onAnimationEnd() {
    const elapsed = performance.now() - this.startedAt;
    const left = Math.max(0, MIN_SHOW_MS - elapsed);
    if (left === 0) this.dismiss();
    else setTimeout(() => this.dismiss(), left);
  }

  dismiss(_userInitiated = false) {
    if (!this.visible()) return;
    if (this.autoTimer) { clearTimeout(this.autoTimer); this.autoTimer = null; }

    this.playing.set(false);
    document.documentElement.classList.add('intro-lift'); // page slides up

    setTimeout(() => {
      this.visible.set(false);
      document.documentElement.classList.remove('intro-active');
      setTimeout(() => document.documentElement.classList.remove('intro-lift'), 50);
      if (!this.force) this.svc.markSeen();
    }, 700); // match your .site transition
  }
}
