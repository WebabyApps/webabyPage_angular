import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-aurora-shader',
  standalone: true,
  template: '<canvas #canvas aria-hidden="true"></canvas>',
  styleUrls: ['./aurora-shader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuroraShaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private animationId = 0;
  private gl?: WebGLRenderingContext;
  private program?: WebGLProgram;
  private timeLocation?: WebGLUniformLocation | null;
  private resolutionLocation?: WebGLUniformLocation | null;
  private resizeObserver?: ResizeObserver;
  private startedAt = 0;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || this.prefersReducedMotion()) {
      return;
    }

    this.init();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animationId);
    }
    this.resizeObserver?.disconnect();
    this.gl?.deleteProgram(this.program ?? null);
  }

  private init(): void {
    const canvas = this.canvasRef.nativeElement;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true });
    if (!gl) {
      return;
    }

    const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, `
      attribute vec2 position;

      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `);

    const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, `
      precision highp float;

      uniform float time;
      uniform vec2 resolution;

      #define NUM_OCTAVES 3

      float rand(vec2 n) {
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u * u * (3.0 - 2.0 * u);

        float res = mix(
          mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
          mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
          u.y
        );
        return res * res;
      }

      float fbm(vec2 x) {
        float v = 0.0;
        float a = 0.3;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));

        for (int i = 0; i < NUM_OCTAVES; ++i) {
          v += a * noise(x);
          x = rot * x * 2.0 + shift;
          a *= 0.4;
        }

        return v;
      }

      void main() {
        vec2 shake = vec2(sin(time * 1.2) * 0.005, cos(time * 2.1) * 0.005);
        vec2 p = ((gl_FragCoord.xy + shake * resolution.xy) - resolution.xy * 0.5) /
          resolution.y * mat2(6.0, -4.0, 4.0, 6.0);
        vec4 color = vec4(0.0);
        float f = 2.0 + fbm(p + vec2(time * 1.2, 0.0)) * 0.5;

        for (float i = 0.0; i < 35.0; i++) {
          vec2 v = p + cos(i * i + (time + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5 +
            vec2(sin(time * 3.0 + i) * 0.003, cos(time * 3.5 - i) * 0.003);
          float tailNoise = fbm(v + vec2(time * 0.5, i)) * 0.3 * (1.0 - (i / 35.0));
          vec4 aurora = vec4(
            0.26 + 0.24 * sin(i * 0.2 + time * 0.4),
            0.42 + 0.38 * cos(i * 0.3 + time * 0.5),
            0.74 + 0.26 * sin(i * 0.4 + time * 0.3),
            1.0
          );
          vec4 contribution = aurora * exp(sin(i * i + time * 0.8)) /
            length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
          float thinness = smoothstep(0.0, 1.0, i / 35.0) * 0.6;
          color += contribution * (1.0 + tailNoise * 0.8) * thinness;
        }

        color = max(color, vec4(0.0));
        color = tanh(pow(color / 100.0, vec4(1.6)));
        gl_FragColor = vec4(color.rgb * 1.55, 0.86);
      }
    `);

    const program = gl.createProgram();
    if (!vertexShader || !fragmentShader || !program) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    this.gl = gl;
    this.program = program;
    this.timeLocation = gl.getUniformLocation(program, 'time');
    this.resolutionLocation = gl.getUniformLocation(program, 'resolution');
    this.startedAt = performance.now();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    this.render();
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const gl = this.gl;
    if (!gl) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width * pixelRatio));
    const height = Math.max(1, Math.floor(rect.height * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program ?? null);
    gl.uniform2f(this.resolutionLocation ?? null, width, height);
  }

  private render = (): void => {
    const gl = this.gl;
    if (!gl || !this.program) {
      return;
    }

    gl.useProgram(this.program);
    gl.uniform1f(this.timeLocation ?? null, (performance.now() - this.startedAt) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.animationId = requestAnimationFrame(this.render);
  };

  private prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
