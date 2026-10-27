import { Course } from '../types/course';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockCourses } from '../data/mockData';
import { multiLanguageCourses } from '../data/mockLanguageContent';
import { queryCache, executeWithRetry } from '../utils/supabaseClientHelper';

const COURSES_STORAGE_KEY = 'bololocal_custom_courses';

const initialCourses: Course[] = [
  ...mockCourses.map((c) => ({ ...c, language_id: c.language_id || 'mr' })),
  ...multiLanguageCourses,
];

const getStoredCustomCourses = (): Course[] => {
  try {
    if (typeof localStorage === 'undefined') return initialCourses;
    const raw = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(initialCourses));
      return initialCourses;
    }
    return JSON.parse(raw);
  } catch {
    return initialCourses;
  }
};

const saveCustomCourses = (courses: Course[]): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    }
  } catch (e) {
    console.error('Failed to save custom courses', e);
  }
};

export const courseService = {
  getCourses: async (languageId?: string): Promise<Course[]> => {
    const cacheKey = `courses:${languageId ? languageId.toLowerCase() : 'all'}`;

    return queryCache.getOrFetch(cacheKey, async () => {
      const localCourses = getStoredCustomCourses();

      if (!isSupabaseConfigured) {
        if (!languageId) return [...localCourses];
        const norm = languageId.toLowerCase();
        return localCourses.filter((c) => c.language_id?.toLowerCase() === norm);
      }

      try {
        let query = supabase.from('courses').select('*, languages(name, code)');
        if (languageId) {
          query = query.eq('language_id', languageId.toLowerCase());
        }

        const { data, error }: any = await executeWithRetry(async () => await query);

        if (error) {
          console.warn('Supabase query error in getCourses, using local store:', error);
          if (!languageId) return localCourses;
          return localCourses.filter((c) => c.language_id?.toLowerCase() === languageId.toLowerCase());
        }

        if (!data || data.length === 0) {
          if (!languageId) return localCourses;
          return localCourses.filter((c) => c.language_id?.toLowerCase() === languageId.toLowerCase());
        }

        const dbCourses: Course[] = data.map((row: any) => ({
          id: row.id,
          language_id: row.language_id,
          title: row.title,
          language: row.languages?.name || row.language_id,
          description: row.description || '',
          level: row.level || 'Beginner',
          totalLessons: row.total_lessons || 10,
          completedLessons: 0,
          estimatedHours: row.estimated_hours || 5,
          coverImage: row.cover_image,
          badge: row.badge,
          enrolledCount: row.enrolled_count || 0,
        }));

        // Merge any custom local items not in Supabase
        const dbIds = new Set(dbCourses.map((c) => c.id));
        const merged = [
          ...dbCourses,
          ...localCourses.filter((c) => !dbIds.has(c.id) && (!languageId || c.language_id?.toLowerCase() === languageId.toLowerCase())),
        ];

        return merged;
      } catch (err) {
        console.warn('Network error in getCourses, using local courses:', err);
        if (!languageId) return localCourses;
        return localCourses.filter((c) => c.language_id?.toLowerCase() === languageId.toLowerCase());
      }
    }, 60000);
  },

  getCourseById: async (id: string): Promise<Course | undefined> => {
    const all = await courseService.getCourses();
    return all.find((c) => c.id === id);
  },

  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    const id = courseData.id || `course-${courseData.language_id || 'mr'}-${Date.now().toString().slice(-4)}`;
    const newCourse: Course = {
      id,
      language_id: courseData.language_id || 'mr',
      language: courseData.language || 'Marathi',
      title: courseData.title || 'Untitled Course',
      description: courseData.description || '',
      level: courseData.level || 'Beginner',
      totalLessons: courseData.totalLessons || 10,
      completedLessons: 0,
      estimatedHours: courseData.estimatedHours || 12,
      enrolledCount: courseData.enrolledCount || 1,
      coverImage: courseData.coverImage,
      badge: courseData.badge,
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('courses').insert({
          id: newCourse.id,
          language_id: newCourse.language_id.toLowerCase(),
          title: newCourse.title,
          description: newCourse.description,
          level: newCourse.level,
          total_lessons: newCourse.totalLessons,
          estimated_hours: newCourse.estimatedHours,
        });

        if (error) {
          console.warn('Supabase createCourse failed, persisting to local store:', error.message);
        }
      } catch (err) {
        console.warn('Error inserting course to Supabase:', err);
      }
    }

    // Persist to local storage
    const current = getStoredCustomCourses();
    const updated = [newCourse, ...current.filter((c) => c.id !== newCourse.id)];
    saveCustomCourses(updated);

    // Invalidate cache
    queryCache.invalidate('courses');

    return newCourse;
  },

  updateCourse: async (id: string, updates: Partial<Course>): Promise<Course> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.level) dbUpdates.level = updates.level;
        if (updates.totalLessons) dbUpdates.total_lessons = updates.totalLessons;
        if (updates.estimatedHours) dbUpdates.estimated_hours = updates.estimatedHours;
        if (updates.language_id) dbUpdates.language_id = updates.language_id.toLowerCase();

        const { error } = await supabase.from('courses').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn(`Supabase updateCourse error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error updating course ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomCourses();
    const idx = current.findIndex((c) => c.id === id);
    const existing = idx >= 0 ? current[idx] : { id, title: 'Course', language_id: 'mr', description: '', level: 'Beginner', totalLessons: 10, estimatedHours: 10, completedLessons: 0 } as Course;
    const updatedCourse: Course = { ...existing, ...updates };

    if (idx >= 0) {
      current[idx] = updatedCourse;
    } else {
      current.unshift(updatedCourse);
    }
    saveCustomCourses(current);

    queryCache.invalidate('courses');
    return updatedCourse;
  },

  deleteCourse: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deleteCourse error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting course ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomCourses();
    const filtered = current.filter((c) => c.id !== id);
    saveCustomCourses(filtered);

    queryCache.invalidate('courses');
    return true;
  },
};
