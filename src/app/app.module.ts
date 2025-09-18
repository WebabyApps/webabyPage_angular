import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { HeroComponent } from './shared/hero/hero.component';
import { ProductsCarouselComponent } from './shared/products-carousel/products-carousel.component';
import { AboutComponent } from './shared/about/about.component';
import { ContactComponent } from './shared/contact/contact.component';
import { FooterComponent } from './shared/footer/footer.component';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Standalone imports
import { TutorialSectionComponent } from './shared/tutorial-section/tutorial-section.component';
import { QRCodeComponent } from 'angularx-qrcode';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HeroComponent,
    ProductsCarouselComponent,
    AboutComponent,
    ContactComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    MatDialogModule,
    MatButtonModule,

    // ⬇️ Standalone components go here:
    TutorialSectionComponent,
    QRCodeComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
