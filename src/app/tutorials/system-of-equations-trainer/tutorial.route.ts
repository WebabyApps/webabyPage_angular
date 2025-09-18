import { Routes } from '@angular/router';
import { TUTORIALS } from '../tutorial.token';
import type { TutorialContent } from '../tutorial.model';

const DATA: Record<string, TutorialContent> = {
  'system-of-equations-trainer': {
    title: 'System of Equations - Tutorial',
    intro: 'Quick guide with UI shots and a short demo.',
    blocks: [
      { type: 'heading', level: 2, text: 'Overview' },
      { type: 'gallery', images: [
        { src: 'ui-overview.png',  alt: 'Main screen',  caption: 'Main UI' },
        { src: 'level-select.png', alt: 'Level select', caption: 'Levels' }
      ]},
      { type: 'heading', level: 2, text: 'How to use it' },
      { type: 'steps', items: [
        { title: 'Pick a level',  html: 'Tap <b>Play</b> and choose difficulty.', img: 'step1.png' },
        { title: 'Enter x and y', html: 'Use the keypad; fractions supported.',   img: 'step2.png' },
        { title: 'Check & learn', html: 'Tap <b>Check</b>; hints on mistakes.',   img: 'step3.png' },
      ]},
      { type: 'youtube', id: 'dQw4w9WgXcQ', caption: 'Short walkthrough' }
    ]
  }
};

export default [
  {
    path: '',
    data: { slug: 'system-of-equations-trainer' },
    providers: [{ provide: TUTORIALS, useValue: DATA }],
    loadComponent: () =>
      import('../../pages/tutorial-page/tutorial-page.component')
        .then(m => m.TutorialPageComponent),
  }
] satisfies Routes;
