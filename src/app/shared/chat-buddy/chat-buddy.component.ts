import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// --- typy wiadomości i bazy FAQ ---
type Msg = { from: 'user' | 'bot'; text: string };
type Qa  = { q: RegExp; a: (m: string) => string };


@Component({
  selector: 'app-chat-buddy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-buddy.component.html',
  styleUrls: ['./chat-buddy.component.scss'],
  // ← HOST BINDING: klasa "visible" na hoście sterowana sygnałem
  host: { '[class.visible]': 'visible()' }
})
export class ChatBuddyComponent {
  // UI state

  visible = signal(false);     // start: ukryty
  private revealed = false;    // strażnik, żeby pokazać tylko raz
// --- typy wiadomości i FAQ ---



   constructor() {
     window.addEventListener('webaby:intro:done', () => this.markVisibleOnce());
    // losowe mrugnięcia co 3–7 s
    this.startBlinking();
    // delikatne „kołysanie” co 5 s
    this.startWobble();
    // prefer-reduced-motion
    effect(() => {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      if (reduce) { this.stopAnimations(); }
    });
  }

enableVoice = signal<boolean>(true);
private voice?: SpeechSynthesisVoice;
private voicesReady = false;
private unlockedByUser = false; // po pierwszym kliknięciu w robota

  // --- DOPISZ do klasy ChatBuddyComponent ---



ngOnInit() {
   // (2) Gdy intro wyjdzie z ekranu (scroll) – IntersectionObserver
    this.observeIntroLeavingViewport();

    // (3) Fallback: po X sekundach (np. 4s), jeśli nic nie zadziałało
    setTimeout(() => this.markVisibleOnce(), 4000);
 /* const pickVoice = () => {
    const vs = window.speechSynthesis?.getVoices?.() || [];
    if (!vs.length) return false;

    // Preferuj polski, potem EN, potem pierwszy z listy
    this.voice =
      vs.find(v => /pl(-|_|$)/i.test(v.lang) || /Polish/i.test(v.name)) ||
      vs.find(v => /en(-|_|$)/i.test(v.lang) || /English/i.test(v.name)) ||
      vs[0];
    this.voicesReady = !!this.voice;
    return this.voicesReady;
  };*/
  const pickVoice = () => {
  const vs = window.speechSynthesis?.getVoices?.() || [];
  if (!vs.length) return false;

  // Spróbuj złapać "robotyczne" brzmienia
  this.voice =
    vs.find(v => /Zarvox|Trinoids|Fred|Cellos|Bubbles|Bad\sNews/i.test(v.name)) || // macOS/iOS
    vs.find(v => /David/i.test(v.name)) ||                                         // Windows
    vs.find(v => /Google\sUK\sEnglish\sMale/i.test(v.name)) ||                     // Android
    vs.find(v => /pl(-|_|$)/i.test(v.lang)) ||                                     // Polski
    vs.find(v => /en(-|_|$)/i.test(v.lang)) ||
    vs[0];

  this.voicesReady = !!this.voice;
  return this.voicesReady;
};


  // 1) Spróbuj natychmiast
  if (!pickVoice()) {
    // 2) Spróbuj, gdy przeglądarka zgłosi gotowość
    if ('onvoiceschanged' in speechSynthesis) {
      speechSynthesis.onvoiceschanged = () => pickVoice();
    }
    // 3) Delikatny retry (często pomaga w Safari)
    setTimeout(() => pickVoice(), 600);
    setTimeout(() => pickVoice(), 1500);
  }

  // Wznowienie po powrocie karty
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && 'speechSynthesis' in window) {
      try { speechSynthesis.resume(); } catch {}
    }
  });
}

private markVisibleOnce() {
    if (this.revealed) return;
    this.revealed = true;
    this.visible.set(true);
  }

  private observeIntroLeavingViewport() {
    const el =
      document.querySelector('#intro') ||
      document.querySelector('.hero') ||
      document.querySelector('app-hero') ||
      null;

    if (!el || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      const e = entries[0];
      // pokaż kiedy intro prawie zniknie z viewportu
      if (e && e.intersectionRatio < 0.2) {
        this.markVisibleOnce();
        io.disconnect();
      }
    }, { threshold: [0, 0.2, 1] });

    io.observe(el);
  }
  

private speak(text: string) {
  if (!this.enableVoice() || !('speechSynthesis' in window)) return;

  const say = () => {
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.rate = 1.2;
    u.pitch = 0.6;
    u.lang = this.voice?.lang || 'pl-PL';

    // Anuluj kolejkę (żeby nie „naginało” wielu wiadomości)
    try { window.speechSynthesis.cancel(); } catch {}
    try {
      window.speechSynthesis.speak(u);
      window.speechSynthesis.resume();
    } catch {}
  };

  if (this.voicesReady) {
    say();
  } else {
    // Głosy jeszcze się ładują — spróbuj po krótkim czasie
    setTimeout(() => say(), 400);
  }
}

open = signal(false);
  typing = signal(false);
  input = signal('');
  messages = signal<Msg[]>([
    { from: 'bot', text: 'Cześć! Jestem Webaby Bot. Zapytaj o nasze produkty lub firmę 😊' }
  ]);

  // proste FAQ (podmień pod swoje treści / Transloco)
  private kb: Qa[] = [
    { q: /abc[\s-]?land|abecad/i, a: () => 'ABC-Land: gra edukacyjna do nauki liter. Działa na iOS/Android. Chcesz link do tutorialu?' },
    { q: /lucky\s?draw|koło|losow/i, a: () => 'Lucky Draw: wspólne losowanie z live-sharing. Otwórz stronę produktu i kliknij „Tutorial”.' },
    { q: /cena|price|koszt/i, a: () => 'Większość aplikacji jest darmowa; płatne dodatki opisujemy na stronach produktów.' },
    { q: /firma|kim|o nas|about/i, a: () => 'Webaby tworzy proste, ładne i edukacyjne narzędzia dla dzieci i rodziców – z naciskiem na języki i matematykę.' },
    { q: /kontakt|email|mail/i, a: () => 'Napisz do nas przez formularz kontaktowy – odpowiedzi zwykle w 24h.' },
  ];

  // mruganie: sygnał -> klasa CSS
  blink = signal(false);
  wobble = signal(false);
  private blinkTimer?: number;
  private wobbleTimer?: number;

 

  toggle() {
  this.open.update(v => !v);

  // Pierwszy klik użytkownika -> odblokowanie TTS
  if (!this.unlockedByUser && 'speechSynthesis' in window) {
    try {
      // triki na iOS/Chrome do „rozruszania” TTS
      const u = new SpeechSynthesisUtterance(''); // pusty
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      window.speechSynthesis.resume();
      this.unlockedByUser = true;
    } catch {}
  }
}

onSubmit(e?: Event) {
  e?.preventDefault(); // ← to zatrzymuje przeładowanie strony

  const text = this.input().trim();
  if (!text) return;

  this.messages.update(m => [...m, { from: 'user', text }]);
  this.input.set('');
  this.reply(text);
  this.scrollToBottomSoon(); // (optional) przewiń na dół
}
 private reply(userMsg: string) {
  this.typing.set(true);

  // zabawna odpowiedź na powitania
  const helloRe = /\b(cześć|czesc|hej|siema|hello|hi)\b/i;
  const funny = [
    'Cześć! 🤖 Właśnie naoliwiłem antenkę — jak mogę pomóc?',
    'Hejo! Jeśli szukasz magii, mam śrubokręt i FAQ ✨',
    'Dzień dobry! Wersja demo uśmiechu: 😊 — pełna wersja po kawie.',
  ];

  window.setTimeout(() => {
    let answer: string;
    if (helloRe.test(userMsg)) {
      answer = funny[Math.floor(Math.random() * funny.length)];
    } else {
      const hit = this.kb.find(k => k.q.test(userMsg));
      answer = hit
        ? hit.a(userMsg)
        : 'Dobre pytanie! Mogę opowiedzieć o produktach (np. „ABC-Land”, „Lucky Draw”), kontaktach, cenach czy firmie.';
    }

    this.messages.update(m => [...m, { from: 'bot', text: answer }]);
    this.speak(answer);
    this.typing.set(false);
    this.scrollToBottomSoon();
  }, 500 + Math.min(1500, userMsg.length * 25));
}

// (opcjonalnie) autoscroll na dół listy wiadomości
private scrollToBottomSoon() {
  setTimeout(() => {
    const box = document.querySelector('.panel__messages') as HTMLElement | null;
    if (box) box.scrollTop = box.scrollHeight;
  }, 0);
}

  // --- animacje ---
  private startBlinking() {
    const tick = () => {
      const next = 3000 + Math.random()*4000; // 3–7s
      this.blink.set(true);
      window.setTimeout(() => this.blink.set(false), 120); // krótkie mrugnięcie
      this.blinkTimer = window.setTimeout(tick, next) as unknown as number;
    };
    this.blinkTimer = window.setTimeout(tick, 2500) as unknown as number;
  }

  private startWobble() {
    const tick = () => {
      this.wobble.set(true);
      window.setTimeout(() => this.wobble.set(false), 900);
      this.wobbleTimer = window.setTimeout(tick, 5000) as unknown as number;
    };
    this.wobbleTimer = window.setTimeout(tick, 4000) as unknown as number;
  }

  private stopAnimations() {
    if (this.blinkTimer) window.clearTimeout(this.blinkTimer);
    if (this.wobbleTimer) window.clearTimeout(this.wobbleTimer);
    this.blink.set(false);
    this.wobble.set(false);
  }
}
