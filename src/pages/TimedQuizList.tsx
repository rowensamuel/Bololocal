import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Zap,
  Flame,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart2,
  Compass,
} from '../components/common/Icons';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/quizService';
import { TimedQuiz, TimedQuizAttempt } from '../types/timedQuiz';
import { mockLanguages, getLanguageById } from '../data/mockLanguages';

export const TimedQuizList: React.FC = () => {
  const navigate = useNavigate();
  const { user, setLearningLanguage } = useAuth();
  const activeLangId = user?.learning_language_id || 'mr';
  const currentLanguage = getLanguageById(activeLangId);

  const [quizzes, setQuizzes] = useState<TimedQuiz[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<TimedQuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [quizList, attempts] = await Promise.all([
          quizService.getTimedQuizzes(activeLangId),
          quizService.getUserTimedAttempts(user?.id),
        ]);
        setQuizzes(quizList);
        setRecentAttempts(attempts);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [activeLangId, user?.id]);

  const bestScore = recentAttempts.length > 0
    ? Math.max(...recentAttempts.map((a) => a.score))
    : 0;
  const averageAccuracy = recentAttempts.length > 0
    ? Math.round(recentAttempts.reduce((sum, a) => sum + a.accuracy_percentage, 0) / recentAttempts.length)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Header with Language Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE57F] text-black border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-xs font-black uppercase mb-2">
            <Clock className="w-3.5 h-3.5 text-black" />
            <span>High-Speed Recall Sprint</span>
          </div>
          <h1 className="text-3xl font-black text-black tracking-tight">Timed Quizzes</h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-700 mt-1 max-w-xl">
            Test split-second language reflexes under time pressure. Answer before the countdown expires to build natural speaking spontaneity.
          </p>
        </div>

        {/* Learning Language Switcher */}
        <div className="flex items-center gap-2 bg-white p-2.5 rounded-[4px] border-2 border-black shadow-[3px_3px_0px_#000]">
          <Compass className="w-4 h-4 text-black shrink-0" />
          <div className="text-xs">
            <div className="text-neutral-500 text-[10px] font-black uppercase">Learning Target:</div>
            <select
              value={activeLangId}
              onChange={(e) => setLearningLanguage(e.target.value)}
              className="font-black text-black bg-transparent border-none p-0 text-xs focus:outline-none cursor-pointer"
            >
              {mockLanguages.map((lang) => (
                <option key={lang.id} value={lang.code}>
                  {lang.name} ({lang.native_name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Performance Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-500">
            <span>Sprints Taken</span>
            <RotateCcw className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black mt-1.5">{recentAttempts.length}</div>
          <div className="text-[11px] font-bold text-neutral-600 mt-0.5">Total sessions</div>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-500">
            <span>Avg Accuracy</span>
            <Zap className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black mt-1.5">{averageAccuracy}%</div>
          <div className="text-[11px] font-bold text-neutral-600 mt-0.5">Under time limit</div>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-500">
            <span>Highest Score</span>
            <Trophy className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black mt-1.5">{bestScore} pts</div>
          <div className="text-[11px] font-bold text-neutral-600 mt-0.5">Personal best</div>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-500">
            <span>Target Locale</span>
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black mt-1.5">{currentLanguage.name}</div>
          <div className="text-[11px] font-bold text-neutral-600 mt-0.5">{currentLanguage.native_name}</div>
        </div>
      </div>

      {/* Quiz Modes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-wider text-black">Available Sprint Modes</h2>
          <span className="text-xs font-bold text-neutral-600">
            Calibrated for {currentLanguage.name}
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-black font-bold text-sm">
            Loading timed challenges...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quizzes.map((quiz) => {
              const isQuick = quiz.mode === 'Quick Challenge';
              const isSpeed = quiz.mode === 'Speed Round';

              const accentPill = isQuick
                ? 'bg-[#B8FF9F]'
                : isSpeed
                ? 'bg-[#FFE57F]'
                : 'bg-[#A6FAFF]';

              return (
                <div
                  key={quiz.id}
                  className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:bg-[#FDF8F5] transition-none"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-[4px] border border-black shadow-[1px_1px_0px_#000] uppercase tracking-wider ${accentPill}`}>
                        {quiz.mode}
                      </span>
                      <div className="flex items-center gap-1 font-mono text-xs font-black text-black bg-white px-2.5 py-1 rounded-[4px] border border-black shadow-[1px_1px_0px_#000]">
                        <Clock className="w-3.5 h-3.5 text-black" />
                        <span>{quiz.time_limit_seconds}s</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-black">
                        {quiz.title}
                      </h3>
                      <p className="text-xs font-medium text-neutral-700 mt-1.5 leading-relaxed">
                        {quiz.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t-2 border-black grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-neutral-100 border border-black rounded-[4px]">
                        <span className="text-[10px] text-neutral-600 block font-bold uppercase">Questions</span>
                        <span className="font-black text-black">{quiz.question_count} items</span>
                      </div>
                      <div className="p-2 bg-[#FFE57F] border border-black rounded-[4px]">
                        <span className="text-[10px] text-black block font-bold uppercase">Reward</span>
                        <span className="font-black text-black flex items-center gap-1">
                          <Zap className="w-3 h-3 text-black" />
                          +{quiz.xp_reward} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4">
                    <Button
                      variant="primary"
                      className="w-full justify-center gap-2"
                      onClick={() => navigate(`/quiz/timed/${quiz.id}`)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Start {quiz.mode}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Sprint History */}
      {recentAttempts.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-black flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-black" />
            <span>Recent Sprint Attempts</span>
          </h2>

          <div className="border-2 border-black rounded-[4px] shadow-[4px_4px_0px_#000] bg-white overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-[#ECEAE4] border-b-2 border-black text-black font-black uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Quiz Mode</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3">Time Taken</th>
                  <th className="px-4 py-3">XP Earned</th>
                  <th className="px-6 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-black font-medium">
                {recentAttempts.slice(0, 5).map((attempt) => {
                  const lang = getLanguageById(attempt.language_id);
                  return (
                    <tr key={attempt.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-3.5 font-bold text-black">
                        {quizzes.find((q) => q.id === attempt.timed_quiz_id)?.title || 'Timed Sprint'}
                      </td>
                      <td className="px-4 py-3.5 font-bold">{lang.name}</td>
                      <td className="px-4 py-3.5 font-black text-black">
                        {attempt.correct_answers}/{attempt.total_questions}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-black px-1.5 py-0.5 border border-black rounded text-[11px] ${
                            attempt.accuracy_percentage >= 80
                              ? 'bg-[#B8FF9F]'
                              : attempt.accuracy_percentage >= 50
                              ? 'bg-[#FFE57F]'
                              : 'bg-[#FFA6F6]'
                          }`}
                        >
                          {attempt.accuracy_percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-neutral-700">
                        {attempt.time_taken_seconds}s / {attempt.time_limit_seconds}s
                      </td>
                      <td className="px-4 py-3.5 font-black text-black">
                        +{attempt.xp_earned} XP
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-neutral-600 text-[11px]">
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rules & Pro Tips Card */}
      <div className="p-6 bg-[#FFE57F] border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] text-black space-y-3">
        <div className="flex items-center gap-2 font-black text-black text-sm uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-black" />
          <span>Sprint Pro Tips: Building Natural Spoken Fluency</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <li className="p-3 bg-white rounded-[4px] border-2 border-black shadow-[2px_2px_0px_#000]">
            <strong className="block text-black font-black uppercase mb-1">1. Trust your instinct</strong>
            Spoken communication requires instant instinct without pauses. Answer immediately based on sound feel.
          </li>
          <li className="p-3 bg-white rounded-[4px] border-2 border-black shadow-[2px_2px_0px_#000]">
            <strong className="block text-black font-black uppercase mb-1">2. Watch the countdown</strong>
            When the timer begins pulsing, accelerate! Any unanswered question when time expires counts as incomplete.
          </li>
          <li className="p-3 bg-white rounded-[4px] border-2 border-black shadow-[2px_2px_0px_#000]">
            <strong className="block text-black font-black uppercase mb-1">3. Streak Badges</strong>
            Score 90%+ in Speed Round to unlock the coveted Speed Learner achievement and rapid XP multipliers.
          </li>
        </ul>
      </div>
    </div>
  );
};
