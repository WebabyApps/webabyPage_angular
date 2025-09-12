export type TutorialBlock =
  | { type: 'heading'; level?: 2 | 3 | 4; text: string }
  | { type: 'text'; html: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'gallery'; images: { src: string; alt: string; caption?: string }[] }
  | { type: 'steps'; items: { title?: string; html: string; img?: string }[] }
  | { type: 'youtube'; id: string; caption?: string; start?: number }
  | { type: 'link'; href: string; label: string; external?: boolean }
  | { type: 'divider' };

export interface TutorialContent {
  title?: string;
  intro?: string;
  blocks: TutorialBlock[];
  resources?: { label: string; href: string }[];
}
