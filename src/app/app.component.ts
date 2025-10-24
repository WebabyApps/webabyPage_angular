// app.component.ts
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, UrlTree } from '@angular/router';
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
    <!-- Intro tylko na HOME, bez #fragmentu i bez ?product=..., chyba że ?intro=1 -->
    <app-intro-splash *ngIf="isHomeNoHashNoProduct$ | async"></app-intro-splash>

    <app-header></app-header>
    <app-chat-buddy></app-chat-buddy>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `
})
export class AppComponent {
  isHomeNoHashNoProduct$: Observable<boolean>;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isHomeNoHashNoProduct$ = this.router.events.pipe(
      startWith(null),
      filter(e => !e || e instanceof NavigationEnd),
      map(() => this.computeIntroVisibility()),
      distinctUntilChanged()
    );
  }

  private computeIntroVisibility(): boolean {
    // SSR-safe parsowanie bieżącego URL
    const url = this.router.url;
    const tree: UrlTree = this.router.parseUrl(url);

    const path = url.split('?')[0];                 // '/','/home','/...'
    const fragment = tree.fragment ?? null;         // '#...'
    const qp = tree.queryParamMap;

    const forceIntro = qp.get('intro') === '1';     // ?intro=1 wymusza intro
    const hasProduct = qp.has('product');           // blokuje intro dla deep-linka

    // Intro tylko na home i bez fragmentu oraz bez ?product=..., chyba że wymuszone
    return forceIntro || (this.isHomePath(path) && !fragment && !hasProduct);
  }

  private isHomePath(path: string): boolean {
    // dopisz ewentualne aliasy jak '/pl'
    return path === '/' || path === '' || path === '/home';
  }
}
