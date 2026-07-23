import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Inject,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { take } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoModule, QRCodeComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  readonly isBrowser: boolean;

  @ViewChild('heroModelCanvas') private set heroModelCanvasRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this.heroModelCanvas = value;
    this.scheduleHeroModelInit();
  }

  @ViewChild('heroModelStage') private set heroModelStageRef(value: ElementRef<HTMLElement> | undefined) {
    this.heroModelStage = value;
    this.scheduleHeroModelInit();
  }

  heroModelReady = false;
  heroModelFailed = false;

  private _scope?: string;
  private _title?: string;
  private _subtitle?: string;
  private _ctaText?: string;
  private heroModelRenderer?: any;
  private heroModelScene?: any;
  private heroModelCamera?: any;
  private heroModelPivot?: any;
  private heroModelResizeObserver?: ResizeObserver;
  private heroModelFrame = 0;
  private heroModelLastFrame = 0;
  private heroModelHoverActive = false;
  private heroModelHoverStart = 0;
  private heroModelHoverFrom = 0;
  private heroModelHoverFromZ = 0;
  private heroModelReleaseActive = false;
  private heroModelReleaseStart = 0;
  private heroModelReleaseFrom = 0;
  private heroModelReleaseFromZ = 0;
  private heroModelDestroyed = false;
  private heroModelInitStarted = false;
  private heroModelCanvas?: ElementRef<HTMLCanvasElement>;
  private heroModelStage?: ElementRef<HTMLElement>;

  resolvedTitle?: string;
  resolvedSubtitle?: string;
  resolvedCtaText?: string;

  // ⬇️ WSTRZYKNIJ PLATFORM_ID (pierwszy parametr) + Transloco
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private transloco: TranslocoService,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    this.scheduleHeroModelInit();
  }

  private scheduleHeroModelInit(): void {
    if (
      !this.isBrowser ||
      this.compact ||
      this.heroModelInitStarted ||
      !this.heroModelCanvas ||
      !this.heroModelStage
    ) return;

    this.heroModelInitStarted = true;
    this.ngZone.runOutsideAngular(() => {
      const startModel = () => void this.initHeroModel();
      const requestIdle = (window as any).requestIdleCallback as
        | ((callback: () => void, options?: { timeout: number }) => number)
        | undefined;

      if (requestIdle) {
        requestIdle(startModel, { timeout: 1200 });
        return;
      }

      window.setTimeout(startModel, 500);
    });
  }

  ngOnDestroy(): void {
    this.heroModelDestroyed = true;
    if (this.heroModelFrame) cancelAnimationFrame(this.heroModelFrame);
    this.heroModelResizeObserver?.disconnect();
    this.disposeHeroModel();
  }

  setHeroModelHover(active: boolean): void {
    if (!this.isBrowser) return;

    const now = performance.now();
    const currentRotationY = this.heroModelPivot?.rotation?.y ?? 0;
    const currentRotationZ = this.heroModelPivot?.rotation?.z ?? 0;

    this.heroModelHoverActive = active;
    this.heroModelLastFrame = now;

    if (active) {
      this.heroModelReleaseActive = false;
      this.heroModelHoverStart = now;
      this.heroModelHoverFrom = currentRotationY;
      this.heroModelHoverFromZ = currentRotationZ;
    } else {
      this.heroModelReleaseActive = true;
      this.heroModelReleaseStart = now;
      this.heroModelReleaseFrom = currentRotationY;
      this.heroModelReleaseFromZ = currentRotationZ;
    }
  }

  @Input() set scope(value: string | undefined) { this._scope = value || undefined; this.resolveAll(); }
  @Input() set title(value: string | undefined) { this._title = value || undefined; this.resolveAll(); }
  @Input() set subtitle(value: string | undefined) { this._subtitle = value || undefined; this.resolveAll(); }
  @Input() set ctaText(value: string | undefined) { this._ctaText = value || undefined; this.resolveAll(); }

  @Input() brandScrollTarget?: string;   // np. "page-title"
  @Input() brandScrollOffset = 0;        // kompensacja sticky headera (px)
  @Input() showQr = false;
  @Input() appUrl?: string;          // URL do aplikacji (np. z mapy slug->url)
  @Input() qrSize = 140;             // rozmiar QR w px
  @Input() qrEcLevel: 'L'|'M'|'Q'|'H' = 'M'; 
  // ✅ PUBLIC + ARROW => widoczne w template, poprawne this-binding
  public onLogoClick = (event: MouseEvent): void => {
    if (!this.brandScrollTarget) return; // pozwól routerLinkowi działać normalnie
    event.preventDefault();

    if (!this.isBrowser) return;

    const el = document.getElementById(this.brandScrollTarget);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - (this.brandScrollOffset || 0);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  private isKey(str?: string): boolean {
    return !!str && str.includes('.') && !/\s/.test(str);
  }

  private trMaybeAsync(str?: string, setter?: (v: string) => void) {
    if (!str || !setter) return;
    if (!this.isKey(str)) { setter(str); return; }

    const svc: any = this.transloco as any;
    if (typeof svc.selectTranslate === 'function') {
      const obs = this._scope ? svc.selectTranslate(str, {}, this._scope)
                              : svc.selectTranslate(str);
      obs.pipe(take(1)).subscribe((v: string) => {
        if (v !== str) {
          setter(v);
          return;
        }

        if (!this._scope) {
          setter(v);
          return;
        }

        const prefixedKey = `${this._scope}.${str}`;
        this.transloco.selectTranslate(prefixedKey).pipe(take(1)).subscribe((prefixed: string) => {
          setter(prefixed !== prefixedKey ? prefixed : v);
        });
      });
      return;
    }
    const v = this._scope ? this.transloco.translate(str, {}, this._scope)
                          : this.transloco.translate(str);
    if (v !== str || !this._scope) {
      setter(v);
      return;
    }

    const prefixedKey = `${this._scope}.${str}`;
    const prefixed = this.transloco.translate(prefixedKey);
    setter(prefixed !== prefixedKey ? prefixed : v);
  }

  private resolveAll() {
    this.trMaybeAsync(this._title, v => this.resolvedTitle = v);
    this.trMaybeAsync(this._subtitle, v => this.resolvedSubtitle = v);
    this.trMaybeAsync(this._ctaText, v => this.resolvedCtaText = v);
  }

  @Input() ctaLink: string | any[] | null = null;
  @Input() ctaFragment?: string;
  @Input() compact = false;

  scrollToProducts() {
    if (!this.isBrowser) return;

    const el = document.querySelector('#products');
    if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private async initHeroModel(): Promise<void> {
    const canvas = this.heroModelCanvas?.nativeElement;
    const stage = this.heroModelStage?.nativeElement;
    if (!canvas || !stage || this.heroModelDestroyed) return;

    try {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
      camera.position.set(0, 0, 6.2);
      camera.lookAt(0, 0, 0);

      const pivot = new THREE.Group();
      scene.add(pivot);

      scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x08051c, 2.4));

      const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
      keyLight.position.set(2.7, 2.4, 3.2);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x6ec9ff, 4.4);
      rimLight.position.set(-3.2, 1.4, -2.5);
      scene.add(rimLight);

      const violetLight = new THREE.PointLight(0x9f5cff, 3.2, 7);
      violetLight.position.set(-1.2, -1.6, 2.2);
      scene.add(violetLight);

      this.heroModelRenderer = renderer;
      this.heroModelScene = scene;
      this.heroModelCamera = camera;
      this.heroModelPivot = pivot;

      this.resizeHeroModel();
      this.heroModelResizeObserver = new ResizeObserver(() => this.resizeHeroModel());
      this.heroModelResizeObserver.observe(stage);

      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync('/assets/hero/webaby-logo-model.glb');
      const model = gltf.scene;

      model.traverse((node: any) => {
        if (!node?.isMesh) return;
        node.frustumCulled = false;
        node.castShadow = false;
        node.receiveShadow = false;
        if (node.material) {
          node.material.side = THREE.DoubleSide;
          if ('roughness' in node.material) node.material.roughness = 0.38;
          if ('metalness' in node.material) node.material.metalness = 0.08;
          node.material.needsUpdate = true;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxFlatSize = Math.max(size.x, size.y) || 1;
      const modelScale = 1.62 / maxFlatSize;
      const depthBoost = 3.2;
      const displayGroup = new THREE.Group();
      const logoMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x1c46bd,
        emissiveIntensity: 0.18,
        metalness: 0.16,
        roughness: 0.28,
        side: THREE.DoubleSide,
      });

      model.scale.set(modelScale, modelScale, modelScale * depthBoost);
      model.updateWorldMatrix(true, true);
      const scaledCenter = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      model.position.sub(scaledCenter);

      model.traverse((node: any) => {
        if (!node?.isMesh) return;
        node.material = logoMaterial.clone();
      });

      model.rotation.x = 0;
      model.rotation.y = 0;
      model.rotation.z = 0;
      displayGroup.add(model);
      pivot.rotation.y = 0;
      pivot.add(displayGroup);

      this.ngZone.run(() => {
        this.heroModelReady = true;
      });

      this.heroModelLastFrame = performance.now();
      this.animateHeroModel(this.heroModelLastFrame);
    } catch (error) {
      console.error('[hero] GLB model failed to load', error);
      this.ngZone.run(() => {
        this.heroModelFailed = true;
      });
    }
  }

  private resizeHeroModel(): void {
    const stage = this.heroModelStage?.nativeElement;
    const renderer = this.heroModelRenderer;
    const camera = this.heroModelCamera;
    if (!stage || !renderer || !camera) return;

    const width = Math.max(1, Math.round(stage.clientWidth));
    const height = Math.max(1, Math.round(stage.clientHeight));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  private animateHeroModel = (time: number): void => {
    if (this.heroModelDestroyed) return;

    const pivot = this.heroModelPivot;
    const renderer = this.heroModelRenderer;
    const scene = this.heroModelScene;
    const camera = this.heroModelCamera;
    if (!pivot || !renderer || !scene || !camera) return;

    const delta = Math.min((time - this.heroModelLastFrame) / 1000, 0.05);
    this.heroModelLastFrame = time;

    if (this.heroModelHoverActive) {
      const progress = Math.min((time - this.heroModelHoverStart) / 900, 1);
      const frontTurn = this.shortestAngleDelta(this.heroModelHoverFrom, 0);
      const zTurn = this.shortestAngleDelta(this.heroModelHoverFromZ, 0);
      if (progress < 0.58) {
        pivot.rotation.y = this.heroModelHoverFrom + frontTurn * this.easeOutCubic(progress / 0.58);
        pivot.rotation.z = this.heroModelHoverFromZ + zTurn * this.easeOutCubic(progress / 0.58);
      } else {
        pivot.rotation.y = 0;
        pivot.rotation.z = this.lerp(0, -Math.PI / 4, this.easeOutCubic((progress - 0.58) / 0.42));
      }
    } else if (this.heroModelReleaseActive) {
      const progress = Math.min((time - this.heroModelReleaseStart) / 520, 1);
      const yTurn = this.shortestAngleDelta(this.heroModelReleaseFrom, 0);
      const zTurn = this.shortestAngleDelta(this.heroModelReleaseFromZ, 0);
      pivot.rotation.y = this.heroModelReleaseFrom + yTurn * this.easeOutCubic(progress);
      pivot.rotation.z = this.heroModelReleaseFromZ + zTurn * this.easeOutCubic(progress);
      if (progress >= 1) {
        pivot.rotation.y = 0;
        pivot.rotation.z = 0;
        this.heroModelReleaseActive = false;
      }
    } else {
      pivot.rotation.y -= delta * 0.48;
      pivot.rotation.z = 0;
    }

    renderer.render(scene, camera);
    this.heroModelFrame = requestAnimationFrame(this.animateHeroModel);
  };

  private disposeHeroModel(): void {
    const pivot = this.heroModelPivot;
    if (pivot) {
      pivot.traverse((node: any) => {
        node.geometry?.dispose?.();
        const materials = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
        for (const material of materials) {
          for (const value of Object.values(material)) {
            if (value && typeof value === 'object' && 'dispose' in value) {
              (value as { dispose?: () => void }).dispose?.();
            }
          }
          material.dispose?.();
        }
      });
    }

    this.heroModelRenderer?.dispose?.();
    this.heroModelRenderer = undefined;
    this.heroModelScene = undefined;
    this.heroModelCamera = undefined;
    this.heroModelPivot = undefined;
  }

  private shortestAngleDelta(from: number, to: number): number {
    const turn = Math.PI * 2;
    return ((((to - from) % turn) + Math.PI * 3) % turn) - Math.PI;
  }

  private lerp(start: number, end: number, amount: number): number {
    return start + (end - start) * amount;
  }

  private easeOutCubic(value: number): number {
    return 1 - Math.pow(1 - value, 3);
  }
}
