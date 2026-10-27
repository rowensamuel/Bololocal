export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';
export type NativeLanguage = 'Hindi' | 'English' | 'Marathi' | 'Gujarati' | 'Bengali' | 'Tamil' | 'Telugu' | 'Sanskrit' | 'Kannada' | 'Malayalam';
export type TargetLanguage = 'Marathi' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Bengali' | 'Gujarati' | 'Sanskrit' | 'English' | 'Malayalam';
export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type DailyGoalMinutes = 5 | 10 | 15 | 20;
export type LearningPurpose = 'College' | 'Travel' | 'Food' | 'Shopping' | 'Work' | 'Daily Conversation' | 'Cultural Interest';
export type LearningGoal = LearningPurpose;

export interface UserProfile {
  id: string;
  auth_user_id: string;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  native_language_id: string; // e.g. 'hi'
  learning_language_id: string; // e.g. 'mr'
  level: ProficiencyLevel;
  daily_goal: DailyGoalMinutes;
  status: UserStatus;
  created_at: string;
  updated_at: string;

  // Compatibility helper properties
  name?: string;
  avatarUrl?: string;
  nativeLanguage?: NativeLanguage;
  learningLanguage?: TargetLanguage;
  dailyGoalMinutes?: DailyGoalMinutes;
  purposes?: LearningPurpose[];
  goal?: LearningGoal;
  streakDays?: number;
  totalXp?: number;
  lessonsCompletedCount?: number;
  joinedDate?: string;
  isAdmin?: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
