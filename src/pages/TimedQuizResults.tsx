import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Trophy,
  Volume2,
} from '../components/common/Icons';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TimedQuiz, TimedQuizAttempt } from '../types/timedQuiz';
import { Achievement } from '../types/achievement';
import { Badge as BadgeType } from '../types/badge';
import { speechService } from '../utils/speech';

export const TimedQuizResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    attempt?: TimedQuizAttempt;
    quiz?: TimedQuiz;
    newAchievements?: Achievement[];
    newBadges?: BadgeType[];
  } | undefined;

  const attempt = state?.attempt;
  const quiz = state?.quiz;
  const newAchievements = state?.newAchievements || [];
  const newBadges = state?.newBadges || [];

  if (!attempt || !quiz) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 font-sans">
        <h2 className="text-xl font-black text-black">No recent timed attempt data found</h2>
        <p className="text-xs font-semibold text-neutral-600">
          Complete a timed challenge to view performance metrics, score breakdowns, and unlocked badges.
        </p>
        <Button variant="primary" onClick={() => navigate('/quiz/timed')}>
          Go to Timed Quizzes
        </Button>
      </div>
    );
  }

  const accuracy = attempt.accuracy_percentage;
  const isPassed = accuracy >= 60;
  const questions = quiz.questions || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-sans">
      {/* Top Banner & Celebration */}
      <div
        className={`p-6 sm:p-8 border-3 border-black rounded-[6px] shadow-[6px_6px_0px_#000] text-center ${
          isPassed ? 'bg-[#FFE57F]' : 'bg-[#FFA6F6]'
        }`}
      >
        <div className="max-w-lg mx-auto space-y-3">
          <div className="w-16 h-16 rounded-[4px] bg-white border-2 border-black flex items-center justify-center mx-auto text-black shadow-[3px_3px_0px_#000]">
            <Trophy className="w-8 h-8 text-black" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest block text-black">
            {quiz.mode} Finished
          </span>

          <h1 className="text-3xl font-black text-black">
            {isPassed ? 'Outstanding Sprint!' : 'Time Up! Keep Practicing'}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-neutral-800 leading-relaxed">
            {isPassed
              ? `You answered quickly with high accuracy in ${quiz.title}. Rapid recall translates directly into real-life speaking confidence.`
              : `Speed rounds test quick intuition. Review the answers below and try another sprint to build faster muscle memory.`}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B8FF9F] text-black border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] font-black text-xs">
              <Zap className="w-3.5 h-3.5 text-black" />
              +{attempt.xp_earned} XP Awarded
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] font-black text-xs">
              <Clock className="w-3.5 h-3.5 text-black" />
              {attempt.time_taken_seconds}s used / {attempt.time_limit_seconds}s
            </span>
          </div>
        </div>
      </div>

      {/* Score and Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] text-center">
          <div className="text-xs text-neutral-500 font-black uppercase">Accuracy</div>
          <div className="text-3xl font-black mt-1 text-black">
            {accuracy}%
          </div>
          <div className="text-[11px] font-bold text-neutral-600 mt-0.5">Overall rate</div>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] text-center">
          <div className="text-xs text-neutral-500 font-black uppercase">Correct</div>
          <div className="text-3xl font-black text-black mt-1">
            {attempt.correct_answers}
          </div>
          <div className="text-[11px] font-bold text-neutral-600 mt-0.5">
            of {attempt.total_questions} questions
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] text-center">
          <div className="text-xs text-neutral-500 font-black uppercase">Incorrect</div>
          <div className="text-3xl font-black text-black mt-1">
            {attempt.incorrect_answers}
          </div>
          <div className="text-[11px] font-bold text-neutral-600 mt-0.5">Mistakes</div>
        </div>

        <div className="p-4 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] text-center">
          <div className="text-xs text-neutral-500 font-black uppercase">Unanswered</div>
          <div className="text-3xl font-black text-black mt-1">
            {attempt.unanswered}
          </div>
          <div className="text-[11px] font-bold text-neutral-600 mt-0.5">Timed out</div>
        </div>
      </div>

      {/* Unlocked Achievements & Badges if any */}
      {(newAchievements.length > 0 || newBadges.length > 0) && (
        <div className="p-6 bg-[#B8FF9F] border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-3">
          <div className="flex items-center gap-2 text-black font-black text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-black" />
            <span>New Milestones Unlocked!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newAchievements.map((ach) => (
              <div
                key={ach.id}
                className="p-3 bg-white rounded-[4px] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-[4px] bg-[#FFE57F] text-black border border-black flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="font-black text-black text-xs">{ach.name}</div>
                  <div className="text-[11px] font-semibold text-neutral-600">{ach.description}</div>
                </div>
              </div>
            ))}

            {newBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-3 bg-white rounded-[4px] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-[4px] bg-[#A6FAFF] text-black border border-black flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="font-black text-black text-xs">{badge.name}</div>
                  <div className="text-[11px] font-semibold text-neutral-600">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-black">Sprint Question Breakdown</h2>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const userAnswerEntry = attempt.user_answers?.find(
              (a) => a.question_id === q.id
            );
            const userIndex = userAnswerEntry?.selected_option_index;
            const correctIdx =
              q.correctOptionIndex !== undefined && q.correctOptionIndex >= 0
                ? q.correctOptionIndex
                : q.options.indexOf(q.correctAnswer);

            const isCorrect = userIndex === correctIdx;
            const isSkipped = userIndex === null || userIndex === undefined;

            return (
              <div
                key={q.id}
                className="p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase text-neutral-500 bg-neutral-100 px-1.5 py-0.5 border border-black rounded">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-black">
                        {q.prompt}
                      </span>
                    </div>

                    {q.marathiPrompt && (
                      <div className="flex items-center gap-2 text-sm font-bold text-black pl-4">
                        <span>{q.marathiPrompt}</span>
                        <button
                          type="button"
                          onClick={() => speechService.speak(q.marathiPrompt!, { lang: quiz.language_id })}
                          className="p-1 hover:bg-neutral-100 rounded text-black cursor-pointer"
                          title="Listen pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-black" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-black bg-[#B8FF9F] px-2.5 py-1 rounded-[4px] border border-black shadow-[1px_1px_0px_#000]">
                        <CheckCircle className="w-3 h-3 text-black" /> Correct
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-black bg-neutral-200 px-2.5 py-1 rounded-[4px] border border-black shadow-[1px_1px_0px_#000]">
                        <HelpCircle className="w-3 h-3 text-black" /> Timed Out
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-black bg-[#FFA6F6] px-2.5 py-1 rounded-[4px] border border-black shadow-[1px_1px_0px_#000]">
                        <XCircle className="w-3 h-3 text-black" /> Incorrect
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t-2 border-black">
                  <div className="p-2.5 bg-neutral-100 rounded-[4px] border border-black">
                    <span className="text-[10px] text-neutral-600 block font-black uppercase">Your Selection:</span>
                    <span
                      className={`font-bold ${
                        isCorrect
                          ? 'text-black'
                          : isSkipped
                          ? 'text-neutral-500 italic'
                          : 'text-black line-through'
                      }`}
                    >
                      {userIndex !== null && userIndex !== undefined
                        ? q.options[userIndex]
                        : 'No answer submitted'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#B8FF9F] rounded-[4px] border border-black">
                    <span className="text-[10px] text-black block font-black uppercase">Correct Answer:</span>
                    <span className="font-bold text-black">
                      {q.options[correctIdx] || q.correctAnswer}
                    </span>
                  </div>
                </div>

                {q.explanation && (
                  <div className="text-[11px] text-black bg-[#FFE57F] p-3 rounded-[4px] border border-black">
                    <strong className="text-black font-black uppercase">Explanation: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-black">
        <Link to="/quiz/timed">
          <Button variant="outline" size="md">
            View All Timed Sprints
          </Button>
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(`/quiz/timed/${quiz.id}`)}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Retry This Sprint
          </Button>

          <Link to="/achievements">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View My Achievements
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
