import type { Contact } from './types';

export const DEMO_CONTACTS: Contact[] = [
  { id: 'demo-amara', name: 'Amara', avatarUrl: './demo/amara.webp', demo: true },
  { id: 'demo-owen', name: 'Owen', avatarUrl: './demo/owen.webp', demo: true },
  { id: 'demo-sofia', name: 'Sofia', avatarUrl: './demo/sofia.webp', demo: true },
  { id: 'demo-dev', name: 'Dev', avatarUrl: './demo/dev.webp', demo: true },
  { id: 'demo-claire', name: 'Claire', avatarUrl: './demo/claire.webp', demo: true },
  { id: 'demo-malik', name: 'Malik', avatarUrl: './demo/malik.webp', demo: true },
];

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
