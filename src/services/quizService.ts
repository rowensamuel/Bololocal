import { Quiz, QuizAttempt } from '../types/quiz';
import { TimedQuiz, TimedQuizAttempt } from '../types/timedQuiz';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockQuizzes } from '../data/mockQuizzes';
import { achievementService } from './achievementService';
import { badgeService } from './badgeService';
import { progressService } from './progressService';
import { timedQuizService } from './timedQuizService';
import { Achievement } from '../types/achievement';
import { Badge } from '../types/badge';
import { queryCache, executeWithRetry } from '../utils/supabaseClientHelper';

const QUIZ_ATTEMPTS_STORAGE_PREFIX = 'bololocal_quiz_attempts_';
const PROCESSED_ATTEMPTS_KEY = 'bololocal_processed_attempt_ids';
const QUIZZES_STORAGE_KEY = 'bololocal_custom_quizzes';

const getStoredCustomQuizzes = (): Quiz[] => {
  try {
    if (typeof localStorage === 'undefined') return mockQuizzes;
    const raw = localStorage.getItem(QUIZZES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(mockQuizzes));
      return mockQuizzes;
    }
    return JSON.parse(raw);
  } catch {
    return mockQuizzes;
  }
};

const saveCustomQuizzes = (quizzes: Quiz[]): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
    }
  } catch (err) {
    console.error('Failed to save custom quizzes to local storage', err);
  }
};

const getProcessedAttemptIds = (): Set<string> => {
  try {
    if (typeof localStorage === 'undefined') return new Set();
    const raw = localStorage.getItem(PROCESSED_ATTEMPTS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const markAttemptProcessed = (attemptId: string) => {
  try {
    if (typeof localStorage === 'undefined') return;
    const set = getProcessedAttemptIds();
    set.add(attemptId);
    localStorage.setItem(PROCESSED_ATTEMPTS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error('Failed to mark attempt processed', err);
  }
};

export const quizService = {
  // Standard Quizzes
  getQuizzes: async (languageId?: string): Promise<Quiz[]> => {
    const cacheKey = `quizzes:${languageId ? languageId.toLowerCase() : 'all'}`;

    return queryCache.getOrFetch(cacheKey, async () => {
      const localQuizzes = getStoredCustomQuizzes();

      if (!isSupabaseConfigured) {
        if (!languageId) return [...localQuizzes];
        const norm = languageId.toLowerCase();
        return localQuizzes.filter((q) => q.language_id.toLowerCase() === norm);
      }

      try {
        let query = supabase.from('quizzes').select('*');
        if (languageId) {
          query = query.eq('language_id', languageId.toLowerCase());
        }

        const { data, error }: any = await executeWithRetry(async () => await query);

        if (error || !data || data.length === 0) {
          if (!languageId) return localQuizzes;
          return localQuizzes.filter((q) => q.language_id.toLowerCase() === languageId.toLowerCase());
        }

        const dbQuizzes: Quiz[] = data.map((row: any) => ({
          id: row.id,
          language_id: row.language_id,
          lessonId: row.lesson_id,
          title: row.title,
          description: row.description || '',
          difficulty: row.difficulty || 'Beginner',
          timeLimitSeconds: row.time_limit_seconds || 300,
          xpReward: row.xp_reward || 50,
          totalQuestions: row.total_questions || row.questions?.length || 5,
          questions: row.questions || [],
        }));

        const dbIds = new Set(dbQuizzes.map((q) => q.id));
        const merged = [
          ...dbQuizzes,
          ...localQuizzes.filter((q) => !dbIds.has(q.id) && (!languageId || q.language_id.toLowerCase() === languageId.toLowerCase())),
        ];

        return merged;
      } catch (err) {
        console.warn('Network error in getQuizzes, using local store:', err);
        return localQuizzes;
      }
    }, 60000);
  },

  getQuizById: async (quizId: string): Promise<Quiz | undefined> => {
    const all = await quizService.getQuizzes();
    return all.find((q) => q.id === quizId);
  },

  createQuiz: async (data: Partial<Quiz>): Promise<Quiz> => {
    const id = data.id || `quiz-${data.language_id || 'mr'}-${Date.now().toString().slice(-4)}`;
    const newQuiz: Quiz = {
      id,
      language_id: data.language_id || 'mr',
      lessonId: data.lessonId,
      title: data.title || 'New Assessment Quiz',
      description: data.description || 'Test vocabulary and grammar comprehension.',
      difficulty: data.difficulty || 'Beginner',
      timeLimitSeconds: data.timeLimitSeconds || 300,
      xpReward: data.xpReward || 50,
      totalQuestions: data.questions?.length || 5,
      questions: data.questions || [],
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('quizzes').insert({
          id: newQuiz.id,
          language_id: newQuiz.language_id.toLowerCase(),
          lesson_id: newQuiz.lessonId,
          title: newQuiz.title,
          description: newQuiz.description,
          difficulty: newQuiz.difficulty,
          time_limit_seconds: newQuiz.timeLimitSeconds,
          xp_reward: newQuiz.xpReward,
        });

        if (error) {
          console.warn('Supabase createQuiz error, persisting locally:', error.message);
        }
      } catch (err) {
        console.warn('Error creating quiz in Supabase:', err);
      }
    }

    const current = getStoredCustomQuizzes();
    const updated = [newQuiz, ...current.filter((q) => q.id !== newQuiz.id)];
    saveCustomQuizzes(updated);

    queryCache.invalidate('quizzes');
    return newQuiz;
  },

  updateQuiz: async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;
        if (updates.xpReward) dbUpdates.xp_reward = updates.xpReward;
        if (updates.timeLimitSeconds) dbUpdates.time_limit_seconds = updates.timeLimitSeconds;

        const { error } = await supabase.from('quizzes').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn(`Supabase updateQuiz error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error updating quiz ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomQuizzes();
    const idx = current.findIndex((q) => q.id === id);
    const existing = idx >= 0 ? current[idx] : { id, title: 'Quiz', language_id: 'mr', description: '', difficulty: 'Beginner', timeLimitSeconds: 300, xpReward: 50, totalQuestions: 5, questions: [] } as Quiz;
    const updatedQuiz: Quiz = { ...existing, ...updates };

    if (idx >= 0) {
      current[idx] = updatedQuiz;
    } else {
      current.unshift(updatedQuiz);
    }
    saveCustomQuizzes(current);

    queryCache.invalidate('quizzes');
    return updatedQuiz;
  },

  deleteQuiz: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('quizzes').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deleteQuiz error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting quiz ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomQuizzes();
    const filtered = current.filter((q) => q.id !== id);
    saveCustomQuizzes(filtered);

    queryCache.invalidate('quizzes');
    return true;
  },

  getQuizForLanguage: async (
    languageId: string,
    preferredQuizId?: string
  ): Promise<Quiz | undefined> => {
    const langQuizzes = await quizService.getQuizzes(languageId);
    if (langQuizzes.length === 0) return undefined;

    if (preferredQuizId) {
      const match = langQuizzes.find((q) => q.id === preferredQuizId);
      if (match && match.language_id.toLowerCase() === languageId.toLowerCase()) {
        return match;
      }
    }

    return langQuizzes.find((q) => q.language_id.toLowerCase() === languageId.toLowerCase()) || langQuizzes[0];
  },

  submitQuizAttempt: async (
    attempt: QuizAttempt
  ): Promise<{
    xpEarned: number;
    success: boolean;
    isDuplicate: boolean;
    newAchievements: Achievement[];
    newBadges: Badge[];
  }> => {
    const attemptId =
      attempt.id ||
      `${attempt.quizId || attempt.quiz_id || 'quiz'}-${attempt.completedAt || Date.now()}`;
    const processed = getProcessedAttemptIds();
    const isDuplicate = processed.has(attemptId);

    if (isDuplicate) {
      return {
        xpEarned: 0,
        success: true,
        isDuplicate: true,
        newAchievements: [],
        newBadges: [],
      };
    }

    markAttemptProcessed(attemptId);

    const userId = attempt.user_id || 'guest';
    const lang = attempt.language_id || 'mr';

    if (isSupabaseConfigured && userId !== 'guest' && !userId.startsWith('usr-test-')) {
      try {
        const { error } = await supabase.from('quiz_attempts').insert({
          user_id: userId,
          quiz_id: attempt.quizId || attempt.quiz_id,
          language_id: lang,
          score: attempt.score,
          total_questions: attempt.totalQuestions,
          correct_count: attempt.score,
          incorrect_count: Math.max(0, attempt.totalQuestions - attempt.score),
          xp_awarded: attempt.xpEarned,
          xp_earned: attempt.xpEarned,
          completed_at: attempt.completedAt || new Date().toISOString(),
        });

        if (error) {
          console.error('Failed to save quiz attempt to Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase quiz attempt insert error:', err);
      }
    }

    const storageKey = `${QUIZ_ATTEMPTS_STORAGE_PREFIX}${userId}`;
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        const list: QuizAttempt[] = stored ? JSON.parse(stored) : [];
        list.unshift(attempt);
        localStorage.setItem(storageKey, JSON.stringify(list));
      }
    } catch {}

    const prog = await progressService.getLanguageProgress(userId, lang);
    await progressService.updateLanguageProgress(userId, lang, {
      total_xp: prog.total_xp + attempt.xpEarned,
      quiz_attempts_count: prog.quiz_attempts_count + 1,
    });

    const accuracy = attempt.totalQuestions > 0 ? (attempt.score / attempt.totalQuestions) * 100 : 0;
    const newAchievements = await achievementService.evaluateAchievements(userId, {
      quizCount: prog.quiz_attempts_count + 1,
      accuracy,
      perfectScore: accuracy >= 100,
      streakDays: prog.streak_days,
      totalXp: prog.total_xp + attempt.xpEarned,
    });

    const newBadges = await badgeService.evaluateBadges(userId, {
      quizCount: prog.quiz_attempts_count + 1,
      accuracy,
      perfectScore: accuracy >= 100,
      streakDays: prog.streak_days,
    });

    return {
      xpEarned: attempt.xpEarned,
      success: true,
      isDuplicate: false,
      newAchievements,
      newBadges,
    };
  },

  // Timed Quizzes delegation
  getTimedQuizzes: (languageId?: string): Promise<TimedQuiz[]> => {
    return timedQuizService.getTimedQuizzes(languageId);
  },

  getTimedQuizById: (timedQuizId: string): Promise<TimedQuiz | undefined> => {
    return timedQuizService.getTimedQuizById(timedQuizId);
  },

  getTimedQuizForLanguage: (languageId: string, preferredId?: string): Promise<TimedQuiz | undefined> => {
    return timedQuizService.getTimedQuizForLanguage(languageId, preferredId);
  },

  submitTimedQuizAttempt: (
    attempt: TimedQuizAttempt
  ): Promise<{
    attempt: TimedQuizAttempt;
    success: boolean;
    isDuplicate: boolean;
    newAchievements: Achievement[];
    newBadges: Badge[];
  }> => {
    return timedQuizService.submitTimedQuizAttempt(attempt);
  },

  getUserTimedAttempts: (userId?: string): Promise<TimedQuizAttempt[]> => {
    return timedQuizService.getUserTimedAttempts(userId);
  },

  getAllAchievements: (): Promise<Achievement[]> => {
    return achievementService.getAllAchievements();
  },

  getAllBadges: (): Promise<Badge[]> => {
    return badgeService.getAllBadges();
  },
};
