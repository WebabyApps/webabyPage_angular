import { Routes } from '@angular/router';

import { HeroComponent } from './shared/hero/hero.component';
import { AboutComponent } from './shared/about/about.component';
import { ContactComponent } from './shared/contact/contact.component';

export const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },

  // zawsze na końcu:
  { path: '**', redirectTo: '' },
];
