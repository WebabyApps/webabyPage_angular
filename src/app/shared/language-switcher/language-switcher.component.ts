// src/app/shared/language-switcher/language-switcher.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, UrlSegment, UrlTree } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';

type Lang = 'en' | 'pl';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  styles: [`
    .lang-switch { position: relative; }
  
    /* default (transparent header) = light-on-dark */
    .lang-btn {
      display:flex; align-items:center; gap:.5rem;
      padding:.4rem .7rem;
      border:1px solid rgba(255,255,255,.25);
      border-radius:999px;
      background:transparent;
      cursor:pointer;
      font-weight:600; font-size:.95rem;
      color:#fff;
    }
    .menu {
      position:absolute; top:110%; right:0; min-width:140px;
      border:1px solid rgba(255,255,255,.25);
      border-radius:12px;
      background: rgba(0,0,0,.75);
      padding:.25rem;
      box-shadow: 0 6px 24px rgba(0,0,0,.35);
      z-index: 50;
      color:#fff;
    }
    .item { padding:.5rem .75rem; border-radius:10px; cursor:pointer; }
    .item:hover { background: rgba(255,255,255,.08); }
  
    /* when header is scrolled = dark-on-light */
    :host-context(.site-header.scrolled) .lang-btn {
      color:#111;
      border-color: rgba(0,0,0,.25);
      background: transparent;
    }
    :host-context(.site-header.scrolled) .menu {
      color:#111;
      background: rgba(255,255,255,.95);
      border-color: rgba(0,0,0,.2);
    }
    :host-context(.site-header.scrolled) .item:hover {
      background: rgba(0,0,0,.06);
    }
  `],
  
  template: `
    <div class="lang-switch" (keydown.escape)="open=false">
      <button class="lang-btn" (click)="open = !open" aria-haspopup="menu" [attr.aria-expanded]="open">
        <span class="flag">{{ active() === 'pl' ? '🇵🇱' : '🇬🇧' }}</span>
        <span>{{ active() === 'pl' ? 'Polski' : 'English' }}</span>
      </button>

      <div class="menu" *ngIf="open">
        <div class="item" [class.active]="active() === 'en'" (click)="switch('en')">
          <span class="flag">🇬🇧</span> English
        </div>
        <div class="item" [class.active]="active() === 'pl'" (click)="switch('pl')">
          <span class="flag">🇵🇱</span> Polski
        </div>
      </div>
    </div>
  `
})
export class LanguageSwitcherComponent {
  private transloco = inject(TranslocoService);
  private locale = inject(TranslocoLocaleService, { optional: true });
  private router = inject(Router);

  open = false;
  active = signal<Lang>((this.transloco.getActiveLang() as Lang) || 'en');

  constructor() {
    const urlLang = this._langFromUrl();                                  // 1) URL first
    const saved   = (typeof localStorage !== 'undefined'
                    ? (localStorage.getItem('lang') as Lang | null)
                    : null);
    const initial: Lang = (urlLang ?? saved ?? this.active()) as Lang;    // 2) then saved, then default
    if (initial !== this.transloco.getActiveLang()) this.setLang(initial);
  }

  switch(lang: Lang) {
    this.setLang(lang);
    this.open = false;
    const tree = this._treeWithLang(lang);
    this.router.navigateByUrl(tree);
  }

  private setLang(lang: Lang) {
    this.transloco.setActiveLang(lang);
    this.locale?.setLocale(lang === 'pl' ? 'pl-PL' : 'en-US');
    this.active.set(lang);
    if (typeof localStorage !== 'undefined') localStorage.setItem('lang', lang);
  }

  private _langFromUrl(): Lang | null {
    const current = this.router.parseUrl(this.router.url);
    const seg0 = current.root.children['primary']?.segments?.[0]?.path;
    return seg0 === 'pl' || seg0 === 'en' ? seg0 : null;
  }

  private _treeWithLang(lang: Lang): UrlTree {
    const current = this.router.parseUrl(this.router.url);
    const primary = current.root.children['primary'];
    const segments: UrlSegment[] = primary?.segments ?? [];

    if (segments.length && ['en','pl'].includes(segments[0].path)) {
      segments[0] = new UrlSegment(lang, {});
    } else {
      segments.unshift(new UrlSegment(lang, {}));
    }

    return this.router.createUrlTree(
      segments.map(s => s.path),
      { queryParams: current.queryParams, fragment: current.fragment || undefined }
    );
  }
}
