export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  marathiScript?: string;
  romanTransliteration?: string;
  meaning?: string;
  explanation?: string;
  suggestedReplies?: string[];
  timestamp: string;
}

export interface RolePlayScenario {
  id: string;
  language_id?: string;
  title: string;
  situation: string;
  description: string;
  partnerRole: string; // e.g. "Restaurant Waiter", "Auto Driver"
  userRole: string; // e.g. "Customer", "Passenger"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  initialAIMessage: string;
  initialAIRoman: string;
  initialAIMeaning: string;
  goal: string;
  suggestedPhrases: {
    marathi: string;
    roman: string;
    english: string;
  }[];
}

export interface RolePlayResult {
  vocabularyUsed: number;
  grammarAccuracy: number;
  mistakesCount: number;
  newPhrasesLearned: number;
  strengths: string[];
  improvementTips: string[];
}
