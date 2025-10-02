import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroSplashService } from './intro-splash.service';

// ===== Config you can tweak =====
const MIN_SHOW_MS = 1800;           // minimalny czas widoczności overlaya (ms)
const AUTO_DISMISS_AFTER = 2600;    // auto-hide po tej liczbie ms (jeśli chcesz "poczekać")
const DISMISS_ON_SCROLL = false;    // jeżeli krótko miga, wyłącz chowanie po scrollu

@Component({
  selector: 'app-intro-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-splash.component.html',
  styleUrls: ['./intro-splash.component.scss']
})
export class IntroSplashComponent implements OnDestroy {
  private svc = inject(IntroSplashService);

  // signals
  visible = signal(false);
  playing = signal(false);

  private startedAt = 0; // timestamp startu animacji
  private autoTimer: any;
  private force = false;

  private keydownHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.dismiss(true);
  };
  private scrollHandler = () => {
    if (!this.visible()) return;
    this.dismiss();
    window.removeEventListener('scroll', this.scrollHandler as any, { capture: true } as any);
  };

  constructor() {
    const url = new URL(window.location.href);
    this.force = url.searchParams.get('intro') === '1';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const willShow = (this.force || !this.svc.alreadySeen()) && !reduce;

    if (willShow) {
      // Ukryj stronę i przygotuj intro
      document.documentElement.classList.add('intro-active');

      this.visible.set(true);
      requestAnimationFrame(() => {
        this.startedAt = performance.now();
        this.playing.set(true);

        if (AUTO_DISMISS_AFTER > 0) {
          const wait = Math.max(AUTO_DISMISS_AFTER, MIN_SHOW_MS);
          this.autoTimer = setTimeout(() => this.dismiss(), wait);
        }
      });

      // Listenery tylko gdy intro jest aktywne
      window.addEventListener('keydown', this.keydownHandler);
      if (DISMISS_ON_SCROLL) {
        setTimeout(() => {
          window.addEventListener('scroll', this.scrollHandler, { passive: true, capture: true });
        }, 600);
      }

      // (opcjonalnie) Canvas particles – działa tylko, gdy intro widoczne
      const c = document.getElementById('introCanvas') as HTMLCanvasElement | null;
      const ctx = c?.getContext('2d');
      if (!reduce && c && ctx) {
        const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        let w = 0, h = 0; let raf = 0;
        const P = 80; // particles
        const pts: {x:number,y:number,vx:number,vy:number}[] = [];

        const resize = () => {
          w = c.clientWidth; h = c.clientHeight;
          c.width = w * DPR; c.height = h * DPR;
          ctx.setTransform(DPR,0,0,DPR,0,0);
        };
        const rnd = (a:number,b:number)=>a+Math.random()*(b-a);
        const reset = () => {
          pts.length = 0;
          for (let i=0;i<P;i++) pts.push({x:rnd(0,w), y:rnd(0,h), vx:rnd(-.2,.2), vy:rnd(-.2,.2)});
        };
        const step = () => {
          ctx.clearRect(0,0,w,h);
          ctx.globalAlpha = .9;
          for (const p of pts){
            p.x += p.vx; p.y += p.vy;
            if (p.x<0||p.x>w) p.vx*=-1; if (p.y<0||p.y>h) p.vy*=-1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, Math.PI*2); ctx.fillStyle = '#9aa7ff'; ctx.fill();
          }
          ctx.globalAlpha = .08; ctx.strokeStyle = '#a78bfa';
          for (let i=0;i<P;i++) for (let j=i+1;j<P;j++){
            const a=pts[i], b=pts[j]; const dx=a.x-b.x, dy=a.y-b.y; const d=dx*dx+dy*dy;
            if (d<110**2){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
          }
          raf = requestAnimationFrame(step);
        };

        const init = () => { resize(); reset(); cancelAnimationFrame(raf); step(); };
        new ResizeObserver(init).observe(c);

        // stop when splash hides
        const mo = new MutationObserver(()=>{ if (!document.body.contains(c)) cancelAnimationFrame(raf); });
        mo.observe(document.body, { childList: true, subtree: true });
      }

    } else {
      // NIC nie pokazujemy → upewnij się, że strona jest widoczna
      this.visible.set(false);
      this.playing.set(false);
      document.documentElement.classList.remove('intro-active', 'intro-lift');
    }
  }

  onAnimationEnd(){
    // Zachowaj MIN_SHOW_MS zanim schowasz overlay
    const elapsed = performance.now() - this.startedAt;
    const left = Math.max(0, MIN_SHOW_MS - elapsed);
    if (left === 0) {
      this.dismiss();
    } else {
      this.autoTimer = setTimeout(() => this.dismiss(), left);
    }
  }

  dismiss(userInitiated = false){
    if (!this.visible()) return;

    if (this.autoTimer) { clearTimeout(this.autoTimer); this.autoTimer = null; }
    this.playing.set(false);

    // Start wjazdu strony (globalny CSS robi resztę)
    document.documentElement.classList.add('intro-lift');

    // Dopasuj do czasu fade-out intro (np. 700ms)
    setTimeout(() => {
      this.visible.set(false);
      // Strona ma być już widoczna – zdejmij blokadę
      document.documentElement.classList.remove('intro-active');

      // Sprzątanie 'lift' po klatce, by nie blokować kolejnych wejść
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('intro-lift');
      });

      // Oznacz „widziane” tylko jeśli nie wymuszone przez ?intro=1
      if (!this.force) this.svc.markSeen();

      // zdejmij listenery (jeśli były dodane)
      window.removeEventListener('keydown', this.keydownHandler);
      if (DISMISS_ON_SCROLL){
        window.removeEventListener('scroll', this.scrollHandler as any, { capture: true } as any);
      }
    }, 700);
  }

  ngOnDestroy(): void {
    // Safety cleanup
    window.removeEventListener('keydown', this.keydownHandler);
    if (DISMISS_ON_SCROLL){
      window.removeEventListener('scroll', this.scrollHandler as any, { capture: true } as any);
    }
    if (this.autoTimer){ clearTimeout(this.autoTimer); }
  }
}
