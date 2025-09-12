import { Routes } from '@angular/router';
import { TUTORIALS } from '../tutorial.token';
import type { TutorialContent } from '../tutorial.model';

const DATA: Record<string, TutorialContent> = {
  'abc-land'  : {
    title: 'Abecadłowo - Tutorial',
    intro: 'Krótki przewodnik: jak używać aplikacji do nauki literek.',
    blocks: [
      { type: 'heading', level: 2, text: 'Wprowadzenie' },
      { type: 'text', html: `
        <p><b>Abecadłowo</b> pomaga dzieciom poznawać litery, dźwięki i proste słowa.
        Poniżej znajdziesz zrzuty ekranu oraz sekcję <i>Jak korzystać</i>.</p>
      `},

      { type: 'gallery', images: [
        { src: 'home.png',           alt: 'Ekran główny',     caption: 'Ekran główny' },
        { src: 'alphabet-grid.png',  alt: 'Siatka liter',     caption: 'Wybór liter' }
      ]},

      { type: 'heading', level: 2, text: 'Jak korzystać' },
      { type: 'steps', items: [
        { title: '1) Wybierz literę',  html: 'Dotknij literki na planszy.',                         img: 'step1.png' },
        { title: '2) Posłuchaj dźwięku', html: 'Kliknij ikonę głośnika, aby odtworzyć głoskę.',     img: 'step2.png' },
        { title: '3) Powtórz i napisz', html: 'Powtórz na głos i spróbuj narysować literę palcem.', img: 'step3.png' }
      ]},

      { type: 'youtube', id: 'kJQP7kiw5Fk', caption: 'Krótka prezentacja działania' },
      { type: 'divider' },
      { type: 'link', href: 'mailto:hello@webaby.dev', label: 'Napisz do nas', external: true }
    ],
  }
};

export default [
  {
    path: '',
    data: { slug: 'abc-land' },
    providers: [{ provide: TUTORIALS, useValue: DATA }],
    loadComponent: () =>
      import('../../pages/tutorial-page/tutorial-page.component')
        .then(m => m.TutorialPageComponent),
  }
] satisfies Routes;
