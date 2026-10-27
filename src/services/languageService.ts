import { Language } from '../types/language';
export type LanguageRecord = Language;
import { supabase, isSupabaseConfigured } from './supabase';
import { mockLanguages } from '../data/mockLanguages';
import { cachedOrInFlight, invalidateCache } from '../utils/supabaseClientHelper';

const CUSTOM_LANGUAGES_KEY = 'bololocal_custom_languages';

const getCustomLanguages = (): Language[] => {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(CUSTOM_LANGUAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    }
  } catch {}
  return [];
};

const saveCustomLanguages = (langs: Language[]): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CUSTOM_LANGUAGES_KEY, JSON.stringify(langs));
    }
  } catch {}
};

export const languageService = {
  /**
   * Fetches all active languages with caching and deduplication.
   */
  getLanguages: async (): Promise<Language[]> => {
    return cachedOrInFlight('languages:all', async () => {
      const custom = getCustomLanguages();

      if (!isSupabaseConfigured) {
        return [...mockLanguages, ...custom];
      }

      try {
        const { data, error } = await supabase
          .from('languages')
          .select('*')
          .order('name');

        if (error || !data || data.length === 0) {
          return [...mockLanguages, ...custom];
        }

        const dbLangs: Language[] = data.map((row: any) => ({
          id: row.id,
          code: row.code,
          name: row.name,
          native_name: row.native_name,
          script: row.script,
          is_active: row.is_active ?? true,
          flag: row.flag || '🇮🇳',
          greeting: row.greeting || 'Namaste',
          greeting_meaning: row.greeting_meaning || '',
        }));

        // Merge custom languages not yet in DB
        const dbCodes = new Set(dbLangs.map((l) => l.code.toLowerCase()));
        const uniqueCustom = custom.filter((c) => !dbCodes.has(c.code.toLowerCase()));

        return [...dbLangs, ...uniqueCustom];
      } catch {
        return [...mockLanguages, ...custom];
      }
    }, 120000); // 2 minute TTL
  },

  /**
   * Retrieves a single language by id or code.
   */
  getLanguageById: async (idOrCode: string): Promise<Language | undefined> => {
    const list = await languageService.getLanguages();
    const norm = idOrCode.toLowerCase();
    return list.find(
      (l) => l.id.toLowerCase() === norm || l.code.toLowerCase() === norm || l.name.toLowerCase() === norm
    );
  },

  /**
   * Creates a new language (INSERT).
   */
  createLanguage: async (lang: Partial<Language>): Promise<Language> => {
    const code = (lang.code || lang.id || '').trim().toLowerCase();
    if (!code || !lang.name) {
      throw new Error('Language code and name are required.');
    }

    const newLang: Language = {
      id: code,
      code,
      name: lang.name.trim(),
      native_name: (lang.native_name || lang.name).trim(),
      script: lang.script || 'Native Script',
      flag: lang.flag || '🇮🇳',
      greeting: lang.greeting || 'Namaste!',
      greeting_meaning: lang.greeting_meaning || '',
      is_active: lang.is_active ?? true,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('languages')
          .insert({
            id: newLang.id,
            code: newLang.code,
            name: newLang.name,
            native_name: newLang.native_name,
            script: newLang.script,
            flag: newLang.flag,
            greeting: newLang.greeting,
            greeting_meaning: newLang.greeting_meaning,
            is_active: newLang.is_active,
          })
          .select()
          .single();

        if (!error && data) {
          invalidateCache('languages');
          return {
            id: data.id,
            code: data.code,
            name: data.name,
            native_name: data.native_name,
            script: data.script,
            is_active: data.is_active,
            flag: data.flag,
            greeting: data.greeting,
            greeting_meaning: data.greeting_meaning,
          };
        }
      } catch (err) {
        console.warn('Supabase insert language error, storing locally:', err);
      }
    }

    // Local storage persistence
    const custom = getCustomLanguages();
    const existingIdx = custom.findIndex((c) => c.code === code);
    if (existingIdx >= 0) {
      custom[existingIdx] = newLang;
    } else {
      custom.unshift(newLang);
    }
    saveCustomLanguages(custom);
    invalidateCache('languages');
    return newLang;
  },

  /**
   * Updates an existing language (UPDATE).
   */
  updateLanguage: async (codeOrId: string, updates: Partial<Language>): Promise<Language> => {
    const norm = codeOrId.toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.native_name) dbUpdates.native_name = updates.native_name;
        if (updates.script) dbUpdates.script = updates.script;
        if (updates.flag) dbUpdates.flag = updates.flag;
        if (updates.greeting) dbUpdates.greeting = updates.greeting;
        if (updates.greeting_meaning) dbUpdates.greeting_meaning = updates.greeting_meaning;
        if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

        const { data, error } = await supabase
          .from('languages')
          .update(dbUpdates)
          .or(`id.eq.${norm},code.ilike.${norm}`)
          .select()
          .maybeSingle();

        if (!error && data) {
          invalidateCache('languages');
          return {
            id: data.id,
            code: data.code,
            name: data.name,
            native_name: data.native_name,
            script: data.script,
            is_active: data.is_active,
            flag: data.flag,
            greeting: data.greeting,
            greeting_meaning: data.greeting_meaning,
          };
        }
      } catch (err) {
        console.warn('Supabase update language error, updating locally:', err);
      }
    }

    const custom = getCustomLanguages();
    const idx = custom.findIndex((c) => c.code === norm || c.id === norm);
    let updated: Language;

    if (idx >= 0) {
      updated = { ...custom[idx], ...updates };
      custom[idx] = updated;
      saveCustomLanguages(custom);
    } else {
      const mock = mockLanguages.find((m) => m.code === norm || m.id === norm);
      const base: Language = mock || { id: norm, code: norm, name: norm, native_name: norm, script: 'Devanagari', is_active: true };
      updated = { ...base, ...updates, is_active: updates.is_active ?? base.is_active ?? true };
      custom.unshift(updated);
      saveCustomLanguages(custom);
    }

    invalidateCache('languages');
    return updated;
  },

  /**
   * Deletes a language (DELETE).
   */
  deleteLanguage: async (codeOrId: string): Promise<boolean> => {
    const norm = codeOrId.toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('languages')
          .delete()
          .or(`id.eq.${norm},code.ilike.${norm}`);

        if (!error) {
          invalidateCache('languages');
        }
      } catch (err) {
        console.warn('Supabase delete language error:', err);
      }
    }

    const custom = getCustomLanguages();
    const filtered = custom.filter((c) => c.code !== norm && c.id !== norm);
    saveCustomLanguages(filtered);
    invalidateCache('languages');
    return true;
  },
};
