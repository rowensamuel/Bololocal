# RETEST CHECKLIST — BOLOLOCAL

Use this practical, step-by-step checklist to manually test and verify the fixed features in any browser environment.

---

## 1. Landing Page Navigation
- [ ] Visit `http://localhost:3000/`.
- [ ] Verify brand logo ("BOLOLOCAL") and tagline ("Don't Just Translate. Learn to Speak.").
- [ ] Click anchor links in top header: `#why`, `#how-it-works`, `#situations`, `#ai-tutor`. Verify page smoothly scrolls to target sections.
- [ ] Click pronunciation audio button next to "पाणी" on the live dialogue card. Verify speech synthesis plays.
- [ ] Click "Start Learning" (hero or navigation button). Verify it navigates to `/register` or `/onboarding`.

---

## 2. Guest Onboarding Flow (Fixed Issue BOL-002)
- [ ] Clear browser local storage (or open an Incognito window).
- [ ] Navigate to `http://localhost:3000/onboarding`.
- [ ] **Step 1:** Enter a unique username (e.g. `pune_learner`). Verify green checkmark "Username is available!". Click **Continue**.
- [ ] **Step 2:** Choose native reference language (e.g. `Hindi`). Click **Continue**.
- [ ] **Step 3:** Select target language (e.g. `Marathi` or `Bengali`). Click **Continue**.
- [ ] **Step 4:** Select motivation (e.g. `Daily Living`) and daily practice time (e.g. `15m`). Click **Continue**.
- [ ] **Step 5:** Review summary card. Click **Start Learning**.
- [ ] **Verification:** Verify that the application does NOT freeze, automatically registers the session, and successfully transitions into the **Learning Dashboard** (`/dashboard`).

---

## 3. Login & Authentication Flow (With Demo Credentials)
- [ ] Navigate to `http://localhost:3000/login`.
- [ ] Click the quick-fill button: **🛡️ Admin (admin / Admin@123)**.
- [ ] Verify fields populate with `admin` and `Admin@123`.
- [ ] Click **Sign In**. Verify direct redirect into `/admin` (Admin Center).
- [ ] Click "Logout from Admin". Verify return to `/login`.
- [ ] Click the quick-fill button: **🎓 Student (test_marathi / Pass@123)**.
- [ ] Click **Sign In**. Verify direct redirect to `/dashboard`.

---

## 4. Student Study Center
- [ ] **Dashboard (`/dashboard`):** Check active streak (days), total XP, course progress percentage, Phrase of the Day, and quick practice cards.
- [ ] **Language Switcher (Header):** Change language in header dropdown (e.g. from Marathi to Bengali). Verify dashboard metrics, Phrase of the Day, and lessons update to match Bengali.
- [ ] **Learn (`/learn`):** Click filter chips ("Beginner", "Intermediate"). Verify lesson list filters accordingly.
- [ ] **Lesson Studio (`/lesson/:lessonId`):**
  - Switch tabs: Objectives, Vocabulary, Useful Phrases, Interactive Dialogue, and Summary Takeaways.
  - Click audio buttons on vocabulary cards to test pronunciation.
  - Click "Complete Lesson & Claim +50 XP". Verify celebration badge appears with incremented XP.
- [ ] **Vocabulary Vault (`/vocabulary`):** Type in search bar to filter words. Click bookmark icon. Click "Bookmarked Words" filter toggle.
- [ ] **Useful Phrases (`/phrases`):** Filter by category (e.g. "Auto / Taxi", "Restaurant"). Verify phrases and context tips display.
- [ ] **Practice Arena (`/practice`):**
  - AI Tutor mode: Type "How do I ask for tea?" and press Send. Verify AI replies with script, transliteration, and explanation.
  - Role-play mode: Click "Start Role-play" on a scenario. Send responses and verify turn progression.

---

## 5. Quizzes & Timed Sprints
- [ ] **Standard Quiz (`/quiz`):**
  - Answer 5 questions.
  - Click Next Question.
  - On question 5, complete quiz. Verify modal opens with score, accuracy %, and XP awarded.
  - Check that clicking review answers allows inspecting mistakes.
- [ ] **Timed Sprint (`/quiz/timed`):**
  - Click "Start Sprint" on a 60-second challenge.
  - Verify countdown timer decrements every second with audio tick.
  - Click an answer. Verify soundFX plays (soft chime for correct, buzz for incorrect).
  - Complete sprint. Verify results screen displays score, elapsed time, and XP bonus.

---

## 6. Profile & Settings (Fixed Issue BOL-001)
- [ ] Navigate to `http://localhost:3000/profile`.
- [ ] Modify learner name and native language. Click **Save Changes**. Verify green confirmation banner.
- [ ] Click "Reset Progress". Confirm browser alert. Verify completed lessons and quiz scores reset to clean baseline.

---

## 7. Admin Console Management (Fixed Issues BOL-004, BOL-005, BOL-006)
- [ ] Log in as admin (`admin` / `Admin@123`) and navigate to `/admin`.
- [ ] **Languages (`/admin/languages`):**
  - Verify all 10 regional languages appear with flags, scripts, and status.
  - Click **Add New Language**. Fill in code (`pa`), name (`Punjabi`), native (`ਪੰਜਾਬੀ`), greeting (`Sat Sri Akal`). Click **Register Language**. Verify new card appears in the grid.
- [ ] **Courses (`/admin/courses`):**
  - Filter courses by language dropdown.
  - Click **Create Course**. Fill in title and description. Click **Save Course**. Verify new course is added.
- [ ] **Phrases (`/admin/phrases`):**
  - Click **Add Phrase**. Fill in Marathi script, transliteration, meaning, and category. Click **Save Phrase**. Verify phrase prepends to the table.
- [ ] **User Directory (`/admin/users`):**
  - Search by learner name or email.
  - Test role change, status toggle (Active/Inactive), and password reset.

---

## 8. Mobile Responsiveness
- [ ] Open Chrome DevTools (`F12`), toggle Device Toolbar (`Ctrl+Shift+M`), select iPhone 14 or Pixel 7.
- [ ] Verify bottom navigation bar has 5 items without overlap.
- [ ] Click top-left hamburger menu. Verify drawer opens with correctly mapped icons (`BarChart3` for Progress, `Award` for Achievements).
- [ ] Tap outside or click (X) to verify drawer closes cleanly.
