// src/app/shared/product-dialog/product-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { QRCodeComponent } from 'angularx-qrcode';
import { TranslocoModule } from '@jsverse/transloco';

export type Product = {
  title: string;
  imageUrl: string;
  appUrl?: string;
  slug: string;
  desc?: string;
};

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, QRCodeComponent, TranslocoModule],
  template: `
    <div class="dialog">
      <button class="close"
              type="button"
              [attr.aria-label]="'home.products.dialog.close' | transloco"
              (click)="close()">×</button>

      <!-- przewijalna część środka -->
      <div class="dialog-body">
        <img class="hero" [src]="data.imageUrl" [attr.alt]="data.title" />

     <div class="info-wrap">
  <div class="info-text">
    <h2>{{ data.title }}</h2>
    <p *ngIf="data.desc">{{ data.desc }}</p>
   <a class="glow-pill" [href]="data.appUrl" target="_blank" rel="noopener">
  {{ 'home.products.dialog.openLink' | transloco }}
</a>
  </div>

  <div class="info-qr" *ngIf="data.appUrl">
    <qrcode [qrdata]="data.appUrl" [width]="140" [errorCorrectionLevel]="'M'"></qrcode>
    <div class="qr-caption">
     <!-- <a [href]="data.appUrl" target="_blank" rel="noopener">
        {{ 'home.products.dialog.openLink' | transloco }}
      </a>-->
      <p>{{ 'home.products.dialog.qrInstruction' | transloco }}</p> 
    </div>
  </div>
</div>
      </div>

      <!-- zawsze widoczny footer -->
      <div class="dialog-actions">
        <button mat-raised-button color="primary" class="glow-btn" (click)="goToDetails()">
          {{ 'home.products.dialog.detailsCta' | transloco }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* KARTA MODALA */
    .dialog{
      width: min(96vw, 720px);
      max-height: 96vh;               /* ⬅️ kluczowe */
      background: rgba(18,18,22,0.72);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 20px;
      color:#fff; position:relative;
      display:flex; flex-direction:column;   /* ⬅️ kolumny */
      overflow:hidden;                       /* ⬅️ odetnij nadmiar */
      padding: 12px 16px 16px; /* ⬅️ było np. 20px – zmniejszyłem */
    }

    .close{
      position:absolute; top:12px; right:12px;
      background:transparent; border:0; color:#bbb;
      font-size:28px; line-height:1; cursor:pointer; z-index:2;
    }

    /* PRZEWIJALNE WNĘTRZE */
    .dialog-body{
      padding:20px; padding-top:20px; /* miejsce na X */
      overflow:auto;                   /* ⬅️ scroll tylko w środku */
      flex:1;                          /* ⬅️ wypełnia dostępne miejsce */
    }

    .hero{
      width:100%; height:auto; border-radius:14px; margin-bottom:12px;margin-top:14px
      max-height:30vh; object-fit:cover;       /* ⬅️ obraz nie "zjada" miejsca */
      display:block;
    }

    h2{ margin:0 0 10px; font-size:1.4rem; }
    .qr-wrap{ display:flex; align-items:center; gap:16px; margin:12px 0 22px; flex-wrap:wrap; }
    .qr-caption{ font-size:.95rem; }
    button[mat-raised-button]{ align-self:flex-start; }

    /* "Przyklejony" footer z przyciskiem */
    .dialog-actions{
      position:sticky; bottom:0;        /* ⬅️ zawsze widoczny */
      padding:12px 20px;
      background: rgba(18,18,22,.9);
      border-top:1px solid rgba(255,255,255,.08);
      backdrop-filter: blur(6px);
    }

    @media (max-width:480px){
      .qr-wrap{ flex-direction:column; align-items:flex-start; }
    }
      .info-wrap {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 16px 0 22px;
  align-items: flex-start;
  flex-wrap: wrap; /* ⬅️ fallback na małych ekranach */
}

.info-text {
  flex: 1 1 55%;   /* opis zajmuje ~połowę */
  min-width: 220px;
}

.info-qr {
  flex: 0 0 auto;
  text-align: center;
}

.info-qr qrcode {
  display: block;
  margin: 0 auto 8px;
}

.qr-caption {
  font-size: 0.9rem;
  max-width: 180px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .info-wrap {
    flex-direction: column;
    align-items: flex-start;
  }
  .info-qr {
    margin-top: 12px;
    text-align: left;
  }
}
  /* mały „pill” z pulsującą poświatą */
.glow-pill{
  display:inline-block;
  padding:8px 14px;
  border-radius:12px;
  text-decoration:none;
  color:#fff;
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

/* puls */
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
