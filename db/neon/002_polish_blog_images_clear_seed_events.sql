alter table public.blog_posts
  add column if not exists image_url text;

update public.blog_posts
set
  title = 'Aplikacje agentowe w 2026: od chatbota do prawdziwego workflow',
  excerpt = 'Agenci AI wychodza poza okno chatu i zaczynaja obslugiwac konkretne procesy: planowanie, narzedzia, pamiec, zgody i telemetryke.',
  body = array[
    'Najciekawsze produkty AI nie sa juz tylko rozmowa z modelem. Coraz czesciej sa systemami workflow, w ktorych agent potrafi dobrac kontekst, wywolac narzedzie, poprosic o akceptacje i przekazac zadanie dalej.',
    'Dla aplikacji webowych i mobilnych oznacza to zmiane projektowania. Zamiast wielkiego pola tekstowego warto budowac male, pewne akcje, ktore usuwaja powtarzalna koordynacje.',
    'Najlepszy start to waskie agenty z jasnymi uprawnieniami, logami dzialan i kontrola czlowieka.'
  ],
  category = 'Agenci AI',
  tags = array['AI agents', 'automatyzacja', 'product design'],
  image_url = 'assets/futere_technology.jpeg'
where slug = 'agentic-apps-2026';

update public.blog_posts
set
  title = 'Serwery MCP jako nowa warstwa integracji dla narzedzi AI',
  excerpt = 'Model Context Protocol pomaga laczyc modele AI z narzedziami, zasobami i promptami w bardziej przewidywalny sposob.',
  body = array[
    'MCP staje sie praktycznym mostem pomiedzy modelami jezykowymi a systemami biznesowymi. Zamiast pisac osobna integracje dla kazdego asystenta, zespol moze wystawic narzedzia i zasoby przez jeden serwer MCP.',
    'To wazne, bo oddziela interfejs AI od logiki produktu. CRM, archiwum dokumentow, panel analityczny albo proces wewnetrzny moga udostepniac stabilne mozliwosci dla roznych agentow.',
    'Architektonicznie warto traktowac MCP jak produkcyjne API: z autoryzacja, limitami, logami audytu i opisami narzedzi, ktore trudno zle zinterpretowac.'
  ],
  category = 'MCP',
  tags = array['MCP', 'integracje', 'AI tooling'],
  image_url = 'assets/software_development.jpeg'
where slug = 'mcp-servers-product-architecture';

update public.blog_posts
set
  title = 'SEO dla Angular SSR: co naprawde ma znaczenie',
  excerpt = 'SSR daje crawlerom HTML, ale widocznosc zalezy tez od jakosci tresci, metadanych, linkow wewnetrznych i wydajnosci.',
  body = array[
    'Server-side rendering rozwiazuje wazny problem: roboty i podglady social media widza prawdziwy HTML. Ale sam SSR nie jest strategia pozycjonowania.',
    'Dobry setup SEO w Angularze obejmuje unikalne tytuly i opisy, canonicale, structured data, sitemap, dostepne naglowki, opisowe linki i szybkie strony.',
    'Architektura tresci tez ma znaczenie. Blog, tutoriale produktowe i huby tematyczne pomagaja wyszukiwarkom zrozumiec, czym zajmuje sie strona.'
  ],
  category = 'SEO',
  tags = array['Angular', 'SSR', 'SEO'],
  image_url = 'assets/hero-bg.jpg'
where slug = 'seo-for-ssr-angular-apps';

delete from public.meetup_events
where slug in (
  'ai-agents-for-products',
  'angular-ssr-seo-workshop',
  'mobile-ai-patterns'
);
