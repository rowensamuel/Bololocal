import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('placeholder')
);

// Graceful client initialization without runtime crash if environment variables are not yet configured
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }) as SupabaseClient);

/**
 * Validates backend connectivity and configuration.
 * Never invents mock responses or fake credentials.
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
      error:
        'Supabase is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    };
  }

  try {
    const { data, error } = await supabase.from('languages').select('count', { count: 'exact', head: true });
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
      error: err?.message || 'Failed to reach Supabase endpoint.',
    };
  }
};
