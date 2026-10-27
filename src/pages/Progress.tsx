import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { lessonService } from '../services/lessonService';
import { getLanguageById } from '../data/mockLanguages';
import { Lesson } from '../types/lesson';

export const Progress: React.FC = () => {
  const { user } = useAuth();
  const { totalXp, streakDays, completedLessonIds } = useLearning();

  const currentLang = getLanguageById(user?.learning_language_id || 'mr');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    lessonService.getLessons(currentLang.code).then((data) => {
      if (isMounted) {
        setLessons(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentLang.code]);

  const matchingCompleted = completedLessonIds.filter((id) =>
    lessons.some((l) => l.id === id)
  );
  const totalLessons = lessons.length || 1;
  const completionPercent = Math.round(
    (matchingCompleted.length / totalLessons) * 100
  );

  // Weekly activity mock
  const weekDays = [
    { day: 'Mon', active: true, minutes: 15 },
    { day: 'Tue', active: true, minutes: 20 },
    { day: 'Wed', active: true, minutes: 12 },
    { day: 'Thu', active: true, minutes: 25 },
    { day: 'Fri', active: true, minutes: 18 },
    { day: 'Sat', active: true, minutes: 10 },
    { day: 'Sun', active: true, minutes: 15 },
  ];

  return (
    <div className="space-y-8">
      {/* Neo-Brutalist Header Banner */}
      <div className="bg-[#FFE57F] p-6 sm:p-8 rounded-[6px] border-2 border-black shadow-[6px_6px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              Fluency Analytics
            </Badge>
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Personal Metrics for {currentLang.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
            Your {currentLang.name} Growth
          </h1>
          <p className="text-sm font-medium text-black max-w-xl">
            Track your speaking practice, vocabulary retention, XP milestones, and completed units in {currentLang.name}.
          </p>
        </div>

        <Link to="/achievements">
          <Button variant="outline" size="sm">
            View Badges & Awards →
          </Button>
        </Link>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Daily Streak"
          value={`${streakDays} Days`}
          subtitle="Active streak"
          colorScheme="orange"
          icon={<span className="text-xl">🔥</span>}
        />
        <StatCard
          title="Total Points"
          value={`${totalXp} XP`}
          subtitle="Earned in language"
          colorScheme="indigo"
          icon={<span className="text-xl">⚡</span>}
        />
        <StatCard
          title="Curriculum"
          value={`${completionPercent}%`}
          subtitle={`${matchingCompleted.length}/${totalLessons} in ${currentLang.name}`}
          colorScheme="emerald"
          icon={<span className="text-xl">📖</span>}
        />
        <StatCard
          title="Total Practice"
          value={`${matchingCompleted.length * 15 + 20}m`}
          subtitle="Learning time"
          colorScheme="amber"
          icon={<span className="text-xl">⏱️</span>}
        />
      </div>

      {/* Visual Activity & Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Activity Heatmap (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-black uppercase tracking-wider">
                  Weekly Practice Activity
                </h2>
                <p className="text-xs font-medium text-stone-600">
                  Daily practice minutes over the last 7 days.
                </p>
              </div>
              <Badge variant="green" size="sm">Active</Badge>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2 text-center">
              {weekDays.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-32 bg-[#FDF8F5] border-2 border-black rounded-[4px] p-1.5 flex flex-col justify-end items-center shadow-[2px_2px_0px_#000]">
                    <div
                      style={{ height: `${(item.minutes / 30) * 100}%` }}
                      className="w-full rounded-[2px] bg-[#FFC29F] border-2 border-black transition-all"
                      title={`${item.minutes} minutes practiced`}
                    />
                  </div>
                  <div className="text-xs font-black text-black">
                    {item.day}
                  </div>
                  <div className="text-[10px] font-bold text-stone-600">
                    {item.minutes}m
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* XP Breakdown by Activity */}
          <Card padding="lg" className="space-y-4">
            <h2 className="text-base font-black text-black uppercase tracking-wider">
              XP Breakdown by Activity
            </h2>
            <div className="space-y-4 text-xs">
              {[
                { name: 'Lessons Completed', xp: Math.round(totalXp * 0.55), percent: 55, color: '#A6FAFF' },
                { name: 'Quizzes & Practice', xp: Math.round(totalXp * 0.25), percent: 25, color: '#FFE57F' },
                { name: 'AI Role-play Simulations', xp: Math.round(totalXp * 0.20), percent: 20, color: '#B8FF9F' },
              ].map((act, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-black font-black text-xs uppercase">
                    <span>{act.name}</span>
                    <span>{act.xp} XP ({act.percent}%)</span>
                  </div>
                  <div className="w-full h-4 rounded-[4px] bg-white border-2 border-black shadow-[2px_2px_0px_#000] overflow-hidden">
                    <div
                      className="h-full border-r-2 border-black transition-all"
                      style={{ width: `${act.percent}%`, backgroundColor: act.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Lessons Completion list (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-black uppercase tracking-wider">
                {currentLang.name} Lesson Completion
              </h2>
              <span className="text-xs font-black text-black">
                {matchingCompleted.length} / {totalLessons}
              </span>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs font-black">Loading lessons...</div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-[4px] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between transition-all ${
                        isCompleted ? 'bg-[#B8FF9F]' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-[4px] bg-white border-2 border-black flex items-center justify-center text-xs font-black">
                          {isCompleted ? '✓' : lesson.number || 1}
                        </div>
                        <div>
                          <span className="font-black text-xs text-black block">{lesson.title}</span>
                          <span className="text-[10px] font-bold text-stone-600 uppercase">{lesson.difficulty}</span>
                        </div>
                      </div>
                      {isCompleted ? (
                        <Badge variant="green" size="sm">Done</Badge>
                      ) : (
                        <Link to={`/lesson/${lesson.id}`}>
                          <Button variant="outline" size="sm" className="text-[11px] py-1 px-3">
                            Start
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
