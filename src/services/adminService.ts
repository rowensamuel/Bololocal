import { supabase, isSupabaseConfigured } from './supabase';
import { userService } from './userService';
import { languageService } from './languageService';
import { courseService } from './courseService';
import { lessonService } from './lessonService';
import { vocabularyService } from './vocabularyService';
import { phraseService } from './phraseService';

export const adminService = {
  getUsers: async () => {
    return userService.getUsers();
  },

  getLanguages: async () => {
    return languageService.getLanguages();
  },

  getCourses: async (languageId?: string) => {
    return courseService.getCourses(languageId);
  },

  getLessons: async (languageId?: string) => {
    return lessonService.getLessons(languageId);
  },

  getVocabulary: async (languageId?: string) => {
    return vocabularyService.getAllVocabulary(languageId);
  },

  getPhrases: async (languageId?: string) => {
    return phraseService.getPhrases(languageId);
  },

  getAnalyticsSummary: async () => {
    if (!isSupabaseConfigured) {
      const users = await userService.getUsers();
      return {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === 'active').length,
        adminCount: users.filter((u) => u.role === 'admin').length,
        totalLanguages: 8,
        totalCourses: 8,
        totalLessons: 16,
      };
    }

    try {
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: totalLanguages },
        { count: totalCourses },
        { count: totalLessons },
        { count: totalAttempts },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('languages').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalLanguages: totalLanguages || 0,
        totalCourses: totalCourses || 0,
        totalLessons: totalLessons || 0,
        totalQuizAttempts: totalAttempts || 0,
      };
    } catch (err) {
      console.error('Error fetching admin analytics summary:', err);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalLanguages: 8,
        totalCourses: 8,
        totalLessons: 16,
      };
    }
  },
};
