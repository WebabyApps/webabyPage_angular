import { AfterViewInit, Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[fadeInOnScroll]',
  standalone: true
})
export class FadeInOnScrollDirective implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Start hidden, CSS will fade it in when 'visible' is added
    this.renderer.addClass(this.el.nativeElement, 'fade-in-section');
  }

  ngAfterViewInit(): void {
    // 1) If already on screen at mount, reveal immediately (no flash)
    const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const alreadyVisible = rect.top < vh && rect.bottom > 0;
    if (alreadyVisible) {
      this.renderer.addClass(this.el.nativeElement, 'visible');
    }

    // 2) Observe enter/leave with generous rootMargin so it triggers reliably
    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.el.nativeElement, 'visible');
          } else {
            this.renderer.removeClass(this.el.nativeElement, 'visible');
          }
        }
      },
      {
        root: null,
        // Trigger a bit before it fully enters/leaves viewport
        rootMargin: '0px 0px -10% 0px',
        threshold: 0    // any intersection counts
      }
    );

    // Small defer to let layout settle before observing
    requestAnimationFrame(() => this.observer?.observe(this.el.nativeElement));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
