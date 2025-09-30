// contact.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from './contact.service'; // <=== dostosuj ścieżkę

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  expanded = false;
  loading = false;
  success = false;
  error: string | null = null;

  private api = inject(ContactService);

  expand() { this.expanded = true; }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.error = null;
    this.success = false;

    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const payload = {
      email:   String(fd.get('email') ?? '').trim(),
      name:    String(fd.get('name') ?? '').trim(),
      topic:   String(fd.get('topic') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
      website: String(fd.get('website') ?? '').trim(), // honeypot
    };

    // prosta walidacja – backend i tak waliduje
    if (!payload.email || !payload.message) {
      this.error = 'Podaj email i treść wiadomości.';
      return;
    }

    this.loading = true;
    try {
      await this.api.send(payload); // -> wyśle z Bearer token
      this.success = true;
      form.reset();          // czyścimy formularz
      this.expanded = false; // opcjonalnie chowamy sekcję
    } catch (err: any) {
      const s = err?.status;
      if (s === 429) this.error = 'Zbyt wiele prób. Spróbuj za kilka minut.';
      else if (s === 401) this.error = 'Problem z tokenem (wygasł lub niepoprawny). Odśwież stronę i spróbuj ponownie.';
      else if (s === 409) this.error = 'Token już został użyty. Spróbuj ponownie wysłać.';
      else if (s === 400) this.error = 'Nieprawidłowe dane. Sprawdź formularz.';
      else this.error = 'Nie udało się wysłać wiadomości. Spróbuj ponownie później.';
    } finally {
      this.loading = false;
    }
  }
}
