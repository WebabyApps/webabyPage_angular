import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

type Lang = 'en' | 'pl' | 'de';
const LANGS: Lang[] = ['en', 'pl', 'de'];

@Injectable({ providedIn: 'root' })
export class LocalizedRoutingService {
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  root(): string[] {
    const lang = this.currentLang();
    return lang ? ['/', lang] : ['/'];
  }

  path(...segments: string[]): string[] {
    const lang = this.currentLang();
    const cleanSegments = segments.map((segment) => segment.replace(/^\/+|\/+$/g, '')).filter(Boolean);
    return lang ? ['/', lang, ...cleanSegments] : ['/', ...cleanSegments];
  }

  currentLang(): Lang | null {
    const firstSegment = this.router.url.split('?')[0].split('#')[0].split('/').filter(Boolean)[0];
    if (LANGS.includes(firstSegment as Lang)) return firstSegment as Lang;
    const active = (this.transloco.getActiveLang() || '').toLowerCase().split('-')[0];
    return LANGS.includes(active as Lang) ? active as Lang : null;
  }
}
