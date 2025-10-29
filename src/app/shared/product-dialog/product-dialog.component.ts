// src/app/shared/product-dialog/product-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { QRCodeComponent } from 'angularx-qrcode';
import { TranslocoModule } from '@jsverse/transloco';
import { A11yModule } from '@angular/cdk/a11y';
//import { NgOptimizedImage } from '@angular/common';

export type Product = {
  title: string;
  imageUrl: string;
  appUrl?: string;
  slug: string;
  desc?: string;
};
export type ProductDialogData = Product & Partial<ProductDialogOptions> & {
  deepLink?: string; // NEW
};

// ➕ Opcje widoczności elementów (domyślnie wszystko włączone)
export type ProductDialogOptions = {
  showImage: boolean;
  showOpenLinkButton: boolean;
  showDetailsButton: boolean;
  showQr: boolean;
  showCloseButton: boolean;
};


@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, QRCodeComponent, TranslocoModule, A11yModule],
  template: `
    <div class="dialog">
      <!-- ❌ X można ukryć -->
 <button
  *ngIf="cfg.showCloseButton"
  class="close"
  type="button"
  cdkFocusInitial
  (click)="$event.stopPropagation(); close('x')"
>×</button>


      

      <!-- przewijalna część środka -->
      <div class="dialog-body">
        <!-- 🖼️ Obrazek można ukryć -->
        <img
          *ngIf="cfg.showImage"
          class="hero"
          [src]="data.imageUrl"
          [attr.alt]="data.title"
        />

        <div class="info-wrap">
          <div class="info-text">
            <h2>

  <button *ngIf="data.deepLink"
          class="copy-link"
          type="button"
          (click)="copyDeepLink()">
    {{ data.title }}
  </button>
</h2>

            <p *ngIf="data.desc">{{ data.desc }}</p>

            <!-- 🔗 Przycisk-link można ukryć; i tak wymaga appUrl -->
            <a
              *ngIf="cfg.showOpenLinkButton && data.appUrl"
              class="glow-pill"
              [href]="data.appUrl"
              target="_blank"
              rel="noopener"
            >
              {{ 'home.products.dialog.openLink' | transloco }}
            </a>
          </div>

          <!-- ◻️ QR można wyłączyć; i tak wymaga appUrl -->
          <div class="info-qr" *ngIf="cfg.showQr && data.appUrl">
            <qrcode
              [qrdata]="data.appUrl"
              [width]="140"
              [errorCorrectionLevel]="'M'"
            ></qrcode>
            <div class="qr-caption">
              <p>{{ 'home.products.dialog.qrInstruction' | transloco }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 📌 Footer z CTA można ukryć -->
      <div class="dialog-actions" *ngIf="cfg.showDetailsButton">
        <button
  mat-raised-button
  type="button"
  color="primary"
  class="glow-btn"
  (click)="goToDetails()">
  {{ 'home.products.dialog.detailsCta' | transloco }}
</button>

      </div>
    </div>
  `,
  styles: [`
    /* KARTA MODALA */
    .copy-link{
  font-size:1.875rem;
  background:transparent;
  border:1px solid rgba(255,255,255,.25);
  color:#fff; border-radius:8px; padding:4px 8px; cursor:pointer;
}
.copy-link:hover{ border-color: rgba(255,255,255,.45); }

    .dialog{
      width: min(96vw, 720px);
      max-height: 96vh;
      background: rgba(18,18,22,0.72);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 20px;
      color:#fff; position:relative;
      display:flex; flex-direction:column;
      overflow:hidden;
      padding: 12px 16px 16px;
    }
    .close{
      position:absolute; top:12px; right:12px;
      background:transparent; border:0; color:#bbb;
      font-size:28px; line-height:1; cursor:pointer; z-index:2;
    }
    .dialog-body{
      padding:20px; padding-top:20px;
      overflow:auto; flex:1;
    }
    .hero{
      width:100%; height:auto; border-radius:14px; margin-bottom:12px; margin-top:14px;
      max-height:30vh; object-fit:cover; display:block;
    }
    h2{ margin:0 0 10px; font-size:1.4rem; }
    .qr-caption{ font-size:.95rem; }
    .dialog-actions{
      position:sticky; bottom:0;
      padding:12px 20px;
      background: rgba(18,18,22,.9);
      border-top:1px solid rgba(255,255,255,.08);
      backdrop-filter: blur(6px);
    }
    .info-wrap {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin: 16px 0 22px;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .info-text { flex: 1 1 55%; min-width: 220px; }
    .info-qr { flex: 0 0 auto; text-align: center; }
    .info-qr qrcode { display: block; margin: 0 auto 8px; }
    .qr-caption { font-size: 0.9rem; max-width: 180px; margin: 0 auto; }
    @media (max-width: 600px) {
      .info-wrap { flex-direction: column; align-items: flex-start; }
      .info-qr { margin-top: 12px; text-align: left; }
    }
    /* mały „pill” z pulsującą poświatą */
    .glow-pill{
      display:inline-block; padding:8px 14px; border-radius:12px; text-decoration:none; color:#fff;
      background: rgba(255,255,255,0.04);
      border:1px solid rgba(0, 169, 255, .45);
      box-shadow:
        inset 0 0 12px rgba(0,169,255,.15),
        0 0 0 0 rgba(0,169,255,.45),
        0 6px 18px rgba(0,0,0,.35);
      transition: transform .15s ease;
      animation: pill-glow 2.2s ease-in-out infinite;
    }
    .glow-pill:hover{ transform: translateY(-1px); }
    .glow-pill:focus-visible{
      outline: none;
      box-shadow:
        0 0 0 3px rgba(0,169,255,.35),
        0 6px 18px rgba(0,0,0,.35);
    }
    @keyframes pill-glow{
      0%,100% { box-shadow:
          inset 0 0 12px rgba(0,169,255,.15),
          0 0 0 0 rgba(0,169,255,.45),
          0 6px 18px rgba(0,0,0,.35);
      }
      50% { box-shadow:
          inset 0 0 14px rgba(0,169,255,.22),
          0 0 0 8px rgba(0,169,255,0),
          0 6px 18px rgba(0,0,0,.35);
      }
    }
  `]
})
export class ProductDialogComponent {
  // Sklejone ustawienia z domyślnymi wartościami
  public readonly cfg: Required<ProductDialogOptions>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProductDialogData,
    private ref: MatDialogRef<ProductDialogComponent>,
    private router: Router
  ) {
    this.cfg = {
      showImage: data.showImage ?? true,
      showOpenLinkButton: data.showOpenLinkButton ?? true,
      showDetailsButton: data.showDetailsButton ?? true,
      showQr: data.showQr ?? true,
      showCloseButton: data.showCloseButton ?? true,
    };
  }


close(reason: 'x' | 'cancel' = 'cancel') {
  this.ref.close(reason);
}

copyDeepLink() {
  if (!this.data.deepLink) return;
  navigator.clipboard?.writeText(this.data.deepLink).catch(() => {});
}

goToDetails(ev?: Event) {
  ev?.preventDefault();
  ev?.stopPropagation();

  const slug = this.data.slug;

  // 1) zamknij z powodem, żeby rodzic wiedział „nie sprzątać”
  this.ref.close('details');

  // 2) nawiguj absolutnie (bez setTimeout)
  this.router.navigate(['/products', slug]);
}




}
