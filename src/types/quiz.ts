export type QuestionType = 'multiple-choice' | 'translation' | 'fill-in-the-blank' | 'audio-listening';

export interface QuizQuestion {
  id: string;
  language_id?: string;
  type: QuestionType;
  prompt: string;
  question?: string;
  marathiPrompt?: string;
  romanPrompt?: string;
  englishPrompt?: string;
  audioPrompt?: string;
  options: string[];
  correctAnswer: string;
  correctOptionIndex?: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  language_id: string;
  lessonId?: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  xpReward: number;
  timeLimitSeconds?: number;
  totalQuestions?: number;
  difficulty?: string;
}

export interface QuizAttempt {
  id?: string;
  user_id?: string;
  language_id?: string;
  quizId?: string;
  quiz_id?: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  timeSpentSeconds?: number;
  userAnswers?: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
  completedAt: string;
}
