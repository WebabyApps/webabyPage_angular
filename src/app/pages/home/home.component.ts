import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco'; 

// Shared (standalone) components you already have:
import { HeroComponent } from '../../shared/hero/hero.component';
import { ProductsCarouselComponent } from '../../shared/products-carousel/products-carousel.component';
import { AboutComponent } from '../../shared/about/about.component';
import { ContactComponent } from '../../shared/contact/contact.component';
import { BlogTeaserComponent } from '../../shared/blog-teaser/blog-teaser.component';
import { VaporTextComponent } from '../../shared/vapor-text/vapor-text.component';
import { CpuArchitectureComponent } from '../../shared/cpu-architecture/cpu-architecture.component';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { HomepageSettingsService } from '../../content/homepage-settings.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    ProductsCarouselComponent,
    BlogTeaserComponent,
    VaporTextComponent,
    CpuArchitectureComponent,
    AboutComponent,
    ContactComponent,
    TranslocoModule 
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'] // you can delete this line if you don't want a scss file
})
export class HomeComponent {
  readonly viewModel$ = combineLatest([
    this.homepageSettings.settings$,
    this.route.queryParamMap,
  ]).pipe(
    map(([settings, params]) => {
      const previewVariant = params.get('hero');
      return {
        ...settings,
        heroVariant: previewVariant === 'classic' || previewVariant === 'apps'
          ? previewVariant
          : settings.heroVariant,
      };
    }),
  );

  constructor(
    private readonly homepageSettings: HomepageSettingsService,
    private readonly route: ActivatedRoute,
  ) {}
}
