import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IntroSplashService } from './intro-splash.service';

const MIN_SHOW_MS = 1800;        // minimalny czas pokazania overlaya
const AUTO_DISMISS_AFTER = 2600; // auto-hide (>= MIN_SHOW_MS). Ustaw 0 aby wyłączyć.
const DISMISS_ON_SCROLL = false; // chowanie po pierwszym scrollu — zwykle off

// URL-e uznawane za "stronę główną"
const HOME_URLS = ['/', '/home'];

@Component({
  selector: 'app-intro-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-splash.component.html',
  styleUrls: ['./intro-splash.component.scss']
})
export class IntroSplashComponent {
  private svc = inject(IntroSplashService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  visible = signal(false);
  playing = signal(false);

  private startedAt = 0;
  private autoTimer: any = null;
  private force = false;
  private endedOnce = false;

  constructor() {
    // 1) Czy to home?
    const current = this.router.url.split('?')[0] || '/';
    const isHome = HOME_URLS.includes(current);

    // 2) Force przez query param
    const url = new URL(window.location.href);
    this.force = url.searchParams.get('intro') === '1';

    // 3) Respect reduced motion
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 4) Warunek pokazania
    const shouldShow = (isHome || this.force) && !reduce && !this.svc.alreadySeen();

    if (shouldShow) {
      document.documentElement.classList.add('intro-active');
      this.visible.set(true);

      // Start animacji po następnym frame
      requestAnimationFrame(() => {
        this.startedAt = performance.now();
        this.playing.set(true);

        if (AUTO_DISMISS_AFTER > 0) {
          const wait = Math.max(AUTO_DISMISS_AFTER, MIN_SHOW_MS);
          this.autoTimer = setTimeout(() => this.dismiss(), wait);
        }
      });
    }

    // ESC -> zamknij
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') this.dismiss(true); };
    window.addEventListener('keydown', onKey);

    // Scroll -> opcjonalnie zamknij
    if (DISMISS_ON_SCROLL) {
      const onScroll = () => { if (this.visible()) this.dismiss(); };
      setTimeout(() => window.addEventListener('scroll', onScroll, { passive: true, capture: true }), 600);
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll as any, { capture: true } as any));
    }

    // cleanup
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', onKey);
      if (this.autoTimer) clearTimeout(this.autoTimer);
      document.documentElement.classList.remove('intro-active', 'intro-lift');
    });

    // --- (opcjonalne) cząsteczki canvas — zostawiam hook:
    // this.initParticlesIfPresent();
  }

  // Jeżeli używasz (masz <canvas id="introCanvas">), odkomentuj wywołanie w ctor
  private initParticlesIfPresent() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const c = document.getElementById('introCanvas') as HTMLCanvasElement | null;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = 0, h = 0; let raf = 0;
    const P = 80;
    const pts: {x:number,y:number,vx:number,vy:number}[] = [];
    const rnd = (a:number,b:number)=>a+Math.random()*(b-a);

    const resize = () => { w = c.clientWidth; h = c.clientHeight; c.width = w*DPR; c.height = h*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); };
    const reset = () => { pts.length = 0; for (let i=0;i<P;i++) pts.push({x:rnd(0,w), y:rnd(0,h), vx:rnd(-.2,.2), vy:rnd(-.2,.2)}); };
    const step = () => {
      ctx.clearRect(0,0,w,h);
      ctx.globalAlpha = .9;
      for (const p of pts){ p.x+=p.vx; p.y+=p.vy; if (p.x<0||p.x>w) p.vx*=-1; if (p.y<0||p.y>h) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,1.3,0,Math.PI*2); ctx.fillStyle='#9aa7ff'; ctx.fill();
      }
      ctx.globalAlpha = .08; ctx.strokeStyle = '#a78bfa';
      for (let i=0;i<P;i++) for (let j=i+1;j<P;j++){
        const a=pts[i], b=pts[j], dx=a.x-b.x, dy=a.y-b.y, d=dx*dx+dy*dy;
        if (d<110**2){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
      }
      raf = requestAnimationFrame(step);
    };

    const init = () => { resize(); reset(); cancelAnimationFrame(raf); step(); };
    new ResizeObserver(init).observe(c);

    const mo = new MutationObserver(()=>{ if (!document.body.contains(c)) cancelAnimationFrame(raf); });
    mo.observe(document.body, { childList: true, subtree: true });

    this.destroyRef.onDestroy(() => cancelAnimationFrame(raf));
  }

  /** Handler powiązany w HTML: (animationend)="onAnimationEnd($event)" */
  onAnimationEnd(e?: AnimationEvent){
    // Ten event strzela z wielu elementów — reagujemy tylko na koniec 'liftUp' na root .intro
    if (!e || e.animationName !== 'liftUp') return;
    if (this.endedOnce) return;
    this.endedOnce = true;

    const elapsed = performance.now() - this.startedAt;
    const left = Math.max(0, MIN_SHOW_MS - elapsed);
    if (left === 0) this.dismiss();
    else setTimeout(() => this.dismiss(), left);
  }

  dismiss(_userInitiated = false){
    if (!this.visible()) return;

    if (this.autoTimer) { clearTimeout(this.autoTimer); this.autoTimer = null; }
    this.playing.set(false);

    // Strona wjeżdża do góry (globalne reguły CSS)
    document.documentElement.classList.add('intro-lift');

    // Czas zgodny z animacją .intro.playing { animation: liftUp .7s ... }
    setTimeout(() => {
      this.visible.set(false);
      document.documentElement.classList.remove('intro-active');
      // mikro-timeout żeby transition strony dokończyła i nie było „szarpnięcia”
      setTimeout(() => document.documentElement.classList.remove('intro-lift'), 50);

      if (!this.force) this.svc.markSeen(); // tylko gdy nie wymusiliśmy
    }, 700);
  }

  /** (opcjonalnie) Jeżeli w HTML masz (animationend)="onAnimEnd($event)" */
  onAnimEnd = (e: AnimationEvent) => this.onAnimationEnd(e);
}
