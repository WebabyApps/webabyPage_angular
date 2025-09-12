import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Shared (standalone) components you already have:
import { HeroComponent } from '../../shared/hero/hero.component';
import { ProductsCarouselComponent } from '../../shared/products-carousel/products-carousel.component';
import { AboutComponent } from '../../shared/about/about.component';
import { ContactComponent } from '../../shared/contact/contact.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    ProductsCarouselComponent,
    AboutComponent,
    ContactComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'] // you can delete this line if you don't want a scss file
})
export class HomeComponent {}
