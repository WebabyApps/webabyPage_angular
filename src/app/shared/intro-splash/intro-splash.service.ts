import { Injectable } from '@angular/core';

const KEY = 'introSeen_v1';
const ENABLED_KEY = 'webabyIntroEnabled_v1';

@Injectable({ providedIn: 'root' })
export class IntroSplashService {
  isEnabled(): boolean {
    try { return localStorage.getItem(ENABLED_KEY) === '1'; } catch { return false; }
  }
  setEnabled(enabled: boolean): void {
    try {
      if (enabled) localStorage.setItem(ENABLED_KEY, '1');
      else localStorage.removeItem(ENABLED_KEY);
    } catch {}
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
