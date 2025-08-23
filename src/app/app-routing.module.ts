const routes: Routes = [
    { path: 'products/:slug', loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
    { path: '', pathMatch: 'full', redirectTo: 'home' }, // przykładowo
  ];
  