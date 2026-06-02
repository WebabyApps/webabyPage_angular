export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readingMinutes: number;
  imageUrl?: string;
  featured?: boolean;
};

export type MeetupEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string[];
  startsAt: string;
  location: string;
  capacity: number;
  tags: string[];
  signupCount?: number;
};

export type EventSignup = {
  eventId: string;
  name: string;
  email: string;
  createdAt: string;
};
