export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  icon?: React.ReactNode;
  category: 'milestone' | 'streak' | 'accuracy' | 'special';
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
  xpBonus?: number;
}

export interface DailyActivity {
  day: string; // e.g. 'Mon', 'Tue'
  date: string;
  minutesSpent: number;
  xpEarned: number;
  completed: boolean;
}

export interface UserProgress {
  userId: string;
  streakDays: number;
  totalXp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  completedLessonsCount: number;
  masteredWordsCount: number;
  accuracyRate: number;
  weeklyActivities: DailyActivity[];
  recentActivities: {
    id: string;
    title: string;
    type: 'lesson' | 'quiz' | 'vocabulary' | 'ai_practice';
    scoreOrWords?: string;
    timeAgo: string;
    xpEarned: number;
  }[];
}

export interface UserLanguageProgress {
  id: string;
  user_id: string;
  language_id: string;
  total_xp: number;
  streak_days: number;
  level: number;
  level_title: string;
  completed_lesson_ids: string[];
  bookmarked_vocab_ids: string[];
  bookmarked_phrase_ids: string[];
  quiz_attempts_count: number;
  timed_quiz_attempts_count: number;
  last_active_at: string;
}

