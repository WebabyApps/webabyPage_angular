import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { TranslocoService } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';

interface GoalOrbitItem {
    id: 'mission' | 'development' | 'innovations' | 'vision';
    labelKey: string;
    sectionKey: 'mission' | 'dev' | 'innovation' | 'vision';
    titleKey: string;
    p1Key: string;
    p2Key: string;
    planetClass: string;
    imageSrc: string;
    energy: number;
}

const ROTATION_STEP_DEGREES = 0.24;
const ROTATION_FRAME_MS = 30;
const ORBIT_STEP_DEGREES = 90;
const NEXT_TOP_DELAY_MS = Math.round(ORBIT_STEP_DEGREES / (ROTATION_STEP_DEGREES / ROTATION_FRAME_MS));

@Component({
    selector: 'app-about', templateUrl: './about.component.html', styleUrls: ['./about.component.scss'],
    standalone: true,   
    imports: [CommonModule, TranslocoModule]   
})
export class AboutComponent implements OnInit, OnDestroy {
    readonly orbitItems: GoalOrbitItem[] = [
        {
            id: 'mission',
            labelKey: 'home.about.orbit.mission',
            sectionKey: 'mission',
            titleKey: 'home.about.mission.title',
            p1Key: 'home.about.mission.p1',
            p2Key: 'home.about.mission.p2',
            planetClass: 'planet-cyan',
            imageSrc: 'assets/education_and_grow_small.jpg',
            energy: 92,
        },
        {
            id: 'development',
            labelKey: 'home.about.orbit.development',
            sectionKey: 'dev',
            titleKey: 'home.about.dev.title',
            p1Key: 'home.about.dev.p1',
            p2Key: 'home.about.dev.p2',
            planetClass: 'planet-lime',
            imageSrc: 'assets/software.png',
            energy: 84,
        },
        {
            id: 'innovations',
            labelKey: 'home.about.orbit.innovations',
            sectionKey: 'innovation',
            titleKey: 'home.about.innovation.title',
            p1Key: 'home.about.innovation.p1',
            p2Key: 'home.about.innovation.p2',
            planetClass: 'planet-violet',
            imageSrc: 'assets/software_development.jpeg',
            energy: 88,
        },
        {
            id: 'vision',
            labelKey: 'home.about.orbit.vision',
            sectionKey: 'vision',
            titleKey: 'home.about.vision.title',
            p1Key: 'home.about.vision.p1',
            p2Key: 'home.about.vision.p2',
            planetClass: 'planet-amber',
            imageSrc: 'assets/future.png',
            energy: 76,
        },
    ];

    activeGoalId: GoalOrbitItem['id'] = 'mission';
    rotationAngle = 0;
    autoRotate = false;
    typedTitle = '';
    typedText = '';

    private typingTimer?: ReturnType<typeof setInterval>;
    private rotationTimer?: ReturnType<typeof setInterval>;
    private resumeTimer?: ReturnType<typeof setTimeout>;
    private cycleTimer?: ReturnType<typeof setTimeout>;
    private selectedIndex = 0;
    private readonly destroy$ = new Subject<void>();

    private platformId = inject(PLATFORM_ID);
    constructor(private readonly transloco: TranslocoService) {}

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) return; // SSR — nie startuj timerów animacji

        this.transloco.selectTranslation()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.focusGoal(this.orbitItems[this.selectedIndex]);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.clearTimers();
    }

    get activeGoal(): GoalOrbitItem | undefined {
        return this.orbitItems.find((item) => item.id === this.activeGoalId);
    }

    getPlanetStyle(index: number): Record<string, string | number> {
        const total = this.orbitItems.length;
        const baseAngle = (index / total) * 360;
        const angle = baseAngle + this.rotationAngle;
        const radians = (angle * Math.PI) / 180;
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 760;
        const radiusX = isMobile ? 31 : 36;
        const radiusY = isMobile ? 18 : 20;
        const x = Math.cos(radians) * radiusX;
        const y = Math.sin(radians) * radiusY;
        const depth = (Math.sin(radians) + 1) / 2;

        return {
            left: `calc(50% + ${x}%)`,
            top: `calc(36% + ${y}%)`,
            opacity: 0.58 + depth * 0.42,
            zIndex: Math.round(40 + depth * 40),
        };
    }

    selectGoal(item: GoalOrbitItem, index: number, event?: Event): void {
        event?.stopPropagation();
        this.selectedIndex = index;
        this.focusGoal(item);
    }

    isActive(item: GoalOrbitItem): boolean {
        return this.activeGoalId === item.id;
    }

    private focusGoal(item: GoalOrbitItem): void {
        this.clearTimers();
        this.activeGoalId = item.id;
        this.autoRotate = false;
        this.rotateGoalToTop(item);
        this.startTyping(item);
    }

    private rotateGoalToTop(item: GoalOrbitItem): void {
        const index = this.orbitItems.findIndex((goal) => goal.id === item.id);
        const baseAngle = (index / this.orbitItems.length) * 360;
        this.rotationAngle = -90 - baseAngle;
    }

    private startTyping(item: GoalOrbitItem): void {
        const title = this.transloco.translate(item.titleKey).toUpperCase();
        const body = `${this.transloco.translate(item.p1Key)} ${this.transloco.translate(item.p2Key)}`;
        const full = `${title}\n${body}`;
        let position = 0;

        this.typedTitle = '';
        this.typedText = '';

        this.typingTimer = setInterval(() => {
            position += 2;
            const visible = full.slice(0, position);
            const [visibleTitle, ...visibleBody] = visible.split('\n');

            this.typedTitle = visibleTitle;
            this.typedText = visibleBody.join('\n');

            if (position >= full.length) {
                this.stopTypingTimer();
                this.resumeTimer = setTimeout(() => {
                    this.startAutoRotate();
                    this.scheduleNextGoal();
                }, 1800);
            }
        }, 16);
    }

    private startAutoRotate(): void {
        this.autoRotate = true;
        this.rotationTimer = setInterval(() => {
            this.rotationAngle = (this.rotationAngle + ROTATION_STEP_DEGREES) % 360;
        }, ROTATION_FRAME_MS);
    }

    private scheduleNextGoal(): void {
        this.cycleTimer = setTimeout(() => {
            this.selectedIndex = (this.selectedIndex - 1 + this.orbitItems.length) % this.orbitItems.length;
            this.focusGoal(this.orbitItems[this.selectedIndex]);
        }, NEXT_TOP_DELAY_MS);
    }

    private clearTimers(): void {
        this.stopTypingTimer();

        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = undefined;
        }

        if (this.resumeTimer) {
            clearTimeout(this.resumeTimer);
            this.resumeTimer = undefined;
        }

        if (this.cycleTimer) {
            clearTimeout(this.cycleTimer);
            this.cycleTimer = undefined;
        }
    }

    private stopTypingTimer(): void {
        if (this.typingTimer) {
            clearInterval(this.typingTimer);
            this.typingTimer = undefined;
        }
    }
}
