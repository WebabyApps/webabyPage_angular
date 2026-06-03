import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

type Particle = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  alpha: number;
  originalAlpha: number;
  vx: number;
  vy: number;
};

@Component({
  selector: 'app-vapor-text',
  standalone: true,
  template: `
    <span class="seo-heading">{{ text }}</span>
    <canvas #canvas aria-hidden="true"></canvas>
  `,
  styleUrls: ['./vapor-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaporTextComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() text = '';
  @Input() minFont = 56;
  @Input() maxFont = 104;
  @Input() fontRatio = 0.115;
  @Input() fontWeight = 800;

  @ViewChild('canvas', { static: true }) private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private particles: Particle[] = [];
  private animationId = 0;
  private resizeObserver?: ResizeObserver;
  private startTime = 0;
  private textBounds = { left: 0, width: 0 };

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.prepareCanvas());
    this.resizeObserver.observe(this.canvasRef.nativeElement);
    this.prepareCanvas();

    if (!this.prefersReducedMotion()) {
      this.startTime = performance.now();
      this.animate();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text'] && isPlatformBrowser(this.platformId) && this.canvasRef) {
      queueMicrotask(() => this.prepareCanvas());
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animationId);
    }
    this.resizeObserver?.disconnect();
  }

  private prepareCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx || !this.text) {
      return;
    }

    const fontSize = this.fontSize(rect.width);
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${this.fontWeight} ${fontSize * dpr}px system-ui, -apple-system, Segoe UI, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#eaf7fb';
    this.textBounds = this.drawText(ctx, width, height, fontSize * dpr);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const sample = Math.max(2, Math.floor(dpr * 2));
    const particles: Particle[] = [];

    for (let y = 0; y < height; y += sample) {
      for (let x = 0; x < width; x += sample) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3] / 255;
        if (alpha > 0.08) {
          particles.push({
            x,
            y,
            originX: x,
            originY: y,
            alpha,
            originalAlpha: alpha,
            vx: 0,
            vy: 0,
          });
        }
      }
    }

    this.particles = particles;
    ctx.clearRect(0, 0, width, height);
    this.drawStatic(ctx, dpr);
  }

  private animate = (): void => {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cycle = 11000;
    const elapsed = (performance.now() - this.startTime) % cycle;
    const vaporProgress = Math.min(1, Math.max(0, (elapsed - 7600) / 1700));
    const rebuildProgress = Math.min(1, Math.max(0, (elapsed - 9600) / 1000));
    const waveX = this.textBounds.left + this.textBounds.width * vaporProgress;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const particle of this.particles) {
      if (elapsed < 7600) {
        this.resetParticle(particle);
      } else if (elapsed < 9400 && particle.originX <= waveX) {
        if (particle.vx === 0 && particle.vy === 0) {
          particle.vx = (Math.random() - 0.1) * 42 * dpr;
          particle.vy = (Math.random() - 0.55) * 28 * dpr;
        }

        particle.x += particle.vx * 0.018;
        particle.y += particle.vy * 0.018;
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.alpha = Math.max(0, particle.alpha - 0.009);
      } else if (elapsed >= 3550) {
        particle.x += (particle.originX - particle.x) * 0.08;
        particle.y += (particle.originY - particle.y) * 0.08;
        particle.alpha = Math.min(particle.originalAlpha, rebuildProgress * particle.originalAlpha);
        if (rebuildProgress >= 0.98) {
          particle.vx = 0;
          particle.vy = 0;
        }
      }

      if (particle.alpha > 0.01) {
        ctx.fillStyle = `rgba(234, 247, 251, ${particle.alpha})`;
        ctx.fillRect(particle.x / dpr, particle.y / dpr, 1.55, 1.55);
      }
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  private drawStatic(ctx: CanvasRenderingContext2D, dpr: number): void {
    for (const particle of this.particles) {
      ctx.fillStyle = `rgba(234, 247, 251, ${particle.alpha})`;
      ctx.fillRect(particle.x / dpr, particle.y / dpr, 1.55, 1.55);
    }
  }

  private resetParticle(particle: Particle): void {
    particle.x = particle.originX;
    particle.y = particle.originY;
    particle.alpha = particle.originalAlpha;
    particle.vx = 0;
    particle.vy = 0;
  }

  private drawText(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fontSize: number,
  ): { left: number; width: number } {
    const lines = this.wrapText(ctx, this.text, width * 0.92);
    const lineHeight = fontSize * 1.12;
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    let left = width;
    let right = 0;

    lines.forEach((line, index) => {
      const metrics = ctx.measureText(line);
      const lineLeft = width / 2 - metrics.width / 2;
      left = Math.min(left, lineLeft);
      right = Math.max(right, lineLeft + metrics.width);
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    return { left, width: Math.max(1, right - left) };
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width <= maxWidth || !line) {
        line = testLine;
      } else {
        lines.push(line);
        line = word;
      }
    }

    if (line) {
      lines.push(line);
    }

    return lines;
  }

  private fontSize(width: number): number {
    return Math.max(this.minFont, Math.min(this.maxFont, width * this.fontRatio));
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
