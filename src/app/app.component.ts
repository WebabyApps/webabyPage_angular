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
    <!-- Intro tylko na HOME -->
    <app-intro-splash *ngIf="isHome$ | async"></app-intro-splash>

    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `
})
export class AppComponent {
  isHome$: Observable<boolean>;

  constructor(private router: Router){
    this.isHome$ = this.router.events.pipe(
      // dajemy też stan początkowy
      startWith(null),
      filter(e => !e || e instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0].split('#')[0]),
      map(path => this.isHomePath(path)),
      distinctUntilChanged()
    );
  }

  private isHomePath(path: string): boolean {
    // dodaj tu swoje aliasy home jeśli masz (np. '/pl')
    return path === '/' || path === '' || path === '/home';
  }
}
