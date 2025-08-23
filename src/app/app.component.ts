import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './shared/header/header.component';
import { HeroComponent } from './shared/hero/hero.component';
import { ProductsCarouselComponent } from './shared/products-carousel/products-carousel.component';
import { AboutComponent } from './shared/about/about.component';
import { ContactComponent } from './shared/contact/contact.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    HeroComponent,
    ProductsCarouselComponent,
    AboutComponent,
    ContactComponent,
    FooterComponent
  ],
  template: `
    <app-header></app-header>
    <app-hero></app-hero>
    <main id="content">
      <section id="products" class="section">
        <div class="container">
          <h2>Products</h2>
          <app-products-carousel></app-products-carousel>
        </div>
      </section>
      <section id="about" class="section alt">
        <div class="container">
          <h2>About Us</h2>
          <app-about></app-about>
        </div>
      </section>
      <section id="contact" class="section">
        <div class="container">
          <h2>Contact</h2>
          <app-contact></app-contact>
        </div>
      </section>
    </main>
    <app-footer></app-footer>
  `
})
export class AppComponent {}
