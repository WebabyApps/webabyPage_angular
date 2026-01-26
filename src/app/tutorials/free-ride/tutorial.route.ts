import { Routes } from '@angular/router';
import { TUTORIALS } from '../tutorial.token';
import type { TutorialContent } from '../tutorial.model';

const DATA: Record<string, TutorialContent> = {
  'free-ride': {
    title: 'FreeRide - Tutorial',
    intro: 'Offer and book rides with smart route optimisation.',
    blocks: [
      { type: 'image', src: 'FreeRideHeader.png', alt: 'FreeRide app', caption: 'FreeRide preview' },
      { type: 'heading', level: 2, text: 'How it works' },
      { type: 'steps', items: [
        { title: 'Offer a ride', html: 'Create an offer and set your route.', img: 'OfferRide.png' },
        { title: 'Find a ride', html: 'Browse available rides and compare options.', img: 'FindRide.png' },
        { title: 'Book a seat', html: 'Reserve a seat and get trip details.', img: 'BookASeat.png' },
        { title: 'Profile & trust', html: 'Keep your profile updated for better matches.', img: 'Profile.png' },
      ]}
    ]
  }
};

export default [
  {
    path: '',
    data: { slug: 'free-ride' },
    providers: [{ provide: TUTORIALS, useValue: DATA }],
    loadComponent: () =>
      import('../../pages/tutorial-page/tutorial-page.component')
        .then(m => m.TutorialPageComponent),
  }
] satisfies Routes;