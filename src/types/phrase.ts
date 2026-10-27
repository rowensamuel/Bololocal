export type SituationCategory =
  | 'College'
  | 'Restaurant'
  | 'Shopping'
  | 'Travel'
  | 'Auto / Taxi'
  | 'Railway Station'
  | 'Hospital'
  | 'Daily Conversation';

export interface UsefulPhrase {
  id: string;
  language_id?: string;
  marathi: string;
  roman: string;
  english: string;
  category: SituationCategory;
  context: string;
  culturalInsight?: string;
  audioKey?: string;
  tags: string[];
}

export interface SituationGuide {
  id: string;
  language_id?: string;
  title: string;
  category: SituationCategory;
  icon: string;
  description: string;
  colorAccent: string;
  phraseCount: number;
}
