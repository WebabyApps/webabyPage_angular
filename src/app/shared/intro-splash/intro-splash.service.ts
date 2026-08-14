import { Injectable } from '@angular/core';
import { HomepageSettingsService } from '../../content/homepage-settings.service';

const KEY = 'introSeen_v1';

@Injectable({ providedIn: 'root' })
export class IntroSplashService {
  constructor(private readonly homepageSettings: HomepageSettingsService) {}

  isEnabled(): boolean {
    return this.homepageSettings.current.showIntro;
  }
  alreadySeen(): boolean {
    try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
  }
  markSeen(): void {
    try { sessionStorage.setItem(KEY, '1'); } catch {}
  }
  reset(): void {
    try { sessionStorage.removeItem(KEY); } catch {}
  }
}
