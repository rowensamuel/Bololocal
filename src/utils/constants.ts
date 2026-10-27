import {
  BookOpen,
  Compass,
  Award,
  Layers,
  MessageSquareQuote,
  BarChart3,
  Sparkles,
  User,
  Users,
  Globe,
  HelpCircle,
  FileText
} from 'lucide-react';

export const APP_NAME = 'BOLOLOCAL';
export const APP_TAGLINE = "Don't Just Translate. Learn to Speak.";
export const APP_DESCRIPTION =
  'Learn Marathi through real-life conversations, useful phrases, interactive lessons, and AI-powered practice.';

export const STUDENT_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: Layers },
  { name: 'Learn', path: '/learn', icon: BookOpen },
  { name: 'Practice', path: '/practice', icon: Sparkles },
  { name: 'Vocabulary', path: '/vocabulary', icon: Compass },
  { name: 'Phrases', path: '/phrases', icon: MessageSquareQuote },
  { name: 'Progress', path: '/progress', icon: BarChart3 },
  { name: 'Achievements', path: '/achievements', icon: Award },
];

export const ADMIN_NAV_ITEMS = [
  { name: 'Overview', path: '/admin', icon: Layers },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Languages', path: '/admin/languages', icon: Globe },
  { name: 'Courses', path: '/admin/courses', icon: BookOpen },
  { name: 'Lessons', path: '/admin/lessons', icon: FileText },
  { name: 'Vocabulary', path: '/admin/vocabulary', icon: Compass },
  { name: 'Phrases', path: '/admin/phrases', icon: MessageSquareQuote },
  { name: 'Quizzes', path: '/admin/quizzes', icon: HelpCircle },
];

export const NATIVE_LANGUAGES = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Bengali'] as const;
export const TARGET_LANGUAGES = ['Marathi', 'Hindi', 'Tamil', 'Telugu', 'Kannada'] as const;
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export const DAILY_GOALS = [5, 10, 15, 20] as const;
export const PURPOSES = ['College', 'Travel', 'Food', 'Shopping', 'Work', 'Daily Conversation'] as const;

export const SITUATION_CATEGORIES = [
  'College',
  'Restaurant',
  'Shopping',
  'Travel',
  'Auto / Taxi',
  'Railway Station',
  'Hospital',
  'Daily Conversation',
] as const;
