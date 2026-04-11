import { Routes } from '@angular/router';
import { TUTORIALS } from '../tutorial.token';
import type { TutorialContent } from '../tutorial.model';

const DATA: Record<string, TutorialContent> = {
  docuflow: {
    title: 'DocuFlow - Tutorial',
    intro: 'Document workflow, KSeF, rentals, and reporting in one workspace.',
    blocks: []
  }
};

export default [
  {
    path: '',
    data: { slug: 'docuflow' },
    providers: [{ provide: TUTORIALS, useValue: DATA }],
    loadComponent: () =>
      import('../../pages/tutorial-page/tutorial-page.component')
        .then(m => m.TutorialPageComponent),
  }
] satisfies Routes;
