# Database Migrations & Supabase Schema Guide

**Platform:** BoloLocal — Regional Indian Language Learning Platform  
**Target Engine:** Supabase PostgreSQL 15  
**Audit Date:** October 27, 2026

---

## 1. Schema Overview

The complete production schema for BoloLocal is maintained in [supabase/schema.sql](file:///c:/Users/Rowen/Downloads/bololocal/supabase/schema.sql).

### Verified Schema Tables & Columns:

1. **`public.languages`**:
   - `id TEXT PRIMARY KEY` (Language code, e.g. `'hi'`, `'mr'`, `'sa'`, `'bn'`, `'te'`, `'ta'`, `'gu'`, `'en'`, `'kn'`, `'ml'`)
   - `name TEXT NOT NULL`, `code TEXT NOT NULL UNIQUE`, `native_name TEXT NOT NULL`, `script TEXT NOT NULL`
   - `flag TEXT`, `greeting TEXT`, `greeting_meaning TEXT`, `is_active BOOLEAN NOT NULL DEFAULT true`
2. **`public.profiles`**:
   - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `auth_user_id UUID NOT NULL DEFAULT auth.uid() UNIQUE`
   - `username TEXT NOT NULL UNIQUE`, `full_name TEXT NOT NULL DEFAULT ''`, `email TEXT NOT NULL UNIQUE`
   - `role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'))`
   - `native_language_id TEXT REFERENCES public.languages(id)`, `learning_language_id TEXT REFERENCES public.languages(id)`
   - `level TEXT NOT NULL DEFAULT 'Beginner'`, `daily_goal INTEGER NOT NULL DEFAULT 15`
3. **`public.courses`**:
   - `id TEXT PRIMARY KEY`, `language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE`
   - `title TEXT NOT NULL`, `description TEXT NOT NULL`, `level TEXT NOT NULL DEFAULT 'Beginner'`
   - `total_lessons INTEGER NOT NULL DEFAULT 10`, `estimated_hours INTEGER NOT NULL DEFAULT 12`
4. **`public.lessons`**:
   - `id TEXT PRIMARY KEY`, `course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL`
   - `language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE`
   - `number TEXT NOT NULL`, `title TEXT NOT NULL`, `native_title TEXT`
   - `short_description TEXT NOT NULL`, `difficulty TEXT NOT NULL DEFAULT 'Beginner'`
   - `duration_minutes INTEGER NOT NULL DEFAULT 15`, `xp_reward INTEGER NOT NULL DEFAULT 50`
   - `is_locked BOOLEAN NOT NULL DEFAULT false`
5. **`public.vocabulary`**:
   - `id TEXT PRIMARY KEY`, `language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE`
   - `lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL`
   - `native_word TEXT NOT NULL`, `roman TEXT NOT NULL`, `english TEXT NOT NULL`, `hindi TEXT`
   - `category TEXT NOT NULL DEFAULT 'General'`, `difficulty TEXT NOT NULL DEFAULT 'Beginner'`
   - `example_sentence TEXT`, `example_roman TEXT`, `example_english TEXT`
6. **`public.phrases`**:
   - `id TEXT PRIMARY KEY`, `language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE`
   - `native_text TEXT NOT NULL`, `roman TEXT NOT NULL`, `english TEXT NOT NULL`
   - `category TEXT NOT NULL DEFAULT 'General'`, `context TEXT`, `tags TEXT[] DEFAULT ARRAY[]::TEXT[]`
7. **`public.situations`**:
   - `id TEXT PRIMARY KEY`, `language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE`
   - `title TEXT NOT NULL`, `category TEXT NOT NULL`, `icon TEXT NOT NULL DEFAULT '📍'`
   - `description TEXT NOT NULL`, `phrase_count INTEGER NOT NULL DEFAULT 0`
8. **`public.quizzes`** & **`public.quiz_questions`**:
   - `id TEXT PRIMARY KEY`, `language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE`
   - `lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL`
   - `title TEXT NOT NULL`, `description TEXT NOT NULL`, `difficulty TEXT NOT NULL DEFAULT 'Beginner'`
   - `xp_reward INTEGER NOT NULL DEFAULT 50`, `time_limit_seconds INTEGER DEFAULT 180`
9. **`public.timed_quizzes`** & **`public.timed_quiz_questions`**:
   - `id TEXT PRIMARY KEY`, `language_id TEXT NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE`
   - `title TEXT NOT NULL`, `description TEXT NOT NULL`, `time_limit_seconds INTEGER NOT NULL DEFAULT 60`
   - `xp_reward INTEGER NOT NULL DEFAULT 80`, `is_active BOOLEAN NOT NULL DEFAULT true`
10. **`public.achievements`** & **`public.user_achievements`**:
    - `id TEXT PRIMARY KEY`, `name TEXT NOT NULL`, `description TEXT NOT NULL`
    - `icon TEXT NOT NULL DEFAULT 'Award'`, `category TEXT NOT NULL DEFAULT 'milestone'`
    - `condition_type TEXT NOT NULL`, `condition_value INTEGER NOT NULL DEFAULT 1`
    - `xp_reward INTEGER NOT NULL DEFAULT 25`, `is_active BOOLEAN NOT NULL DEFAULT true`
11. **`public.badges`** & **`public.user_badges`**:
    - `id TEXT PRIMARY KEY`, `name TEXT NOT NULL`, `description TEXT NOT NULL`
    - `icon TEXT NOT NULL DEFAULT '🏆'`, `rarity TEXT NOT NULL DEFAULT 'Common'`
    - `condition_type TEXT NOT NULL`, `condition_value INTEGER NOT NULL DEFAULT 1`
    - `xp_bonus INTEGER NOT NULL DEFAULT 25`, `is_active BOOLEAN NOT NULL DEFAULT true`

---

## 2. Row Level Security (RLS) Policy Guide

All tables have RLS enabled. The security model guarantees:
1. **Public Read Access**: Anyone can view approved regional languages, courses, lessons, vocabulary, phrases, quizzes, and badges (`SELECT USING (true)`).
2. **Authenticated Admin Write Access**: Only authenticated users with `role = 'admin'` in `public.profiles` can insert, update, or delete curriculum content (`FOR ALL TO authenticated USING (public.is_admin())`).
3. **Private User Data Protection**: User progress, quiz attempts, and profile modifications are strictly scoped to the owner (`auth_user_id = auth.uid()`).
4. **Zero Service-Role Key Exposure**: Frontend applications only require and store the public `anon` publishable key.

### Recommended SQL Migration Script (Apply in Supabase SQL Editor if needed):

```sql
-- Ensure is_admin function exists and is stable
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Ensure RLS is active
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timed_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Idempotent admin policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public languages are viewable by all users') THEN
    CREATE POLICY "Public languages are viewable by all users" ON public.languages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can modify languages') THEN
    CREATE POLICY "Admin can modify languages" ON public.languages FOR ALL TO authenticated USING (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public vocabulary viewable by all') THEN
    CREATE POLICY "Public vocabulary viewable by all" ON public.vocabulary FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can modify vocabulary') THEN
    CREATE POLICY "Admin can modify vocabulary" ON public.vocabulary FOR ALL TO authenticated USING (public.is_admin());
  END IF;
END $$;
```

---

## 3. Safe Execution & Verification

To verify that migrations match the code:
1. Run the test suite:
   ```bash
   npx tsx tests/adminCrud.test.ts
   ```
2. Verify production build:
   ```bash
   npm run build
   ```
3. No destructive migrations (`DROP TABLE`, `TRUNCATE`) were executed. All foreign key relationships and existing production data structures are preserved.
