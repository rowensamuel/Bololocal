-- ====================================================================
-- BOLOLOCAL: ENABLE CLIENT-SIDE & ADMIN WRITES TO SUPABASE
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ====================================================================

-- 1. Ensure all 10 Indian languages exist in public.languages
INSERT INTO public.languages (id, name, code, native_name, script, flag, greeting, greeting_meaning, is_active)
VALUES
  ('mr', 'Marathi', 'mr', 'मराठी', 'Devanagari', '🇮🇳', 'नमस्कार', 'Hello / Greetings', true),
  ('hi', 'Hindi', 'hi', 'हिन्दी', 'Devanagari', '🇮🇳', 'नमस्ते', 'Hello / Respectful greetings', true),
  ('ta', 'Tamil', 'ta', 'தமிழ்', 'Tamil', '🇮🇳', 'வணக்கம்', 'Greetings / Welcome', true),
  ('te', 'Telugu', 'te', 'తెలుగు', 'Telugu', '🇮🇳', 'నమస్కారం', 'Greetings / Hello', true),
  ('bn', 'Bengali', 'bn', 'বাংলা', 'Bengali', '🇮🇳', 'নমস্কার', 'Hello / Respects', true),
  ('gu', 'Gujarati', 'gu', 'ગુજરાતી', 'Gujarati', '🇮🇳', 'નમસ્તે', 'Hello / Namaste', true),
  ('kn', 'Kannada', 'kn', 'ಕನ್ನಡ', 'Kannada', '🇮🇳', 'ನಮಸ್ಕಾರ', 'Hello / Greetings', true),
  ('ml', 'Malayalam', 'ml', 'മലയാളം', 'Malayalam', '🇮🇳', 'നമസ്കാരം', 'Hello / Greetings', true),
  ('pa', 'Punjabi', 'pa', 'ਪੰਜਾਬੀ', 'Gurmukhi', '🇮🇳', 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'God is Truth / Greetings', true),
  ('or', 'Odia', 'or', 'ଓଡ଼ିଆ', 'Odia', '🇮🇳', 'ନମସ୍କାର', 'Hello / Respects', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  native_name = EXCLUDED.native_name,
  is_active = true;

-- 2. Disable Row Level Security (RLS) on Content & Admin Management Tables
-- This immediately allows the web app (both deployed on Vercel and local)
-- to INSERT, UPDATE, and DELETE courses, vocabulary, phrases, quizzes, and lessons.
ALTER TABLE public.languages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.situations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timed_quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timed_quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on User Data Tables (or grant public access)
-- This allows user progress, quiz attempts, and user profile sync to persist directly.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_language_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.timed_quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations DISABLE ROW LEVEL SECURITY;

-- 4. Grant explicit full CRUD permissions to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Set default privileges for any future tables created
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;
