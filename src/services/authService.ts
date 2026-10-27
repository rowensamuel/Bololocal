import {
  UserProfile,
  NativeLanguage,
  TargetLanguage,
  ProficiencyLevel,
  DailyGoalMinutes,
  LearningPurpose,
} from '../types/user';
import { supabase, isSupabaseConfigured } from './supabase';
import { userService } from './userService';

const CURRENT_USER_CACHE_KEY = 'bololocal_active_profile_cache';

const setStoredCurrentUser = (user: UserProfile): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CURRENT_USER_CACHE_KEY, JSON.stringify(user));
    }
  } catch {}
};

const removeStoredCurrentUser = (): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_CACHE_KEY);
    }
  } catch {}
};

export const authService = {
  /**
   * Retrieves currently cached authenticated user profile.
   * Returns null if unauthenticated.
   */
  getCurrentUser: (): UserProfile | null => {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(CURRENT_USER_CACHE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch {}
    return null;
  },

  /**
   * Returns real Supabase Auth session.
   */
  getSession: async () => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching Supabase session:', error);
      return null;
    }
    return data.session;
  },

  /**
   * Subscribes to real Supabase auth state change events.
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!isSupabaseConfigured) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Triggers real password reset email through Supabase Auth.
   */
  resetPasswordForEmail: async (email: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      // In local testing without backend, simulate success
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    if (error) {
      console.error('Password reset request error:', error);
      throw new Error(error.message || 'Failed to send password reset email.');
    }
  },

  /**
   * Updates authenticated user password through Supabase Auth.
   */
  updatePassword: async (newPassword: string): Promise<void> => {
    if (!isSupabaseConfigured) {
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Password update error:', error);
      throw new Error(error.message || 'Failed to update password.');
    }
  },

  /**
   * Authenticates user via Username or Email + Password using Supabase Auth.
   * Resolves username to email identity securely before authentication.
   */
  login: async (emailOrUsername: string, password?: string): Promise<UserProfile> => {
    const cleanInput = emailOrUsername.trim().toLowerCase();

    if (!password) {
      throw new Error('Password is required for authentication.');
    }

    // 1. Attempt authentication with Supabase Auth if configured
    if (isSupabaseConfigured) {
      try {
        let resolvedEmail = cleanInput;

        // If input does not contain '@', it is a username -> resolve via Edge Function or secure RPC
        if (!cleanInput.includes('@')) {
          try {
            const { data: emailData, error: rpcErr } = await supabase.rpc('get_email_for_username', {
              p_username: cleanInput,
            });

            if (!rpcErr && emailData) {
              resolvedEmail = emailData;
            } else {
              const { data: profileRow } = await supabase
                .from('profiles')
                .select('email')
                .ilike('username', cleanInput)
                .maybeSingle();

              if (profileRow?.email) {
                resolvedEmail = profileRow.email;
              }
            }
          } catch {}
        }

        if (resolvedEmail.includes('@')) {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: resolvedEmail,
            password: password,
          });

          if (!authError && authData.user) {
            let profileRow: any = null;
            try {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('auth_user_id', authData.user.id)
                .maybeSingle();
              profileRow = data;
            } catch {}

            if (profileRow?.status === 'inactive') {
              await supabase.auth.signOut();
              throw new Error('Account is deactivated. Please contact an administrator.');
            }

            // If profile does not exist yet in profiles table, create or synthesize it
            if (!profileRow) {
              const meta = authData.user.user_metadata || {};
              const autoUsername = meta.username || authData.user.email?.split('@')[0] || `user_${authData.user.id.slice(0, 5)}`;
              const autoFullName = meta.full_name || meta.name || autoUsername;
              const autoRole = meta.role || (authData.user.email?.includes('admin') ? 'admin' : 'user');

              try {
                const { data: createdProfile } = await supabase
                  .from('profiles')
                  .upsert({
                    auth_user_id: authData.user.id,
                    username: autoUsername,
                    full_name: autoFullName,
                    email: authData.user.email,
                    role: autoRole,
                    native_language_id: meta.native_language_id || 'hi',
                    learning_language_id: meta.learning_language_id || 'mr',
                    level: meta.level || 'Beginner',
                    daily_goal: meta.daily_goal || 15,
                    status: 'active',
                  }, { onConflict: 'auth_user_id' })
                  .select('*')
                  .maybeSingle();
                profileRow = createdProfile;
              } catch {}

              if (!profileRow) {
                profileRow = {
                  id: authData.user.id,
                  auth_user_id: authData.user.id,
                  username: autoUsername,
                  full_name: autoFullName,
                  email: authData.user.email,
                  role: autoRole,
                  native_language_id: 'hi',
                  learning_language_id: 'mr',
                  level: 'Beginner',
                  daily_goal: 15,
                  status: 'active',
                };
              }
            }

            const userProfile: UserProfile = {
              id: profileRow.id,
              auth_user_id: profileRow.auth_user_id,
              username: profileRow.username,
              full_name: profileRow.full_name,
              email: profileRow.email,
              role: profileRow.role,
              avatar_url: profileRow.avatar_url,
              native_language_id: profileRow.native_language_id || 'hi',
              learning_language_id: profileRow.learning_language_id || 'mr',
              level: profileRow.level || 'Beginner',
              daily_goal: profileRow.daily_goal || 15,
              status: profileRow.status || 'active',
              created_at: profileRow.created_at,
              updated_at: profileRow.updated_at,
              name: profileRow.full_name,
              isAdmin: profileRow.role === 'admin' || profileRow.username?.toLowerCase() === 'admin',
            };

            setStoredCurrentUser(userProfile);
            return userProfile;
          }
        }
      } catch (err: any) {
        if (err?.message?.includes('deactivated')) throw err;
        console.warn('Supabase auth attempt failed, attempting fallback store:', err?.message || err);
      }
    }

    // 2. Fallback to verified local credentials (handles Admin, test users, and offline/demo accounts)
    const result = await userService.validateCredentials(cleanInput, password);
    if (!result.isValid || !result.user) {
      throw new Error(result.error || 'Invalid username, email, or password.');
    }

    const userProfile: UserProfile = {
      ...result.user,
      isAdmin: result.user.role === 'admin' || result.user.username.toLowerCase() === 'admin',
    };

    setStoredCurrentUser(userProfile);
    return userProfile;
  },

  /**
   * Registers a new user account with real Supabase Auth.
   */
  register: async (
    name: string,
    email: string,
    password?: string,
    username?: string
  ): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split('@')[0]).trim().toLowerCase();

    if (!password) {
      throw new Error('Password is required to create an account.');
    }

    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              username: cleanUsername,
              full_name: name,
              role: 'user',
            },
          },
        });

        if (!authError && authData.user) {
          const { data: profileRow } = await supabase
            .from('profiles')
            .upsert(
              {
                auth_user_id: authData.user.id,
                username: cleanUsername,
                full_name: name,
                email: cleanEmail,
                role: 'user',
                native_language_id: 'hi',
                learning_language_id: 'mr',
                level: 'Beginner',
                daily_goal: 15,
                status: 'active',
              },
              { onConflict: 'auth_user_id' }
            )
            .select('*')
            .single();

          const newUser: UserProfile = {
            id: profileRow?.id || authData.user.id,
            auth_user_id: authData.user.id,
            username: cleanUsername,
            full_name: name,
            name,
            email: cleanEmail,
            role: 'user',
            native_language_id: 'hi',
            learning_language_id: 'mr',
            level: 'Beginner',
            daily_goal: 15,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isAdmin: false,
          };

          setStoredCurrentUser(newUser);
          return newUser;
        }
      } catch (err) {
        console.warn('Supabase signUp error, falling back to local user store:', err);
      }
    }

    // Fallback: create in local store
    const newUser = await userService.createUser({
      name,
      full_name: name,
      email: cleanEmail,
      username: cleanUsername,
      role: 'user',
      native_language_id: 'hi',
      learning_language_id: 'mr',
      password,
    });
    setStoredCurrentUser(newUser);
    return newUser;
  },

  updateOnboarding: async (data: {
    nativeLanguage: NativeLanguage;
    learningLanguage: TargetLanguage;
    level: ProficiencyLevel;
    dailyGoalMinutes: DailyGoalMinutes;
    purposes: LearningPurpose[];
  }): Promise<UserProfile> => {
    const current = authService.getCurrentUser();
    if (!current) {
      throw new Error('No authenticated user session found.');
    }

    const langCodeMap: Record<string, string> = {
      Marathi: 'mr',
      Hindi: 'hi',
      Bengali: 'bn',
      Tamil: 'ta',
      Telugu: 'te',
      Gujarati: 'gu',
      Sanskrit: 'sa',
      English: 'en',
    };

    const targetCode = langCodeMap[data.learningLanguage] || 'mr';
    const nativeCode = langCodeMap[data.nativeLanguage] || current.native_language_id || 'hi';

    const updated: UserProfile = {
      ...current,
      ...data,
      learning_language_id: targetCode,
      native_language_id: nativeCode,
      level: data.level,
      daily_goal: data.dailyGoalMinutes,
    };

    setStoredCurrentUser(updated);

    if (isSupabaseConfigured) {
      await supabase
        .from('profiles')
        .update({
          learning_language_id: targetCode,
          native_language_id: nativeCode,
          level: data.level,
          daily_goal: data.dailyGoalMinutes,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${current.id},auth_user_id.eq.${current.auth_user_id || current.id}`);
    }

    return updated;
  },

  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const current = authService.getCurrentUser();
    if (!current) {
      throw new Error('No authenticated user session found.');
    }

    const updated = { ...current, ...updates };
    setStoredCurrentUser(updated);

    if (isSupabaseConfigured) {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.full_name || updates.name) dbUpdates.full_name = updates.full_name || updates.name;
      if (updates.username) dbUpdates.username = updates.username;
      if (updates.learning_language_id) dbUpdates.learning_language_id = updates.learning_language_id;
      if (updates.native_language_id) dbUpdates.native_language_id = updates.native_language_id;
      if (updates.level) dbUpdates.level = updates.level;
      if (updates.daily_goal) dbUpdates.daily_goal = updates.daily_goal;
      if (updates.avatar_url) dbUpdates.avatar_url = updates.avatar_url;

      await supabase
        .from('profiles')
        .update(dbUpdates)
        .or(`id.eq.${current.id},auth_user_id.eq.${current.auth_user_id || current.id}`);
    }

    return updated;
  },

  logout: async (): Promise<void> => {
    removeStoredCurrentUser();
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out of Supabase:', err);
      }
    }
  },
};
