import { VocabularyItem } from '../types/lesson';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockVocabulary } from '../data/mockData';
import { multiLanguageVocabulary } from '../data/mockLanguageContent';
import { queryCache, executeWithRetry } from '../utils/supabaseClientHelper';

const VOCAB_STORAGE_KEY = 'bololocal_custom_vocabulary';

const initialVocabulary: VocabularyItem[] = [
  ...mockVocabulary.map((item) => ({ ...item, language_id: item.language_id || 'mr' })),
  ...multiLanguageVocabulary,
];

const getStoredCustomVocabulary = (): VocabularyItem[] => {
  try {
    if (typeof localStorage === 'undefined') return initialVocabulary;
    const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(initialVocabulary));
      return initialVocabulary;
    }
    return JSON.parse(raw);
  } catch {
    return initialVocabulary;
  }
};

const saveCustomVocabulary = (items: VocabularyItem[]): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Failed to save custom vocabulary', e);
  }
};

export const vocabularyService = {
  getAllVocabulary: async (languageId?: string): Promise<VocabularyItem[]> => {
    const cacheKey = `vocabulary:${languageId ? languageId.toLowerCase() : 'all'}`;

    return queryCache.getOrFetch(cacheKey, async () => {
      const localVocab = getStoredCustomVocabulary();

      if (!isSupabaseConfigured) {
        if (!languageId) return [...localVocab];
        const norm = languageId.toLowerCase();
        return localVocab.filter((item) => item.language_id?.toLowerCase() === norm);
      }

      try {
        let query = supabase.from('vocabulary').select('*');
        if (languageId) {
          query = query.eq('language_id', languageId.toLowerCase());
        }

        const { data, error }: any = await executeWithRetry(async () => await query);

        if (error) {
          console.warn('Supabase query error in getAllVocabulary, using local store:', error);
          if (!languageId) return localVocab;
          return localVocab.filter((item) => item.language_id?.toLowerCase() === languageId.toLowerCase());
        }

        if (!data || data.length === 0) {
          if (!languageId) return localVocab;
          return localVocab.filter((item) => item.language_id?.toLowerCase() === languageId.toLowerCase());
        }

        const dbVocab: VocabularyItem[] = data.map((row: any) => ({
          id: row.id,
          language_id: row.language_id,
          marathi: row.native_word || row.target_script || row.target_text || '',
          roman: row.roman || '',
          english: row.english || '',
          hindi: row.hindi,
          category: row.category || 'General',
          difficulty: row.difficulty || 'Beginner',
          exampleSentence: row.example_sentence,
          exampleRoman: row.example_roman,
          exampleEnglish: row.example_english,
        }));

        const dbIds = new Set(dbVocab.map((v) => v.id));
        const merged = [
          ...dbVocab,
          ...localVocab.filter((v) => !dbIds.has(v.id) && (!languageId || v.language_id?.toLowerCase() === languageId.toLowerCase())),
        ];

        return merged;
      } catch (err) {
        console.warn('Network error in getAllVocabulary, using local store:', err);
        if (!languageId) return localVocab;
        return localVocab.filter((item) => item.language_id?.toLowerCase() === languageId.toLowerCase());
      }
    }, 60000);
  },

  searchVocabulary: async (
    query: string,
    category?: string,
    difficulty?: string,
    languageId?: string
  ): Promise<VocabularyItem[]> => {
    const q = query.trim().toLowerCase();
    const list = await vocabularyService.getAllVocabulary(languageId);

    return list.filter((item) => {
      const matchesQuery =
        !q ||
        (item.marathi && item.marathi.toLowerCase().includes(q)) ||
        item.roman.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        (item.hindi && item.hindi.toLowerCase().includes(q));

      const matchesCategory = !category || category === 'All' || item.category === category;
      const matchesDifficulty = !difficulty || difficulty === 'All' || item.difficulty === difficulty;

      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  },

  createVocabulary: async (data: Partial<VocabularyItem>): Promise<VocabularyItem> => {
    const id = data.id || `v-${Date.now()}`;
    const newItem: VocabularyItem = {
      id,
      language_id: data.language_id || 'mr',
      marathi: data.marathi || '',
      roman: data.roman || data.marathi || '',
      english: data.english || '',
      hindi: data.hindi,
      category: data.category || 'General',
      difficulty: data.difficulty || 'Beginner',
      exampleSentence: data.exampleSentence,
      exampleRoman: data.exampleRoman,
      exampleEnglish: data.exampleEnglish,
    };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('vocabulary').insert({
          id: newItem.id,
          language_id: (newItem.language_id || 'mr').toLowerCase(),
          native_word: newItem.marathi,
          roman: newItem.roman,
          english: newItem.english,
          hindi: newItem.hindi,
          category: newItem.category,
          difficulty: newItem.difficulty,
          example_sentence: newItem.exampleSentence,
          example_roman: newItem.exampleRoman,
          example_english: newItem.exampleEnglish,
        });

        if (error) {
          console.warn('Supabase createVocabulary error, persisting locally:', error.message);
        }
      } catch (err) {
        console.warn('Error creating vocabulary in Supabase:', err);
      }
    }

    const current = getStoredCustomVocabulary();
    const updated = [newItem, ...current.filter((v) => v.id !== newItem.id)];
    saveCustomVocabulary(updated);

    queryCache.invalidate('vocabulary');
    return newItem;
  },

  updateVocabulary: async (id: string, updates: Partial<VocabularyItem>): Promise<VocabularyItem> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.marathi) dbUpdates.native_word = updates.marathi;
        if (updates.roman) dbUpdates.roman = updates.roman;
        if (updates.english) dbUpdates.english = updates.english;
        if (updates.hindi !== undefined) dbUpdates.hindi = updates.hindi;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.difficulty) dbUpdates.difficulty = updates.difficulty;

        const { error } = await supabase.from('vocabulary').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn(`Supabase updateVocabulary error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error updating vocabulary ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomVocabulary();
    const idx = current.findIndex((v) => v.id === id);
    const existing = idx >= 0 ? current[idx] : { id, marathi: '', roman: '', english: '', category: 'General', difficulty: 'Beginner' } as VocabularyItem;
    const updatedItem: VocabularyItem = { ...existing, ...updates };

    if (idx >= 0) {
      current[idx] = updatedItem;
    } else {
      current.unshift(updatedItem);
    }
    saveCustomVocabulary(current);

    queryCache.invalidate('vocabulary');
    return updatedItem;
  },

  deleteVocabulary: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('vocabulary').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deleteVocabulary error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting vocabulary ${id} in Supabase:`, err);
      }
    }

    const current = getStoredCustomVocabulary();
    const filtered = current.filter((v) => v.id !== id);
    saveCustomVocabulary(filtered);

    queryCache.invalidate('vocabulary');
    return true;
  },

  getCategories: async (languageId?: string): Promise<string[]> => {
    const items = await vocabularyService.getAllVocabulary(languageId);
    const set = new Set(items.map((item) => item.category));
    return ['All', ...Array.from(set)];
  },
};
