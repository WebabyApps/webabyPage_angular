import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { take, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

import { HeroComponent } from '../../shared/hero/hero.component';
import { TutorialSectionComponent } from '../../shared/tutorial-section/tutorial-section.component';

@Component({
  selector: 'app-tutorial-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, HeroComponent, TutorialSectionComponent],
  templateUrl: './tutorial-page.component.html',
  styleUrls: ['./tutorial-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialPageComponent implements OnInit {
  slug!: string;
  scopePath!: string; // e.g. 'abc-land'

  startMenuItems$ = new BehaviorSubject<string[]>([]);
  soundItems$     = new BehaviorSubject<string[]>([]);

  constructor(
    private route: ActivatedRoute,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    this.scopePath = this.route.snapshot.data['slug'] as string;

    
  // ⬇️ załaduje /assets/i18n/abc-land/<lang>.json
  this.transloco.selectTranslation(this.scopePath).pipe(take(1)).subscribe();
    // (optional) quick debug for single keys
   // console.log('[i18n] title@scope', this.transloco.translate('sections.startMenu.title', {}, this.scopePath));

    // ✅ Load the scope, then read arrays once
   // this.loadSectionArrays();
  }

  /** ---- SCOPE-AWARE HELPERS ---- */
  tr(key: string, params: Record<string, any> = {}): string {
    return this.transloco.translate(key, params, this.scopePath);
  }
  tro(key: string, params: Record<string, any> = {}) {
    const svc: any = this.transloco as any;
    if (typeof svc.selectTranslate === 'function') {
      return svc.selectTranslate(key, params, this.scopePath);
    }
    return {
      subscribe: (fn: (v: string) => void) => {
        fn(this.transloco.translate(key, params, this.scopePath));
        return { unsubscribe() {} };
      }
    };
  }

  /** ---- NEW: robust arrays loader ---- */
  private loadSectionArrays(): void {
    const scope = this.scopePath;
    if (!scope) {
      this.startMenuItems$.next([]);
      this.soundItems$.next([]);
      return;
    }
  
    // ✅ To wywoła loader z (activeLang, scope) → /assets/i18n/<scope>/<lang>.json
    this.transloco.selectTranslation(scope).pipe(take(1)).subscribe((tr: any) => {
      console.debug('[i18n] full scope loaded:', scope, tr);
  
      const start = tr?.sections?.startMenu?.items ?? [];
      const sound = tr?.sections?.sound?.items ?? [];
  
      this.startMenuItems$.next(Array.isArray(start) ? start : []);
      this.soundItems$.next(Array.isArray(sound) ? sound : []);
    });
  }
}
