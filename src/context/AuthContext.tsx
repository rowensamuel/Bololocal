import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  NativeLanguage,
  TargetLanguage,
  ProficiencyLevel,
  DailyGoalMinutes,
  LearningPurpose,
} from '../types/user';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { getLanguageById } from '../data/mockLanguages';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  role: string | undefined;
  username: string | undefined;
  learningLanguage: string | undefined;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (usernameOrEmail: string, pass?: string) => Promise<UserProfile>;
  register: (name: string, email: string, pass?: string, username?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPass: string) => Promise<void>;
  updateOnboarding: (data: {
    nativeLanguage: NativeLanguage;
    learningLanguage: TargetLanguage;
    level: ProficiencyLevel;
    dailyGoalMinutes: DailyGoalMinutes;
    purposes: LearningPurpose[];
  }) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setLearningLanguage: (langIdOrCode: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check for active Supabase session
        const session = await authService.getSession();
        if (session?.user) {
          const profile = await userService.getUserById(session.user.id);
          if (isMounted && profile) {
            setUser(profile);
            setIsLoading(false);
            return;
          }
        }

        // Check cached profile if available
        const current = authService.getCurrentUser();
        if (isMounted) {
          setUser(current);
        }
      } catch (err) {
        console.error('Error initializing auth state:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state change events from Supabase
    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await userService.getUserById(session.user.id);
        if (isMounted) {
          setUser(profile || authService.getCurrentUser());
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
        }
      }
    });

    return () => {
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (usernameOrEmail: string, pass?: string): Promise<UserProfile> => {
    const loggedUser = await authService.login(usernameOrEmail, pass);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (name: string, email: string, pass?: string, username?: string) => {
    const newUser = await authService.register(name, email, pass, username);
    setUser(newUser);
  };

  const resetPassword = async (email: string) => {
    await authService.resetPasswordForEmail(email);
  };

  const updatePassword = async (newPass: string) => {
    await authService.updatePassword(newPass);
  };

  const updateOnboarding = async (data: {
    nativeLanguage: NativeLanguage;
    learningLanguage: TargetLanguage;
    level: ProficiencyLevel;
    dailyGoalMinutes: DailyGoalMinutes;
    purposes: LearningPurpose[];
  }) => {
    const updated = await authService.updateOnboarding(data);
    setUser(updated);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
  };

  const setLearningLanguage = async (langIdOrCode: string) => {
    const lang = getLanguageById(langIdOrCode);
    const updated = await authService.updateProfile({
      learning_language_id: lang.code,
      learningLanguage: lang.name as TargetLanguage,
    });
    setUser(updated);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        role: user?.role,
        username: user?.username,
        learningLanguage: user?.learningLanguage || user?.learning_language_id,
        loading: isLoading,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        resetPassword,
        updatePassword,
        updateOnboarding,
        updateProfile,
        updateUserProfile: updateProfile,
        setLearningLanguage,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
