export type CardProduct = {
  id: string;
  slug: string;
  img: string;
  appUrl?: string;
  detailsUrl?: string;
};

export const PRODUCTS: CardProduct[] = [
  { id: 'bubbleWord',       slug: 'bubble-world',        img: 'assets/bubble.jpg',        appUrl: 'https://webaby.io/details/bubble-word' },
  { id: 'basketballShots',  slug: 'basketball-shots',    img: 'assets/basket.jpg',        appUrl: 'https://play.google.com/store/apps/details?id=com.basketballshots.app&hl=pl' },
  { id: 'equationsTrainer', slug: 'system-of-equations', img: 'assets/equations.jpg',     appUrl: 'https://lucky-draw.webaby.io' },
  { id: 'abcLand',          slug: 'abc-land',            img: 'assets/scene1.jpg',        appUrl: 'https://play.google.com/store/apps/details?id=abecadlowo.webaby.io' },
  { id: 'luckyDraw',        slug: 'lucky-draw',          img: 'assets/lucky_draw.png',    appUrl: 'https://lucky-draw.webaby.io' },
  { id: 'bibbleEcho',       slug: 'bibble-echo',         img: 'assets/bibble_echo2.jpeg', appUrl: 'https://biblecho.webaby.io/' },
  { id: 'socialmigrateai',  slug: 'socialmigrateai',     img: 'assets/socialmigrateai.jpg', appUrl: 'https://socialmigrateai.webaby.io/' },
  { id: 'musiccolours',     slug: 'music-colours',       img: 'assets/tutorials/music-colours/Music_colours_icon.png', appUrl: 'https://musiccolours.webaby.io' },
  { id: 'freeride',         slug: 'free-ride',           img: 'assets/tutorials/freeride/icon.png', appUrl: 'https://freeride.webaby.io' }
];

export function getAppUrlBySlug(slug?: string): string | undefined {
  return PRODUCTS.find(p => p.slug === slug)?.appUrl;
}
