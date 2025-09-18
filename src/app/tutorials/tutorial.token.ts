import { InjectionToken } from '@angular/core';
import type { TutorialContent } from './tutorial.model';

export const TUTORIALS = new InjectionToken<Record<string, TutorialContent>>('TUTORIALS');
