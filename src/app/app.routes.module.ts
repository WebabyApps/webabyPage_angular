// src/app/app.routes.module.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './shared/about/about.component';
import { ContactComponent } from './shared/contact/contact.component';
import { TutorialPageComponent } from './pages/tutorial-page/tutorial-page.component';
import { PrivacyPolicyEnComponent } from './pages/privacy-policy-en/privacy-policy-en.component';
import { ProductPrivacyPolicyComponent } from './pages/product-privacy-policy/product-privacy-policy.component';
import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
const i18nResolver = () => {
  const t = inject(TranslocoService);
  const lang = (t.getActiveLang() || 'en').toLowerCase();
  return t.load(lang);
};

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },

  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  
  { path: 'privacy-policy', component: PrivacyPolicyEnComponent, resolve: { i18n: i18nResolver } },
  { path: 'products/:slug/privacy-policy', component: ProductPrivacyPolicyComponent, resolve: { i18n: i18nResolver } },
  // --- Per-tutorial lazy "modules" (specific slugs first) ---
  { path: 'products/basketball-shots',
    loadChildren: () => import('./tutorials/basketball-shots/tutorial.route') },
  { path: 'products/system-of-equations',
    loadChildren: () => import('./tutorials/system-of-equations/tutorial.route') },
  { path: 'products/abecadlowo',
    loadChildren: () => import('./tutorials/abecadlowo/tutorial.route') },  
  { path: 'products/bibble-echo',
    loadChildren: () => import('./tutorials/bibble-echo/tutorial.route') }, 
  { path: 'products/lucky-draw',
    loadChildren: () => import('./tutorials/lucky-draw/tutorial.route') }, 
  { path: 'products/abc-land',
    loadChildren: () => import('./tutorials/abc-land/tutorial.route') },
    { path: 'products/bubble-world',
      loadChildren: () => import('./tutorials/bubble-world/tutorial.route') },
    { path: 'products/music-colours',
      loadChildren: () => import('./tutorials/music-colours/tutorial.route') },
    { path: 'products/free-ride',
      loadChildren: () => import('./tutorials/free-ride/tutorial.route') },
    
  // --- Fallbacks (match AFTER specific routes) ---
  { path: 'products/:slug', component: TutorialPageComponent },  // generic
  { path: 'tutorial/:slug', component: TutorialPageComponent },  // optional alias

  { path: '**', redirectTo: '' },
];
