import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ProductDialogComponent } from '../../shared/product-dialog/product-dialog.component';
import { PRIVACY_POLICY_EN } from '../..//pages/privacy-policy-en/privacy-policy-text.en';
@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    standalone: true
})
export class FooterComponent{ 
    year=new Date().getFullYear();
    private dialog = inject(MatDialog);





openPrivacyPolicy() {
  this.dialog.open(ProductDialogComponent, {
    data: {
      title: 'Privacy policy',
      desc: PRIVACY_POLICY_EN,   // tutaj idzie cały tekst
      imageUrl: '',
      slug: 'privacy-policy',
      showImage: false,
      showOpenLinkButton: false,
      showDetailsButton: false,
      showQr: false,
      showCloseButton: true,
    },
    width: '800px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    autoFocus: false,
    restoreFocus: true,
  });
}
}
