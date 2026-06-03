insert into public.blog_posts
  (slug, title, excerpt, body, category, tags, author_name, image_url, published_at)
values
  (
    'claude-code-skills-grillme-guide',
    'Skille w Claude Code: praktyczny poradnik na przykladzie GrillMe',
    'Skille pomagaja zamienic asystenta AI w narzedzie z konkretnym trybem pracy. Zobacz, czym sa, kiedy ich uzywac i jak moze dzialac skill GrillMe.',
    array[
      'Skill w Claude Code mozna traktowac jak zapisany sposob pracy dla asystenta. Zamiast za kazdym razem tlumaczyc, jak ma analizowac projekt, jak ma pisac recenzje albo jak ma prowadzic debugowanie, przygotowujesz instrukcje, ktore nadaja mu konkretny tryb dzialania.',
      'Najprostszy przyklad: zwykly prompt mowi co chcesz zrobic teraz, a skill opisuje powtarzalna metode. Moze zawierac kontekst, kryteria oceny, format odpowiedzi, preferowane kroki, ograniczenia i przyklady dobrego wyniku.',
      'W praktyce skille najlepiej sprawdzaja sie tam, gdzie czesto wracasz do tego samego typu zadania: review kodu, przygotowanie release notes, projektowanie komponentow UI, analiza logow, optymalizacja promptow albo pisanie dokumentacji technicznej.',
      'Skill o nazwie GrillMe moglby sluzyc do celowo ostrej, ale konstruktywnej recenzji. Prosisz asystenta: uzyj GrillMe dla tego pomyslu albo tego komponentu. Wtedy AI nie tylko chwali, ale szuka slabych zalozen, dziur w UX, ryzyk technicznych, miejsc bez testow i decyzji, ktore moga zabolec po wdrozeniu.',
      'Dobry GrillMe nie powinien byc zlosliwy. Jego zadaniem jest szybkie wykrycie problemow, zanim zobacza je uzytkownicy. Przykladowy wynik to lista najwiekszych ryzyk, konkretne pytania kontrolne, propozycje uproszczen i jednoznaczna rekomendacja: poprawic teraz, odlozyc albo zaakceptowac swiadomie.',
      'Jak uzywac skilla? Najpierw wybierz waski cel. Zamiast prosic ogolnie o pomoc, napisz: uzyj GrillMe do oceny tej sekcji landing page, sprawdz ten endpoint pod katem bezpieczenstwa albo zrecenzuj ten plan migracji. Im wyrazniejszy obiekt recenzji, tym lepsza odpowiedz.',
      'Warto tez dawac skillowi material do pracy: fragment kodu, screenshot, opis produktu, kryteria sukcesu, ograniczenia czasowe albo informacje, czego nie wolno zmieniac. Skill nie zastepuje kontekstu, tylko pomaga go przetworzyc wedlug stalej metody.',
      'Najwieksza korzysc ze skilli polega na powtarzalnosci. Zespol moze miec wspolne tryby pracy: SecurityReview, UXPolish, ReleaseCheck, DocsWriter albo wlasnie GrillMe. Dzieki temu AI staje sie mniej przypadkowym rozmowca, a bardziej narzedziem wpisanym w proces tworzenia produktu.'
    ],
    'AI Coding',
    array['Claude Code', 'skille', 'AI coding', 'workflow'],
    'Webaby Labs',
    'assets/software_development2.jpeg',
    '2026-06-03 00:00:00+00'
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  category = excluded.category,
  tags = excluded.tags,
  author_name = excluded.author_name,
  image_url = excluded.image_url,
  published_at = excluded.published_at,
  updated_at = now();
