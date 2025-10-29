import {
  AfterViewInit,
  OnInit,
  OnDestroy,
  Component,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { PRODUCTS } from '../models/producs.data';
import { Location } from '@angular/common';

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
  imports: [CommonModule, MatDialogModule, TranslocoModule],
})
export class ProductsCarouselComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('track', { static: false }) trackRef!: ElementRef<HTMLDivElement>;

  products: CardProduct[] = PRODUCTS;

  private dialogRef: MatDialogRef<ProductDialogComponent> | null = null;
  private openingFromUrl = false;
  private isClosing = false;
  private openingNow = false;            // ⬅️ blokada reentrancji

  private qpSub?: Subscription;
  private resizeHandler = () => this.nudge();

  constructor(
    private dialog: MatDialog,
    private transloco: TranslocoService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private location: Location
  ) {}

  async ngOnInit() {
    // reaguj na ?product=slug
    this.qpSub = this.route.queryParamMap.subscribe(async (pm) => {
      const slug = pm.get('product');

      if (!slug) {
        // brak paramu → zamknij jeśli coś otwarte (bez grzebania w URL tutaj)
        if (this.dialog.openDialogs.length > 0 || this.dialogRef) {
          this.isClosing = true;
          this.dialog.closeAll();
          await firstValueFrom(this.dialog.afterAllClosed.pipe(take(1)));
          this.dialogRef = null;
          // zdejmie się w afterClosed / mikro-tickach
        }
        return;
      }

      // nie otwieraj jeśli w trakcie zamykania/otwierania lub coś już jest
      if (this.isClosing || this.openingNow || this.dialog.openDialogs.length > 0 || this.dialogRef) return;

      const prod = this.products.find((p) => p.slug === slug);
      if (prod && !this.openingFromUrl) {
        this.openingFromUrl = true;
        await this.openDialog(prod, /*pushUrl*/ false);
        this.openingFromUrl = false;
      }
    });
  }

  ngAfterViewInit() {
    this.startAutoplay();
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
    this.stopHover();
    this.qpSub?.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private async ensureTranslationsReady(scope?: string) {
    await firstValueFrom(this.transloco.selectTranslation(scope));
  }

  private clearProductQueryWithoutNav() {
    const tree = this.router.parseUrl(this.router.url);
    if (!tree.queryParams || !('product' in tree.queryParams)) return;

    const { product, ...rest } = tree.queryParams;
    tree.queryParams = rest;

    const cleaned = this.router
      .serializeUrl(tree)
      .replace(/[?&]$/g, '')
      .replace(/\?&/, '?');

    this.location.replaceState(cleaned); // bez nawigacji i bez eventów routera
  }

 async openDialog(p: CardProduct, pushUrl: boolean = true) {
  if (this.openingNow) return; // ⬅️ blokada reentrancji
  this.openingNow = true;

  try {
    const base = `home.products.${p.id}`;

    if (pushUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { product: p.slug },
        queryParamsHandling: 'merge',
        replaceUrl: false,
      });
    }

    // SINGLE-INSTANCE: domknij wszystko zanim otworzysz
    if (this.dialog.openDialogs.length > 0) {
      this.isClosing = true;
      this.dialog.closeAll();
      await firstValueFrom(this.dialog.afterAllClosed.pipe(take(1)));
      this.isClosing = false;
      this.dialogRef = null;
    }

    await this.ensureTranslationsReady();

    this.dialogRef = this.dialog.open(ProductDialogComponent, {
      panelClass: ['wb-product-dialog', 'transparent-dialog'],
      width: '720px',
      maxWidth: '96vw',
      maxHeight: '96vh',
      autoFocus: true,
      restoreFocus: false,
      closeOnNavigation: true,
      disableClose: true,
      data: {
        title: this.transloco.translate(`${base}.title`),
        imageUrl: p.img,
        appUrl: p.appUrl,
        slug: p.slug,
        desc: this.transloco.translate(`${base}.desc`),
        deepLink: this.buildDeepLink(p.slug),
      } as any,
    });

    this.dialogRef.afterClosed().subscribe((reason) => {
      this.dialogRef = null;
      this.isClosing = true;

      if (isPlatformBrowser(this.platformId)) {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }

      if (
        reason !== 'details' &&
        !this.router.url.startsWith('/products/') &&
        this.route.snapshot.queryParamMap.has('product')
      ) {
        queueMicrotask(() => this.clearProductQueryWithoutNav());
      }

      queueMicrotask(() => {
        this.isClosing = false;
        this.openingNow = false;
      });
    });
  } catch (error) {
    console.error('openDialog failed:', error);
    this.openingNow = false;
    this.isClosing = false;
  }
}


  // --- autoplay / carousel logic (bez zmian) ---
  private autoplayId: any = null;
  private hoverId: any = null;

  private track(): HTMLDivElement {
    const el = this.trackRef?.nativeElement;
    if (!el) throw new Error('Track element not ready yet');
    return el;
  }
  private cardWidth() {
    const c = this.track().querySelector('.card') as HTMLElement | null;
    return (c?.getBoundingClientRect().width ?? 320) + this.gap();
  }
  private gap() {
    return 18;
  }
  private move(px: number) {
    const t = this.track();
    t.scrollLeft += px;
    const max = t.scrollWidth - t.clientWidth;
    if (t.scrollLeft <= 0) t.scrollLeft = max - 2;
    else if (t.scrollLeft >= max - 1) t.scrollLeft = 1;
  }
  private easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  private easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  private animateBy(delta: number, dur = 420, ease = (t: number) => t) {
    const t = this.track();
    const startX = t.scrollLeft;
    const max = t.scrollWidth - t.clientWidth;
    const s = performance.now();
    return new Promise<void>((res) => {
      const f = (n: number) => {
        const k = Math.min(1, (n - s) / dur);
        const x = startX + delta * ease(k);
        t.scrollLeft = Math.max(0, Math.min(max, x));
        if (k < 1) requestAnimationFrame(f);
        else res();
      };
      requestAnimationFrame(f);
    });
  }
  async spring(dir: number) {
    this.stopAutoplay();
    this.stopHover();
    const d = this.cardWidth() * dir;
    const over = d * 0.14;
    await this.animateBy(d + over, 340, this.easeOutCubic);
    await this.animateBy(-over, 180, this.easeInOutCubic);
    this.startAutoplay();
  }
  private startAutoplay() {
    this.stopAutoplay();
    this.autoplayId = setInterval(() => this.move(this.cardWidth()), 4000);
  }
  private stopAutoplay() {
    if (this.autoplayId) {
      clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }
  hover(dir: number) {
    this.stopHover();
    this.hoverId = setInterval(() => this.move(dir * 4), 16);
    this.stopAutoplay();
  }
  stopHover() {
    if (this.hoverId) {
      clearInterval(this.hoverId);
      this.hoverId = null;
    }
    this.startAutoplay();
  }
  private nudge() {
    this.move(0);
  }

  // helper do zbudowania absolutnego linku (SSR-safe)
  private buildDeepLink(slug: string): string {
    if (isPlatformBrowser(this.platformId)) {
      const url = new URL(window.location.href);
      url.searchParams.set('product', slug);
      return url.toString();
    }
    return this.router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: { product: slug },
        queryParamsHandling: 'merge',
      })
      .toString();
  }
}
