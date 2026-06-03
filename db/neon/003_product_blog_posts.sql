insert into public.blog_posts
  (slug, title, excerpt, body, category, tags, author_name, image_url, published_at)
values
  (
    'docuflow-ksef-company-workflow',
    'DocuFlow jest juz online: dokumenty firmowe, workflow i KSeF w jednym miejscu',
    'Udalo sie wrzucic DocuFlow, aplikacje Webaby ulatwiajaca obsluge firmy, dokumentow i procesow zwiazanych z KSeF.',
    array[
      'DocuFlow to aplikacja Webaby przygotowana z mysla o firmach, ktore chca uporzadkowac dokumenty, platnosci, kontrahentow i codzienne procesy administracyjne.',
      'Najwazniejszy kierunek produktu to praktyczna obsluga firmy: mniej rozproszonych plikow, mniej recznego sprawdzania statusow i czytelniejszy przeplyw informacji pomiedzy dokumentami.',
      'Szczegolnie waznym elementem jest przygotowanie pod realia KSeF. DocuFlow ma pomagac w pracy z fakturami, komunikatami, bledami i procesami, ktore w wielu firmach szybko staja sie powtarzalnym obciazeniem.'
    ],
    'Produkty Webaby',
    array['DocuFlow', 'KSeF', 'firma', 'workflow'],
    'Webaby Labs',
    'assets/tutorials/docuflow/carousel-banner.png',
    '2026-06-03 00:00:00+00'
  ),
  (
    'planetlingua-language-learning-app',
    'PlanetLingua: nauka jezykow w kosmicznym stylu',
    'PlanetLingua trafila do ekosystemu Webaby jako aplikacja do nauki jezykow przez lekkie lekcje, powtorki i interaktywny rytm pracy.',
    array[
      'PlanetLingua powstala jako aplikacja do nauki jezykow, ktora ma byc bardziej przyjazna niz klasyczna lista slowek. Lekcje sa krotkie, wizualne i osadzone w lekkim kosmicznym klimacie.',
      'W tutorialach widac najwazniejsze czesci produktu: wybor jezyka, profil ucznia, sesje nauki, zdania, liczby, sluchanie i elementy bonusowe.',
      'To dobry przyklad kierunku Webaby: edukacja powinna byc konkretna, ale nie musi byc sucha. Produkt ma pomagac wracac do nauki regularnie, bez poczucia ciezkiej platformy szkoleniowej.'
    ],
    'Produkty Webaby',
    array['PlanetLingua', 'edukacja', 'jezyki', 'mobile learning'],
    'Webaby Labs',
    'assets/tutorials/planetlingua/planet-header.png',
    '2026-06-03 00:00:00+00'
  ),
  (
    'music-colours-creative-learning',
    'Music Colours: kreatywna aplikacja Webaby do laczenia dzwieku i kolorow',
    'Music Colours pokazuje bardziej kreatywna strone Webaby: prosta aplikacje, ktora laczy muzyke, kolory i intuicyjna zabawe.',
    array[
      'Music Colours to mniejszy, ale bardzo charakterystyczny produkt Webaby. Zamiast rozbudowanego panelu stawia na proste doswiadczenie: kolory, dzwieki i szybka reakcje uzytkownika.',
      'Takie aplikacje sa wazne, bo pozwalaja testowac pomysly edukacyjne i sensoryczne bez nadmiaru funkcji. Uzytkownik od razu widzi, co moze zrobic, i moze zaczac eksperymentowac.',
      'W praktyce Music Colours pasuje do portfolio jako lekka aplikacja kreatywna: dobra do zabawy, nauki skojarzen i budowania bardziej angazujacych interakcji.'
    ],
    'Produkty Webaby',
    array['Music Colours', 'kreatywnosc', 'muzyka', 'edukacja'],
    'Webaby Labs',
    'assets/tutorials/music-colours/Music_colours_icon.png',
    '2026-06-03 00:00:00+00'
  ),
  (
    'freeride-sharing-rides-webaby',
    'FreeRide: aplikacja Webaby do umawiania wspolnych przejazdow',
    'FreeRide porzadkuje prosty, codzienny problem: znalezienie przejazdu, zaoferowanie miejsca i dogadanie szczegolow bez chaosu w wiadomosciach.',
    array[
      'FreeRide to aplikacja Webaby zbudowana wokol bardzo praktycznego scenariusza: ktos ma wolne miejsce w aucie, ktos inny szuka przejazdu, a obie strony potrzebuja prostego sposobu na dogadanie szczegolow.',
      'Tutorial pokazuje podstawowe akcje: znalezienie przejazdu, zaoferowanie trasy, rezerwacje miejsca i zarzadzanie profilem.',
      'Najwieksza wartosc FreeRide nie polega na skomplikowanej funkcji, tylko na usunieciu tarcia. Zamiast rozproszonych ustalen w czacie, uzytkownik ma jasny przeplyw i konkretne informacje.'
    ],
    'Produkty Webaby',
    array['FreeRide', 'transport', 'mobile app', 'community'],
    'Webaby Labs',
    'assets/tutorials/freeride/icon.png',
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
