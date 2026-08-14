import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, Optional, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import {
  DEFAULT_HOMEPAGE_SETTINGS,
  HomepageSettings,
  INITIAL_HOMEPAGE_SETTINGS,
  normalizeHomepageSettings,
} from './homepage-settings.models';

const TRANSFER_KEY = makeStateKey<HomepageSettings>('webaby.homepageSettings');

@Injectable({ providedIn: 'root' })
export class HomepageSettingsService {
  private readonly settingsSubject = new BehaviorSubject<HomepageSettings>(DEFAULT_HOMEPAGE_SETTINGS);
  readonly settings$ = this.settingsSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly transferState: TransferState,
    @Inject(PLATFORM_ID) platformId: Object,
    @Optional() @Inject(INITIAL_HOMEPAGE_SETTINGS) initialSettings: HomepageSettings | null,
  ) {
    const browser = isPlatformBrowser(platformId);
    const transferred = this.transferState.get(TRANSFER_KEY, null as HomepageSettings | null);
    const initial = normalizeHomepageSettings(initialSettings ?? transferred);
    this.settingsSubject.next(initial);

    if (!browser) {
      this.transferState.set(TRANSFER_KEY, initial);
      return;
    }

    if (transferred) {
      this.transferState.remove(TRANSFER_KEY);
      return;
    }

    this.refresh().subscribe();
  }

  get current(): HomepageSettings {
    return this.settingsSubject.value;
  }

  refresh(): Observable<HomepageSettings> {
    return this.http.get<HomepageSettings>('/api/homepage-settings').pipe(
      tap((settings) => this.settingsSubject.next(normalizeHomepageSettings(settings))),
      catchError(() => of(this.current)),
    );
  }

  update(settings: HomepageSettings, adminEmail: string): Observable<HomepageSettings> {
    const headers = new HttpHeaders({ 'x-admin-email': adminEmail });
    return this.http.put<HomepageSettings>(
      '/api/homepage-settings',
      normalizeHomepageSettings(settings),
      { headers },
    ).pipe(
      tap((saved) => this.settingsSubject.next(normalizeHomepageSettings(saved))),
    );
  }
}
