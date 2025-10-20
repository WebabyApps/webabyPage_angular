import { Component, effect, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Jeśli używasz Transloco do TTS językowego (opcjonalnie):
// import { TranslocoService } from '@jsverse/transloco';

type Msg = { from: 'user' | 'bot'; text: string };
type Qa  = { q: RegExp; a: (m: string) => string };

@Component({
  selector: 'app-chat-buddy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-buddy.component.html',
  styleUrls: ['./chat-buddy.component.scss'],
  host: { '[class.visible]': 'visible()' }
})
export class ChatBuddyComponent implements OnInit {
  // --- Widoczność po intro ---
  visible = signal(false);
  private revealed = false;

  // --- Panel / czat ---
  open    = signal(false);
  typing  = signal(false);
  input   = signal('');
  messages = signal<Msg[]>([
    { from: 'bot', text: 'Hi! I am Webaby Bot. Ask about our products or company ' }
  ]);

  private kb: Qa[] = [
    { q: /abc[\s-]?land|abecad/i, a: () => 'ABC-Land: an educational game for learning letters. Works on iOS/Android. Would you like a link to the tutorial?' },
{ q: /lucky\s?draw|koło|losow/i, a: () => 'Lucky Draw: shared drawing with live sharing. Open the product page and click "Tutorial".' },
{ q: /cena|price|cost/i, a: () => 'Most apps are free; paid add-ons are described on the product pages.' },
{ q: /company|whom|about us|about/i, a: () => 'Webaby creates simple, beautiful, and educational tools for children and parents - with an emphasis on languages and math.' },
{ q: /contact|email|mail/i, a: () => 'Write to us via the contact form -responses usually within 24 hours.' },
  ];
  // --- Animacje avatara ---
  blink = signal(false);
  wobble = signal(false);
  private blinkTimer?: number;
  private wobbleTimer?: number;

  // --- TTS ---
  enableVoice = signal<boolean>(true);
  private voice?: SpeechSynthesisVoice;
  private voicesReady = false;
  private unlockedByUser = false;

  // (opcjonalnie Transloco)
  // private transloco = inject(TranslocoService);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('webaby:intro:done', () => this.markVisibleOnce());

      // animacje
      this.startBlinking();
      this.startWobble();

      // prefer-reduced-motion
      effect(() => {
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        if (reduce) { this.stopAnimations(); }
      });
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      // 1) intro zniknęło z viewportu
      this.observeIntroLeavingViewport();
      // 2) fallback czasowy
      setTimeout(() => this.markVisibleOnce(), 4000);

      // --- TTS: inicjalizacja głosów ---
      const tryPick = () => this.pickVoice();
      tryPick();
      if ('onvoiceschanged' in speechSynthesis) {
        speechSynthesis.onvoiceschanged = tryPick;
      }
      setTimeout(tryPick, 600);
      setTimeout(tryPick, 1500);

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && 'speechSynthesis' in window) {
          try { speechSynthesis.resume(); } catch {}
        }
      });

      // (opcjonalnie) Transloco -> ustaw preferowany język TTS
      // const lang = (this.transloco.getActiveLang?.() ?? 'pl').split('-')[0];
      // this.desiredLang.set(lang as 'pl'|'en'|'de');
    }
  }

  // --- widoczność po intro ---
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
      if (e && e.intersectionRatio < 0.2) {
        this.markVisibleOnce();
        io.disconnect();
      }
    }, { threshold: [0, 0.2, 1] });

    io.observe(el);
  }

  // --- UI handlers ---
  toggle() {
    this.open.update(v => !v);

    // odblokuj TTS po pierwszym kliknięciu
    if (!this.unlockedByUser && 'speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        window.speechSynthesis.resume();
        this.unlockedByUser = true;
      } catch {}
    }
  }

  onSubmit(e?: Event) {
    e?.preventDefault();
    const text = this.input().trim();
    if (!text) return;

    this.messages.update(m => [...m, { from: 'user', text }]);
    this.input.set('');
    this.reply(text);
    this.scrollToBottomSoon();
  }

  private reply(userMsg: string) {
    this.typing.set(true);

    const helloRe = /\b(cześć|czesc|hej|siema|hello|hi)\b/i;
    const funny = [
  'Hello! I just oiled my antenna—how can I help?',
'Hey! If you are looking for magic, I have a screwdriver and an FAQ',
'Good morning! Smile demo: 😊—full version after coffee.',
    ];

    window.setTimeout(() => {
      let answer: string;
      if (helloRe.test(userMsg)) {
        answer = funny[Math.floor(Math.random() * funny.length)];
      } else {
        const hit = this.kb.find(k => k.q.test(userMsg));
        answer = hit
          ? hit.a(userMsg)
          :  'Good question! I can tell you about the products (e.g. "ABC-Land", "Lucky Draw"), contacts, prices and the company.';
      }

      this.messages.update(m => [...m, { from: 'bot', text: answer }]);
      this.speak(answer);
      this.typing.set(false);
      this.scrollToBottomSoon();
    }, 500 + Math.min(1500, userMsg.length * 25));
  }

  private scrollToBottomSoon() {
    setTimeout(() => {
      const box = document.querySelector('.panel__messages') as HTMLElement | null;
      if (box) box.scrollTop = box.scrollHeight;
    }, 0);
  }

  // --- Animacje ---
  private startBlinking() {
    const tick = () => {
      const next = 3000 + Math.random()*4000; // 3–7s
      this.blink.set(true);
      window.setTimeout(() => this.blink.set(false), 120);
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

  // --- TTS ---
  private pickVoice() {
    const vs = window.speechSynthesis?.getVoices?.() || [];
    if (!vs.length) return false;

    // jeśli integrujesz z Transloco, możesz użyć desiredLang() i mapowania języków
    // const lang = this.desiredLang();
    // const preferRobotNames = /Zarvox|Trinoids|Fred|Cellos|Bubbles|Bad\sNews|David/i;

    this.voice =
      vs.find(v => /Zarvox|Trinoids|Fred|Cellos|Bubbles|Bad\sNews|David/i.test(v.name)) ||
      vs.find(v => /pl(-|_|$)/i.test(v.lang)) ||
      vs.find(v => /en(-|_|$)/i.test(v.lang)) ||
      vs[0];

    this.voicesReady = !!this.voice;
    return this.voicesReady;
  }

  private speak(text: string) {
    if (!this.enableVoice() || !('speechSynthesis' in window)) return;

    const say = () => {
      const u = new SpeechSynthesisUtterance(text);
      if (this.voice) u.voice = this.voice;
      u.rate = 1;   // <- możesz korygować
      u.pitch = 0.1;  // <-
      u.lang = this.voice?.lang || 'pl-PL';

      try { window.speechSynthesis.cancel(); } catch {}
      try {
        window.speechSynthesis.speak(u);
        window.speechSynthesis.resume();
      } catch {}
    };

    if (this.voicesReady) say();
    else setTimeout(() => say(), 400);
  }
}
