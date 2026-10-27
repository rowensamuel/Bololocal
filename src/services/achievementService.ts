import { Achievement, UserAchievement } from '../types/achievement';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockAchievements } from '../data/mockAchievements';
import { isValidUuid } from '../utils/helpers';

const STORAGE_PREFIX = 'bololocal_user_achievements_';

export interface AchievementEvaluationMetrics {
  quizCount?: number;
  timedQuizCount?: number;
  accuracy?: number;
  perfectScore?: boolean;
  streakDays?: number;
  completedLessonsCount?: number;
  totalXp?: number;
}

export const achievementService = {
  getAllAchievements: async (): Promise<Achievement[]> => {
    if (!isSupabaseConfigured) {
      return [...mockAchievements];
    }

    const { data, error } = await supabase.from('achievements').select('*');
    if (error) {
      console.error('Error fetching achievements from Supabase:', error);
      throw new Error(`Database error fetching achievements: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.title || row.name,
      description: row.description,
      icon: row.icon,
      category: row.category || 'milestone',
      condition_type: row.criteria_type || row.condition_type || 'count',
      condition_value: row.threshold || row.condition_value || 1,
      language_id: row.language_id,
      is_active: row.is_active ?? true,
      xp_reward: row.points || row.xp_reward || 50,
    }));
  },

  createAchievement: async (data: Partial<Achievement>): Promise<Achievement> => {
    const id = data.id || `ach-${Date.now().toString().slice(-4)}`;
    const newAch: Achievement = {
      id,
      name: data.name || 'New Achievement',
      description: data.description || 'Milestone achieved.',
      icon: data.icon || 'Award',
      category: data.category || 'milestone',
      condition_type: data.condition_type || 'count',
      condition_value: data.condition_value || 1,
      language_id: data.language_id,
      is_active: data.is_active ?? true,
      xp_reward: data.xp_reward || 50,
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('achievements').insert({
          id: newAch.id,
          name: newAch.name,
          description: newAch.description,
          icon: newAch.icon,
          category: newAch.category,
          condition_type: newAch.condition_type,
          condition_value: newAch.condition_value,
          xp_reward: newAch.xp_reward,
          is_active: newAch.is_active,
        });

        if (error) {
          console.warn('Supabase createAchievement error:', error.message);
        }
      } catch (err) {
        console.warn('Error creating achievement in Supabase:', err);
      }
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const key = 'bololocal_custom_achievements';
        const stored = localStorage.getItem(key);
        const list: Achievement[] = stored ? JSON.parse(stored) : [];
        list.unshift(newAch);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch {}

    return newAch;
  },

  updateAchievement: async (id: string, updates: Partial<Achievement>): Promise<Achievement> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.xp_reward) dbUpdates.xp_reward = updates.xp_reward;
        if (updates.condition_type) dbUpdates.condition_type = updates.condition_type;
        if (updates.condition_value) dbUpdates.condition_value = updates.condition_value;

        const { error } = await supabase.from('achievements').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn(`Supabase updateAchievement error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error updating achievement ${id} in Supabase:`, err);
      }
    }

    const all = await achievementService.getAllAchievements();
    const existing = all.find((a) => a.id === id) || { id, name: 'Achievement', description: '', icon: 'Award', category: 'milestone', condition_type: 'count', condition_value: 1, xp_reward: 50, is_active: true };
    return { ...existing, ...updates };
  },

  deleteAchievement: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('achievements').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deleteAchievement error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting achievement ${id} in Supabase:`, err);
      }
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const key = 'bololocal_custom_achievements';
        const stored = localStorage.getItem(key);
        if (stored) {
          const list: Achievement[] = JSON.parse(stored);
          localStorage.setItem(key, JSON.stringify(list.filter((a) => a.id !== id)));
        }
      }
    } catch {}

    return true;
  },

  getUserAchievements: async (userId: string): Promise<UserAchievement[]> => {
    if (!userId) return [];

    if (isSupabaseConfigured && isValidUuid(userId)) {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user achievements from Supabase:', error);
        return [];
      }

      return (data || []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        achievement_id: r.achievement_id,
        unlocked_at: r.unlocked_at,
      }));
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  isAchievementUnlocked: async (userId: string, achievementId: string): Promise<boolean> => {
    const userAchs = await achievementService.getUserAchievements(userId);
    return userAchs.some((a) => a.achievement_id === achievementId);
  },

  unlockAchievement: async (userId: string, achievementId: string): Promise<Achievement | null> => {
    if (!userId) return null;
    const isUnlocked = await achievementService.isAchievementUnlocked(userId, achievementId);
    if (isUnlocked) {
      return null;
    }

    const allAchs = await achievementService.getAllAchievements();
    const definition = allAchs.find((a) => a.id === achievementId) || mockAchievements.find((a) => a.id === achievementId);
    if (!definition) return null;

    if (isSupabaseConfigured && isValidUuid(userId)) {
      const { error } = await supabase.from('user_achievements').upsert(
        {
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,achievement_id' }
      );

      if (error) {
        console.error('Error saving achievement unlock to Supabase:', error);
      }
    }

    try {
      const current = await achievementService.getUserAchievements(userId);
      const updated = [
        ...current,
        {
          id: `uach-${Date.now()}`,
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
    } catch {}

    return definition;
  },

  evaluateAchievements: async (
    userId: string,
    metrics: AchievementEvaluationMetrics
  ): Promise<Achievement[]> => {
    if (!userId) return [];
    const unlockedNow: Achievement[] = [];

    // Milestone: First quiz
    if ((metrics.quizCount ?? 0) >= 1) {
      const ach = await achievementService.unlockAchievement(userId, 'ach-first-quiz');
      if (ach) unlockedNow.push(ach);
    }

    // Milestone: First timed quiz
    if ((metrics.timedQuizCount ?? 0) >= 1) {
      const ach = await achievementService.unlockAchievement(userId, 'ach-first-timed');
      if (ach) unlockedNow.push(ach);
    }

    // Accuracy: Perfect Score (100%)
    if (metrics.perfectScore || (metrics.accuracy ?? 0) >= 100) {
      const ach = await achievementService.unlockAchievement(userId, 'ach-perfect-score');
      if (ach) unlockedNow.push(ach);
    }

    // Timed quiz: Speed Learner (>= 90% accuracy)
    if ((metrics.accuracy ?? 0) >= 90 && (metrics.timedQuizCount ?? 0) >= 1) {
      const ach = await achievementService.unlockAchievement(userId, 'ach-speed-learner');
      if (ach) unlockedNow.push(ach);
    }

    // Streak: 3 or 7 days
    if ((metrics.streakDays ?? 0) >= 3) {
      const ach = await achievementService.unlockAchievement(userId, 'ach-quiz-streak');
      if (ach) unlockedNow.push(ach);
    }
    if ((metrics.streakDays ?? 0) >= 7) {
      const ach = await achievementService.unlockAchievement(userId, 'ach-streak-week');
      if (ach) unlockedNow.push(ach);
    }

    // 10 quizzes
    if ((metrics.quizCount ?? 0) >= 10) {
      const ach = await achievementService.unlockAchievement(userId, 'ach-10-quizzes');
      if (ach) unlockedNow.push(ach);
    }

    return unlockedNow;
  },
};
