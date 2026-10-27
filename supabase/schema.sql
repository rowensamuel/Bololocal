-- ====================================================================
-- BOLOLOCAL MASTER PRODUCTION DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. LANGUAGES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.languages (
  id TEXT PRIMARY KEY, -- 'hi', 'mr', 'sa', 'bn', 'te', 'ta', 'gu', 'en', 'kn', 'ml'
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  native_name TEXT NOT NULL,
  script TEXT NOT NULL,
  flag TEXT,
  greeting TEXT,
  greeting_meaning TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 2. PROFILES TABLE (CONNECTED TO AUTH.USERS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL DEFAULT auth.uid() UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  native_language_id TEXT NOT NULL DEFAULT 'hi' REFERENCES public.languages(id) ON UPDATE CASCADE,
  learning_language_id TEXT NOT NULL DEFAULT 'mr' REFERENCES public.languages(id) ON UPDATE CASCADE,
  level TEXT NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  daily_goal INTEGER NOT NULL DEFAULT 15 CHECK (daily_goal IN (5, 10, 15, 20)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ====================================================================
-- 3. COURSES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Beginner',
  total_lessons INTEGER NOT NULL DEFAULT 10,
  estimated_hours INTEGER NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_language ON public.courses(language_id);

-- ====================================================================
-- 4. LESSONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  native_title TEXT,
  short_description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  summary_text TEXT,
  grammar_point TEXT,
  cultural_note TEXT,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  useful_phrases JSONB DEFAULT '[]'::jsonb,
  dialogue JSONB DEFAULT '[]'::jsonb,
  summary_takeaways JSONB DEFAULT '[]'::jsonb,
  pronunciation_tips JSONB DEFAULT '[]'::jsonb,
  associated_quiz_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_language ON public.lessons(language_id);

-- ====================================================================
-- 5. VOCABULARY TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL,
  native_word TEXT NOT NULL,
  roman TEXT NOT NULL,
  english TEXT NOT NULL,
  hindi TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  example_sentence TEXT,
  example_roman TEXT,
  example_english TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_language ON public.vocabulary(language_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON public.vocabulary(category);

-- ====================================================================
-- 6. PHRASES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.phrases (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  native_text TEXT NOT NULL,
  roman TEXT NOT NULL,
  english TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  situation TEXT,
  context TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phrases_language ON public.phrases(language_id);
CREATE INDEX IF NOT EXISTS idx_phrases_category ON public.phrases(category);

-- ====================================================================
-- 7. SITUATIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.situations (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📍',
  description TEXT NOT NULL,
  phrase_count INTEGER NOT NULL DEFAULT 0,
  key_dialogue JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_situations_language ON public.situations(language_id);

-- ====================================================================
-- 8. QUIZZES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  time_limit_seconds INTEGER DEFAULT 180,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_language ON public.quizzes(language_id);

-- ====================================================================
-- 9. QUIZ QUESTIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL DEFAULT 'multiple-choice',
  prompt TEXT NOT NULL,
  native_prompt TEXT,
  roman_prompt TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  correct_option_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);

-- ====================================================================
-- 10. TIMED QUIZZES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.timed_quizzes (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  mode TEXT NOT NULL DEFAULT 'Quick Challenge',
  question_count INTEGER NOT NULL DEFAULT 5,
  time_limit_seconds INTEGER NOT NULL DEFAULT 60,
  xp_reward INTEGER NOT NULL DEFAULT 80,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timed_quizzes_language ON public.timed_quizzes(language_id);

-- ====================================================================
-- 11. TIMED QUIZ QUESTIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.timed_quiz_questions (
  id TEXT PRIMARY KEY,
  timed_quiz_id TEXT NOT NULL REFERENCES public.timed_quizzes(id) ON DELETE CASCADE,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  native_prompt TEXT,
  roman_prompt TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  correct_option_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timed_quiz_questions_quiz ON public.timed_quiz_questions(timed_quiz_id);

-- ====================================================================
-- 12. USER LANGUAGE PROGRESS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_language_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 1,
  level INTEGER NOT NULL DEFAULT 1,
  level_title TEXT NOT NULL DEFAULT 'Beginner Explorer',
  completed_lesson_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  bookmarked_vocab_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  bookmarked_phrase_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  quiz_attempts_count INTEGER NOT NULL DEFAULT 0,
  timed_quiz_attempts_count INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, language_id),
  UNIQUE(auth_user_id, language_id)
);

CREATE INDEX IF NOT EXISTS idx_ulp_user_lang ON public.user_language_progress(auth_user_id, language_id);

-- ====================================================================
-- 13. LESSON PROGRESS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT true,
  is_completed BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id),
  UNIQUE(auth_user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(auth_user_id);

-- ====================================================================
-- 14. QUIZ ATTEMPTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  user_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(auth_user_id);

-- ====================================================================
-- 15. TIMED QUIZ ATTEMPTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.timed_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  timed_quiz_id TEXT NOT NULL,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  unanswered INTEGER NOT NULL DEFAULT 0,
  time_limit_seconds INTEGER NOT NULL DEFAULT 60,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  time_remaining_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT true,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage INTEGER NOT NULL DEFAULT 0,
  user_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timed_attempts_user ON public.timed_quiz_attempts(auth_user_id);

-- ====================================================================
-- 16. ACHIEVEMENTS & USER ACHIEVEMENTS TABLES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Award',
  category TEXT NOT NULL DEFAULT 'milestone',
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 25,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id),
  UNIQUE(auth_user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements ON public.user_achievements(auth_user_id);

-- ====================================================================
-- 17. BADGES & USER BADGES TABLES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  rarity TEXT NOT NULL DEFAULT 'Common',
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL DEFAULT 1,
  xp_bonus INTEGER NOT NULL DEFAULT 25,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id),
  UNIQUE(auth_user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges ON public.user_badges(auth_user_id);

-- ====================================================================
-- 18. AI CONVERSATIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  scenario_id TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  evaluation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations ON public.ai_conversations(auth_user_id);

-- ====================================================================
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timed_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timed_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_language_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timed_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PUBLIC CONTENT POLICIES (Anyone can read, only admin can write)
CREATE POLICY "Public languages are viewable by all users" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Admin can modify languages" ON public.languages FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public courses viewable by all" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admin can modify courses" ON public.courses FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public lessons viewable by all" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Admin can modify lessons" ON public.lessons FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public vocabulary viewable by all" ON public.vocabulary FOR SELECT USING (true);
CREATE POLICY "Admin can modify vocabulary" ON public.vocabulary FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public phrases viewable by all" ON public.phrases FOR SELECT USING (true);
CREATE POLICY "Admin can modify phrases" ON public.phrases FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public situations viewable by all" ON public.situations FOR SELECT USING (true);
CREATE POLICY "Admin can modify situations" ON public.situations FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public quizzes viewable by all" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Admin can modify quizzes" ON public.quizzes FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public quiz questions viewable by all" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Admin can modify quiz questions" ON public.quiz_questions FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public timed quizzes viewable by all" ON public.timed_quizzes FOR SELECT USING (true);
CREATE POLICY "Admin can modify timed quizzes" ON public.timed_quizzes FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public timed quiz questions viewable by all" ON public.timed_quiz_questions FOR SELECT USING (true);
CREATE POLICY "Admin can modify timed quiz questions" ON public.timed_quiz_questions FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public achievements viewable by all" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admin can modify achievements" ON public.achievements FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public badges viewable by all" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admin can modify badges" ON public.badges FOR ALL TO authenticated USING (public.is_admin());

-- USER-SENSITIVE DATA POLICIES (Users read/write only their own rows; Admin can inspect)
CREATE POLICY "Users can view own profile or admin can view all" ON public.profiles
  FOR SELECT TO authenticated USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admin can manage all profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Users can view and manage own language progress" ON public.user_language_progress
  FOR ALL TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admin can view all user language progress" ON public.user_language_progress
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Users can view and manage own lesson progress" ON public.lesson_progress
  FOR ALL TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can view and insert own quiz attempts" ON public.quiz_attempts
  FOR ALL TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admin can view all quiz attempts" ON public.quiz_attempts
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Users can view and insert own timed quiz attempts" ON public.timed_quiz_attempts
  FOR ALL TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admin can view all timed quiz attempts" ON public.timed_quiz_attempts
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Users can view and unlock own achievements" ON public.user_achievements
  FOR ALL TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can view and unlock own badges" ON public.user_badges
  FOR ALL TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can view and manage own AI conversations" ON public.ai_conversations
  FOR ALL TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

-- ====================================================================
-- 20. AUTH TRIGGER & USERNAME RESOLUTION FUNCTIONS
-- ====================================================================

-- Function to resolve email from username (for secure username login without exposing emails publicly)
CREATE OR REPLACE FUNCTION public.get_email_for_username(p_username TEXT)
RETURNS TEXT AS $$
  SELECT email FROM public.profiles WHERE LOWER(username) = LOWER(p_username) LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger to automatically create a profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
  v_native_lang TEXT;
  v_learning_lang TEXT;
  v_role TEXT;
BEGIN
  v_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', v_username);
  v_native_lang := COALESCE(new.raw_user_meta_data->>'native_language_id', 'hi');
  v_learning_lang := COALESCE(new.raw_user_meta_data->>'learning_language_id', 'mr');
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'user');

  -- Ensure role is only 'admin' if explicitly created via secure admin flow
  IF v_role NOT IN ('admin', 'user') THEN
    v_role := 'user';
  END IF;

  INSERT INTO public.profiles (
    id,
    auth_user_id,
    username,
    full_name,
    email,
    role,
    native_language_id,
    learning_language_id,
    status
  ) VALUES (
    new.id,
    new.id,
    v_username,
    v_full_name,
    new.email,
    v_role,
    v_native_lang,
    v_learning_lang,
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    native_language_id = EXCLUDED.native_language_id,
    learning_language_id = EXCLUDED.learning_language_id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
