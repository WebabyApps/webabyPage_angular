// app.component.ts (recap)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { IntroSplashComponent } from './shared/intro-splash/intro-splash.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, IntroSplashComponent],
  template: `
  <app-intro-splash></app-intro-splash>

    <!-- STRONA POD INTRO -->
    <div class="site">
      <app-header class="site-header"></app-header>
      <router-outlet class="site-main"></router-outlet>
      <app-footer class="site-footer"></app-footer>
    </div>
    
  `
})
export class AppComponent {}
