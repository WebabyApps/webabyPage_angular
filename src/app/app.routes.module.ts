// src/app/app.routes.module.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './shared/about/about.component';
import { ContactComponent } from './shared/contact/contact.component';
import { TutorialPageComponent } from './pages/tutorial-page/tutorial-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },

  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },

  // --- Per-tutorial lazy "modules" (specific slugs first) ---
  { path: 'products/basketball-shots',
    loadChildren: () => import('./tutorials/basketball-shots/tutorial.route') },
  { path: 'products/system-of-equations-trainer',
    loadChildren: () => import('./tutorials/system-of-equations-trainer/tutorial.route') },
  { path: 'products/abecadlowo',
    loadChildren: () => import('./tutorials/abecadlowo/tutorial.route') },  
  { path: 'products/abc-land',
    loadChildren: () => import('./tutorials/abc-land/tutorial.route') },
  
  // --- Fallbacks (match AFTER specific routes) ---
  { path: 'products/:slug', component: TutorialPageComponent },  // generic
  { path: 'tutorial/:slug', component: TutorialPageComponent },  // optional alias

  { path: '**', redirectTo: '' },
];
