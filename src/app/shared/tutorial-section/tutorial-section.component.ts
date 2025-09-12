import { Component, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FadeInOnScrollDirective } from '../directives/fade-in-on-scroll.directive';

@Component({
  selector: 'app-tutorial-section',
  standalone: true,
  imports: [NgIf, NgClass, FadeInOnScrollDirective],
  templateUrl: './tutorial-section.component.html',
  styleUrls: ['./tutorial-section.component.scss'],
})
export class TutorialSectionComponent {
  @Input() title = '';
  @Input() caption = '';
  @Input() reverse = false;

  // Image inputs
  @Input() img = '';
  @Input() alt = '';

  // YouTube inputs (provide either youtubeId OR youtubeUrl)
  @Input() youtubeId = '';
  @Input() youtubeUrl = '';
  @Input() start = 0;            // seconds
  @Input() autoplay = false;
  @Input() modestBranding = true;
  @Input() rel = 0;              // show related vids (0/1)
  @Input() lazyVideo = false;  // ⬅️ New: disable lazy-loading by default

  constructor(private sanitizer: DomSanitizer) {}

  get videoId(): string | null {
    if (this.youtubeId) return this.youtubeId.trim();
    if (!this.youtubeUrl) return null;
    // Extract ID from common YouTube URL forms
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
      playsinline: '1'
    }).toString();
    // Use the no-cookie domain
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${id}?${params}`
    );
  }

  // Convenience: if both are provided, video wins.
  get showVideo(): boolean {
    return !!this.embedUrl;
  }
}


