import { Component } from '@angular/core';
@Component({
  selector:'app-root',
  template:`
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
export class AppComponent{}