import { Component, Input, OnChanges } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FadeInOnScrollDirective } from '../directives/fade-in-on-scroll.directive';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-tutorial-section',
  standalone: true,
  imports: [NgIf, NgClass, FadeInOnScrollDirective, TranslocoModule],
  templateUrl: './tutorial-section.component.html',
  styleUrls: ['./tutorial-section.component.scss'],
})
export class TutorialSectionComponent implements OnChanges {
  @Input() scope?: string;

  @Input() title?: string;
  @Input() caption?: string;
  @Input() alt?: string;

  resolvedTitle?: string;
  resolvedCaption?: string;
  resolvedAlt?: string;

  @Input() reverse = false;
  @Input() img = '';
  @Input() lazyImg = true;

  @Input() youtubeId = '';
  @Input() youtubeUrl = '';
  @Input() start = 0;
  @Input() autoplay = false;
  @Input() modestBranding = true;
  @Input() rel = 0;
  @Input() lazyVideo = false;

  constructor(
    private sanitizer: DomSanitizer,
    private transloco: TranslocoService   // ⬅️ injected here
  ) {}

  ngOnChanges(): void {
    this.resolveAll();
  }

  private isKey(str?: string): boolean {
    return !!str && str.includes('.') && !/\s/.test(str);
  }

  private trMaybeAsync(str?: string, setter?: (v: string) => void) {
    if (!str || !setter) return;
    if (!this.isKey(str)) { setter(str); return; }

    const svc: any = this.transloco as any;
    if (typeof svc.selectTranslate === 'function') {
      const obs = this.scope
        ? svc.selectTranslate(str, {}, this.scope)
        : svc.selectTranslate(str);
      obs.pipe().subscribe((v: string) => setter(v));
      return;
    }
    const v = this.scope
      ? this.transloco.translate(str, {}, this.scope)
      : this.transloco.translate(str);
    setter(v);
  }

  private resolveAll() {
    this.trMaybeAsync(this.title, v => (this.resolvedTitle = v));
    this.trMaybeAsync(this.caption, v => (this.resolvedCaption = v));
    this.trMaybeAsync(this.alt, v => (this.resolvedAlt = v));
  }

  /** ⬇️ NEW scope-aware helpers */
  tr(key: string, params: Record<string, any> = {}): string {
    return this.transloco.translate(key, params, this.scope);
  }

  tro(key: string, params: Record<string, any> = {}) {
    const svc: any = this.transloco as any;
    if (typeof svc.selectTranslate === 'function') {
      return svc.selectTranslate(key, params, this.scope);
    }
    return {
      subscribe: (fn: (v: string) => void) => {
        fn(this.transloco.translate(key, params, this.scope));
        return { unsubscribe() {} };
      },
    };
  }
  /** ⬆️ END of helpers */

  get videoId(): string | null {
    if (this.youtubeId) return this.youtubeId.trim();
    if (!this.youtubeUrl) return null;
    const m =
      this.youtubeUrl.match(/[?&]v=([^&#]+)/) ||
      this.youtubeUrl.match(/youtu\.be\/([^?&#/]+)/) ||
      this.youtubeUrl.match(/youtube\.com\/embed\/([^?&#/]+)/);
    return m ? m[1] : null;
  }

  get embedUrl(): SafeResourceUrl | null {
    const id = this.videoId;
    if (!id) return null;
    const params = new URLSearchParams({
      autoplay: this.autoplay ? '1' : '0',
      start: String(this.start || 0),
      modestbranding: this.modestBranding ? '1' : '0',
      rel: String(this.rel ?? 0),
      playsinline: '1',
    }).toString();
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${id}?${params}`
    );
  }

  get showVideo(): boolean {
    return !!this.embedUrl;
  }
}
