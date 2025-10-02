// app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { IntroSplashComponent } from './shared/intro-splash/intro-splash.component';
import { filter, map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, IntroSplashComponent],
  template: `
    <!-- Intro tylko na HOME bez hash-a; ?intro=1 zawsze wymusza -->
    <app-intro-splash *ngIf="isHomeNoHash$ | async"></app-intro-splash>

    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `
})
export class AppComponent {
  isHomeNoHash$: Observable<boolean>;

  constructor(private router: Router){
    this.isHomeNoHash$ = this.router.events.pipe(
      startWith(null),
      filter(e => !e || e instanceof NavigationEnd),
      // bierzemy pełny URL z przeglądarki, bo Router nie zawsze zawiera fragment
      map(() => ({
        path: this.router.url.split('?')[0],      // /, /home, /privacy-policy itd.
        hasHash: !!window.location.hash,          // #products, #about itd.
        force: new URL(window.location.href).searchParams.get('intro') === '1'
      })),
      map(({ path, hasHash, force }) => (this.isHomePath(path) && !hasHash) || force),
      distinctUntilChanged()
    );
  }

  private isHomePath(path: string): boolean {
    // dodaj swoje aliasy home jeśli masz (np. '/pl')
    return path === '/' || path === '' || path === '/home';
  }
}
