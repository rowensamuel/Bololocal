import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  BookOpen,
  Clock,
  ArrowRight,
  Trophy,
  Play,
  RotateCcw,
  Bot,
  Zap,
} from '../components/common/Icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/common/StatCard';
import { AudioButton } from '../components/common/AudioButton';
import { PhraseCard } from '../components/learning/PhraseCard';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { lessonService } from '../services/lessonService';
import { phraseService } from '../services/phraseService';
import { vocabularyService } from '../services/vocabularyService';
import { badgeService } from '../services/badgeService';
import { getLanguageById } from '../data/mockLanguages';
import { Lesson, VocabularyItem } from '../types/lesson';
import { UsefulPhrase } from '../types/phrase';
import { Badge as BadgeType } from '../types/badge';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { totalXp, streakDays, completedLessonIds } = useLearning();

  const currentLangCode = user?.learning_language_id || 'mr';
  const currentLang = getLanguageById(currentLangCode);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [phraseOfTheDay, setPhraseOfTheDay] = useState<UsefulPhrase | null>(null);
  const [recentVocab, setRecentVocab] = useState<VocabularyItem[]>([]);
  const [userBadges, setUserBadges] = useState<BadgeType[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardContent = async () => {
      try {
        setLoadError(null);
        const [langLessons, potd, vocab, allBadges, myBadges] = await Promise.all([
          lessonService.getLessons(currentLangCode),
          phraseService.getPhraseOfTheDay(currentLangCode),
          vocabularyService.getAllVocabulary(currentLangCode),
          badgeService.getAllBadges(),
          user?.id ? badgeService.getUserBadges(user.id) : Promise.resolve([]),
        ]);

        if (!isMounted) return;

        setLessons(langLessons);
        setPhraseOfTheDay(potd);
        setRecentVocab(vocab.slice(0, 4));

        // Map unlocked badges
        const unlockedIds = new Set(myBadges.map((b) => b.badge_id));
        const badgesWithStatus = allBadges.slice(0, 3).map((b) => ({
          ...b,
          is_active: unlockedIds.has(b.id),
        }));
        setUserBadges(badgesWithStatus as any);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Error loading dashboard content:', err);
        setLoadError('Unable to load data. Please check your connection or database configuration.');
      }
    };

    loadDashboardContent();

    return () => {
      isMounted = false;
    };
  }, [currentLangCode, user?.id]);

  if (loadError) {
    return (
      <div className="p-8 text-center bg-[#FFA6F6] rounded-[6px] border-2 border-black shadow-[6px_6px_0px_#000] space-y-3 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 bg-white text-black border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] flex items-center justify-center mx-auto">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-black">Unable to load data</h2>
        <p className="text-xs font-semibold text-black leading-relaxed">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white rounded-[4px] text-xs font-bold shadow-[2px_2px_0px_#000] hover:bg-neutral-800 transition-none cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Pick ongoing or next available lesson
  const currentLesson =
    lessons.find((l) => !completedLessonIds.includes(l.id) && !l.isLocked) ||
    lessons[0];

  const totalLessonsCount = lessons.length || 1;
  const completedCount = completedLessonIds.filter((id) =>
    lessons.some((l) => l.id === id)
  ).length;
  const progressPercent = Math.round((completedCount / totalLessonsCount) * 100);

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFE57F] text-black p-6 sm:p-8 border-3 border-black rounded-[6px] shadow-[6px_6px_0px_#000] relative">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-black">
              {currentLang.greeting}
            </span>
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-[4px] bg-[#A6FAFF] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              {currentLang.name} Learner
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Welcome back, {user?.name || user?.full_name || 'Learner'}!
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-neutral-800 max-w-lg leading-relaxed">
            Consistency builds {currentLang.name} fluency. You have practiced for {streakDays} days continuously—keep up the speaking streak!
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0 relative z-10">
          {currentLesson ? (
            <Link to={`/lesson/${currentLesson.id}`}>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Resume Lesson {currentLesson.number || 1}
              </Button>
            </Link>
          ) : (
            <Link to="/learn">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Lessons
              </Button>
            </Link>
          )}
          <span className="text-xs font-bold text-black hidden sm:inline bg-white px-2 py-0.5 border border-black rounded">
            Target: {user?.daily_goal || user?.dailyGoalMinutes || 15} mins/day
          </span>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Streak"
          value={`${streakDays} Days`}
          subtitle="Keep daily rhythm"
          colorScheme="orange"
          icon={<Flame className="w-5 h-5 text-black" />}
          trend={{ text: 'Active today', isPositive: true }}
        />
        <StatCard
          title="Total Experience"
          value={`${totalXp} XP`}
          subtitle="Earned from practice"
          colorScheme="cyan"
          icon={<Zap className="w-5 h-5 text-black" />}
          trend={{ text: 'Earned XP', isPositive: true }}
        />
        <StatCard
          title="Lessons Completed"
          value={`${completedCount}/${totalLessonsCount}`}
          subtitle={`${progressPercent}% of ${currentLang.name}`}
          colorScheme="green"
          icon={<BookOpen className="w-5 h-5 text-black" />}
        />
        <StatCard
          title="Daily Goal"
          value={`${Math.min(user?.daily_goal || 15, 12)}/${user?.daily_goal || 15}m`}
          subtitle="Target minutes"
          colorScheme="yellow"
          icon={<Clock className="w-5 h-5 text-black" />}
        />
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Continue Learning & Quick Practice */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Continue Learning Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-black">
                Continue Where You Left Off
              </h3>
              <Link to="/learn" className="text-xs font-black text-black underline hover:bg-[#FFE57F] px-1 py-0.5 rounded transition-none">
                View All {currentLang.name} Lessons →
              </Link>
            </div>

            {currentLesson ? (
              <div className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[6px_6px_0px_#000]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="cyan" size="sm">
                        Lesson {currentLesson.number || 1}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {currentLesson.difficulty}
                      </Badge>
                    </div>
                    <h4 className="text-lg sm:text-xl font-black text-black">
                      {currentLesson.title}
                    </h4>
                    <p className="text-xs font-medium text-neutral-700 line-clamp-2">
                      {currentLesson.shortDescription}
                    </p>

                    <div className="pt-2 max-w-md">
                      <div className="flex justify-between text-[11px] font-black text-black mb-1">
                        <span>Course Progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <ProgressBar value={progressPercent} variant="green" />
                    </div>
                  </div>

                  <div className="shrink-0 sm:self-center">
                    <Link to={`/lesson/${currentLesson.id}`}>
                      <Button variant="primary" size="md" rightIcon={<Play className="w-4 h-4" />}>
                        Resume Activity
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] text-center">
                <p className="text-xs font-bold text-neutral-600">No lessons available for {currentLang.name} yet.</p>
              </div>
            )}
          </div>

          {/* Section 2: Quick Practice Arena Cards */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-black">
              Quick Practice Arena
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/quiz" className="block">
                <div className="h-full p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] hover:bg-[#FDF8F5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none space-y-2">
                  <div className="w-10 h-10 bg-[#FFC29F] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] flex items-center justify-center text-black">
                    <RotateCcw className="w-5 h-5 text-black" />
                  </div>
                  <h4 className="text-sm font-black text-black">Standard Quiz</h4>
                  <p className="text-xs font-medium text-neutral-700">
                    Test comprehension in {currentLang.name}.
                  </p>
                  <span className="text-xs font-black text-black underline inline-flex items-center gap-1 pt-1">
                    Play Quiz →
                  </span>
                </div>
              </Link>

              <Link to="/quiz/timed" className="block">
                <div className="h-full p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] hover:bg-[#FDF8F5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none space-y-2">
                  <div className="w-10 h-10 bg-[#FFE57F] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] flex items-center justify-center text-black">
                    <Clock className="w-5 h-5 text-black" />
                  </div>
                  <h4 className="text-sm font-black text-black">Timed Sprint</h4>
                  <p className="text-xs font-medium text-neutral-700">
                    Speed challenge with live countdown.
                  </p>
                  <span className="text-xs font-black text-black underline inline-flex items-center gap-1 pt-1">
                    Start Sprint →
                  </span>
                </div>
              </Link>

              <Link to="/practice" className="block">
                <div className="h-full p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] hover:bg-[#FDF8F5] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none space-y-2">
                  <div className="w-10 h-10 bg-[#B8FF9F] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] flex items-center justify-center text-black">
                    <Bot className="w-5 h-5 text-black" />
                  </div>
                  <h4 className="text-sm font-black text-black">AI Roleplay</h4>
                  <p className="text-xs font-medium text-neutral-700">
                    Simulate real street conversations.
                  </p>
                  <span className="text-xs font-black text-black underline inline-flex items-center gap-1 pt-1">
                    Start Roleplay →
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Section 3: Recommended Phrases */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-black">
                  Recommended Phrases ({currentLang.name})
                </h3>
                <p className="text-xs font-semibold text-neutral-600">
                  Practical spoken sentences for everyday life.
                </p>
              </div>
              <Link to="/phrases" className="text-xs font-black text-black underline hover:bg-[#FFE57F] px-1 py-0.5 rounded transition-none">
                All Phrases →
              </Link>
            </div>

            {phraseOfTheDay && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PhraseCard phrase={phraseOfTheDay} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Phrase of the day, recent vocab, badges */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Phrase of the Day Card */}
          {phraseOfTheDay && (
            <div className="p-5 bg-[#FFE57F] border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  Phrase of the Day
                </span>
                <AudioButton textToSpeak={phraseOfTheDay.marathi} variant="pill" size="sm" />
              </div>

              <div className="space-y-1">
                <p className="text-xl font-black text-black leading-snug">
                  {phraseOfTheDay.marathi}
                </p>
                <p className="text-xs font-bold text-neutral-800">
                  {phraseOfTheDay.roman}
                </p>
                <p className="text-xs font-semibold text-neutral-700 italic">
                  "{phraseOfTheDay.english}"
                </p>
              </div>

              <div className="text-[11px] font-bold text-black pt-2 border-t-2 border-black">
                Context: {phraseOfTheDay.context}
              </div>
            </div>
          )}

          {/* Recent Vocabulary */}
          <div className="p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-wider text-black">Vocabulary Quick-View</h4>
              <Link to="/vocabulary" className="text-xs font-black text-black underline hover:bg-[#FFE57F] px-1 rounded transition-none">
                All Words →
              </Link>
            </div>

            <div className="divide-y-2 divide-black">
              {recentVocab.length > 0 ? (
                recentVocab.map((word) => (
                  <div key={word.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black text-base">
                          {word.marathi}
                        </span>
                        <span className="text-xs font-semibold text-neutral-600">
                          ({word.roman})
                        </span>
                      </div>
                      <span className="text-xs font-medium text-neutral-700">{word.english}</span>
                    </div>
                    <AudioButton textToSpeak={word.marathi || ''} variant="icon-only" size="sm" />
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-neutral-500 py-2">No vocabulary loaded for this language.</p>
              )}
            </div>
          </div>

          {/* Badges Preview */}
          <div className="p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-wider text-black">Your Achievements</h4>
              <Link to="/achievements" className="text-xs font-black text-black underline hover:bg-[#FFE57F] px-1 rounded transition-none">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {userBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-2.5 border-2 border-black rounded-[4px] flex flex-col items-center gap-1 ${
                    badge.is_active
                      ? 'bg-[#B8FF9F] shadow-[2px_2px_0px_#000]'
                      : 'bg-neutral-100 opacity-60 shadow-none'
                  }`}
                >
                  <Trophy className="w-5 h-5 text-black" />
                  <span className="text-[10px] font-black line-clamp-1 text-black">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
