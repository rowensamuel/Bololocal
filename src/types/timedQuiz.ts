import { QuizQuestion } from './quiz';

export type TimedQuizMode = 'Quick Challenge' | 'Speed Round' | 'Language Sprint';

export interface TimedQuiz {
  id: string;
  title: string;
  description: string;
  language_id: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  mode: TimedQuizMode;
  question_count: number;
  time_limit_seconds: number;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions?: QuizQuestion[];
}

export interface TimedQuizAttempt {
  id: string;
  user_id: string;
  timed_quiz_id: string;
  language_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  time_limit_seconds: number;
  time_taken_seconds: number;
  time_remaining_seconds: number;
  completed: boolean;
  xp_earned: number;
  accuracy_percentage: number;
  started_at: string;
  completed_at: string;
  user_answers?: {
    question_id: string;
    selected_option_index: number | null;
    is_correct: boolean;
  }[];
}
