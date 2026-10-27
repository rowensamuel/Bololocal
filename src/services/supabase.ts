import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Production Supabase project defaults ensure seamless deployment on Vercel even before manual env var configuration
const FALLBACK_SUPABASE_URL = 'https://syvndmnxryuhducugovz.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_iJpEQMqYi46hZjkzkMXjeA_ImXfBaDc';

const envUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';

const envAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

const supabaseUrl = (envUrl && !envUrl.includes('placeholder') && !envUrl.includes('your-project-ref'))
  ? envUrl
  : FALLBACK_SUPABASE_URL;

const supabaseAnonKey = (envAnonKey && !envAnonKey.includes('placeholder'))
  ? envAnonKey
  : FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Validates backend connectivity and configuration.
 */
export const checkSupabaseConnection = async (): Promise<{
  isConfigured: boolean;
  isConnected: boolean;
  error?: string;
}> => {
  if (!isSupabaseConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      error: 'Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    };
  }

  try {
    const { error } = await supabase.from('languages').select('count', { count: 'exact', head: true });
    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        error: error.message,
      };
    }
    return {
      isConfigured: true,
      isConnected: true,
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      error: err?.message || 'Connection failed',
    };
  }
};
