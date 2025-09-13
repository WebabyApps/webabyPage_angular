// src/app/shared/products-carousel/products-carousel.component.ts
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

type CardProduct = {
  id: string;        // klucz i18n (np. "abcLand")
  slug: string;      // stabilny slug do routów (np. "abc-land")
  img: string;
  appUrl?: string;
  detailsUrl?: string;
};


@Component({
  selector: 'app-products-carousel',
  standalone: true,
  templateUrl: './products-carousel.component.html',
  styleUrls: ['./products-carousel.component.scss'],
  imports: [CommonModule, MatDialogModule, TranslocoModule] // ← dodany TranslocoModule
})
export class ProductsCarouselComponent implements AfterViewInit {
  @ViewChild('track', { static: false }) trackRef!: ElementRef<HTMLDivElement>;

  products: CardProduct[] = [
    { id: 'bubbleWord',       slug: 'bubble-word',                   img: 'assets/bubble.jpg',        appUrl: 'https://webaby.io/details/bubble-word' },
    { id: 'basketballShots',  slug: 'basketball-shots',              img: 'assets/basket.jpg',        appUrl: 'https://lucky-draw.webaby.io' },
    { id: 'equationsTrainer', slug: 'system-of-equations-trainer',   img: 'assets/equations.jpg',     appUrl: 'https://lucky-draw.webaby.io' },
    { id: 'abcLand',          slug: 'abc-land',                      img: 'assets/scene1.jpg',        appUrl: 'https://play.google.com/store/apps/details?id=abecadlowo.webaby.io' },
    { id: 'luckyDraw',        slug: 'lucky-draw',                    img: 'assets/lucky_draw.png',    appUrl: 'https://lucky-draw.webaby.io' },
    { id: 'bibbleEcho',       slug: 'bibble-echo',                   img: 'assets/bibble_echo2.jpeg', appUrl: 'https://bibbleecho.webaby.io/' }
  ];
  
  constructor(private dialog: MatDialog, private transloco: TranslocoService) {}

  openDialog(p: CardProduct) {
    const base = `home.products.${p.id}`;
    this.dialog.open(ProductDialogComponent, {
      panelClass: 'transparent-dialog',
      width: '800px',
      autoFocus: true,
      data: {
        title: this.transloco.translate(`${base}.title`),
        imageUrl: p.img,
        appUrl: p.appUrl,
        slug: p.slug,                                // ✅ używaj stabilnego sluga
        desc: this.transloco.translate(`${base}.desc`)
      },
      maxWidth: '90vw'
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
}
