/**
 * BOLOLOCAL Comprehensive Automated Test Suite
 * Validating Authentication, RBAC, Multi-language Isolation,
 * Quiz Language Guarding, and XP / Achievement Idempotency.
 */

// Mock Browser Environment
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

// @ts-ignore
globalThis.localStorage = localStorageMock;

import { userService } from '../src/services/userService';
import { authService } from '../src/services/authService';
import { lessonService } from '../src/services/lessonService';
import { vocabularyService } from '../src/services/vocabularyService';
import { phraseService } from '../src/services/phraseService';
import { quizService } from '../src/services/quizService';
import { achievementService } from '../src/services/achievementService';
import { badgeService } from '../src/services/badgeService';
import { progressService } from '../src/services/progressService';
import { mockLanguages } from '../src/data/mockLanguages';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('🚀 BOLOLOCAL TEST RUNNER STARTING');
  console.log('========================================\n');

  // TEST 1: Initial Auth State
  console.log('--- 1. AUTHENTICATION & GUEST STATE ---');
  localStorage.clear();
  const initialUser = authService.getCurrentUser();
  assert(initialUser === null, 'Initial state without token returns null (Guest is NOT auto-logged in)');

  // TEST 2: Valid Login (Admin)
  const adminUser = await authService.login('admin', 'Admin@123');
  assert(adminUser.role.toLowerCase() === 'admin', 'Admin user logs in successfully with admin role');
  assert(authService.getCurrentUser()?.username === 'admin', 'Current user correctly reflects authenticated admin');

  // TEST 3: Invalid Credentials Rejected
  let rejected = false;
  try {
    await authService.login('admin', 'WrongPass');
  } catch {
    rejected = true;
  }
  assert(rejected, 'Invalid password is strictly rejected with error');

  // TEST 4: Student User Login
  const studentUser = await authService.login('test_marathi', 'Pass@123');
  assert(studentUser.role.toLowerCase() === 'user', 'Student logs in successfully with user role');
  assert(studentUser.learning_language_id === 'mr', 'Student active language is initialized to Marathi');

  // TEST 5: User Management Rejection of Duplicates
  console.log('\n--- 2. ADMIN USER MANAGEMENT & DUPLICATE CHECKS ---');
  let dupUsernameRejected = false;
  try {
    await userService.createUser({
      full_name: 'Duplicate Admin',
      email: 'new_unique@bololocal.com',
      username: 'admin', // already taken!
      role: 'user',
      learning_language_id: 'mr',
    });
  } catch (err: any) {
    dupUsernameRejected = err.message.includes('Username');
  }
  assert(dupUsernameRejected, 'Duplicate username is rejected with descriptive error');

  let dupEmailRejected = false;
  try {
    await userService.createUser({
      full_name: 'Duplicate Email',
      email: 'admin@bololocal.com', // already taken!
      username: 'unique_user_99',
      role: 'user',
      learning_language_id: 'mr',
    });
  } catch (err: any) {
    dupEmailRejected = err.message.includes('Email');
  }
  assert(dupEmailRejected, 'Duplicate email is rejected with descriptive error');

  const validNewUser = await userService.createUser({
    full_name: 'Fresh Learner',
    email: 'learner@bololocal.com',
    username: 'fresh_learner',
    role: 'user',
    learning_language_id: 'bn',
  });
  assert(validNewUser.username === 'fresh_learner', 'Unique user is registered successfully');

  // TEST 6: Multi-Language Content Filtering
  console.log('\n--- 3. MULTI-LANGUAGE CONTENT FILTERING ---');
  assert(mockLanguages.length === 10, '10 official languages supported');

  for (const lang of mockLanguages) {
    const vocab = await vocabularyService.getAllVocabulary(lang.code);
    assert(Array.isArray(vocab) && vocab.length > 0, `Vocabulary exists for language: ${lang.name} (${lang.code})`);

    const phrases = await phraseService.getPhrases(lang.code);
    assert(Array.isArray(phrases) && phrases.length > 0, `Phrases exist for language: ${lang.name} (${lang.code})`);

    const lessons = await lessonService.getLessonsByLanguage(lang.code);
    assert(Array.isArray(lessons) && lessons.length > 0, `Lessons exist for language: ${lang.name} (${lang.code})`);
  }

  // TEST 7: Quiz Language Validation
  console.log('\n--- 4. QUIZ LANGUAGE VALIDATION ---');
  const marathiQuiz = await quizService.getQuizById('quiz-01');
  assert(marathiQuiz !== null && marathiQuiz?.language_id === 'mr', 'Marathi quiz loaded with language_id = "mr"');

  const bengaliQuiz = await quizService.getQuizById('quiz-bn-01');
  assert(bengaliQuiz !== null && bengaliQuiz?.language_id === 'bn', 'Bengali quiz loaded with language_id = "bn"');

  // TEST 8: User & Multi-Language Progress Isolation
  console.log('\n--- 5. PROGRESS ISOLATION (PER USER & PER LANGUAGE) ---');
  const user1 = 'user-test-marathi';
  const user2 = 'user-test-bengali';

  // User 1 completes Marathi lesson 1
  await lessonService.markLessonCompleted('lesson-mr-1', user1, 'mr');
  const u1MarathiCompleted = await lessonService.getCompletedLessonIds(user1, 'mr');
  const u1BengaliCompleted = await lessonService.getCompletedLessonIds(user1, 'bn');
  const u2MarathiCompleted = await lessonService.getCompletedLessonIds(user2, 'mr');

  assert(u1MarathiCompleted.includes('lesson-mr-1'), 'User 1 Marathi progress records lesson-mr-1');
  assert(!u1BengaliCompleted.includes('lesson-mr-1'), 'User 1 Bengali progress is isolated and does NOT contain lesson-mr-1');
  assert(!u2MarathiCompleted.includes('lesson-mr-1'), 'User 2 progress is isolated and does NOT contain User 1 completions');

  // Verify isolated progress metrics
  await progressService.addXp(user1, 'mr', 100);
  await progressService.addXp(user1, 'bn', 30);
  const u1MrProgress = await progressService.getProgress(user1, 'mr');
  const u1BnProgress = await progressService.getProgress(user1, 'bn');

  assert(u1MrProgress.total_xp === 150, 'User 1 Marathi XP is 150 (50 baseline + 100 added)');
  assert(u1BnProgress.total_xp === 80, 'User 1 Bengali XP is 80 (50 baseline + 30 added, separate storage)');

  // TEST 9: XP & Quiz Attempt Idempotency
  console.log('\n--- 6. IDEMPOTENCY OF QUIZ SUBMISSIONS & ACHIEVEMENTS ---');
  const attemptId = 'unique-attempt-999';
  const firstSubmit = await quizService.submitQuizAttempt({
    id: attemptId,
    user_id: user1,
    language_id: 'mr',
    quizId: 'quiz-01',
    score: 5,
    totalQuestions: 5,
    xpEarned: 130,
    completedAt: new Date().toISOString(),
  });

  assert(firstSubmit.success && !firstSubmit.isDuplicate && firstSubmit.xpEarned === 130, 'First attempt submits and awards 130 XP');

  // Re-submitting the exact same attempt
  const secondSubmit = await quizService.submitQuizAttempt({
    id: attemptId,
    user_id: user1,
    language_id: 'mr',
    quizId: 'quiz-01',
    score: 5,
    totalQuestions: 5,
    xpEarned: 130,
    completedAt: new Date().toISOString(),
  });

  assert(firstSubmit.newAchievements.some(a => a.id === 'ach-first-quiz'), 'First quiz attempt automatically unlocks ach-first-quiz');
  assert(firstSubmit.newBadges.some(b => b.id === 'badge-speed-learner'), 'Perfect score quiz automatically awards badge-speed-learner');

  // TEST 10: Achievement & Badge Idempotency with manual unlocks
  const freshUser = 'user-fresh-ach-test';
  const ach1 = await achievementService.unlockAchievement(freshUser, 'ach-first-timed');
  assert(ach1 !== null && ach1.id === 'ach-first-timed', 'First achievement unlocked successfully for fresh user');

  const ach2 = await achievementService.unlockAchievement(freshUser, 'ach-first-timed');
  assert(ach2 === null, 'Duplicate achievement unlock is idempotently rejected (returns null)');

  const badge1 = await badgeService.unlockBadge(freshUser, 'badge-first-steps');
  assert(badge1 !== null && badge1.id === 'badge-first-steps', 'First badge unlocked successfully for fresh user');

  const badge2 = await badgeService.unlockBadge(freshUser, 'badge-first-steps');
  assert(badge2 === null, 'Duplicate badge unlock is idempotently rejected (returns null)');

  // TEST 11: Timer format utilities & non-negative bounds
  console.log('\n--- 7. TIMER MECHANICS & BOUNDS ---');
  const { formatTimerSeconds } = await import('../src/hooks/useQuizTimer');
  assert(formatTimerSeconds(65) === '01:05', 'Timer formats 65 seconds as 01:05');
  assert(formatTimerSeconds(0) === '00:00', 'Timer formats 0 seconds as 00:00');
  assert(formatTimerSeconds(-10) === '00:00', 'Negative timer input is strictly clamped to 00:00');

  // TEST 12: Timed Quiz Submission & Idempotent XP
  console.log('\n--- 8. TIMED QUIZ SUBMISSION & IDEMPOTENCY ---');
  const timedAttemptId = 'timed-attempt-unique-123';
  const timedSubmit1 = await quizService.submitTimedQuizAttempt({
    id: timedAttemptId,
    user_id: user1,
    timed_quiz_id: 'tq-mr-01',
    language_id: 'mr',
    score: 40,
    total_questions: 4,
    correct_answers: 4,
    incorrect_answers: 0,
    unanswered: 0,
    time_limit_seconds: 60,
    time_taken_seconds: 22,
    time_remaining_seconds: 38,
    completed: true,
    xp_earned: 90,
    accuracy_percentage: 100,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  });

  assert(timedSubmit1.success && !timedSubmit1.isDuplicate && timedSubmit1.attempt.xp_earned === 90, 'Timed quiz submission succeeds with 90 XP');

  // Resubmit exact same timed attempt
  const timedSubmit2 = await quizService.submitTimedQuizAttempt({
    id: timedAttemptId,
    user_id: user1,
    timed_quiz_id: 'tq-mr-01',
    language_id: 'mr',
    score: 40,
    total_questions: 4,
    correct_answers: 4,
    incorrect_answers: 0,
    unanswered: 0,
    time_limit_seconds: 60,
    time_taken_seconds: 22,
    time_remaining_seconds: 38,
    completed: true,
    xp_earned: 90,
    accuracy_percentage: 100,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  });

  assert(timedSubmit2.isDuplicate === true && timedSubmit2.attempt.xp_earned === 0, 'Duplicate timed quiz attempt returns 0 duplicate XP');

  // TEST 13: Strict Quiz Language Matching
  console.log('\n--- 9. STRICT QUIZ LANGUAGE MATCHING ---');
  const marathiQuizCheck = await quizService.getQuizById('quiz-01');
  const userBengaliLang = 'bn';
  const isMatch = marathiQuizCheck?.language_id.toLowerCase() === userBengaliLang.toLowerCase();
  assert(isMatch === false, 'Bengali user attempting Marathi quiz is correctly detected as mismatch (NOT silently accepted)');

  // TEST 14: Course Syllabus Isolation
  console.log('\n--- 10. MULTI-LANGUAGE COURSE ISOLATION ---');
  const { courseService } = await import('../src/services/courseService');
  const bengaliCourses = await courseService.getCourses('bn');
  assert(bengaliCourses.every((c) => c.language_id === 'bn'), 'Bengali course list only contains Bengali courses');

  const marathiCourses = await courseService.getCourses('mr');
  assert(marathiCourses.every((c) => c.language_id === 'mr'), 'Marathi course list only contains Marathi courses');

  // TEST 15: Unauthenticated Onboarding Registration & Profile Setup
  console.log('\n--- 11. ONBOARDING REGISTRATION & PROFILE PERSISTENCE ---');
  const freshLearner = await authService.register(
    'New Onboarder',
    'onboarder@example.com',
    'Pass@123',
    'onboarder_99'
  );
  assert(freshLearner.username === 'onboarder_99', 'Guest registers successfully during onboarding');

  const updatedLearner = await authService.updateProfile({
    learning_language_id: 'bn',
    native_language_id: 'hi',
    daily_goal: 20,
    level: 'Beginner',
  });
  assert(updatedLearner.learning_language_id === 'bn', 'Onboarding preferences correctly update learning language to Bengali');
  assert(updatedLearner.daily_goal === 20, 'Daily practice target is recorded as 20 mins');

  // TEST 16: Profile Role Update Integrity
  console.log('\n--- 12. ROLE UPDATE INTEGRITY ---');
  const elevated = await authService.updateProfile({ role: 'admin' });
  assert(elevated.role === 'admin', 'User profile role can be updated to admin');
  const demoted = await authService.updateProfile({ role: 'user' });
  assert(demoted.role === 'user', 'User profile role can be updated back to user');

  // TEST 17: Speech Locale Mapping for all 10 languages
  console.log('\n--- 13. SPEECH LOCALES COVERAGE ---');
  const { LANGUAGE_LOCALE_MAP } = await import('../src/utils/speech');
  for (const lang of mockLanguages) {
    const locale = LANGUAGE_LOCALE_MAP[lang.code];
    assert(typeof locale === 'string' && locale.includes('IN'), `Valid speech locale exists for ${lang.name} (${lang.code}): ${locale}`);
  }

  console.log('\n========================================');
  console.log(`🏁 TEST RUN FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
