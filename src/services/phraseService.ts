import { UsefulPhrase, SituationGuide, SituationCategory } from '../types/phrase';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockPhrases, mockSituations } from '../data/mockData';
import { multiLanguagePhrases } from '../data/mockLanguageContent';
import { queryCache, executeWithRetry } from '../utils/supabaseClientHelper';

const PHRASES_STORAGE_KEY = 'bololocal_custom_phrases';
const SITUATIONS_STORAGE_KEY = 'bololocal_custom_situations';

const initialPhrases: UsefulPhrase[] = [
  ...mockPhrases.map((p) => ({ ...p, language_id: p.language_id || 'mr' })),
  ...multiLanguagePhrases,
];

const getStoredCustomPhrases = (): UsefulPhrase[] => {
  try {
    if (typeof localStorage === 'undefined') return initialPhrases;
    const raw = localStorage.getItem(PHRASES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(initialPhrases));
      return initialPhrases;
    }
    return JSON.parse(raw);
  } catch {
    return initialPhrases;
  }
};

const saveCustomPhrases = (items: UsefulPhrase[]): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Failed to save custom phrases', e);
  }
};

const getStoredCustomSituations = (): SituationGuide[] => {
  try {
    if (typeof localStorage === 'undefined') return mockSituations;
    const raw = localStorage.getItem(SITUATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SITUATIONS_STORAGE_KEY, JSON.stringify(mockSituations));
      return mockSituations;
    }
    return JSON.parse(raw);
  } catch {
    return mockSituations;
  }
};

const saveCustomSituations = (items: SituationGuide[]): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SITUATIONS_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Failed to save custom situations', e);
  }
};

export const phraseService = {
  getPhrases: async (languageId?: string): Promise<UsefulPhrase[]> => {
    const cacheKey = `phrases:${languageId ? languageId.toLowerCase() : 'all'}`;

    return queryCache.getOrFetch(cacheKey, async () => {
      const localPhrases = getStoredCustomPhrases();

      if (!isSupabaseConfigured) {
        if (!languageId) return [...localPhrases];
        const norm = languageId.toLowerCase();
        return localPhrases.filter((p) => p.language_id?.toLowerCase() === norm);
      }

      try {
        let query = supabase.from('phrases').select('*');
        if (languageId) {
          query = query.eq('language_id', languageId.toLowerCase());
        }

        const { data, error }: any = await executeWithRetry(async () => await query);

        if (error) {
          console.warn('Supabase query error in getPhrases, using local store:', error);
          if (!languageId) return localPhrases;
          return localPhrases.filter((p) => p.language_id?.toLowerCase() === languageId.toLowerCase());
        }

        if (!data || data.length === 0) {
          if (!languageId) return localPhrases;
          return localPhrases.filter((p) => p.language_id?.toLowerCase() === languageId.toLowerCase());
        }

        const dbPhrases: UsefulPhrase[] = data.map((row: any) => ({
          id: row.id,
          language_id: row.language_id,
          marathi: row.native_text || row.target_text || '',
          roman: row.roman || '',
          english: row.english || '',
          category: (row.category || 'Daily Conversation') as SituationCategory,
          context: row.context || '',
          tags: row.tags || ['general'],
          culturalInsight: row.cultural_insight,
          audioKey: row.audio_key,
        }));

        const dbIds = new Set(dbPhrases.map((p) => p.id));
        const merged = [
          ...dbPhrases,
          ...localPhrases.filter((p) => !dbIds.has(p.id) && (!languageId || p.language_id?.toLowerCase() === languageId.toLowerCase())),
        ];

        return merged;
      } catch (err) {
        console.warn('Network error in getPhrases, using local store:', err);
        if (!languageId) return localPhrases;
        return localPhrases.filter((p) => p.language_id?.toLowerCase() === languageId.toLowerCase());
      }
    }, 60000);
  },

  createPhrase: async (data: Partial<UsefulPhrase>): Promise<UsefulPhrase> => {
    const id = data.id || `p-${Date.now()}`;
    const newPhrase: UsefulPhrase = {
      id,
      language_id: data.language_id || 'mr',
      marathi: data.marathi || '',
      roman: data.roman || data.marathi || '',
      english: data.english || '',
      category: data.category || 'Daily Conversation',
      context: data.context || 'Everyday conversational use.',
      tags: data.tags || [data.category || 'general'],
      culturalInsight: data.culturalInsight,
      audioKey: data.audioKey,
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('phrases').insert({
          id: newPhrase.id,
          language_id: (newPhrase.language_id || 'mr').toLowerCase(),
          native_text: newPhrase.marathi,
          roman: newPhrase.roman,
          english: newPhrase.english,
          category: newPhrase.category,
          context: newPhrase.context,
          tags: newPhrase.tags,
        });

        if (error) {
          console.warn('Supabase createPhrase error, persisting locally:', error.message);
        }
      } catch (err) {
        console.warn('Error inserting phrase into Supabase:', err);
      }
    }

    const current = getStoredCustomPhrases();
    const updated = [newPhrase, ...current.filter((p) => p.id !== newPhrase.id)];
    saveCustomPhrases(updated);

    queryCache.invalidate('phrases');
    return newPhrase;
  },

  updatePhrase: async (id: string, updates: Partial<UsefulPhrase>): Promise<UsefulPhrase> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.marathi) dbUpdates.native_text = updates.marathi;
        if (updates.roman) dbUpdates.roman = updates.roman;
        if (updates.english) dbUpdates.english = updates.english;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.context) dbUpdates.context = updates.context;
        if (updates.tags) dbUpdates.tags = updates.tags;

        const { error } = await supabase.from('phrases').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn(`Supabase updatePhrase error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error updating phrase ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomPhrases();
    const idx = current.findIndex((p) => p.id === id);
    const existing = idx >= 0 ? current[idx] : { id, marathi: '', roman: '', english: '', category: 'Daily Conversation', context: '' } as UsefulPhrase;
    const updatedPhrase: UsefulPhrase = { ...existing, ...updates };

    if (idx >= 0) {
      current[idx] = updatedPhrase;
    } else {
      current.unshift(updatedPhrase);
    }
    saveCustomPhrases(current);

    queryCache.invalidate('phrases');
    return updatedPhrase;
  },

  deletePhrase: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('phrases').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deletePhrase error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting phrase ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomPhrases();
    const filtered = current.filter((p) => p.id !== id);
    saveCustomPhrases(filtered);

    queryCache.invalidate('phrases');
    return true;
  },

  getPhraseOfTheDay: async (languageId?: string): Promise<UsefulPhrase> => {
    const list = await phraseService.getPhrases(languageId);
    if (list.length > 0) {
      return list[0];
    }
    return initialPhrases[0];
  },

  getSituations: async (languageId?: string): Promise<SituationGuide[]> => {
    const cacheKey = `situations:${languageId ? languageId.toLowerCase() : 'all'}`;

    return queryCache.getOrFetch(cacheKey, async () => {
      const localSituations = getStoredCustomSituations();

      if (!isSupabaseConfigured) {
        if (!languageId) return [...localSituations];
        const norm = languageId.toLowerCase();
        const filtered = localSituations.filter(
          (s) => !s.language_id || s.language_id.toLowerCase() === norm
        );
        return filtered.length > 0 ? filtered : localSituations;
      }

      try {
        let query = supabase.from('situations').select('*');
        if (languageId) {
          query = query.eq('language_id', languageId.toLowerCase());
        }

        const { data, error }: any = await executeWithRetry(async () => await query);

        if (error || !data || data.length === 0) {
          if (!languageId) return localSituations;
          return localSituations.filter((s) => !s.language_id || s.language_id.toLowerCase() === languageId.toLowerCase());
        }

        const dbSituations: SituationGuide[] = data.map((row: any) => ({
          id: row.id,
          language_id: row.language_id,
          title: row.title,
          description: row.description || '',
          icon: row.icon || 'MessageCircle',
          category: (row.category || 'Daily Conversation') as SituationCategory,
          colorAccent: row.color_accent || 'from-indigo-500 to-purple-600',
          phraseCount: row.phrase_count || 5,
        }));

        const dbIds = new Set(dbSituations.map((s) => s.id));
        const merged = [
          ...dbSituations,
          ...localSituations.filter((s) => !dbIds.has(s.id) && (!languageId || !s.language_id || s.language_id.toLowerCase() === languageId.toLowerCase())),
        ];

        return merged;
      } catch (err) {
        console.warn('Network error in getSituations, using local store:', err);
        return localSituations;
      }
    }, 60000);
  },

  createSituation: async (data: Partial<SituationGuide>): Promise<SituationGuide> => {
    const id = data.id || `sit-${Date.now()}`;
    const newSit: SituationGuide = {
      id,
      language_id: data.language_id || 'mr',
      title: data.title || 'New Situation Guide',
      category: data.category || 'Daily Conversation',
      icon: data.icon || '📍',
      description: data.description || 'Guide to navigating everyday conversations.',
      colorAccent: data.colorAccent || 'from-orange-500 to-amber-600',
      phraseCount: data.phraseCount || 5,
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('situations').insert({
          id: newSit.id,
          language_id: (newSit.language_id || 'mr').toLowerCase(),
          title: newSit.title,
          category: newSit.category,
          icon: newSit.icon,
          description: newSit.description,
          phrase_count: newSit.phraseCount,
        });

        if (error) {
          console.warn('Supabase createSituation error, persisting locally:', error.message);
        }
      } catch (err) {
        console.warn('Error creating situation in Supabase:', err);
      }
    }

    const current = getStoredCustomSituations();
    const updated = [newSit, ...current.filter((s) => s.id !== newSit.id)];
    saveCustomSituations(updated);

    queryCache.invalidate('situations');
    return newSit;
  },

  updateSituation: async (id: string, updates: Partial<SituationGuide>): Promise<SituationGuide> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.icon) dbUpdates.icon = updates.icon;
        if (updates.category) dbUpdates.category = updates.category;

        const { error } = await supabase.from('situations').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn(`Supabase updateSituation error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error updating situation ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomSituations();
    const idx = current.findIndex((s) => s.id === id);
    const existing = idx >= 0 ? current[idx] : { id, title: 'Situation', category: 'Daily Conversation', icon: '📍', description: '', phraseCount: 5 } as SituationGuide;
    const updatedSit: SituationGuide = { ...existing, ...updates };

    if (idx >= 0) {
      current[idx] = updatedSit;
    } else {
      current.unshift(updatedSit);
    }
    saveCustomSituations(current);

    queryCache.invalidate('situations');
    return updatedSit;
  },

  deleteSituation: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('situations').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deleteSituation error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting situation ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomSituations();
    const filtered = current.filter((s) => s.id !== id);
    saveCustomSituations(filtered);

    queryCache.invalidate('situations');
    return true;
  },

  getCategories: async (languageId?: string): Promise<string[]> => {
    const phrases = await phraseService.getPhrases(languageId);
    const set = new Set(phrases.map((p) => p.category));
    return ['All', ...Array.from(set)];
  },
};
