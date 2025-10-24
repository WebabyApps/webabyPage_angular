import { AfterViewInit, Component, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { PRODUCTS } from '../models/producs.data';



type CardProduct = {
  id: string;  // i18n key
  slug: string;
  img: string;
  appUrl?: string;
  detailsUrl?: string;
};

@Component({
  selector: 'app-products-carousel',
  standalone: true,
  templateUrl: './products-carousel.component.html',
  styleUrls: ['./products-carousel.component.scss'],
  imports: [CommonModule, MatDialogModule, TranslocoModule]
})
export class ProductsCarouselComponent implements AfterViewInit {
  @ViewChild('track', { static: false }) trackRef!: ElementRef<HTMLDivElement>;

 products: CardProduct[] = PRODUCTS;   // ✅
  // NEW: trzymamy referencję do aktualnie otwartego dialogu
  private dialogRef: MatDialogRef<ProductDialogComponent> | null = null;
  // NEW: prosta flaga anty-pętla (gdy otwieramy dialog na zmianę parametru i odwrotnie)
  private openingFromUrl = false;

  constructor(
    private dialog: MatDialog,
    private transloco: TranslocoService,
    private route: ActivatedRoute,            // NEW
    private router: Router,                   // NEW
    @Inject(PLATFORM_ID) private platformId: Object // NEW (dla SSR-safe absolutnego URL)
  ) {}

  private async ensureTranslationsReady(scope?: string) {
  // Jeśli używasz kluczy globalnych typu "home.products...", wystarczy bez scope:
  await firstValueFrom(this.transloco.selectTranslation(scope));
}
  ngOnInit() {
    // NEW: reaguj na query param ?product=slug
    this.route.queryParamMap.subscribe(pm => {
      const slug = pm.get('product');
      if (!slug) {
        // jeśli nie ma parametru, a dialog jest otwarty -> zamknij
        if (this.dialogRef) {
          this.dialogRef.close();
          this.dialogRef = null;
        }
        return;
      }
      // jeśli jest parametr i dialog nie jest już otwarty / jest dla innego sluga -> otwórz
      const prod = this.products.find(p => p.slug === slug);
      if (prod && !this.dialogRef && !this.openingFromUrl) {
        this.openingFromUrl = true;
        this.openDialog(prod, /*pushUrl*/ false); // nie pushuj jeszcze raz URL
        this.openingFromUrl = false;
      }
    });

    // NEW: jeśli user kliknie "wstecz" i router zmieni URL bez `product`, subskrypcja powyżej zamknie dialog.
    // (Dodatkowy filtr NavigationEnd tylko po to, by niepotrzebnie nie dotykać autoplay)
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {});
  }

 
async openDialog(p: CardProduct, pushUrl: boolean = true) {
  const base = `home.products.${p.id}`;

  if (pushUrl) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { product: p.slug },
      queryParamsHandling: 'merge',
      replaceUrl: false
    });
  }

  // ⬇️ KLUCZOWE: poczekaj aż translacje się wczytają
  await this.ensureTranslationsReady(/* 'home' jeśli używasz scope */);

    this.dialogRef = this.dialog.open(ProductDialogComponent, {
  panelClass: ['wb-product-dialog', 'transparent-dialog'],
  width: '720px',
  maxWidth: '96vw',
  maxHeight: '96vh',
  autoFocus: false,
  restoreFocus: true,
  closeOnNavigation: true, // ⬅️ ważne
  data: {
    title: this.transloco.translate(`${base}.title`),
    imageUrl: p.img,
    appUrl: p.appUrl,
    slug: p.slug,
    desc: this.transloco.translate(`${base}.desc`),
    deepLink: this.buildDeepLink(p.slug)
  } as any
});

this.dialogRef.afterClosed().subscribe((reason) => {
  this.dialogRef = null;

  // Poczekaj 1 tick, żeby ewentualna nawigacja do /products/:slug się „zmaterializowała”
  setTimeout(() => {
    const urlNow = this.router.url;

    // 1) Jeśli JESTEŚMY już na /products/..., to nic nie czyść – wygrała nawigacja do tutorialu.
    if (urlNow.startsWith('/products/')) return;

    // 2) Sprzątaj tylko, jeśli powód nie był 'details' ORAZ faktycznie jest ?product w URL
    const hasProductQP = this.route.snapshot.queryParamMap.has('product');
    if (reason !== 'details' && hasProductQP) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { product: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }, 0);
});



   
  }

  // --- autoplay / carousel logic (bez zmian) ---
  private autoplayId:any=null; private hoverId:any=null;

  ngAfterViewInit() {
    this.startAutoplay();
    window.addEventListener('resize', () => this.nudge());
  }

  private track(): HTMLDivElement {
    const el = this.trackRef?.nativeElement;
    if (!el) throw new Error('Track element not ready yet');
    return el;
  }
  private cardWidth() {
    const c = this.track().querySelector('.card') as HTMLElement | null;
    return (c?.getBoundingClientRect().width ?? 320) + this.gap();
  }
  private gap(){ return 18; }
  private move(px:number){ const t=this.track(); t.scrollLeft+=px; const max=t.scrollWidth-t.clientWidth; if(t.scrollLeft<=0)t.scrollLeft=max-2; else if(t.scrollLeft>=max-1) t.scrollLeft=1; }
  private easeOutCubic=(t:number)=>1-Math.pow(1-t,3);
  private easeInOutCubic=(t:number)=> t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  private animateBy(delta:number,dur=420,ease=(t:number)=>t){ const t=this.track(); const startX=t.scrollLeft; const max=t.scrollWidth-t.clientWidth; const s=performance.now(); return new Promise<void>(res=>{ const f=(n:number)=>{ const k=Math.min(1,(n-s)/dur); const x=startX+delta*ease(k); t.scrollLeft=Math.max(0,Math.min(max,x)); if(k<1) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); }
  async spring(dir:number){ this.stopAutoplay(); this.stopHover(); const d=this.cardWidth()*dir; const over=d*0.14; await this.animateBy(d+over,340,this.easeOutCubic); await this.animateBy(-over,180,this.easeInOutCubic); this.startAutoplay(); }
  private startAutoplay(){ this.stopAutoplay(); this.autoplayId=setInterval(()=>this.move(this.cardWidth()),4000); }
  private stopAutoplay(){ if(this.autoplayId){clearInterval(this.autoplayId); this.autoplayId=null;} }
  hover(dir:number){ this.stopHover(); this.hoverId=setInterval(()=>this.move(dir*4),16); this.stopAutoplay(); }
  stopHover(){ if(this.hoverId){clearInterval(this.hoverId); this.hoverId=null;} this.startAutoplay(); }
  private nudge(){ this.move(0); }

  // NEW: helper do zbudowania absolutnego linku (SSR-safe)
  private buildDeepLink(slug: string): string {
    // /?product=slug (zachowuje inne query paramy)
    if (isPlatformBrowser(this.platformId)) {
      const url = new URL(window.location.href);
      url.searchParams.set('product', slug);
      return url.toString();
    }
    // fallback podczas prerenderu/SSR – względny
    return this.router
      .createUrlTree([], { relativeTo: this.route, queryParams: { product: slug }, queryParamsHandling: 'merge' })
      .toString();
  }
}
