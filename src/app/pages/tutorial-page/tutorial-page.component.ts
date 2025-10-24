// src/app/pages/tutorial-page/tutorial-page.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { map, take } from 'rxjs/operators';            // CHANGED: używamy map + take
import { Observable } from 'rxjs';                      // NEW

import { HeroComponent } from '../../shared/hero/hero.component';
import { TutorialSectionComponent } from '../../shared/tutorial-section/tutorial-section.component';
import { getAppUrlBySlug } from '../../shared/models/producs.data';
import { QRCodeComponent } from 'angularx-qrcode';


@Component({
  selector: 'app-tutorial-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, HeroComponent, TutorialSectionComponent],
  templateUrl: './tutorial-page.component.html',
  styleUrls: ['./tutorial-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialPageComponent implements OnInit {
  public arr = (v: unknown): any[] => Array.isArray(v) ? (v as any[]) : [];
  scopePath!: string; // e.g. 'basketball-shots'           // CHANGED: tylko scope potrzebny

  // NEW: cały słownik dla scope’u jako stream (po załadowaniu translacji)
  dict$!: Observable<any>;

  // NEW: bezpieczne strumienie tablic (zwrócą [] zanim i18n dojedzie)
  startMenuItems$!: Observable<string[]>;
  soundItems$!: Observable<string[]>;
  howSteps$!: Observable<string[]>;
  tips$!: Observable<string[]>;

  constructor(
    private route: ActivatedRoute,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    // CHANGED: scope bierzemy z data.slug (lazy-route) lub z param :slug (fallback)
    this.scopePath =
      (this.route.snapshot.data['slug'] as string)
      ?? (this.route.snapshot.paramMap.get('slug') as string)
      ?? 'basketball-shots';

    // NEW: słownik scope’u jako stream
    this.dict$ = this.transloco.selectTranslation(this.scopePath);

    // NEW: mapowania na tablice (zawsze array)
    this.startMenuItems$ = this.dict$.pipe(
      map(d => this.toArray(d?.sections?.startMenu?.items))
    );
    this.soundItems$ = this.dict$.pipe(
      map(d => this.toArray(d?.sections?.sound?.items))
    );
    this.howSteps$ = this.dict$.pipe(
      map(d => this.toArray(d?.sections?.how?.items))
    );
    this.tips$ = this.dict$.pipe(
      map(d => this.toArray(d?.sections?.tips?.items))
    );

    // (opcjonalnie) wymuś jednoładowanie, jeśli chcesz mieć pewność w konsoli:
    this.transloco.selectTranslation(this.scopePath).pipe(take(1)).subscribe();
  }

  /** ---- SCOPE-AWARE HELPERS ---- */
  tr(key: string, params: Record<string, any> = {}): string {
    return this.transloco.translate(key, params, this.scopePath);
  }

  // REMOVED: BehaviorSubjecty i tro() nie są potrzebne do list; zostawiamy tr() dla zwykłych stringów
  // tro() możesz zostawić, jeśli używasz gdzie indziej – nie wpływa na listy.

  /** Bezpieczne rzutowanie na tablicę */
  private toArray<T = string>(v: unknown): T[] {
    return Array.isArray(v) ? (v as T[]) : [];
  }

    get appUrl(): string | undefined {
    return getAppUrlBySlug(this.scopePath /* lub 'sp' */);
  }
}
