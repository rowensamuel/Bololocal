import { Badge, UserBadge, BadgeRarity } from '../types/badge';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockBadges } from '../data/mockBadges';
import { isValidUuid } from '../utils/helpers';

const STORAGE_PREFIX = 'bololocal_user_badges_';

export interface BadgeEvaluationMetrics {
  completedLessonsCount?: number;
  accuracy?: number;
  streakDays?: number;
  wordsLearnedCount?: number;
  quizCount?: number;
  perfectScore?: boolean;
  languagesExploredCount?: number;
  courseCompletedCount?: number;
}

export const badgeService = {
  getAllBadges: async (): Promise<Badge[]> => {
    if (!isSupabaseConfigured) {
      return [...mockBadges];
    }

    const { data, error } = await supabase.from('badges').select('*');
    if (error) {
      console.error('Error fetching badges from Supabase:', error);
      throw new Error(`Database error fetching badges: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      rarity: (row.tier || row.rarity || 'Common') as BadgeRarity,
      condition_type: row.condition_type || 'count',
      condition_value: row.condition_value || 1,
      is_active: row.is_active ?? true,
      xp_bonus: row.xp_bonus || 50,
    }));
  },

  createBadge: async (data: Partial<Badge>): Promise<Badge> => {
    const id = data.id || `badge-${Date.now().toString().slice(-4)}`;
    const newBadge: Badge = {
      id,
      name: data.name || 'New Badge',
      description: data.description || 'Awarded for exceptional progress.',
      icon: data.icon || '🏆',
      rarity: (data.rarity || 'Common') as BadgeRarity,
      condition_type: data.condition_type || 'count',
      condition_value: data.condition_value || 1,
      is_active: data.is_active ?? true,
      xp_bonus: data.xp_bonus || 50,
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('badges').insert({
          id: newBadge.id,
          name: newBadge.name,
          description: newBadge.description,
          icon: newBadge.icon,
          rarity: newBadge.rarity,
          condition_type: newBadge.condition_type,
          condition_value: newBadge.condition_value,
          xp_bonus: newBadge.xp_bonus,
          is_active: newBadge.is_active,
        });

        if (error) {
          console.warn('Supabase createBadge error:', error.message);
        }
      } catch (err) {
        console.warn('Error creating badge in Supabase:', err);
      }
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const key = 'bololocal_custom_badges';
        const stored = localStorage.getItem(key);
        const list: Badge[] = stored ? JSON.parse(stored) : [];
        list.unshift(newBadge);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch {}

    return newBadge;
  },

  updateBadge: async (id: string, updates: Partial<Badge>): Promise<Badge> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.icon) dbUpdates.icon = updates.icon;
        if (updates.rarity) dbUpdates.rarity = updates.rarity;
        if (updates.xp_bonus) dbUpdates.xp_bonus = updates.xp_bonus;

        const { error } = await supabase.from('badges').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn(`Supabase updateBadge error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error updating badge ${id} in Supabase:`, err);
      }
    }

    const all = await badgeService.getAllBadges();
    const existing = all.find((b) => b.id === id) || { id, name: 'Badge', description: '', icon: '🏆', rarity: 'Common', condition_type: 'count', condition_value: 1, xp_bonus: 50, is_active: true };
    return { ...existing, ...updates };
  },

  deleteBadge: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('badges').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deleteBadge error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting badge ${id} in Supabase:`, err);
      }
    }

    try {
      if (typeof localStorage !== 'undefined') {
        const key = 'bololocal_custom_badges';
        const stored = localStorage.getItem(key);
        if (stored) {
          const list: Badge[] = JSON.parse(stored);
          localStorage.setItem(key, JSON.stringify(list.filter((b) => b.id !== id)));
        }
      }
    } catch {}

    return true;
  },

  getUserBadges: async (userId: string): Promise<UserBadge[]> => {
    if (!userId) return [];

    if (isSupabaseConfigured && isValidUuid(userId)) {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user badges from Supabase:', error);
        return [];
      }

      return (data || []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        badge_id: r.badge_id,
        unlocked_at: r.awarded_at || r.unlocked_at,
      }));
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  isBadgeUnlocked: async (userId: string, badgeId: string): Promise<boolean> => {
    const badges = await badgeService.getUserBadges(userId);
    return badges.some((b) => b.badge_id === badgeId);
  },

  unlockBadge: async (userId: string, badgeId: string): Promise<Badge | null> => {
    if (!userId) return null;
    const isUnlocked = await badgeService.isBadgeUnlocked(userId, badgeId);
    if (isUnlocked) {
      return null;
    }

    const allBadges = await badgeService.getAllBadges();
    const definition = allBadges.find((b) => b.id === badgeId) || mockBadges.find((b) => b.id === badgeId);
    if (!definition) return null;

    if (isSupabaseConfigured && isValidUuid(userId)) {
      const { error } = await supabase.from('user_badges').upsert(
        {
          user_id: userId,
          badge_id: badgeId,
          awarded_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,badge_id' }
      );

      if (error) {
        console.error('Error persisting badge in Supabase:', error);
      }
    }

    // Persist to local cache
    try {
      const current = await badgeService.getUserBadges(userId);
      if (!current.some((b) => b.badge_id === badgeId)) {
        current.push({
          id: `ubadge-${Date.now()}`,
          user_id: userId,
          badge_id: badgeId,
          unlocked_at: new Date().toISOString(),
        });
        localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(current));
      }
    } catch {}

    return definition;
  },

  evaluateBadges: async (
    userId: string,
    metrics: BadgeEvaluationMetrics
  ): Promise<Badge[]> => {
    if (!userId) return [];
    const unlockedNow: Badge[] = [];

    // First Steps (1 lesson)
    if ((metrics.completedLessonsCount ?? 0) >= 1) {
      const b = await badgeService.unlockBadge(userId, 'badge-first-steps');
      if (b) unlockedNow.push(b);
    }

    // Speed Learner (>= 90% accuracy)
    if ((metrics.accuracy ?? 0) >= 90) {
      const b = await badgeService.unlockBadge(userId, 'badge-speed-learner');
      if (b) unlockedNow.push(b);
    }

    // Streak Starter (>= 7 days)
    if ((metrics.streakDays ?? 0) >= 7) {
      const b = await badgeService.unlockBadge(userId, 'badge-streak-starter');
      if (b) unlockedNow.push(b);
    }

    // Word Collector (>= 50 words)
    if ((metrics.wordsLearnedCount ?? 0) >= 50) {
      const b = await badgeService.unlockBadge(userId, 'badge-word-collector');
      if (b) unlockedNow.push(b);
    }

    // Quiz Master (>= 10 quizzes)
    if ((metrics.quizCount ?? 0) >= 10) {
      const b = await badgeService.unlockBadge(userId, 'badge-quiz-master');
      if (b) unlockedNow.push(b);
    }

    // Perfect Score (100%)
    if (metrics.perfectScore || (metrics.accuracy ?? 0) >= 100) {
      const b = await badgeService.unlockBadge(userId, 'badge-perfect-score');
      if (b) unlockedNow.push(b);
    }

    // Language Explorer (>= 2 languages)
    if ((metrics.languagesExploredCount ?? 0) >= 2) {
      const b = await badgeService.unlockBadge(userId, 'badge-language-explorer');
      if (b) unlockedNow.push(b);
    }

    // Course Finisher (>= 1 course)
    if ((metrics.courseCompletedCount ?? 0) >= 1) {
      const b = await badgeService.unlockBadge(userId, 'badge-course-finisher');
      if (b) unlockedNow.push(b);
    }

    return unlockedNow;
  },
};
