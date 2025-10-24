import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { take } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  private _scope?: string;
  private _title?: string;
  private _subtitle?: string;
  private _ctaText?: string;

  resolvedTitle?: string;
  resolvedSubtitle?: string;
  resolvedCtaText?: string;

  // ⬇️ WSTRZYKNIJ PLATFORM_ID (pierwszy parametr) + Transloco
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private transloco: TranslocoService
  ) {}

  @Input() set scope(value: string | undefined) { this._scope = value || undefined; this.resolveAll(); }
  @Input() set title(value: string | undefined) { this._title = value || undefined; this.resolveAll(); }
  @Input() set subtitle(value: string | undefined) { this._subtitle = value || undefined; this.resolveAll(); }
  @Input() set ctaText(value: string | undefined) { this._ctaText = value || undefined; this.resolveAll(); }

  @Input() brandScrollTarget?: string;   // np. "page-title"
  @Input() brandScrollOffset = 0;        // kompensacja sticky headera (px)

  // ✅ PUBLIC + ARROW => widoczne w template, poprawne this-binding
  public onLogoClick = (event: MouseEvent): void => {
    if (!this.brandScrollTarget) return; // pozwól routerLinkowi działać normalnie
    event.preventDefault();

    if (!isPlatformBrowser(this.platformId)) return;

    const el = document.getElementById(this.brandScrollTarget);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - (this.brandScrollOffset || 0);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  private isKey(str?: string): boolean {
    return !!str && str.includes('.') && !/\s/.test(str);
  }

  private trMaybeAsync(str?: string, setter?: (v: string) => void) {
    if (!str || !setter) return;
    if (!this.isKey(str)) { setter(str); return; }

    const svc: any = this.transloco as any;
    if (typeof svc.selectTranslate === 'function') {
      const obs = this._scope ? svc.selectTranslate(str, {}, this._scope)
                              : svc.selectTranslate(str);
      obs.pipe(take(1)).subscribe((v: string) => setter(v));
      return;
    }
    const v = this._scope ? this.transloco.translate(str, {}, this._scope)
                          : this.transloco.translate(str);
    setter(v);
  }

  private resolveAll() {
    this.trMaybeAsync(this._title, v => this.resolvedTitle = v);
    this.trMaybeAsync(this._subtitle, v => this.resolvedSubtitle = v);
    this.trMaybeAsync(this._ctaText, v => this.resolvedCtaText = v);
  }

  @Input() ctaLink: string | any[] | null = null;
  @Input() ctaFragment?: string;
  @Input() compact = false;

  scrollToProducts() {
    const el = document.querySelector('#products');
    if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
