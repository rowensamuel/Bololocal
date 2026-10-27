import { TimedQuiz, TimedQuizAttempt } from '../types/timedQuiz';
import { QuizQuestion } from '../types/quiz';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockTimedQuizzes } from '../data/mockTimedQuizzes';
import { achievementService } from './achievementService';
import { badgeService } from './badgeService';
import { progressService } from './progressService';
import { Achievement } from '../types/achievement';
import { Badge } from '../types/badge';

const TIMED_ATTEMPTS_STORAGE_PREFIX = 'bololocal_timed_attempts_';
const PROCESSED_ATTEMPTS_KEY = 'bololocal_processed_timed_attempt_ids';

const getProcessedAttemptIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(PROCESSED_ATTEMPTS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const markAttemptProcessed = (attemptId: string) => {
  try {
    const set = getProcessedAttemptIds();
    set.add(attemptId);
    localStorage.setItem(PROCESSED_ATTEMPTS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error('Failed to mark attempt processed', err);
  }
};

const mapRowToQuestion = (q: any): QuizQuestion => ({
  id: q.id,
  language_id: q.language_id,
  type: (q.type as any) || 'multiple-choice',
  prompt: q.prompt,
  question: q.prompt,
  marathiPrompt: q.native_prompt || q.prompt,
  romanPrompt: q.roman_prompt || '',
  englishPrompt: q.prompt,
  options: Array.isArray(q.options)
    ? q.options
    : typeof q.options === 'string'
    ? JSON.parse(q.options)
    : [],
  correctAnswer: q.correct_answer,
  correctOptionIndex: q.correct_option_index ?? 0,
  explanation: q.explanation || `Correct answer: ${q.correct_answer}`,
});

export const timedQuizService = {
  getTimedQuizzes: async (languageId?: string): Promise<TimedQuiz[]> => {
    if (!isSupabaseConfigured) {
      if (!languageId) return [...mockTimedQuizzes];
      const norm = languageId.toLowerCase();
      return mockTimedQuizzes.filter((tq) => tq.language_id.toLowerCase() === norm);
    }

    try {
      let query = supabase.from('timed_quizzes').select('*').eq('is_active', true);
      if (languageId) {
        query = query.eq('language_id', languageId.toLowerCase());
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        if (error) console.warn('Supabase query error in getTimedQuizzes, using fallback:', error);
        if (!languageId) return [...mockTimedQuizzes];
        const norm = languageId.toLowerCase();
        return mockTimedQuizzes.filter((tq) => tq.language_id.toLowerCase() === norm);
      }

      // Fetch questions for all retrieved quizzes
      const quizIds = data.map((row: any) => row.id);
      const { data: qData } = await supabase
        .from('timed_quiz_questions')
        .select('*')
        .in('timed_quiz_id', quizIds);

      const questionsByQuizId: Record<string, QuizQuestion[]> = {};
      if (qData) {
        for (const row of qData) {
          if (!questionsByQuizId[row.timed_quiz_id]) {
            questionsByQuizId[row.timed_quiz_id] = [];
          }
          questionsByQuizId[row.timed_quiz_id].push(mapRowToQuestion(row));
        }
      }

      return data.map((row: any) => {
        let questions = questionsByQuizId[row.id] || [];
        const mockFallback = mockTimedQuizzes.find(
          (tq) => tq.id === row.id || tq.language_id.toLowerCase() === row.language_id.toLowerCase()
        );

        if (questions.length === 0 && mockFallback && mockFallback.questions) {
          questions = [...mockFallback.questions];
        } else if (mockFallback && mockFallback.questions && questions.length < (row.question_count || 5)) {
          const existingPrompts = new Set(questions.map((q) => q.prompt));
          for (const mockQ of mockFallback.questions) {
            if (!existingPrompts.has(mockQ.prompt)) {
              questions.push(mockQ);
              if (questions.length >= (row.question_count || 5)) break;
            }
          }
        }

        return {
          id: row.id,
          title: row.title,
          description: row.description || '',
          language_id: row.language_id,
          difficulty: row.difficulty || 'Beginner',
          mode: row.mode || 'Quick Challenge',
          question_count: questions.length || row.question_count || 5,
          time_limit_seconds: row.time_limit_seconds || 30,
          xp_reward: row.xp_reward || 60,
          is_active: row.is_active,
          created_at: row.created_at,
          updated_at: row.updated_at,
          questions,
        };
      });
    } catch (err) {
      console.error('Unexpected error in getTimedQuizzes, falling back:', err);
      if (!languageId) return [...mockTimedQuizzes];
      const norm = languageId.toLowerCase();
      return mockTimedQuizzes.filter((tq) => tq.language_id.toLowerCase() === norm);
    }
  },

  getTimedQuizById: async (timedQuizId: string): Promise<TimedQuiz | undefined> => {
    if (!isSupabaseConfigured) {
      return mockTimedQuizzes.find((tq) => tq.id === timedQuizId);
    }

    try {
      const { data, error } = await supabase
        .from('timed_quizzes')
        .select('*')
        .eq('id', timedQuizId)
        .maybeSingle();

      if (error) {
        console.warn(`Supabase error fetching timed quiz ${timedQuizId}, using fallback:`, error);
        return mockTimedQuizzes.find((tq) => tq.id === timedQuizId);
      }

      if (!data) {
        return mockTimedQuizzes.find((tq) => tq.id === timedQuizId);
      }

      // Fetch questions from timed_quiz_questions
      let questions: QuizQuestion[] = [];
      const { data: qData, error: qError } = await supabase
        .from('timed_quiz_questions')
        .select('*')
        .eq('timed_quiz_id', timedQuizId);

      if (!qError && qData && qData.length > 0) {
        questions = qData.map(mapRowToQuestion);
      }

      // If database questions are empty or sparse, supplement with matching mock questions
      const mockFallback = mockTimedQuizzes.find(
        (tq) => tq.id === timedQuizId || tq.language_id.toLowerCase() === data.language_id.toLowerCase()
      );

      if (questions.length === 0 && mockFallback && mockFallback.questions) {
        questions = [...mockFallback.questions];
      } else if (mockFallback && mockFallback.questions && questions.length < (data.question_count || 5)) {
        const existingPrompts = new Set(questions.map((q) => q.prompt));
        for (const mockQ of mockFallback.questions) {
          if (!existingPrompts.has(mockQ.prompt)) {
            questions.push(mockQ);
            if (questions.length >= (data.question_count || 5)) break;
          }
        }
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        language_id: data.language_id,
        difficulty: data.difficulty || 'Beginner',
        mode: data.mode || 'Quick Challenge',
        question_count: questions.length || data.question_count || 5,
        time_limit_seconds: data.time_limit_seconds || 30,
        xp_reward: data.xp_reward || 60,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        questions,
      };
    } catch (err) {
      console.error(`Unexpected error in getTimedQuizById, falling back:`, err);
      return mockTimedQuizzes.find((tq) => tq.id === timedQuizId);
    }
  },

  getTimedQuizForLanguage: async (
    languageId: string,
    preferredId?: string
  ): Promise<TimedQuiz | undefined> => {
    const list = await timedQuizService.getTimedQuizzes(languageId);
    if (list.length > 0) {
      if (preferredId) {
        const match = list.find(
          (tq) => tq.id === preferredId && (tq.questions?.length ?? 0) > 0
        );
        if (match && match.language_id.toLowerCase() === languageId.toLowerCase()) {
          return match;
        }
      }

      // Guarantees selected quiz matches user learning_language_id and has questions
      const matchingWithQuestions = list.find(
        (tq) =>
          tq.language_id.toLowerCase() === languageId.toLowerCase() &&
          (tq.questions?.length ?? 0) > 0
      );
      if (matchingWithQuestions) return matchingWithQuestions;
    }

    // Direct mock fallback if no quiz with questions was found
    const norm = languageId.toLowerCase();
    const mockMatch =
      mockTimedQuizzes.find(
        (tq) =>
          tq.language_id.toLowerCase() === norm && (tq.questions?.length ?? 0) > 0
      ) ||
      mockTimedQuizzes.find((tq) => (tq.questions?.length ?? 0) > 0);

    return mockMatch;
  },

  submitTimedQuizAttempt: async (
    attempt: TimedQuizAttempt
  ): Promise<{
    attempt: TimedQuizAttempt;
    success: boolean;
    isDuplicate: boolean;
    newAchievements: Achievement[];
    newBadges: Badge[];
  }> => {
    const processed = getProcessedAttemptIds();
    const isDuplicate = processed.has(attempt.id);

    if (isDuplicate) {
      return {
        attempt: { ...attempt, xp_earned: 0 },
        success: true,
        isDuplicate: true,
        newAchievements: [],
        newBadges: [],
      };
    }

    markAttemptProcessed(attempt.id);

    const userId = attempt.user_id || 'guest';
    const lang = attempt.language_id || 'mr';

    // Store in PostgreSQL database if Supabase is connected
    if (isSupabaseConfigured && userId !== 'guest' && !userId.startsWith('usr-test-')) {
      try {
        const { error } = await supabase.from('timed_quiz_attempts').insert({
          user_id: userId,
          timed_quiz_id: attempt.timed_quiz_id,
          language_id: lang,
          score: attempt.score,
          total_questions: attempt.total_questions,
          correct_answers: attempt.correct_answers,
          incorrect_answers: attempt.incorrect_answers,
          unanswered: attempt.unanswered || 0,
          time_limit_seconds: attempt.time_limit_seconds,
          time_taken_seconds: attempt.time_taken_seconds,
          time_remaining_seconds: attempt.time_remaining_seconds || 0,
          completed: attempt.completed,
          xp_awarded: attempt.xp_earned,
          xp_earned: attempt.xp_earned,
          accuracy_percentage: attempt.total_questions > 0 ? Math.round((attempt.correct_answers / attempt.total_questions) * 100) : 0,
          started_at: attempt.started_at,
          completed_at: attempt.completed_at || new Date().toISOString(),
        });

        if (error) {
          console.error('Failed to save timed quiz attempt to Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase timed quiz insert error:', err);
      }
    }

    // Save to local cache
    const storageKey = `${TIMED_ATTEMPTS_STORAGE_PREFIX}${userId}`;
    try {
      const stored = localStorage.getItem(storageKey);
      const attempts: TimedQuizAttempt[] = stored ? JSON.parse(stored) : [];
      attempts.unshift(attempt);
      localStorage.setItem(storageKey, JSON.stringify(attempts));
    } catch {}

    // Update language progress
    const prog = await progressService.getLanguageProgress(userId, lang);
    await progressService.updateLanguageProgress(userId, lang, {
      total_xp: prog.total_xp + attempt.xp_earned,
      timed_quiz_attempts_count: prog.timed_quiz_attempts_count + 1,
    });

    // Evaluate achievements and badges idempotently
    const newAchievements = await achievementService.evaluateAchievements(userId, {
      timedQuizCount: prog.timed_quiz_attempts_count + 1,
      accuracy: attempt.accuracy_percentage,
      perfectScore: attempt.accuracy_percentage >= 100,
      streakDays: prog.streak_days,
      totalXp: prog.total_xp + attempt.xp_earned,
    });

    const newBadges = await badgeService.evaluateBadges(userId, {
      accuracy: attempt.accuracy_percentage,
      perfectScore: attempt.accuracy_percentage >= 100,
      streakDays: prog.streak_days,
    });

    return {
      attempt,
      success: true,
      isDuplicate: false,
      newAchievements,
      newBadges,
    };
  },

  createTimedQuiz: async (data: Partial<TimedQuiz>): Promise<TimedQuiz> => {
    const id = data.id || `timed-quiz-${data.language_id || 'mr'}-${Date.now().toString().slice(-4)}`;
    const newTq: TimedQuiz = {
      id,
      title: data.title || 'New Timed Speed Challenge',
      description: data.description || 'Rapid-fire quiz challenge.',
      language_id: data.language_id || 'mr',
      difficulty: data.difficulty || 'Beginner',
      mode: data.mode || 'Quick Challenge',
      question_count: data.questions?.length || data.question_count || 5,
      time_limit_seconds: data.time_limit_seconds || 30,
      xp_reward: data.xp_reward || 60,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: data.questions || [],
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('timed_quizzes').insert({
          id: newTq.id,
          title: newTq.title,
          description: newTq.description,
          language_id: newTq.language_id.toLowerCase(),
          difficulty: newTq.difficulty,
          mode: newTq.mode,
          question_count: newTq.question_count,
          time_limit_seconds: newTq.time_limit_seconds,
          xp_reward: newTq.xp_reward,
          is_active: newTq.is_active,
        });

        if (error) {
          console.warn('Supabase createTimedQuiz error, persisting locally:', error.message);
        }
      } catch (err) {
        console.warn('Error creating timed quiz in Supabase:', err);
      }
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const key = 'bololocal_custom_timed_quizzes';
        const stored = localStorage.getItem(key);
        const list: TimedQuiz[] = stored ? JSON.parse(stored) : [];
        list.unshift(newTq);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch {}

    return newTq;
  },

  updateTimedQuiz: async (id: string, updates: Partial<TimedQuiz>): Promise<TimedQuiz> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.time_limit_seconds) dbUpdates.time_limit_seconds = updates.time_limit_seconds;
        if (updates.xp_reward) dbUpdates.xp_reward = updates.xp_reward;
        if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;
        if (updates.mode) dbUpdates.mode = updates.mode;

        const { error } = await supabase.from('timed_quizzes').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn(`Supabase updateTimedQuiz error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error updating timed quiz ${id} in Supabase:`, err);
      }
    }

    const current = await timedQuizService.getTimedQuizById(id);
    const updated: TimedQuiz = { ...(current || { id, title: 'Timed Quiz', language_id: 'mr', question_count: 5, time_limit_seconds: 30, xp_reward: 60, difficulty: 'Beginner', mode: 'Quick Challenge', is_active: true } as TimedQuiz), ...updates };
    return updated;
  },

  deleteTimedQuiz: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('timed_quizzes').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deleteTimedQuiz error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting timed quiz ${id} in Supabase:`, err);
      }
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const key = 'bololocal_custom_timed_quizzes';
        const stored = localStorage.getItem(key);
        if (stored) {
          const list: TimedQuiz[] = JSON.parse(stored);
          localStorage.setItem(key, JSON.stringify(list.filter((tq) => tq.id !== id)));
        }
      }
    } catch {}

    return true;
  },

  getUserTimedAttempts: async (userId?: string): Promise<TimedQuizAttempt[]> => {
    if (!userId) return [];

    if (isSupabaseConfigured && userId !== 'guest' && !userId.startsWith('usr-test-')) {
      const { data, error } = await supabase
        .from('timed_quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          timed_quiz_id: r.timed_quiz_id,
          language_id: r.language_id,
          score: r.score,
          total_questions: r.total_questions,
          correct_answers: r.correct_answers,
          incorrect_answers: r.incorrect_answers,
          unanswered: r.unanswered,
          time_limit_seconds: r.time_limit_seconds,
          time_taken_seconds: r.time_taken_seconds,
          time_remaining_seconds: r.time_remaining_seconds,
          completed: r.completed,
          xp_earned: r.xp_awarded,
          accuracy_percentage: r.total_questions > 0 ? (r.correct_answers / r.total_questions) * 100 : 0,
          started_at: r.started_at,
          completed_at: r.completed_at,
        }));
      }
    }

    try {
      const storageKey = `${TIMED_ATTEMPTS_STORAGE_PREFIX}${userId}`;
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
