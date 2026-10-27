import { ProficiencyLevel } from './user';

export type LessonDifficulty = ProficiencyLevel;
export type LessonStepType = 'learn' | 'vocabulary' | 'sentences' | 'pronunciation' | 'practice' | 'quiz';

export interface VocabularyItem {
  id: string;
  language_id?: string;
  marathi: string;
  roman: string;
  english: string;
  hindi?: string;
  category: string;
  difficulty: ProficiencyLevel;
  exampleSentence?: string;
  exampleRoman?: string;
  exampleEnglish?: string;
  lessonId?: string;
}

export interface ExampleSentence {
  id: string;
  marathi: string;
  roman: string;
  english: string;
  context: string;
}

export interface PracticeExercise {
  id: string;
  type: 'arrange' | 'match' | 'speak';
  prompt: string;
  targetMarathi: string;
  targetRoman: string;
  targetEnglish: string;
  options?: string[];
  correctAnswer: string;
}

export interface LessonDialogueTurn {
  speaker: string;
  marathi: string;
  roman: string;
  english: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  language_id?: string;
  number: string;
  title: string;
  marathiTitle?: string;
  shortDescription: string;
  difficulty: ProficiencyLevel;
  durationMinutes: number;
  xpReward?: number;
  totalActivities: number;
  completedActivities: number;
  isLocked: boolean;
  isCompleted: boolean;
  learningObjectives?: string[];
  usefulPhrases?: any[];
  dialogue?: LessonDialogueTurn[];
  summaryTakeaways?: string[];
  culturalTip?: string;
  learnContent: {
    summary: string;
    culturalNote?: string;
    keyGrammarPoint: string;
  };
  vocabulary: VocabularyItem[];
  exampleSentences: ExampleSentence[];
  pronunciationTips: {
    sound: string;
    description: string;
    practiceWords: string[];
  }[];
  practiceExercises: PracticeExercise[];
  associatedQuizId?: string;
  quizId?: string;
}

