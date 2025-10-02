import { Injectable } from '@angular/core';

const KEY = 'introSeen_v1';

@Injectable({ providedIn: 'root' })
export class IntroSplashService {
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
