// app.component.ts
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, NavigationStart, RouterOutlet, UrlTree } from '@angular/router'; // ⬅️ + NavigationStart
import { MatDialog } from '@angular/material/dialog'; // ⬅️ NEW
import { ChatBuddyComponent } from './shared/chat-buddy/chat-buddy.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { IntroSplashComponent } from './shared/intro-splash/intro-splash.component';
import { filter, map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, IntroSplashComponent, ChatBuddyComponent],
  template: `
    <app-intro-splash *ngIf="isHomeNoHashNoProduct$ | async"></app-intro-splash>

    <app-header></app-header>
    <app-chat-buddy></app-chat-buddy>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `
})
export class AppComponent {
  isHomeNoHashNoProduct$: Observable<boolean>;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog // ⬅️ NEW
  ) {
    this.isHomeNoHashNoProduct$ = this.router.events.pipe(
      startWith(null),
      filter(e => !e || e instanceof NavigationEnd),
      map(() => this.computeIntroVisibility()),
      distinctUntilChanged()
    );

    // ⬅️ NEW: globalny bezpiecznik zamykający modale przy każdej nawigacji
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(filter(ev => ev instanceof NavigationStart))
        .subscribe(() => this.dialog.closeAll());
    }
  }

  private computeIntroVisibility(): boolean {
    const url = this.router.url;
    const tree: UrlTree = this.router.parseUrl(url);
    const path = url.split('?')[0];
    const fragment = tree.fragment ?? null;
    const qp = tree.queryParamMap;

    const forceIntro = qp.get('intro') === '1';
    const hasProduct = qp.has('product');

    return forceIntro || (this.isHomePath(path) && !fragment && !hasProduct);
  }

  private isHomePath(path: string): boolean {
    return path === '/' || path === '' || path === '/home';
  }
}
