import { Routes } from '@angular/router';
import { TUTORIALS } from '../tutorial.token';
import type { TutorialContent } from '../tutorial.model';
import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom, forkJoin } from 'rxjs';

const DATA: Record<string, TutorialContent> = {
  'music-colours': {
    title: 'Music Colours - Tutorial',
    intro: 'Catch colours in rhythm and unlock bonuses.',
    blocks: [
      { type: 'image', src: 'background_musicColours.png', alt: 'Music Colours gameplay', caption: 'Gameplay preview' },
      { type: 'heading', level: 2, text: 'How to play' },
      { type: 'steps', items: [
        { title: 'Follow the beat', html: 'Match the colour shown in the middle.', img: 'Screenshot 2026-01-26 at 12.20.46 PM.png' },
        { title: 'Collect bonuses', html: 'Bonuses help you clear levels faster.', img: 'Screenshot 2026-01-26 at 12.20.56 PM.png' },
        { title: 'Unlock soundtracks', html: 'Subscription adds custom tracks.', img: 'Screenshot 2026-01-26 at 12.21.05 PM.png' }
      ]}
    ]
  }
};

const i18nResolver = () => firstValueFrom(
  forkJoin([
    inject(TranslocoService).selectTranslation(),
    inject(TranslocoService).selectTranslation('music-colours')
  ])
);

export default [
  {
    path: '',
    data: { slug: 'music-colours' },
    providers: [{ provide: TUTORIALS, useValue: DATA }],
    loadComponent: () =>
      import('../../pages/tutorial-page/tutorial-page.component')
        .then(m => m.TutorialPageComponent),
  }
] satisfies Routes;