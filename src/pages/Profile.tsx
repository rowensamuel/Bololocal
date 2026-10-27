import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { NativeLanguage, LearningGoal, DailyGoalMinutes } from '../types/user';
import { mockLanguages, getLanguageById } from '../data/mockLanguages';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, updateUserProfile, setLearningLanguage, logout } = useAuth();
  const { streakDays, totalXp, resetProgress } = useLearning();

  const [name, setName] = useState(user?.name || user?.full_name || 'Aarav Sharma');
  const [email, setEmail] = useState(user?.email || 'aarav@example.com');
  const [learningLang, setLearningLang] = useState(user?.learning_language_id || 'mr');
  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage>(
    user?.nativeLanguage || 'Hindi'
  );
  const [goal, setGoal] = useState<LearningGoal>(user?.goal || 'College');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<DailyGoalMinutes>(
    user?.dailyGoalMinutes || 15
  );
  const [notifications, setNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentLearningLanguage = getLanguageById(learningLang);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name,
      email,
      learning_language_id: learningLang,
      nativeLanguage,
      goal,
      dailyGoalMinutes,
    });
    await setLearningLanguage(learningLang);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all lesson and quiz progress?')) {
      resetProgress();
      alert('Progress has been reset for demonstration.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Neo-Brutalist Profile Header */}
      <div className="bg-[#A6FAFF] p-6 sm:p-8 rounded-[6px] border-2 border-black shadow-[6px_6px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[4px] bg-white border-2 border-black shadow-[3px_3px_0px_#000] text-black flex items-center justify-center font-black text-2xl overflow-hidden shrink-0">
            {user?.avatar_url || user?.avatarUrl ? (
              <img src={user.avatar_url || user.avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                {name}
              </h1>
              <Badge variant={isAdmin ? 'yellow' : 'neutral'} size="sm">
                {isAdmin ? 'ADMIN' : 'STUDENT'}
              </Badge>
            </div>
            <p className="text-xs font-bold text-stone-800">{email}</p>
            <div className="flex items-center gap-2 text-xs font-bold text-black pt-1">
              <span>Target: <strong>{currentLearningLanguage.name} ({currentLearningLanguage.native_name})</strong></span>
              <span>•</span>
              <span>Native: <strong>{nativeLanguage}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-[4px] bg-white border-2 border-black shadow-[3px_3px_0px_#000] text-center min-w-[80px]">
            <span className="text-xl">🔥</span>
            <span className="text-xs font-black text-black block mt-0.5">
              {streakDays} Days
            </span>
          </div>
          <div className="p-3 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[3px_3px_0px_#000] text-center min-w-[80px]">
            <span className="text-xl">⚡</span>
            <span className="text-xs font-black text-black block mt-0.5">
              {totalXp} XP
            </span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-[4px] bg-[#B8FF9F] border-2 border-black shadow-[4px_4px_0px_#000] text-xs font-black text-black flex items-center gap-2">
          <span className="text-base font-black">✓</span>
          <span>Profile and learning preferences updated successfully!</span>
        </div>
      )}

      {/* Role Information Card */}
      <Card padding="lg" className="bg-white space-y-2">
        <div className="flex items-center gap-2 font-black text-black text-sm uppercase">
          <span>🛡️</span>
          <span>Account Authorization Role</span>
        </div>
        <p className="text-xs font-medium text-stone-700 leading-relaxed">
          Current Role: <span className="inline-block px-2 py-0.5 bg-[#FFE57F] border-2 border-black font-black text-xs rounded-[4px] uppercase">{user?.role || 'user'}</span>.{' '}
          {isAdmin
            ? 'You have administrative privileges to manage languages, courses, vocabulary, quizzes, and learner accounts.'
            : 'Access is limited to student curriculum, interactive practice, vocabulary vault, and personal settings.'}
        </p>
      </Card>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card padding="lg" className="space-y-5 bg-white">
          <h2 className="text-base font-black text-black uppercase tracking-wider flex items-center gap-2">
            <span>👤</span>
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Learning Preferences */}
        <Card padding="lg" className="space-y-5 bg-white">
          <h2 className="text-base font-black text-black uppercase tracking-wider flex items-center gap-2">
            <span>🌐</span>
            <span>Language & Learning Targets</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-black">
                Active Learning Language
              </label>
              <select
                value={learningLang}
                onChange={(e) => setLearningLang(e.target.value)}
                className="w-full rounded-[4px] border-2 border-black bg-white px-3 py-2.5 text-xs font-bold text-black shadow-[3px_3px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#A6FAFF]"
              >
                {mockLanguages.map((l) => (
                  <option key={l.id} value={l.code}>
                    {l.name} ({l.native_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-black">
                Native / Reference Language
              </label>
              <select
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value as NativeLanguage)}
                className="w-full rounded-[4px] border-2 border-black bg-white px-3 py-2.5 text-xs font-bold text-black shadow-[3px_3px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#A6FAFF]"
              >
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="English">English</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-black">
                Primary Motivation
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as LearningGoal)}
                className="w-full rounded-[4px] border-2 border-black bg-white px-3 py-2.5 text-xs font-bold text-black shadow-[3px_3px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#A6FAFF]"
              >
                <option value="College">College & Campus</option>
                <option value="Daily Conversation">Daily Living & Society</option>
                <option value="Work">Work & Business</option>
                <option value="Travel">Travel & Transit</option>
                <option value="Cultural Interest">Culture & Heritage</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-black">
                Daily Study Target
              </label>
              <select
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value) as DailyGoalMinutes)}
                className="w-full rounded-[4px] border-2 border-black bg-white px-3 py-2.5 text-xs font-bold text-black shadow-[3px_3px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#A6FAFF]"
              >
                <option value={5}>5 minutes / day (Casual)</option>
                <option value={10}>10 minutes / day (Regular)</option>
                <option value={15}>15 minutes / day (Serious)</option>
                <option value={30}>30 minutes / day (Intensive)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-[4px] border-2 border-black bg-[#FDF8F5] shadow-[2px_2px_0px_#000] mt-4 sm:mt-0">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔔</span>
                <span className="text-xs font-black uppercase text-black">
                  Daily Practice Reminders
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="h-5 w-5 rounded-[2px] border-2 border-black text-black accent-black cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Neo-Brutalist Danger Zone */}
      <Card padding="lg" className="bg-[#FFA6F6] space-y-4">
        <h2 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
          <span>⚠️</span>
          <span>Account Actions</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs">
          <div className="space-y-0.5">
            <span className="font-black text-black text-sm uppercase">Reset Learning Progress</span>
            <p className="text-xs font-medium text-black">
              Clear your lesson completions, quiz scores, and streak history to restart fresh.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Reset Progress
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t-2 border-black text-xs">
          <div className="space-y-0.5">
            <span className="font-black text-black text-sm uppercase">Log Out of Session</span>
            <p className="text-xs font-medium text-black">
              Return to the student login screen.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
