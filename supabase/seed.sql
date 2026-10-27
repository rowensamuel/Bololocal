-- ====================================================================
-- BOLOLOCAL IDEMPOTENT PRODUCTION SEED SCRIPT
-- ====================================================================

-- 1. SEED 10 OFFICIAL SUPPORTED LANGUAGES
INSERT INTO public.languages
(id, name, code, native_name, script, flag, greeting, greeting_meaning, is_active)
VALUES
  ('hi', 'Hindi', 'hi', 'हिन्दी', 'Devanagari', '🇮🇳', 'नमस्ते!', 'Hello / Greetings in Hindi', true),
  ('mr', 'Marathi', 'mr', 'मराठी', 'Devanagari', '🇮🇳', 'नमस्कार!', 'Hello / Greetings in Marathi', true),
  ('sa', 'Sanskrit', 'sa', 'संस्कृतम्', 'Devanagari', '🇮🇳', 'नमो नमः!', 'Greetings / Respectful Hello in Sanskrit', true),
  ('bn', 'Bengali', 'bn', 'বাংলা', 'Bengali', '🇮🇳', 'নমস্কার!', 'Hello / Greetings in Bengali', true),
  ('te', 'Telugu', 'te', 'తెలుగు', 'Telugu', '🇮🇳', 'నమస్కారం!', 'Hello / Greetings in Telugu', true),
  ('ta', 'Tamil', 'ta', 'தமிழ்', 'Tamil', '🇮🇳', 'வணக்கம்!', 'Hello / Greetings in Tamil', true),
  ('gu', 'Gujarati', 'gu', 'ગુજરાતી', 'Gujarati', '🇮🇳', 'નમસ્તે!', 'Hello / Greetings in Gujarati', true),
  ('en', 'English', 'en', 'English', 'Latin', '🇮🇳', 'Hello!', 'Standard Greeting in English', true),
  ('kn', 'Kannada', 'kn', 'ಕನ್ನಡ', 'Kannada', '🇮🇳', 'ನಮಸ್ಕಾರ!', 'Hello / Greetings in Kannada', true),
  ('ml', 'Malayalam', 'ml', 'മലയാളം', 'Malayalam', '🇮🇳', 'നമസ്കാരം!', 'Hello / Greetings in Malayalam', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  native_name = EXCLUDED.native_name,
  script = EXCLUDED.script,
  flag = EXCLUDED.flag,
  greeting = EXCLUDED.greeting,
  greeting_meaning = EXCLUDED.greeting_meaning,
  is_active = EXCLUDED.is_active;


-- ====================================================================
-- 2. SEED ACHIEVEMENTS
-- ====================================================================

INSERT INTO public.achievements
(id, name, description, icon, category, condition_type, condition_value, xp_reward, is_active)
VALUES
  (
    'ach-first-quiz',
    'First Quiz Completed',
    'Complete your first practice quiz in any learning language.',
    'CheckCircle2',
    'milestone',
    'quiz_completed_count',
    1,
    25,
    true
  ),
  (
    'ach-first-timed',
    'First Timed Quiz Completed',
    'Successfully finish a high-energy timed quiz sprint.',
    'Timer',
    'timed_quiz',
    'timed_quiz_completed_count',
    1,
    50,
    true
  ),
  (
    'ach-perfect-score',
    'Perfect Score',
    'Score a flawless 100% on any quiz.',
    'Sparkles',
    'skill',
    'quiz_perfect_score',
    1,
    75,
    true
  ),
  (
    'ach-speed-demon',
    'Speed Demon',
    'Finish a timed quiz with at least 15 seconds remaining.',
    'Zap',
    'timed_quiz',
    'timed_quiz_time_remaining',
    15,
    60,
    true
  ),
  (
    'ach-polyglot-explorer',
    'Language Explorer',
    'Complete at least one lesson across 3 different languages.',
    'Globe',
    'exploration',
    'distinct_languages_count',
    3,
    100,
    true
  ),
  (
    'ach-streak-7',
    'Dedicated Learner',
    'Maintain an active daily learning streak for 7 consecutive days.',
    'Flame',
    'streak',
    'streak_days',
    7,
    100,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  condition_type = EXCLUDED.condition_type,
  condition_value = EXCLUDED.condition_value,
  xp_reward = EXCLUDED.xp_reward,
  is_active = EXCLUDED.is_active;


-- ====================================================================
-- 3. SEED BADGES
-- ====================================================================

INSERT INTO public.badges
(id, name, description, icon, rarity, condition_type, condition_value, xp_bonus, is_active)
VALUES
  (
    'badge-first-steps',
    'First Steps',
    'Complete your first lesson.',
    '🏆',
    'Common',
    'lesson_completed_count',
    1,
    25,
    true
  ),
  (
    'badge-speed-learner',
    'Speed Learner',
    'Complete a timed quiz with 90% or higher accuracy.',
    '⚡',
    'Rare',
    'timed_quiz_high_accuracy',
    90,
    50,
    true
  ),
  (
    'badge-streak-starter',
    'Streak Starter',
    'Maintain a 7-day learning streak.',
    '🔥',
    'Common',
    'streak_days',
    7,
    30,
    true
  ),
  (
    'badge-vocabulary-master',
    'Word Collector',
    'Master 50 vocabulary words in your learning language.',
    '📚',
    'Epic',
    'words_mastered_count',
    50,
    100,
    true
  ),
  (
    'badge-fluency-pioneer',
    'Conversationalist',
    'Complete all flagship curriculum units in a language.',
    '🌟',
    'Legendary',
    'course_completed_count',
    1,
    200,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  rarity = EXCLUDED.rarity,
  condition_type = EXCLUDED.condition_type,
  condition_value = EXCLUDED.condition_value,
  xp_bonus = EXCLUDED.xp_bonus,
  is_active = EXCLUDED.is_active;


-- ====================================================================
-- 4. SEED COURSES FOR ALL 10 LANGUAGES
-- ====================================================================

INSERT INTO public.courses
(id, language_id, title, description, level, total_lessons, estimated_hours)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'mr',
    'Spoken Marathi Foundation',
    'Master everyday spoken Marathi for street navigation, markets, polite address, and family conversations.',
    'Beginner',
    10,
    12
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'hi',
    'Conversational Hindi Essentials',
    'Foundational conversational Hindi for travel, food ordering, auto bargaining, and practical communication.',
    'Beginner',
    10,
    12
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'bn',
    'Spoken Bengali for Everyday Life',
    'Learn sweet, melodic Bengali for Kolkata markets, friendly chats, respectful greetings, and travel.',
    'Beginner',
    8,
    10
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'ta',
    'Essential Spoken Tamil',
    'Functional Tamil phrases, numbers, bus travel questions, and polite conversation for Chennai and beyond.',
    'Beginner',
    8,
    10
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'te',
    'Everyday Telugu Fluency',
    'Practical spoken Telugu for navigation, markets, transport, and day-to-day conversations.',
    'Beginner',
    8,
    10
  ),
  (
    'c0000000-0000-0000-0000-000000000006',
    'gu',
    'Gujarati Conversation Basics',
    'Practical Gujarati for greetings, markets, travel, food ordering, and everyday conversations.',
    'Beginner',
    8,
    10
  ),
  (
    'c0000000-0000-0000-0000-000000000007',
    'sa',
    'Sanskrit Conversational Basics',
    'Simple conversational Sanskrit (Samskrita Bharati style) for daily greetings, simple queries, and heritage appreciation.',
    'Beginner',
    6,
    8
  ),
  (
    'c0000000-0000-0000-0000-000000000008',
    'en',
    'Practical Indian English Fluency',
    'Professional and casual English tailored for Indian workplace, college, and social interactions.',
    'Beginner',
    8,
    10
  ),
  (
    'c0000000-0000-0000-0000-000000000009',
    'kn',
    'Everyday Spoken Kannada',
    'Navigate Bengaluru, auto rides, filter coffee, and day-to-day conversations with ease.',
    'Beginner',
    8,
    10
  ),
  (
    'c0000000-0000-0000-0000-000000000010',
    'ml',
    'Spoken Malayalam Essentials',
    'Essential Malayalam for Kerala travel, daily courtesy, ordering food, and making friends.',
    'Beginner',
    8,
    10
  )
ON CONFLICT (id) DO UPDATE SET
  language_id = EXCLUDED.language_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  total_lessons = EXCLUDED.total_lessons,
  estimated_hours = EXCLUDED.estimated_hours;


-- ====================================================================
-- 5. SEED STARTER LESSONS
-- ====================================================================

INSERT INTO public.lessons
(id, course_id, language_id, number, title, native_title, short_description, difficulty, duration_minutes, xp_reward)
VALUES
  (
    'l0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'mr',
    '1',
    'Greetings & Polite Forms',
    'नमस्कार आणि शिष्टाचार',
    'Learn formal and casual greetings, respectful pronouns, and essential courtesy.',
    'Beginner',
    15,
    50
  ),
  (
    'l0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'mr',
    '2',
    'Local Transport & Autos',
    'रिक्षा आणि स्थानिक प्रवास',
    'Bargain politely, ask for directions, and navigate Pune and Mumbai auto rides.',
    'Beginner',
    15,
    50
  ),
  (
    'l0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000002',
    'hi',
    '1',
    'Everyday Hindi Greetings',
    'नमस्ते और विनम्रता',
    'Foundational greetings, introducing yourself, and respectful address in Hindi.',
    'Beginner',
    15,
    50
  ),
  (
    'l0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000003',
    'bn',
    '1',
    'Bengali Welcome & Basics',
    'নমস্কার ও পরিচয়',
    'Essential Bengali greetings, polite phrases, and asking someone how they are doing.',
    'Beginner',
    15,
    50
  ),
  (
    'l0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000004',
    'ta',
    '1',
    'Spoken Tamil Essentials',
    'வணக்கம் மற்றும் அறிமுகம்',
    'Learn traditional Vanakkam, courteous forms, and self introduction in Tamil.',
    'Beginner',
    15,
    50
  ),
  (
    'l0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000005',
    'te',
    '1',
    'Telugu Greetings & Politeness',
    'నమస్కారం మరియు మర్యాద',
    'Basic respectful expressions, asking names, and introducing yourself in Telugu.',
    'Beginner',
    15,
    50
  ),
  (
    'l0000000-0000-0000-0000-000000000007',
    'c0000000-0000-0000-0000-000000000006',
    'gu',
    '1',
    'Gujarati Greetings & Warmth',
    'નમસ્તે અને વ્યવહાર',
    'Warm Gujarati greetings, asking well-being, and social politeness in Gujarat.',
    'Beginner',
    15,
    50
  ),
  (
    'l0000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000007',
    'sa',
    '1',
    'Simple Conversational Sanskrit',
    'परिचयः एवं शिष्टाचारः',
    'Simple, joyful conversational Sanskrit for daily greetings and pleasantries.',
    'Beginner',
    15,
    50
  ),
  (
    'l0000000-0000-0000-0000-000000000009',
    'c0000000-0000-0000-0000-000000000009',
    'kn',
    '1',
    'Spoken Kannada Essentials',
    'ನಮಸ್ಕಾರ ಮತ್ತು ಪರಿಚಯ',
    'Basic polite greetings and introduction in spoken Kannada.',
    'Beginner',
    15,
    50
  ),
  (
    'l0000000-0000-0000-0000-000000000010',
    'c0000000-0000-0000-0000-000000000010',
    'ml',
    '1',
    'Malayalam Greetings & Etiquette',
    'നമസ്കാരം',
    'Essential greetings and day-to-day politeness in Malayalam.',
    'Beginner',
    15,
    50
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description;


-- ====================================================================
-- 6. SEED STARTER VOCABULARY FOR ALL LANGUAGES
-- ====================================================================

INSERT INTO public.vocabulary
(id, language_id, native_word, roman, english, hindi, category, difficulty)
VALUES
  (
    'v0000000-0000-0000-0000-000000000001',
    'mr',
    'नमस्कार',
    'Namaskar',
    'Hello / Respectful Greetings',
    'नमस्ते',
    'Greetings',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000002',
    'mr',
    'पाणी',
    'Paani',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000003',
    'mr',
    'धन्यवाद',
    'Dhanyavaad',
    'Thank you',
    'धन्यवाद',
    'Politeness',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000004',
    'hi',
    'नमस्ते',
    'Namaste',
    'Hello / Greetings',
    'नमस्ते',
    'Greetings',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000005',
    'hi',
    'पानी',
    'Paani',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000006',
    'bn',
    'জল',
    'Jôl',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000007',
    'bn',
    'ধন্যবাদ',
    'Dhonnobad',
    'Thank you',
    'धन्यवाद',
    'Politeness',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000008',
    'ta',
    'தண்ணீர்',
    'Thanneer',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000009',
    'ta',
    'நன்றி',
    'Nandri',
    'Thank you',
    'धन्यवाद',
    'Politeness',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000010',
    'te',
    'నీళ్ళు',
    'Neellu',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000011',
    'te',
    'ధన్యవాదాలు',
    'Dhanyavaadaalu',
    'Thank you',
    'धन्यवाद',
    'Politeness',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000012',
    'gu',
    'પાણી',
    'Paani',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000013',
    'gu',
    'આભાર',
    'Aabhar',
    'Thank you',
    'धन्यवाद',
    'Politeness',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000014',
    'sa',
    'जलम्',
    'Jalam',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000015',
    'sa',
    'धन्यवादः',
    'Dhanyavaadah',
    'Thank you',
    'धन्यवाद',
    'Politeness',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000016',
    'en',
    'Water',
    'Water',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000017',
    'kn',
    'ನೀರು',
    'Neeru',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000018',
    'kn',
    'ಧನ್ಯವಾದಗಳು',
    'Dhanyavaadagalu',
    'Thank you',
    'धन्यवाद',
    'Politeness',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000019',
    'ml',
    'വെള്ളം',
    'Vellam',
    'Water',
    'पानी',
    'Daily Needs',
    'Beginner'
  ),
  (
    'v0000000-0000-0000-0000-000000000020',
    'ml',
    'നന്ദി',
    'Nandi',
    'Thank you',
    'धन्यवाद',
    'Politeness',
    'Beginner'
  )
ON CONFLICT (id) DO UPDATE SET
  native_word = EXCLUDED.native_word,
  roman = EXCLUDED.roman,
  english = EXCLUDED.english;


-- ====================================================================
-- 7. SEED STARTER PHRASES FOR ALL LANGUAGES
-- ====================================================================

INSERT INTO public.phrases
(id, language_id, native_text, roman, english, category, situation)
VALUES
  (
    'p0000000-0000-0000-0000-000000000001',
    'mr',
    'कसे आहात तुम्ही?',
    'Kase aahat tumhi?',
    'How are you? (Respectful)',
    'Greetings',
    'Daily Conversation'
  ),
  (
    'p0000000-0000-0000-0000-000000000002',
    'mr',
    'किती झाले?',
    'Kiti jhale?',
    'How much is it? (Fare / Bill)',
    'Shopping',
    'Market & Auto'
  ),
  (
    'p0000000-0000-0000-0000-000000000003',
    'hi',
    'आप कैसे हैं?',
    'Aap kaise hain?',
    'How are you? (Respectful)',
    'Greetings',
    'Daily Conversation'
  ),
  (
    'p0000000-0000-0000-0000-000000000004',
    'hi',
    'कितने पैसे हुए?',
    'Kitne paise hue?',
    'How much is it?',
    'Shopping',
    'Bargaining'
  ),
  (
    'p0000000-0000-0000-0000-000000000005',
    'bn',
    'আপনি কেমন আছেন?',
    'Apni kemon achhen?',
    'How are you?',
    'Greetings',
    'Daily Conversation'
  ),
  (
    'p0000000-0000-0000-0000-000000000006',
    'ta',
    'எப்படி இருக்கிறீர்கள்?',
    'Eppadi irukkiṟīrgaḷ?',
    'How are you?',
    'Greetings',
    'Daily Conversation'
  ),
  (
    'p0000000-0000-0000-0000-000000000007',
    'te',
    'మీరు ఎలా ఉన్నారు?',
    'Meeru ela unnaaru?',
    'How are you?',
    'Greetings',
    'Daily Conversation'
  ),
  (
    'p0000000-0000-0000-0000-000000000008',
    'gu',
    'તમે કેમ છો?',
    'Tame kem chho?',
    'How are you?',
    'Greetings',
    'Daily Conversation'
  ),
  (
    'p0000000-0000-0000-0000-000000000009',
    'sa',
    'भवान् कथम् अस्ति?',
    'Bhavan katham asti?',
    'How are you? (to male)',
    'Greetings',
    'Daily Conversation'
  ),
  (
    'p0000000-0000-0000-0000-000000000010',
    'en',
    'Excuse me, how much is this?',
    'Excuse me, how much is this?',
    'Asking price politely',
    'Shopping',
    'Retail'
  ),
  (
    'p0000000-0000-0000-0000-000000000011',
    'kn',
    'ನೀವು ಹೇಗಿದ್ದೀರಿ?',
    'Neevu hegiddiri?',
    'How are you? (Polite)',
    'Greetings',
    'Daily Conversation'
  ),
  (
    'p0000000-0000-0000-0000-000000000012',
    'ml',
    'സുഖമാണോ?',
    'Sukhamaano?',
    'How are you? / Are you well?',
    'Greetings',
    'Daily Conversation'
  )
ON CONFLICT (id) DO UPDATE SET
  native_text = EXCLUDED.native_text,
  roman = EXCLUDED.roman,
  english = EXCLUDED.english;


-- ====================================================================
-- 8. SEED STARTER QUIZZES & QUESTIONS
-- ====================================================================

INSERT INTO public.quizzes
(id, language_id, title, description, xp_reward)
VALUES
  (
    'q0000000-0000-0000-0000-000000000001',
    'mr',
    'Marathi Greetings & Politeness Quiz',
    'Test your knowledge of respectful address in Marathi.',
    50
  ),
  (
    'q0000000-0000-0000-0000-000000000002',
    'hi',
    'Hindi Basics Practice Quiz',
    'Verify essential Hindi greetings and vocabulary.',
    50
  ),
  (
    'q0000000-0000-0000-0000-000000000003',
    'bn',
    'Bengali Essentials Quiz',
    'Practice essential Bengali words and queries.',
    50
  ),
  (
    'q0000000-0000-0000-0000-000000000004',
    'ta',
    'Tamil Basics Quiz',
    'Test foundational spoken Tamil vocabulary.',
    50
  ),
  (
    'q0000000-0000-0000-0000-000000000005',
    'kn',
    'Kannada Basics Quiz',
    'Verify everyday spoken Kannada words.',
    50
  ),
  (
    'q0000000-0000-0000-0000-000000000006',
    'ml',
    'Malayalam Essentials Quiz',
    'Practice key spoken Malayalam terms.',
    50
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;


INSERT INTO public.quiz_questions
(id, quiz_id, language_id, prompt, options, correct_answer, correct_option_index, explanation)
VALUES
  (
    'qq000000-0000-0000-0000-000000000001',
    'q0000000-0000-0000-0000-000000000001',
    'mr',
    'What does "पाणी" (Paani) mean in English?',
    '["Food", "Water", "House", "Book"]'::jsonb,
    'Water',
    1,
    '"पाणी" means Water in Marathi.'
  ),
  (
    'qq000000-0000-0000-0000-000000000002',
    'q0000000-0000-0000-0000-000000000001',
    'mr',
    'How do you say "Thank you" in Marathi?',
    '["नमस्कार", "धन्यवाद", "कृपया", "शुभ"]'::jsonb,
    'धन्यवाद',
    1,
    '"धन्यवाद" means Thank you.'
  ),
  (
    'qq000000-0000-0000-0000-000000000003',
    'q0000000-0000-0000-0000-000000000002',
    'hi',
    'What is the respectful Hindi word for "Water"?',
    '["दूध", "पानी", "चाय", "रोटी"]'::jsonb,
    'पानी',
    1,
    '"पानी" translates to Water.'
  ),
  (
    'qq000000-0000-0000-0000-000000000004',
    'q0000000-0000-0000-0000-000000000003',
    'bn',
    'What is "Water" called in Bengali?',
    '["ভাত", "জল", "চা", "মাছ"]'::jsonb,
    'জল',
    1,
    'In standard Bengali, Water is referred to as "জল" (Jôl).'
  ),
  (
    'qq000000-0000-0000-0000-000000000005',
    'q0000000-0000-0000-0000-000000000004',
    'ta',
    'How do you say "Thank you" in Tamil?',
    '["வணக்கம்", "நன்றி", "மன்னிக்கவும்", "சரி"]'::jsonb,
    'நன்றி',
    1,
    '"நன்றி" (Nandri) means Thank you in Tamil.'
  ),
  (
    'qq000000-0000-0000-0000-000000000006',
    'q0000000-0000-0000-0000-000000000005',
    'kn',
    'What does "ನೀರು" (Neeru) mean in English?',
    '["Food", "Water", "House", "Road"]'::jsonb,
    'Water',
    1,
    '"ನೀರು" (Neeru) means Water in Kannada.'
  ),
  (
    'qq000000-0000-0000-0000-000000000007',
    'q0000000-0000-0000-0000-000000000006',
    'ml',
    'What does "വെള്ളം" (Vellam) mean in English?',
    '["Food", "Water", "House", "Tree"]'::jsonb,
    'Water',
    1,
    '"വെള്ളം" (Vellam) means Water in Malayalam.'
  )
ON CONFLICT (id) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer;


-- ====================================================================
-- 9. SEED TIMED QUIZZES
-- ====================================================================

INSERT INTO public.timed_quizzes
(id, language_id, title, description, time_limit_seconds, xp_reward, mode)
VALUES
  (
    't0000000-0000-0000-0000-000000000001',
    'mr',
    'Pune Street Smart: 60s Sprint',
    'Quick-fire test for Pune markets and auto negotiations.',
    60,
    80,
    'Speed Round'
  ),
  (
    't0000000-0000-0000-0000-000000000002',
    'hi',
    'Delhi Metro & Street Recall Sprint',
    'Answer fast before the clock expires.',
    60,
    80,
    'Quick Challenge'
  ),
  (
    't0000000-0000-0000-0000-000000000003',
    'bn',
    'Kolkata Tram & Adda 60s Challenge',
    'Rapid recall test for street Bengali.',
    60,
    80,
    'Speed Round'
  ),
  (
    't0000000-0000-0000-0000-000000000004',
    'kn',
    'Bengaluru Auto & Metro 60s Sprint',
    'Rapid recall test for spoken Kannada.',
    60,
    80,
    'Speed Round'
  ),
  (
    't0000000-0000-0000-0000-000000000005',
    'ml',
    'Kochi Ferry & Chai 60s Challenge',
    'Fast spoken Malayalam sprint.',
    60,
    80,
    'Quick Challenge'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  time_limit_seconds = EXCLUDED.time_limit_seconds;


-- ====================================================================
-- 10. SEED TIMED QUIZ QUESTIONS
-- ====================================================================

INSERT INTO public.timed_quiz_questions
(id, timed_quiz_id, language_id, prompt, options, correct_answer, correct_option_index)
VALUES
  (
    'tqq00000-0000-0000-0000-000000000001',
    't0000000-0000-0000-0000-000000000001',
    'mr',
    'Which phrase means "How much is it?" in Marathi?',
    '["कसे आहात?", "किती झाले?", "कुठे चाललात?", "नाव काय?"]'::jsonb,
    'किती झाले?',
    1
  ),
  (
    'tqq00000-0000-0000-0000-000000000002',
    't0000000-0000-0000-0000-000000000001',
    'mr',
    'What does "पाहिजे" (Paahije) mean?',
    '["Do not want", "Want / Need", "Where", "When"]'::jsonb,
    'Want / Need',
    1
  ),
  (
    'tqq00000-0000-0000-0000-000000000003',
    't0000000-0000-0000-0000-000000000002',
    'hi',
    'Which word means "Ticket" in everyday Hindi?',
    '["टिकट", "गाड़ी", "रास्ता", "दुकान"]'::jsonb,
    'टिकट',
    0
  ),
  (
    'tqq00000-0000-0000-0000-000000000004',
    't0000000-0000-0000-0000-000000000003',
    'bn',
    'What is "How much?" in street Bengali?',
    '["কত হয়েছে?", "কোথায় যাবেন?", "কেমন আছেন?", "ভালো"]'::jsonb,
    'কত হয়েছে?',
    0
  ),
  (
    'tqq00000-0000-0000-0000-000000000005',
    't0000000-0000-0000-0000-000000000004',
    'kn',
    'What does "ಧನ್ಯವಾದಗಳು" mean in Kannada?',
    '["Hello", "Thank you", "Water", "Where"]'::jsonb,
    'Thank you',
    1
  ),
  (
    'tqq00000-0000-0000-0000-000000000006',
    't0000000-0000-0000-0000-000000000005',
    'ml',
    'What does "നന്ദി" mean in Malayalam?',
    '["Hello", "Thank you", "Water", "Good"]'::jsonb,
    'Thank you',
    1
  )
ON CONFLICT (id) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer;


-- ====================================================================
-- SEED COMPLETE
-- ====================================================================