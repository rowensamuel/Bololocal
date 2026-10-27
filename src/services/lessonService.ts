import { Lesson } from '../types/lesson';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockLessons } from '../data/mockData';
import { mockMultiLanguageLessons } from '../data/mockMultiLanguageLessons';
import { progressService } from './progressService';
import { queryCache, executeWithRetry } from '../utils/supabaseClientHelper';

const COMPLETED_LESSONS_PREFIX = 'bololocal_completed_lessons_';
const LESSONS_STORAGE_KEY = 'bololocal_custom_lessons';

const initialLessons: Lesson[] = [
  ...mockLessons.map((l) => ({ ...l, language_id: l.language_id || 'mr' })),
  ...mockMultiLanguageLessons,
];

const getStoredCustomLessons = (): Lesson[] => {
  try {
    if (typeof localStorage === 'undefined') return initialLessons;
    const raw = localStorage.getItem(LESSONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(initialLessons));
      return initialLessons;
    }
    return JSON.parse(raw);
  } catch {
    return initialLessons;
  }
};

const saveCustomLessons = (lessons: Lesson[]): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
    }
  } catch (e) {
    console.error('Failed to save custom lessons', e);
  }
};

export const lessonService = {
  getLessons: async (languageId?: string): Promise<Lesson[]> => {
    const cacheKey = `lessons:${languageId ? languageId.toLowerCase() : 'all'}`;

    return queryCache.getOrFetch(cacheKey, async () => {
      const localLessons = getStoredCustomLessons();

      if (!isSupabaseConfigured) {
        if (!languageId) return [...localLessons];
        const norm = languageId.toLowerCase();
        return localLessons.filter((l) => l.language_id?.toLowerCase() === norm);
      }

      try {
        let query = supabase.from('lessons').select('*').order('number');
        if (languageId) {
          query = query.eq('language_id', languageId.toLowerCase());
        }

        const { data, error }: any = await executeWithRetry(async () => await query);

        if (error) {
          console.warn('Supabase query error in getLessons, using local store:', error);
          if (!languageId) return localLessons;
          return localLessons.filter((l) => l.language_id?.toLowerCase() === languageId.toLowerCase());
        }

        if (!data || data.length === 0) {
          if (!languageId) return localLessons;
          return localLessons.filter((l) => l.language_id?.toLowerCase() === languageId.toLowerCase());
        }

        const dbLessons: Lesson[] = data.map((row: any) => ({
          id: row.id,
          courseId: row.course_id,
          language_id: row.language_id,
          number: row.number,
          title: row.title,
          marathiTitle: row.native_title || row.marathi_title,
          shortDescription: row.short_description || '',
          difficulty: row.difficulty || 'Beginner',
          durationMinutes: row.duration_minutes || 10,
          xpReward: row.xp_reward || 50,
          totalActivities: row.practice_exercises?.length || 5,
          completedActivities: 0,
          isLocked: row.is_locked || false,
          isCompleted: false,
          learnContent: row.learn_content || {
            summary: row.short_description || '',
            keyGrammarPoint: row.grammar_point || '',
          },
          vocabulary: row.vocabulary || [],
          exampleSentences: row.example_sentences || [],
          pronunciationTips: row.pronunciation_tips || [],
          practiceExercises: row.practice_exercises || [],
          associatedQuizId: row.associated_quiz_id,
          quizId: row.associated_quiz_id,
        }));

        const dbIds = new Set(dbLessons.map((l) => l.id));
        const merged = [
          ...dbLessons,
          ...localLessons.filter((l) => !dbIds.has(l.id) && (!languageId || l.language_id?.toLowerCase() === languageId.toLowerCase())),
        ];

        return merged;
      } catch (err) {
        console.warn('Network error in getLessons, using local store:', err);
        if (!languageId) return localLessons;
        return localLessons.filter((l) => l.language_id?.toLowerCase() === languageId.toLowerCase());
      }
    }, 60000);
  },

  getLessonsByLanguage: async (languageId?: string): Promise<Lesson[]> => {
    return lessonService.getLessons(languageId);
  },

  getLessonById: async (lessonId: string): Promise<Lesson | undefined> => {
    const all = await lessonService.getLessons();
    return all.find((l) => l.id === lessonId);
  },

  createLesson: async (data: Partial<Lesson>): Promise<Lesson> => {
    const id = data.id || `lesson-${data.language_id || 'mr'}-${Date.now().toString().slice(-4)}`;
    const newLesson: Lesson = {
      id,
      courseId: data.courseId || `course-${data.language_id || 'mr'}-foundation`,
      language_id: data.language_id || 'mr',
      number: data.number || String(Date.now().toString().slice(-2)),
      title: data.title || 'New Lesson Unit',
      marathiTitle: data.marathiTitle || data.title || '',
      shortDescription: data.shortDescription || '',
      difficulty: data.difficulty || 'Beginner',
      durationMinutes: data.durationMinutes || 15,
      xpReward: data.xpReward || 50,
      totalActivities: 5,
      completedActivities: 0,
      isLocked: false,
      isCompleted: false,
      learnContent: data.learnContent || {
        summary: data.shortDescription || '',
        keyGrammarPoint: '',
      },
      vocabulary: data.vocabulary || [],
      exampleSentences: data.exampleSentences || [],
      pronunciationTips: data.pronunciationTips || [],
      practiceExercises: data.practiceExercises || [],
      associatedQuizId: data.associatedQuizId,
      quizId: data.quizId,
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('lessons').insert({
          id: newLesson.id,
          course_id: newLesson.courseId,
          language_id: (newLesson.language_id || 'mr').toLowerCase(),
          number: newLesson.number,
          title: newLesson.title,
          native_title: newLesson.marathiTitle,
          short_description: newLesson.shortDescription,
          difficulty: newLesson.difficulty,
          duration_minutes: newLesson.durationMinutes,
          xp_reward: newLesson.xpReward,
          is_locked: newLesson.isLocked,
        });

        if (error) {
          console.warn('Supabase createLesson error, persisting locally:', error.message);
        }
      } catch (err) {
        console.warn('Error inserting lesson to Supabase:', err);
      }
    }

    const current = getStoredCustomLessons();
    const updated = [newLesson, ...current.filter((l) => l.id !== newLesson.id)];
    saveCustomLessons(updated);

    queryCache.invalidate('lessons');
    return newLesson;
  },

  updateLesson: async (id: string, updates: Partial<Lesson>): Promise<Lesson> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.marathiTitle) dbUpdates.native_title = updates.marathiTitle;
        if (updates.shortDescription) dbUpdates.short_description = updates.shortDescription;
        if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;
        if (updates.durationMinutes) dbUpdates.duration_minutes = updates.durationMinutes;
        if (updates.xpReward) dbUpdates.xp_reward = updates.xpReward;
        if (updates.number) dbUpdates.number = updates.number;

        const { error } = await supabase.from('lessons').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn(`Supabase updateLesson error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error updating lesson ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomLessons();
    const idx = current.findIndex((l) => l.id === id);
    const existing = idx >= 0 ? current[idx] : { id, title: 'Lesson', language_id: 'mr', number: '1', shortDescription: '', difficulty: 'Beginner', durationMinutes: 10, xpReward: 50, totalActivities: 5, completedActivities: 0, isLocked: false, isCompleted: false } as Lesson;
    const updatedLesson: Lesson = { ...existing, ...updates };

    if (idx >= 0) {
      current[idx] = updatedLesson;
    } else {
      current.unshift(updatedLesson);
    }
    saveCustomLessons(current);

    queryCache.invalidate('lessons');
    return updatedLesson;
  },

  deleteLesson: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deleteLesson error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting lesson ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomLessons();
    const filtered = current.filter((l) => l.id !== id);
    saveCustomLessons(filtered);

    queryCache.invalidate('lessons');
    return true;
  },

  markLessonCompleted: async (
    lessonId: string,
    userId?: string,
    languageId?: string
  ): Promise<boolean> => {
    const targetUser = userId || 'guest';
    const targetLang = languageId || 'mr';

    if (isSupabaseConfigured && userId && userId !== 'guest') {
      try {
        const { error } = await supabase.from('lesson_progress').upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            language_id: targetLang,
            is_completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        );

        if (error) {
          console.error('Failed to save lesson progress to Supabase:', error);
        }

        const completedIds = await lessonService.getCompletedLessonIdsAsync(userId, targetLang);
        if (!completedIds.includes(lessonId)) {
          completedIds.push(lessonId);
        }
        await progressService.updateLanguageProgress(userId, targetLang, {
          completed_lesson_ids: completedIds,
        });

        return true;
      } catch (err) {
        console.error('Error marking lesson completed in Supabase:', err);
        return false;
      }
    }

    // Local state tracking
    try {
      const storageKey = `${COMPLETED_LESSONS_PREFIX}${targetUser}_${targetLang}`;
      const stored = localStorage.getItem(storageKey);
      const completed: string[] = stored ? JSON.parse(stored) : [];

      if (!completed.includes(lessonId)) {
        completed.push(lessonId);
        localStorage.setItem(storageKey, JSON.stringify(completed));
      }

      if (userId) {
        await progressService.updateLanguageProgress(userId, targetLang, {
          completed_lesson_ids: completed,
        });
      }

      return true;
    } catch {
      return false;
    }
  },

  getCompletedLessonIdsAsync: async (userId: string, languageId: string): Promise<string[]> => {
    if (!isSupabaseConfigured || !userId || userId === 'guest') {
      return lessonService.getCompletedLessonIds(userId, languageId);
    }

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('language_id', languageId)
      .eq('is_completed', true);

    if (error) {
      console.error('Error fetching completed lessons from Supabase:', error);
      return [];
    }

    return (data || []).map((r: any) => r.lesson_id);
  },

  getCompletedLessonIds: (userId?: string, languageId?: string): string[] => {
    try {
      const targetUser = userId || 'guest';
      const targetLang = languageId || 'mr';
      const storageKey = `${COMPLETED_LESSONS_PREFIX}${targetUser}_${targetLang}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }

      if (userId === 'usr-test-marathi' && targetLang === 'mr') {
        return ['lesson-01', 'lesson-02'];
      }
      if (userId === 'usr-test-bengali' && targetLang === 'bn') {
        return ['lesson-bn-01'];
      }
      if (userId === 'usr-test-hindi' && targetLang === 'hi') {
        return ['lesson-hi-01'];
      }

      return [];
    } catch {
      return [];
    }
  },
};
