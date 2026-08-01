export interface Contact {
  id: string;
  name: string;
  avatarUrl: string;
  demo?: boolean;
}

export type Screen = 'loading' | 'cover' | 'empty' | 'error' | 'round' | 'reveal' | 'result';

export interface RoundResult {
  contact: Contact;
  attempt: number;
  score: number;
}
