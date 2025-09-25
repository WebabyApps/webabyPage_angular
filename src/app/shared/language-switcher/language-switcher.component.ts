// src/app/shared/language-switcher/language-switcher.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, UrlSegment, UrlTree } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';

type Lang = 'en' | 'pl' | 'de';

const LANGS: Array<{ id: Lang; label: string; flag: string; locale: string }> = [
  { id: 'en', label: 'English', flag: '🇬🇧', locale: 'en-US' },
  { id: 'pl', label: 'Polski',  flag: '🇵🇱', locale: 'pl-PL' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
];

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  styles: [`
    .lang-switch { position: relative; }
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
      position:absolute; top:110%; right:0; min-width:160px;
      border:1px solid rgba(255,255,255,.25);
      border-radius:12px;
      background: rgba(0,0,0,.75);
      padding:.25rem;
      box-shadow: 0 6px 24px rgba(0,0,0,.35);
      z-index: 50;
      color:#fff;
    }
    .item { padding:.5rem .75rem; border-radius:10px; cursor:pointer; display:flex; gap:.5rem; align-items:center; }
    .item:hover { background: rgba(255,255,255,.08); }
    .item.active { outline: 2px solid rgba(255,255,255,.2); }

    :host-context(.site-header.scrolled) .lang-btn {
      color:#111; border-color: rgba(0,0,0,.25); background: transparent;
    }
    :host-context(.site-header.scrolled) .menu {
      color:#111; background: rgba(255,255,255,.95); border-color: rgba(0,0,0,.2);
    }
    :host-context(.site-header.scrolled) .item:hover { background: rgba(0,0,0,.06); }
  `],
  template: `
    <div class="lang-switch" (keydown.escape)="open=false">
      <button class="lang-btn" (click)="open = !open" aria-haspopup="menu" [attr.aria-expanded]="open">
        <span class="flag">{{ currentFlag() }}</span>
        <span>{{ currentLabel() }}</span>
      </button>

      <div class="menu" *ngIf="open">
        <div
          class="item"
          *ngFor="let l of langs"
          [class.active]="active() === l.id"
          (click)="switch(l.id)"
        >
          <span class="flag">{{ l.flag }}</span> {{ l.label }}
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
  langs = LANGS;
  active = signal<Lang>((this.transloco.getActiveLang() as Lang) || 'en');

  constructor() {
    const urlLang = this._langFromUrl(); // 1) URL first
    const saved = (typeof localStorage !== 'undefined'
      ? (localStorage.getItem('lang') as Lang | null)
      : null);
    const fallback = this.active();
    const initial = (urlLang ?? saved ?? fallback) as Lang;

    if (initial !== this.transloco.getActiveLang()) {
      this.setLang(initial);
    }
  }

  currentLabel() {
    return this.langs.find(l => l.id === this.active())?.label ?? 'English';
    // optional: you could translate these with Transloco if you prefer
  }

  currentFlag() {
    return this.langs.find(l => l.id === this.active())?.flag ?? '🇬🇧';
  }

  switch(lang: Lang) {
    this.setLang(lang);
    this.open = false;
    const tree = this._treeWithLang(lang);
    this.router.navigateByUrl(tree);
  }

  private setLang(lang: Lang) {
    this.transloco.setActiveLang(lang);
    const lc = this.langs.find(l => l.id === lang)?.locale ?? 'en-US';
    this.locale?.setLocale(lc);
    this.active.set(lang);
    if (typeof localStorage !== 'undefined') localStorage.setItem('lang', lang);
    document.documentElement.lang = lang; // helpful for a11y & SEO
  }

  private _langFromUrl(): Lang | null {
    const current = this.router.parseUrl(this.router.url);
    const seg0 = current.root.children['primary']?.segments?.[0]?.path;
    return (['en','pl','de'] as Lang[]).includes(seg0 as Lang) ? (seg0 as Lang) : null;
  }

  private _treeWithLang(lang: Lang): UrlTree {
    const current = this.router.parseUrl(this.router.url);
    const primary = current.root.children['primary'];
    const segments: UrlSegment[] = primary?.segments ?? [];

    if (segments.length && (['en','pl','de'] as Lang[]).includes(segments[0].path as Lang)) {
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
