import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { ProductDialogComponent } from '../../shared/product-dialog/product-dialog.component';
import { getPolicyBySlug } from '../../privacy/policy-registry.en';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  standalone: true,
})
export class FooterComponent {
  year = new Date().getFullYear();
  private dialog = inject(MatDialog);
  private route  = inject(ActivatedRoute);

  /** Pobiera slug z najgłębszego segmentu trasy, np. 'products/:slug' */
  private getCurrentSlug(): string | null {
    let snap = this.route.snapshot;
    while (snap.firstChild) snap = snap.firstChild;
    return snap.paramMap.get('slug'); // dopasuj nazwę parametru, jeśli inna
  }


  /** slug z aktualnie otwartego product-dialog (jeśli jest) */
  private getSlugFromOpenProductDialog(): string | null {
    const ref = this.dialog.getDialogById('product-dialog');
    // typowanie ochronne; w ProductDialog masz publiczne `data: ProductDialogData`
    const slug = (ref?.componentInstance as ProductDialogComponent | undefined)?.data?.slug;
    return slug ?? null;
  }

  /** slug z najgłębszego segmentu trasy (np. /products/:slug) */
  private getSlugFromRoute(): string | null {
    let snap = this.route.snapshot;
    while (snap.firstChild) snap = snap.firstChild;
    return snap.paramMap.get('slug');
  }

  openPrivacyPolicy() {
    const slug =
      this.getSlugFromOpenProductDialog() ??
      this.getSlugFromRoute() ??
      null;

    // Na czysto UX-owo: zamknij modal produktu, żeby nie „stał” pod spodem.
    this.dialog.getDialogById('product-dialog')?.close();

    const policyText = getPolicyBySlug(slug);

    this.dialog.open(ProductDialogComponent, {
      id: 'privacy-policy-dialog',    // inne ID, żeby nie kolidować
      data: {
        title: 'Privacy policy',
        desc: policyText,             // ⬅️ tu wstrzykujemy gotowy tekst
        imageUrl: '',
        slug: 'privacy-policy',
        showImage: false,
        showOpenLinkButton: false,
        showDetailsButton: false,
        showQr: false,
        showCloseButton: true,
      },
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: true,
    });
  }
}