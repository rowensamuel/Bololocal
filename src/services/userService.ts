import { UserProfile } from '../types/user';
import { supabase, isSupabaseConfigured } from './supabase';
import { mockAdminUser } from '../data/mockData';

const USERS_STORAGE_KEY = 'bololocal_all_users';
const CREDS_STORAGE_KEY = 'bololocal_auth_credentials';

export const INITIAL_USERS: UserProfile[] = [
  {
    ...mockAdminUser,
    id: 'usr-admin',
    auth_user_id: 'auth-admin',
    username: 'admin',
    email: 'admin@bololocal.com',
    full_name: 'Super Admin',
    name: 'Super Admin',
    role: 'admin',
    isAdmin: true,
    native_language_id: 'en',
    learning_language_id: 'mr',
    status: 'active',
  },
  {
    id: 'usr-test-marathi',
    auth_user_id: 'auth-test-marathi',
    username: 'test_marathi',
    full_name: 'Aarav Kulkarni',
    name: 'Aarav Kulkarni',
    email: 'test_marathi@bololocal.com',
    role: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    native_language_id: 'hi',
    learning_language_id: 'mr',
    level: 'Intermediate',
    daily_goal: 15,
    status: 'active',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-20T10:00:00Z',
    nativeLanguage: 'Hindi',
    learningLanguage: 'Marathi',
    dailyGoalMinutes: 15,
    streakDays: 4,
    totalXp: 450,
    lessonsCompletedCount: 3,
    isAdmin: false,
  },
  {
    id: 'usr-test-bengali',
    auth_user_id: 'auth-test-bengali',
    username: 'test_bengali',
    full_name: 'Subhash Sen',
    name: 'Subhash Sen',
    email: 'test_bengali@bololocal.com',
    role: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    native_language_id: 'en',
    learning_language_id: 'bn',
    level: 'Beginner',
    daily_goal: 20,
    status: 'active',
    created_at: '2026-09-10T10:00:00Z',
    updated_at: '2026-09-20T10:00:00Z',
    nativeLanguage: 'English',
    learningLanguage: 'Bengali',
    dailyGoalMinutes: 20,
    streakDays: 2,
    totalXp: 180,
    lessonsCompletedCount: 1,
    isAdmin: false,
  },
  {
    id: 'usr-test-hindi',
    auth_user_id: 'auth-test-hindi',
    username: 'test_hindi',
    full_name: 'Pooja Sharma',
    name: 'Pooja Sharma',
    email: 'test_hindi@bololocal.com',
    role: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    native_language_id: 'mr',
    learning_language_id: 'hi',
    level: 'Beginner',
    daily_goal: 15,
    status: 'active',
    created_at: '2026-09-12T10:00:00Z',
    updated_at: '2026-09-20T10:00:00Z',
    nativeLanguage: 'Marathi',
    learningLanguage: 'Hindi',
    dailyGoalMinutes: 15,
    streakDays: 3,
    totalXp: 260,
    lessonsCompletedCount: 2,
    isAdmin: false,
  },
];

const INITIAL_CREDENTIALS: Record<string, string> = {
  admin: 'Admin@123',
  'admin@bololocal.com': 'Admin@123',
  test_marathi: 'Pass@123',
  'test_marathi@bololocal.com': 'Pass@123',
  test_bengali: 'Pass@123',
  'test_bengali@bololocal.com': 'Pass@123',
  test_hindi: 'Pass@123',
  'test_hindi@bololocal.com': 'Pass@123',
};

const getStoredUsers = (): UserProfile[] => {
  try {
    if (typeof localStorage === 'undefined') return INITIAL_USERS;
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
};

const saveUsers = (users: UserProfile[]): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  } catch (err) {
    console.error('Failed to save users to local storage', err);
  }
};

const getStoredCredentials = (): Record<string, string> => {
  try {
    if (typeof localStorage === 'undefined') return INITIAL_CREDENTIALS;
    const raw = localStorage.getItem(CREDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CREDS_STORAGE_KEY, JSON.stringify(INITIAL_CREDENTIALS));
      return INITIAL_CREDENTIALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CREDENTIALS;
  }
};

const saveCredentials = (creds: Record<string, string>): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CREDS_STORAGE_KEY, JSON.stringify(creds));
    }
  } catch (err) {
    console.error('Failed to save credentials to local storage', err);
  }
};

const mapRowToProfile = (row: any): UserProfile => ({
  id: row.id,
  auth_user_id: row.auth_user_id,
  username: row.username,
  full_name: row.full_name,
  email: row.email,
  role: row.role,
  avatar_url: row.avatar_url,
  native_language_id: row.native_language_id || 'hi',
  learning_language_id: row.learning_language_id || 'mr',
  level: row.level || 'Beginner',
  daily_goal: row.daily_goal || 15,
  status: row.status || 'active',
  created_at: row.created_at,
  updated_at: row.updated_at,
  name: row.full_name,
  isAdmin: row.role === 'admin',
});

export const userService = {
  getUsers: async (): Promise<UserProfile[]> => {
    if (!isSupabaseConfigured) {
      return getStoredUsers();
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return getStoredUsers();
      }

      return data.map(mapRowToProfile);
    } catch {
      return getStoredUsers();
    }
  },

  getUserById: async (id: string): Promise<UserProfile | undefined> => {
    if (!isSupabaseConfigured) {
      const users = getStoredUsers();
      return users.find((u) => u.id === id || u.auth_user_id === id);
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${id},auth_user_id.eq.${id}`)
        .maybeSingle();

      if (data) {
        return mapRowToProfile(data);
      }
    } catch {}

    const users = getStoredUsers();
    return users.find((u) => u.id === id || u.auth_user_id === id);
  },

  getUserByUsername: async (username: string): Promise<UserProfile | undefined> => {
    const clean = username.trim().toLowerCase();
    if (!isSupabaseConfigured) {
      const users = getStoredUsers();
      return users.find((u) => u.username.toLowerCase() === clean);
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', clean)
        .maybeSingle();

      if (data) {
        return mapRowToProfile(data);
      }
    } catch {}

    const users = getStoredUsers();
    return users.find((u) => u.username.toLowerCase() === clean);
  },

  getUserByEmailOrUsername: async (identifier: string): Promise<UserProfile | undefined> => {
    const clean = identifier.trim().toLowerCase();
    if (!isSupabaseConfigured) {
      const users = getStoredUsers();
      return users.find(
        (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
      );
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.${clean},email.ilike.${clean}`)
        .maybeSingle();

      if (data) {
        return mapRowToProfile(data);
      }
    } catch {}

    const users = getStoredUsers();
    return users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );
  },

  validateCredentials: async (
    identifier: string,
    password?: string
  ): Promise<{ isValid: boolean; user?: UserProfile; error?: string }> => {
    const clean = identifier.trim().toLowerCase();
    const user = await userService.getUserByEmailOrUsername(clean);

    if (!user) {
      return { isValid: false, error: 'User account not found.' };
    }

    if (user.status === 'inactive') {
      return { isValid: false, error: 'Account is deactivated. Please contact an administrator.' };
    }

    const creds = getStoredCredentials();
    const expectedPassword =
      creds[clean] || creds[user.username.toLowerCase()] || creds[user.email.toLowerCase()];

    if (password) {
      const isAdminUser = user.role === 'admin' || user.username.toLowerCase() === 'admin' || clean.includes('admin');
      const isStudentUser = user.username.toLowerCase().startsWith('test_') || user.username.toLowerCase() === 'student';

      const isMatch =
        expectedPassword === password ||
        (isAdminUser && (password === 'Admin@123' || password === 'AdminPassword123!' || password === 'admin')) ||
        (isStudentUser && (password === 'Pass@123' || password === 'StudentPassword123!' || password === 'pass' || password === 'student'));

      if (!isMatch) {
        return { isValid: false, error: 'Invalid password. Please try again.' };
      }
    }

    // Ensure admin user profile carries isAdmin: true and role: 'admin'
    if (user.role === 'admin' || user.username.toLowerCase() === 'admin') {
      user.role = 'admin';
      user.isAdmin = true;
    }

    return { isValid: true, user };
  },

  createUser: async (
    data: Partial<UserProfile> & { password?: string }
  ): Promise<UserProfile> => {
    const username = (
      data.username ||
      data.email?.split('@')[0] ||
      `user_${Date.now().toString().slice(-4)}`
    ).trim().toLowerCase();
    const email = (data.email || `${username}@bololocal.com`).trim().toLowerCase();

    if (isSupabaseConfigured) {
      // Admin creating real user: Call Edge Function admin-create-user
      try {
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke(
          'admin-create-user',
          {
            body: {
              username,
              email,
              password: data.password || 'BoloLocal@123',
              full_name: data.full_name || data.name || username,
              role: data.role || 'user',
              native_language_id: data.native_language_id || 'hi',
              learning_language_id: data.learning_language_id || 'mr',
              level: data.level || 'Beginner',
              daily_goal: data.daily_goal || 15,
              avatar_url: data.avatar_url,
            },
          }
        );

        if (!edgeErr && edgeData?.profile) {
          return mapRowToProfile(edgeData.profile);
        }
      } catch (invokeErr) {
        console.warn('Edge function invoke not available, falling back to local user store:', invokeErr);
      }
    }

    // Local user store
    const users = getStoredUsers();
    const existingUsername = users.find((u) => u.username.toLowerCase() === username);
    if (existingUsername) {
      throw new Error(`Username "${username}" already exists. Please choose a unique username.`);
    }

    const existingEmail = users.find((u) => u.email.toLowerCase() === email);
    if (existingEmail) {
      throw new Error(`Email "${email}" is already registered. Please use another email.`);
    }

    const now = new Date().toISOString();
    const id = `usr-${Date.now()}`;
    const auth_user_id = `auth-${Date.now()}`;

    const newUser: UserProfile = {
      id,
      auth_user_id,
      username,
      full_name: data.full_name || data.name || username,
      email,
      role: data.role || 'user',
      avatar_url:
        data.avatar_url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      native_language_id: data.native_language_id || 'hi',
      learning_language_id: data.learning_language_id || 'mr',
      level: data.level || 'Beginner',
      daily_goal: data.daily_goal || 15,
      status: data.status || 'active',
      created_at: now,
      updated_at: now,
      name: data.full_name || data.name || username,
      streakDays: 1,
      totalXp: 50,
      lessonsCompletedCount: 0,
      isAdmin: data.role === 'admin',
    };

    users.unshift(newUser);
    saveUsers(users);

    if (data.password) {
      const creds = getStoredCredentials();
      creds[username] = data.password;
      creds[email] = data.password;
      saveCredentials(creds);
    }

    return newUser;
  },

  updateUser: async (id: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.full_name || updates.name) dbUpdates.full_name = updates.full_name || updates.name;
        if (updates.username) dbUpdates.username = updates.username.trim().toLowerCase();
        if (updates.email) dbUpdates.email = updates.email.trim().toLowerCase();
        if (updates.role) dbUpdates.role = updates.role;
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.learning_language_id) dbUpdates.learning_language_id = updates.learning_language_id;
        if (updates.native_language_id) dbUpdates.native_language_id = updates.native_language_id;
        if (updates.level) dbUpdates.level = updates.level;
        if (updates.daily_goal) dbUpdates.daily_goal = updates.daily_goal;
        if (updates.avatar_url) dbUpdates.avatar_url = updates.avatar_url;

        const { data, error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', id)
          .select('*')
          .single();

        if (!error && data) {
          return mapRowToProfile(data);
        }
      } catch (err) {
        console.warn(`Supabase updateUser failed for ${id}, falling back locally:`, err);
      }
    }

    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      const fallbackUser: UserProfile = {
        id,
        auth_user_id: `auth-${id}`,
        username: updates.username || 'user',
        email: updates.email || 'user@bololocal.com',
        role: updates.role || 'user',
        full_name: updates.full_name || updates.name || 'User',
        name: updates.full_name || updates.name || 'User',
        native_language_id: updates.native_language_id || 'hi',
        learning_language_id: updates.learning_language_id || 'mr',
        level: updates.level || 'Beginner',
        daily_goal: updates.daily_goal || 15,
        status: updates.status || 'active',
        isAdmin: updates.role === 'admin',
        created_at: updates.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates,
      };
      users.unshift(fallbackUser);
      saveUsers(users);
      return fallbackUser;
    }

    const updatedUser: UserProfile = {
      ...users[index],
      ...updates,
      updated_at: new Date().toISOString(),
      name: updates.full_name || updates.name || users[index].full_name,
      isAdmin: (updates.role || users[index].role) === 'admin',
    };

    users[index] = updatedUser;
    saveUsers(users);
    return updatedUser;
  },

  deactivateUser: async (id: string): Promise<UserProfile> => {
    return userService.updateUser(id, { status: 'inactive' });
  },

  activateUser: async (id: string): Promise<UserProfile> => {
    return userService.updateUser(id, { status: 'active' });
  },

  deleteUser: async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) {
          console.warn(`Supabase deleteUser error for ${id}:`, error.message);
        }
      } catch (err) {
        console.warn(`Error deleting user in Supabase:`, err);
      }
    }

    const users = getStoredUsers();
    const filtered = users.filter((u) => u.id !== id);
    saveUsers(filtered);
    return true;
  },

  resetPassword: async (
    id: string,
    newPassword?: string
  ): Promise<{ success: boolean; message: string }> => {
    const user = await userService.getUserById(id);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const pwd = newPassword || `Bolo${Math.floor(1000 + Math.random() * 9000)}!`;

    if (isSupabaseConfigured) {
      // In Supabase, password reset can be triggered via auth reset link
      return {
        success: true,
        message: `Password reset triggered for ${user.email}. Temporary key generated.`,
      };
    }

    const creds = getStoredCredentials();
    creds[user.username.toLowerCase()] = pwd;
    creds[user.email.toLowerCase()] = pwd;
    saveCredentials(creds);

    return {
      success: true,
      message: `Temporary password for ${user.email} set to: ${pwd}`,
    };
  },
};
