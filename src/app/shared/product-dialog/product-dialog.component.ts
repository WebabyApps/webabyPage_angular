import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product } from '../models/products';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode'; //
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-dialog',
  standalone: true, 
  imports: [QRCodeComponent, CommonModule, MatButtonModule],
  template: `
  <div class="dialog">
    <button class="close" aria-label="Close" (click)="close()">×</button>

    <img class="hero" [src]="data.imageUrl" [alt]="data.title" />

    <h2>{{ data.title }}</h2>

    <div class="qr-wrap">
      <qrcode [qrdata]="data.appUrl" [width]="160" [errorCorrectionLevel]="'M'"></qrcode>
      <div class="qr-caption">
        <a [href]="data.appUrl" target="_blank" rel="noopener">Open app link</a>
        <p>Scan the QR code to open the app on your phone</p>
         <p></p>
      </div>
    </div>

<div class="dialog-actions">
    <button mat-raised-button color="primary" class="glow-btn" (click)="goToDetails()">
      Detailed tutorial
    </button>
  </div>
  </div>
  `,
  styles: [`
    .dialog {
      width: min(92vw, 720px);
      background: rgba(18,18,22,0.72);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 20px;
      padding: 20px;
      color: #fff;
      position: relative;
    }
    .close {
      position: absolute; top: 12px; right: 12px;
      background: transparent; border: 0; color: #bbb; font-size: 28px; line-height: 1; cursor: pointer;
    }
    .hero { width: 100%; height: auto; border-radius: 14px; margin-bottom: 16px; }
    h2 { margin: 0 0 10px; font-size: 1.4rem; }
    .qr-wrap { display: flex; align-items: center; gap: 16px; margin: 12px 0 22px; flex-wrap: wrap; }
    .qr-caption { font-size: .95rem; }
    button[mat-raised-button] { align-self: flex-start; }
    @media (max-width: 480px) {
      .qr-wrap { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class ProductDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private ref: MatDialogRef<ProductDialogComponent>,
    private router: Router
  ) {}

  close() { this.ref.close(); }

  goToDetails() {
    this.ref.close();
    this.router.navigate(['/products', this.data.slug]);
  }
}
