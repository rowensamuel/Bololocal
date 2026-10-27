import assert from 'node:assert';

// Mock Browser Environment for Node test runner
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

// @ts-ignore
globalThis.localStorage = localStorageMock;
import { languageService } from '../src/services/languageService';
import { courseService } from '../src/services/courseService';
import { lessonService } from '../src/services/lessonService';
import { vocabularyService } from '../src/services/vocabularyService';
import { phraseService } from '../src/services/phraseService';
import { quizService } from '../src/services/quizService';
import { timedQuizService } from '../src/services/timedQuizService';
import { achievementService } from '../src/services/achievementService';
import { badgeService } from '../src/services/badgeService';
import { userService } from '../src/services/userService';
import { executeWithRetry, isRateLimitError, queryCache } from '../src/utils/supabaseClientHelper';

async function runAdminCrudTests() {
  console.log('\n========================================');
  console.log('🛡️  BOLOLOCAL ADMIN CRUD & RATE LIMIT TEST SUITE');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ❌ FAIL: ${name}`, err);
        failed++;
      });
  }

  // 1. LANGUAGES MODULE CRUD
  console.log('--- 1. LANGUAGES MODULE CRUD ---');
  await test('Create new language', async () => {
    const lang = await languageService.createLanguage({
      id: 'pa',
      code: 'pa',
      name: 'Punjabi',
      native_name: 'ਪੰਜਾਬੀ',
      script: 'Gurmukhi',
      flag: '🇮🇳',
      greeting: 'Sat Sri Akal',
    });
    assert.strictEqual(lang.code, 'pa');
    assert.strictEqual(lang.name, 'Punjabi');
  });

  await test('Read languages includes created language', async () => {
    const list = await languageService.getLanguages();
    const found = list.find((l) => l.code === 'pa');
    assert.ok(found, 'Punjabi should be in languages list');
  });

  await test('Update language', async () => {
    const updated = await languageService.updateLanguage('pa', { greeting: 'Namashkar' });
    assert.strictEqual(updated.greeting, 'Namashkar');
  });

  await test('Delete language', async () => {
    const ok = await languageService.deleteLanguage('pa');
    assert.strictEqual(ok, true);
    const list = await languageService.getLanguages();
    assert.ok(!list.some((l) => l.code === 'pa'));
  });

  // 2. COURSES MODULE CRUD
  console.log('\n--- 2. COURSES MODULE CRUD ---');
  await test('Create course', async () => {
    const c = await courseService.createCourse({
      id: 'course-test-1',
      title: 'Bengali Essentials',
      language_id: 'bn',
      level: 'Beginner',
      totalLessons: 8,
      estimatedHours: 6,
    });
    assert.strictEqual(c.title, 'Bengali Essentials');
  });

  await test('Update course', async () => {
    const updated = await courseService.updateCourse('course-test-1', {
      title: 'Bengali Essentials Advanced',
    });
    assert.strictEqual(updated.title, 'Bengali Essentials Advanced');
  });

  await test('Delete course', async () => {
    const ok = await courseService.deleteCourse('course-test-1');
    assert.strictEqual(ok, true);
    const all = await courseService.getCourses();
    assert.ok(!all.some((c) => c.id === 'course-test-1'));
  });

  // 3. LESSONS MODULE CRUD
  console.log('\n--- 3. LESSONS MODULE CRUD ---');
  await test('Create lesson', async () => {
    const l = await lessonService.createLesson({
      id: 'lesson-test-1',
      title: 'Ordering Food',
      marathiTitle: 'जेवण मागवणे',
      number: '11',
      language_id: 'mr',
      xpReward: 60,
    });
    assert.strictEqual(l.title, 'Ordering Food');
    assert.strictEqual(l.xpReward, 60);
  });

  await test('Update lesson', async () => {
    const updated = await lessonService.updateLesson('lesson-test-1', {
      durationMinutes: 20,
    });
    assert.strictEqual(updated.durationMinutes, 20);
  });

  await test('Delete lesson', async () => {
    const ok = await lessonService.deleteLesson('lesson-test-1');
    assert.strictEqual(ok, true);
    const all = await lessonService.getLessons();
    assert.ok(!all.some((l) => l.id === 'lesson-test-1'));
  });

  // 4. VOCABULARY MODULE CRUD
  console.log('\n--- 4. VOCABULARY MODULE CRUD ---');
  await test('Create vocabulary item', async () => {
    const v = await vocabularyService.createVocabulary({
      id: 'vocab-test-1',
      marathi: 'स्वागत',
      roman: 'Swagat',
      english: 'Welcome',
      category: 'Greetings',
      language_id: 'mr',
    });
    assert.strictEqual(v.marathi, 'स्वागत');
    assert.strictEqual(v.english, 'Welcome');
  });

  await test('Update vocabulary item', async () => {
    const updated = await vocabularyService.updateVocabulary('vocab-test-1', {
      english: 'Warm Welcome',
    });
    assert.strictEqual(updated.english, 'Warm Welcome');
  });

  await test('Delete vocabulary item', async () => {
    const ok = await vocabularyService.deleteVocabulary('vocab-test-1');
    assert.strictEqual(ok, true);
    const all = await vocabularyService.getAllVocabulary();
    assert.ok(!all.some((v) => v.id === 'vocab-test-1'));
  });

  // 5. PHRASES & SITUATIONS MODULE CRUD
  console.log('\n--- 5. PHRASES & SITUATIONS MODULE CRUD ---');
  await test('Create phrase', async () => {
    const p = await phraseService.createPhrase({
      id: 'phrase-test-1',
      marathi: 'तुम्ही कसे आहात?',
      roman: 'Tumhi kase ahat?',
      english: 'How are you?',
      category: 'Daily Conversation',
      language_id: 'mr',
    });
    assert.strictEqual(p.marathi, 'तुम्ही कसे आहात?');
  });

  await test('Update phrase', async () => {
    const updated = await phraseService.updatePhrase('phrase-test-1', {
      english: 'How are you doing?',
    });
    assert.strictEqual(updated.english, 'How are you doing?');
  });

  await test('Delete phrase', async () => {
    const ok = await phraseService.deletePhrase('phrase-test-1');
    assert.strictEqual(ok, true);
    const all = await phraseService.getPhrases();
    assert.ok(!all.some((p) => p.id === 'phrase-test-1'));
  });

  await test('Create situation', async () => {
    const s = await phraseService.createSituation({
      id: 'sit-test-1',
      title: 'Metro Station Navigation',
      category: 'Travel',
      icon: '🚇',
      language_id: 'mr',
    });
    assert.strictEqual(s.title, 'Metro Station Navigation');
  });

  await test('Delete situation', async () => {
    const ok = await phraseService.deleteSituation('sit-test-1');
    assert.strictEqual(ok, true);
  });

  // 6. QUIZZES & TIMED QUIZZES CRUD
  console.log('\n--- 6. QUIZZES & TIMED QUIZZES CRUD ---');
  await test('Create standard quiz', async () => {
    const q = await quizService.createQuiz({
      id: 'quiz-test-1',
      title: 'Advanced Food Terms Quiz',
      language_id: 'mr',
      xpReward: 70,
    });
    assert.strictEqual(q.title, 'Advanced Food Terms Quiz');
    assert.strictEqual(q.xpReward, 70);
  });

  await test('Delete standard quiz', async () => {
    const ok = await quizService.deleteQuiz('quiz-test-1');
    assert.strictEqual(ok, true);
  });

  await test('Create timed quiz', async () => {
    const tq = await timedQuizService.createTimedQuiz({
      id: 'timed-test-1',
      title: 'Super Sprint 45s',
      language_id: 'mr',
      time_limit_seconds: 45,
      xp_reward: 100,
    });
    assert.strictEqual(tq.time_limit_seconds, 45);
    assert.strictEqual(tq.xp_reward, 100);
  });

  await test('Delete timed quiz', async () => {
    const ok = await timedQuizService.deleteTimedQuiz('timed-test-1');
    assert.strictEqual(ok, true);
  });

  // 7. ACHIEVEMENTS & BADGES CRUD
  console.log('\n--- 7. ACHIEVEMENTS & BADGES CRUD ---');
  await test('Create achievement', async () => {
    const ach = await achievementService.createAchievement({
      id: 'ach-test-1',
      name: 'Polyglot Novice',
      description: 'Explore 3 languages',
      category: 'milestone',
      condition_type: 'count',
      condition_value: 3,
      xp_reward: 75,
    });
    assert.strictEqual(ach.name, 'Polyglot Novice');
    assert.strictEqual(ach.xp_reward, 75);
  });

  await test('Delete achievement', async () => {
    const ok = await achievementService.deleteAchievement('ach-test-1');
    assert.strictEqual(ok, true);
  });

  await test('Create badge', async () => {
    const b = await badgeService.createBadge({
      id: 'badge-test-1',
      name: 'Grand Champion',
      description: 'Awarded for exceptional milestones',
      icon: '👑',
      rarity: 'Legendary',
      xp_bonus: 200,
    });
    assert.strictEqual(b.rarity, 'Legendary');
    assert.strictEqual(b.xp_bonus, 200);
  });

  await test('Delete badge', async () => {
    const ok = await badgeService.deleteBadge('badge-test-1');
    assert.strictEqual(ok, true);
  });

  // 8. USER MANAGEMENT CRUD
  console.log('\n--- 8. USER MANAGEMENT CRUD ---');
  await test('Create user account without Edge function crash', async () => {
    const u = await userService.createUser({
      username: 'test_instructor',
      email: 'instructor@bololocal.com',
      full_name: 'Instructor Rao',
      role: 'admin',
    });
    assert.strictEqual(u.username, 'test_instructor');
    assert.strictEqual(u.role, 'admin');
  });

  await test('Update user status and role', async () => {
    const list = await userService.getUsers();
    const target = list.find((u) => u.username === 'test_instructor')!;
    const updated = await userService.updateUser(target.id, { role: 'user' });
    assert.strictEqual(updated.role, 'user');
  });

  await test('Delete user account', async () => {
    const list = await userService.getUsers();
    const target = list.find((u) => u.username === 'test_instructor')!;
    const ok = await userService.deleteUser(target.id);
    assert.strictEqual(ok, true);
  });

  // 9. RATE LIMITING & DEDUPLICATION CHECKS
  console.log('\n--- 9. RATE LIMITING & DEDUPLICATION CHECKS ---');
  await test('isRateLimitError correctly identifies 429 status and messages', () => {
    assert.strictEqual(isRateLimitError({ status: 429 }), true);
    assert.strictEqual(isRateLimitError({ message: 'Email rate limit exceeded' }), true);
    assert.strictEqual(isRateLimitError({ message: 'Too many requests' }), true);
    assert.strictEqual(isRateLimitError({ status: 200 }), false);
  });

  await test('queryCache deduplicates concurrent in-flight requests', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      await new Promise((res) => setTimeout(res, 50));
      return { result: 'ok' };
    };

    const [r1, r2, r3] = await Promise.all([
      queryCache.getOrFetch('test-dedup-key', fetcher),
      queryCache.getOrFetch('test-dedup-key', fetcher),
      queryCache.getOrFetch('test-dedup-key', fetcher),
    ]);

    assert.strictEqual(r1.result, 'ok');
    assert.strictEqual(r2.result, 'ok');
    assert.strictEqual(r3.result, 'ok');
    assert.strictEqual(callCount, 1, 'Fetcher must be invoked exactly once for 3 concurrent requests');
  });

  await test('executeWithRetry retries on transient errors and succeeds', async () => {
    let attempts = 0;
    const flakyOperation = async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error('fetch failed: network glitch');
      }
      return 'success';
    };

    const res = await executeWithRetry(flakyOperation, 2, 20);
    assert.strictEqual(res, 'success');
    assert.strictEqual(attempts, 2, 'Should succeed on second attempt');
  });

  console.log(`\n========================================`);
  console.log(`🏁 ADMIN CRUD SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminCrudTests();
