import { Routes } from '@angular/router';
import { TUTORIALS } from '../tutorial.token';
import type { TutorialContent } from '../tutorial.model';

const DATA: Record<string, TutorialContent> = {
  'planetlingua': {
    title: 'PlanetLingua - Tutorial',
    intro: 'Learn languages in 30 minutes daily and unlock new planets.',
    blocks: [
      { type: 'heading', level: 2, text: 'How to play' },
      { type: 'steps', items: [
        { title: 'Daily mission', html: 'Complete one short learning session each day.' },
        { title: 'Travel planets', html: 'Unlock new language planets as your streak grows.' },
        { title: 'Customize rocket', html: 'Change your rocket style and collect visual upgrades.' }
      ]}
    ]
  }
};

export default [
  {
    path: '',
    data: { slug: 'planetlingua' },
    providers: [{ provide: TUTORIALS, useValue: DATA }],
    loadComponent: () =>
      import('../../pages/tutorial-page/tutorial-page.component')
        .then(m => m.TutorialPageComponent),
  }
] satisfies Routes;
