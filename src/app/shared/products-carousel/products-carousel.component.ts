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

  // ✅ LOOP: lista z klonami (opcja A)
  loopProducts: CardProduct[] = [];
  private readonly clones = 3; // ustaw tutaj: 1–3 (3 jest “najbezpieczniejsze”)
  private isTeleporting = false;

  // dialog / url logic
  private dialogRef: MatDialogRef<ProductDialogComponent> | null = null;
  private openingFromUrl = false;
  private isClosing = false;
  private openingNow = false;

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

  // =========================
  // INIT / DESTROY
  // =========================
  async ngOnInit() {
    this.buildLoopProducts();

    // reaguj na ?product=slug
    this.qpSub = this.route.queryParamMap.subscribe(async (pm) => {
      const slug = pm.get('product');

      if (!slug) {
        if (this.dialog.openDialogs.length > 0 || this.dialogRef) {
          this.isClosing = true;
          this.dialog.closeAll();
          await firstValueFrom(this.dialog.afterAllClosed.pipe(take(1)));
          this.dialogRef = null;
        }
        return;
      }

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

      // ✅ ustaw start scrolla na “prawdziwe” karty (omijamy klony z przodu)
      queueMicrotask(() => this.jumpToRealStart());
    }
  }

  ngOnDestroy() {
    this.stopAutoplay();
    this.stopHover();
    this.qpSub?.unsubscribe();

    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);

    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  // =========================
  // LOOP BUILD
  // =========================
  private buildLoopProducts() {
    const n = this.products.length;
    if (!n) {
      this.loopProducts = [];
      return;
    }
    const k = Math.min(this.clones, n);
    const head = this.products.slice(0, k);
    const tail = this.products.slice(n - k);
    this.loopProducts = [...tail, ...this.products, ...head];
  }

  trackByLoop = (i: number, p: CardProduct) => `${p.slug}__${i}`;

  private jumpToRealStart() {
    const t = this.trackRef?.nativeElement;
    if (!t) return;
    const step = this.cardWidth();
    const n = this.products.length;
    const k = Math.min(this.clones, n);
    t.scrollLeft = step * k;
  }

  private maybeLoopTeleport() {
    if (this.isTeleporting) return;
  
    const t = this.trackRef?.nativeElement;
    if (!t) return;
  
    const step = this.cardWidth();
    const n = this.products.length;
    if (!n || !step) return;
  
    const k = Math.min(this.clones, n);
  
    const startReal = step * k;      // początek prawdziwych kart
    const realLen   = step * n;      // długość “prawdziwego” segmentu
    const endReal   = startReal + realLen;
  
    // mały margines żeby nie teleportować “w połowie snapa”
    const margin = step * 0.7;
  
    // Jesteśmy w lewych klonach -> przesuń o +realLen (zachowaj offset)
    if (t.scrollLeft < startReal - margin) {
      this.isTeleporting = true;
  
      // WYŁĄCZ smooth na moment, żeby teleport był natychmiastowy
      const prev = t.style.scrollBehavior;
      t.style.scrollBehavior = 'auto';
  
      t.scrollLeft = t.scrollLeft + realLen;
  
      // wyczyść ewentualny snap, żeby nie “dobijał” po teleport
      if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);
  
      queueMicrotask(() => {
        t.style.scrollBehavior = prev || '';
        this.isTeleporting = false;
      });
      return;
    }
  
    // Jesteśmy w prawych klonach -> przesuń o -realLen (zachowaj offset)
    if (t.scrollLeft > endReal + margin) {
      this.isTeleporting = true;
  
      const prev = t.style.scrollBehavior;
      t.style.scrollBehavior = 'auto';
  
      t.scrollLeft = t.scrollLeft - realLen;
  
      if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);
  
      queueMicrotask(() => {
        t.style.scrollBehavior = prev || '';
        this.isTeleporting = false;
      });
    }
  }
  

  // =========================
  // NATIVE MOBILE SWIPE HELPERS
  // =========================
  private scrollEndTimer: any = null;
  private isUserInteracting = false;

  onTouchStart() {
    this.isUserInteracting = true;
    this.stopAutoplay();
    this.stopHover();
  }

  onTouchEnd() {
    this.isUserInteracting = false;
    this.scheduleSnapAfterScroll();
    this.startAutoplay();
  }

  onTrackScroll() {
    this.maybeLoopTeleport();
  
    if (!this.isUserInteracting && !this.isTeleporting) {
      this.scheduleSnapAfterScroll();
    }
  }
  

  private scheduleSnapAfterScroll() {
    if (this.scrollEndTimer) clearTimeout(this.scrollEndTimer);
    this.scrollEndTimer = setTimeout(() => {
      this.snapToNearestCard();
    }, 120);
  }

  private snapToNearestCard() {
    const t = this.trackRef?.nativeElement;
    if (!t) return;

    const step = this.cardWidth();
    const n = this.products.length;
    if (!step || !n) return;

    const k = Math.min(this.clones, n);
    const startReal = step * k;

    const rel = t.scrollLeft - startReal;
    const idx = Math.round(rel / step);
    const target = startReal + idx * step;

    t.scrollTo({ left: target, behavior: 'smooth' });
    queueMicrotask(() => this.nudge());
  }

  // =========================
  // DIALOG LOGIC (Twoje, bez zmian sensu)
  // =========================
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

    this.location.replaceState(cleaned);
  }

  async openDialog(p: CardProduct, pushUrl: boolean = true) {
    if (this.openingNow) return;
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

  // =========================
  // AUTOPLAY / ARROWS
  // =========================
  private autoplayId: any = null;
  private hoverId: any = null;

  private track(): HTMLDivElement {
    const el = this.trackRef?.nativeElement;
    if (!el) throw new Error('Track element not ready yet');
    return el;
  }

  private gap() {
    return 18;
  }

  private cardWidth() {
    const c = this.track().querySelector('.card') as HTMLElement | null;
    return (c?.getBoundingClientRect().width ?? 320) + this.gap();
  }

  private move(px: number) {
    const t = this.track();
    t.scrollLeft += px;
    // ✅ loop ogarnia maybeLoopTeleport() wywoływane w onTrackScroll()
  }

  private easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  private easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  private animateBy(delta: number, dur = 420, ease = (t: number) => t) {
    const t = this.track();
    const startX = t.scrollLeft;
    const s = performance.now();
    return new Promise<void>((res) => {
      const f = (n: number) => {
        const k = Math.min(1, (n - s) / dur);
        t.scrollLeft = startX + delta * ease(k);
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
    // wymusza reflow/teleport check przez scroll eventy; bezpieczny “tick”
    this.move(0);
  }
}
