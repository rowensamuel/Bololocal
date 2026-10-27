import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Route Guards
import { AdminRouteGuard } from './AdminRouteGuard';
import { UserRouteGuard } from './UserRouteGuard';

// Public & Auth Pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { Onboarding } from '../pages/Onboarding';

// Student Pages
import { Dashboard } from '../pages/Dashboard';
import { Learn } from '../pages/Learn';
import { Course } from '../pages/Course';
import { Lesson } from '../pages/Lesson';
import { Vocabulary } from '../pages/Vocabulary';
import { Phrases } from '../pages/Phrases';
import { Practice } from '../pages/Practice';
import { Quiz } from '../pages/Quiz';
import { TimedQuizList } from '../pages/TimedQuizList';
import { TimedQuizPlay } from '../pages/TimedQuizPlay';
import { TimedQuizResults } from '../pages/TimedQuizResults';
import { Progress } from '../pages/Progress';
import { Achievements } from '../pages/Achievements';
import { Profile } from '../pages/Profile';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { Users as AdminUsers } from '../pages/admin/Users';
import { Languages as AdminLanguages } from '../pages/admin/Languages';
import { Courses as AdminCourses } from '../pages/admin/Courses';
import { Lessons as AdminLessons } from '../pages/admin/Lessons';
import { Vocabulary as AdminVocabulary } from '../pages/admin/Vocabulary';
import { Phrases as AdminPhrases } from '../pages/admin/Phrases';
import { Situations as AdminSituations } from '../pages/admin/Situations';
import { Quizzes as AdminQuizzes } from '../pages/admin/Quizzes';
import { TimedQuizzes as AdminTimedQuizzes } from '../pages/admin/TimedQuizzes';
import { Achievements as AdminAchievements } from '../pages/admin/Achievements';
import { Badges as AdminBadges } from '../pages/admin/Badges';
import { Analytics as AdminAnalytics } from '../pages/admin/Analytics';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Auth Flow */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Onboarding Wizard */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Student App Portal (Guarded by UserRouteGuard) */}
      <Route element={<UserRouteGuard />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/course/:courseId?" element={<Course />} />
          <Route path="/lesson/:lessonId" element={<Lesson />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/phrases" element={<Phrases />} />
          <Route path="/practice" element={<Practice />} />
          
          {/* AI Shortcuts */}
          <Route path="/ai-tutor" element={<Navigate to="/practice?mode=tutor" replace />} />
          <Route path="/ai-roleplay" element={<Navigate to="/practice?mode=roleplay" replace />} />

          {/* Standard Quiz */}
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/:quizId" element={<Quiz />} />

          {/* Timed Quiz Routes & Aliases */}
          <Route path="/quiz/timed" element={<TimedQuizList />} />
          <Route path="/quiz/timed/:quizId" element={<TimedQuizPlay />} />
          <Route path="/quiz/timed/:quizId/results" element={<TimedQuizResults />} />
          <Route path="/timed-quiz" element={<TimedQuizList />} />
          <Route path="/timed-quiz/:quizId" element={<TimedQuizPlay />} />

          {/* Progress & Gamification */}
          <Route path="/progress" element={<Progress />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/badges" element={<Achievements />} />

          {/* Profile & Settings */}
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin Portal (Strictly Guarded by AdminRouteGuard) */}
      <Route element={<AdminRouteGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="languages" element={<AdminLanguages />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="vocabulary" element={<AdminVocabulary />} />
          <Route path="phrases" element={<AdminPhrases />} />
          <Route path="situations" element={<AdminSituations />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="timed-quizzes" element={<AdminTimedQuizzes />} />
          <Route path="achievements" element={<AdminAchievements />} />
          <Route path="badges" element={<AdminBadges />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
