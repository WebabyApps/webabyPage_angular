// src/app/shared/language-switcher/language-switcher.component.ts
import { Component, inject, signal, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
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

function normalizeLang(value: string | null | undefined): Lang | null {
  const normalized = String(value ?? '').toLowerCase().split('-')[0];
  return (['en', 'pl', 'de'] as Lang[]).includes(normalized as Lang)
    ? (normalized as Lang)
    : null;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  styles: [`
  .lang-switch { position: relative; }
  .lang-btn {
    display:flex; align-items:center; gap:.5rem;
    padding:.4rem .7rem; border:1px solid rgba(255,255,255,.25);
    border-radius:999px; background:transparent; cursor:pointer;
    font-weight:600; font-size:.95rem; color:#fff;
  }

  /* Domyślnie (desktop) menu dockowane do PRAWEJ */
  .menu {
    position:absolute; top:110%;
    right:0; left:auto;             /* ← ważne */
    min-width:160px;
    border:1px solid rgba(255,255,255,.25); border-radius:12px;
    background: rgba(0,0,0,.75); padding:.25rem;
    box-shadow: 0 6px 24px rgba(0,0,0,.35);
    z-index: 50; color:#fff;

    opacity: 0; transform: translateY(-6px);
    pointer-events: none;
    transition: opacity .18s ease, transform .18s ease;
  }
  .menu.open { opacity:1; transform: translateY(0); pointer-events:auto; }

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

  /* === MOBILE: dockuj menu do LEWEJ i wyrównaj przycisk do lewej === */
  @media (max-width: 900px){
    .lang-switch { width: 100%; }                 /* nieobowiązkowe, ale ładnie siada */
    .lang-btn { justify-content: flex-start; }    /* tekst + flaga przy lewej */
    .menu { left: 0; right: auto; }               /* ← kluczowa zmiana */
  }
`],
  template: `
    <div class="lang-switch" (keydown.escape)="closeMenu()" (keydown)="resetInactivityTimer()">
      <button class="lang-btn"
              (click)="toggleMenu()"
              aria-haspopup="menu"
              [attr.aria-expanded]="open"
              [attr.aria-controls]="'lang-menu'">
        <span class="flag">{{ currentFlag() }}</span>
        <span>{{ currentLabel() }}</span>
      </button>

      <div class="menu" [class.open]="open" id="lang-menu" role="menu" #menuRef
           (click)="resetInactivityTimer()"
           (mousemove)="resetInactivityTimer()"
           (touchstart)="resetInactivityTimer()">
        <div
          class="item"
          role="menuitem"
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
export class LanguageSwitcherComponent implements OnDestroy {
  private transloco = inject(TranslocoService);
  private locale = inject(TranslocoLocaleService, { optional: true });
  private router = inject(Router);

  @ViewChild('menuRef', { static: false }) menuRef!: ElementRef<HTMLElement>;

  open = false;
  langs = LANGS;
  active = signal<Lang>(normalizeLang(this.transloco.getActiveLang()) ?? 'en');

  private inactivityTimer: any = null;
  private readonly INACTIVITY_MS = 2000;

  constructor() {
    const urlLang = this._langFromUrl(); // 1) URL first
    const saved = (typeof localStorage !== 'undefined'
      ? normalizeLang(localStorage.getItem('lang'))
      : null);
    const fallback = this.active();
    const initial = urlLang ?? saved ?? fallback;

    if (initial !== this.transloco.getActiveLang()) {
      this.setLang(initial);
    }
  }

  ngOnDestroy(): void {
    this.clearInactivityTimer();
  }

  // ——— UI helpers ———
  currentLabel() {
    return this.langs.find(l => l.id === this.active())?.label ?? 'English';
  }
  currentFlag() {
    return this.langs.find(l => l.id === this.active())?.flag ?? '🇬🇧';
  }

  // ——— Open/Close with inactivity ———
  toggleMenu() {
    this.open = !this.open;
    if (this.open) this.startInactivityTimer();
    else this.clearInactivityTimer();
  }
  closeMenu() {
    if (!this.open) return;
    this.open = false;
    this.clearInactivityTimer();
  }

  private startInactivityTimer() {
    this.clearInactivityTimer();
    if (typeof window === 'undefined') return;
    this.inactivityTimer = setTimeout(() => this.closeMenu(), this.INACTIVITY_MS);
  }
  resetInactivityTimer() {
    if (!this.open) return;
    this.startInactivityTimer();
  }
  private clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  // ——— Global listeners: klik poza, scroll, resize ———
  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.open) return;
    const target = ev.target as Node;
    const menuEl = this.menuRef?.nativeElement;
    const within = menuEl?.contains(target) || (target as HTMLElement).closest('.lang-btn');
    if (within) {
      this.resetInactivityTimer(); // klik wewnątrz — tylko reset
    } else {
      this.closeMenu(); // klik poza — zamknij
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.open) this.closeMenu();
  }

  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  onViewportChange() {
    if (this.open) this.closeMenu();
  }

  // ——— Switch lang ———
  switch(lang: Lang) {
    this.setLang(lang);
    this.closeMenu();
    const tree = this._treeWithLang(lang);
    this.router.navigateByUrl(tree);
  }

  private setLang(lang: Lang) {
    lang = normalizeLang(lang) ?? 'en';
    this.transloco.setActiveLang(lang);
    const lc = this.langs.find(l => l.id === lang)?.locale ?? 'en-US';
    this.locale?.setLocale(lc);
    this.active.set(lang);
    if (typeof localStorage !== 'undefined') localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }

  // ——— URL helpers ———
  private _langFromUrl(): Lang | null {
    const current = this.router.parseUrl(this.router.url);
    const seg0 = current.root.children['primary']?.segments?.[0]?.path;
    return normalizeLang(seg0);
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
