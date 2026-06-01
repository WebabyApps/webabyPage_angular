import {
  Component,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslocoModule, LanguageSwitcherComponent]
})
export class HeaderComponent implements AfterViewInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('navMenu', { static: false }) navMenuRef!: ElementRef<HTMLElement>;

  scrolled = false;
  menuOpen = false;
  hideOnScroll = false;
  private lastY = 0;
  private inactivityTimer: any = null;

  ngAfterViewInit(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.closeMenu());
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', this.onDocumentClick, true);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.onDocumentClick, true);
      document.body.classList.remove('menu-open');
    }
    clearTimeout(this.inactivityTimer);
  }

  onHomeClick(ev: Event) {
    if (this.router.url === '/' || this.router.url.startsWith('/#')) {
      ev.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    document.body.classList.toggle('menu-open', this.menuOpen);
    if (this.menuOpen) this.startInactivityTimer();
    else this.clearInactivityTimer();
  }

  closeMenu() {
    if (this.menuOpen) {
      this.menuOpen = false;
      document.body.classList.remove('menu-open');
      this.clearInactivityTimer();
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!isPlatformBrowser(this.platformId)) return;
    const y = window.scrollY || 0;
    this.scrolled = y > 40;

    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
      const goingDown = y > this.lastY + 5;
      const goingUp = y < this.lastY - 5;

      if (goingDown && y > 80) this.hideOnScroll = true;
      if (goingUp) this.hideOnScroll = false;

      if (this.menuOpen) this.closeMenu();
    } else {
      this.hideOnScroll = false;
    }

    this.lastY = y;
  }

  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  onViewportChange() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.innerWidth > 900) this.closeMenu();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    if (ev.key === 'Escape') this.closeMenu();
    else this.resetInactivityTimer(); // każde naciśnięcie klawisza resetuje licznik
  }

  private onDocumentClick = (ev: Event) => {
    if (!this.menuOpen) return;
    const navEl = this.navMenuRef?.nativeElement;
    const hamburger = (ev.target as HTMLElement)?.closest('.hamburger');
    if (hamburger) return;
    // Każdy klik wewnątrz menu resetuje timer, klik poza — zamyka
    if (navEl && navEl.contains(ev.target as Node)) this.resetInactivityTimer();
    else this.closeMenu();
  };

  /** ----------------
   *  AUTO-CLOSE LOGIC
   *  ----------------*/
  private startInactivityTimer() {
    this.clearInactivityTimer();
    if (!isPlatformBrowser(this.platformId) || window.innerWidth > 900) return; // tylko mobile
    this.inactivityTimer = setTimeout(() => {
      this.closeMenu();
    }, 4000); // 4 sekundy
  }

  private resetInactivityTimer() {
    if (!this.menuOpen) return;
    this.startInactivityTimer();
  }

  private clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}
