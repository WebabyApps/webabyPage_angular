import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export type CurrentUser = {
  name: string;
  email: string;
  isAdmin: boolean;
};

const USER_KEY = 'webaby.currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly browser: boolean;
  private readonly userSubject = new BehaviorSubject<CurrentUser | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.browser = isPlatformBrowser(platformId);
    this.userSubject.next(this.readUser());
  }

  get currentUser(): CurrentUser | null {
    return this.userSubject.value;
  }

  get adminEmail(): string {
    return environment.adminEmail;
  }

  login(email: string, name?: string): CurrentUser {
    const normalizedEmail = email.trim().toLowerCase();
    const user: CurrentUser = {
      email: normalizedEmail,
      name: name?.trim() || normalizedEmail.split('@')[0] || 'Webaby user',
      isAdmin: normalizedEmail === environment.adminEmail.toLowerCase(),
    };

    if (this.browser) localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
    return user;
  }

  logout(): void {
    if (this.browser) localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  private readUser(): CurrentUser | null {
    if (!this.browser) return null;

    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw) as CurrentUser;
      return {
        ...user,
        isAdmin: user.email?.toLowerCase() === environment.adminEmail.toLowerCase(),
      };
    } catch {
      return null;
    }
  }
}
