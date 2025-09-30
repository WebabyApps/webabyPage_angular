// src/app/contact/contact.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type TokenResp = { token: string; expiresIn: number; nonce: string };

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private http: HttpClient) {}

  /** Pobiera token i czeka min. 2s zanim go zwróci (zgodnie z MIN_AGE z PHP) */
  async getTokenRespectingMinAge(): Promise<string> {
    const t0 = Date.now();
    const { token } = await firstValueFrom(
      this.http.get<TokenResp>('/api/contact-token.php', { withCredentials: false })
    );
    const elapsed = Date.now() - t0;
    const MIN_AGE_MS = 2000;
    if (elapsed < MIN_AGE_MS) {
      await new Promise(r => setTimeout(r, MIN_AGE_MS - elapsed));
    }
    return token;
  }

  /** Wysyłka payloadu z nagłówkiem Bearer */
  async send(payload: any): Promise<any> {
    const token = await this.getTokenRespectingMinAge();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return await firstValueFrom(this.http.post('/api/contact.php', payload, { headers }));
  }
}
