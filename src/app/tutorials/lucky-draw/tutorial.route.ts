import { Routes } from '@angular/router';
import { TUTORIALS } from '../tutorial.token';
import type { TutorialContent } from '../tutorial.model';
import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom, forkJoin } from 'rxjs';  

const DATA: Record<string, TutorialContent> = {
  'lucky-draw': {
    title: 'Lucky Draw - Tutorial',
    intro: 'Spin the wheel to get a prize.',
    blocks: [
      { type: 'image', src: 'hero-shot.jpg', alt: 'Gameplay', caption: 'Gameplay example' },
      { type: 'heading', level: 2, text: 'How to use it' },
      { type: 'steps', items: [
        { title: 'Aim',     html: 'Drag to set the arc.',    img: 'aim.png' },
        { title: 'Power',   html: 'Longer drag = more power.', img: 'power.png' },
        { title: 'Release', html: 'Let go at the arc peak.', img: 'release.png' },
      ]},
      { type: 'youtube', id: 'QH2-TGUlwu4', caption: 'Scoring tips' }
    ],
    resources: [{ label: 'Community Discord', href: '#' }]
  }
};

const i18nResolver = () => firstValueFrom(
  forkJoin([
    inject(TranslocoService).selectTranslation(),               // global
    inject(TranslocoService).selectTranslation('abc-land') // ⬅️ scope = folder
  ])
);

export default [
  {
    path: '',
    data: { slug: 'lucky-draw' }, // <- TutorialPage reads this when no :slug param
    providers: [{ provide: TUTORIALS, useValue: DATA }],
    loadComponent: () =>
      import('../../pages/tutorial-page/tutorial-page.component')
        .then(m => m.TutorialPageComponent),
  }
] satisfies Routes;