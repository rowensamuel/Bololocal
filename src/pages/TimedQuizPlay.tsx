import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Volume2,
  CheckCircle,
  HelpCircle,
  Zap,
  AlertTriangle,
} from '../components/common/Icons';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useQuizTimer, formatTimerSeconds } from '../hooks/useQuizTimer';
import { quizService } from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { TimedQuiz, TimedQuizAttempt } from '../types/timedQuiz';
import { soundFX } from '../utils/audioFeedback';
import { speechService } from '../utils/speech';
import { getLanguageById } from '../data/mockLanguages';

export const TimedQuizPlay: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user, setLearningLanguage } = useAuth();
  const { addXp } = useLearning();

  const userLang = user?.learning_language_id || 'mr';
  const currentLang = getLanguageById(userLang);

  const [quiz, setQuiz] = useState<TimedQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMismatch, setIsMismatch] = useState(false);

  // Track start time
  const [startedAt] = useState<string>(new Date().toISOString());
  const hasSubmittedRef = useRef<boolean>(false);

  const [mismatchedQuiz, setMismatchedQuiz] = useState<TimedQuiz | null>(null);

  // Load Quiz Data matching user language
  useEffect(() => {
    let isMounted = true;
    const fetchQuiz = async () => {
      setIsLoading(true);
      let data: TimedQuiz | undefined;

      if (quizId) {
        data = await quizService.getTimedQuizById(quizId);
        if (data && data.language_id.toLowerCase() !== userLang.toLowerCase()) {
          setIsMismatch(true);
          setMismatchedQuiz(data);
          data = undefined;
        } else {
          setIsMismatch(false);
          setMismatchedQuiz(null);
        }
      } else {
        data = await quizService.getTimedQuizForLanguage(userLang);
        setIsMismatch(false);
        setMismatchedQuiz(null);
      }

      if (isMounted) {
        setQuiz(data || null);
        setIsLoading(false);
      }
    };
    fetchQuiz();
    return () => {
      isMounted = false;
    };
  }, [quizId, userLang]);

  // Reset quiz state when quiz changes
  useEffect(() => {
    setCurrentIndex(0);
    setUserAnswers({});
    hasSubmittedRef.current = false;
    setIsSubmitting(false);
  }, [quiz?.id]);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIndex];
  const timeLimit = quiz?.time_limit_seconds || 60;

  // Auto-submit handler triggered when timer hits 0
  const handleAutoTimeout = useRef<() => void>(() => {});

  const timer = useQuizTimer({
    initialSeconds: timeLimit,
    autoStart: !isLoading && !!quiz,
    onTick: (remaining) => {
      // Audible tick during final 10 seconds
      if (soundEnabled && remaining <= 10 && remaining > 0) {
        soundFX.playTick();
      }
    },
    onTimeout: () => {
      handleAutoTimeout.current();
    },
  });

  // Calculate Urgency Level & Visual State
  const timeRemaining = timer.remainingSeconds;
  const timeRatio = timeRemaining / timeLimit;
  const isUrgent = timeRemaining <= 15;

  let timerColorClasses = 'text-black bg-[#B8FF9F] border-2 border-black shadow-[2px_2px_0px_#000]';
  let progressVariant: 'cyan' | 'green' | 'orange' | 'pink' | 'yellow' = 'green';

  if (timeRatio <= 0.25 || isUrgent) {
    timerColorClasses = 'text-black bg-[#FFA6F6] border-2 border-black shadow-[2px_2px_0px_#000] animate-pulse';
    progressVariant = 'pink';
  } else if (timeRatio <= 0.5) {
    timerColorClasses = 'text-black bg-[#FFE57F] border-2 border-black shadow-[2px_2px_0px_#000]';
    progressVariant = 'yellow';
  }

  // Answer selection
  const handleSelectOption = (index: number) => {
    if (!currentQuestion || isSubmitting || hasSubmittedRef.current) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: index,
    }));

    // Audio cue
    if (soundEnabled) {
      const correctIdx =
        currentQuestion.correctOptionIndex !== undefined && currentQuestion.correctOptionIndex >= 0
          ? currentQuestion.correctOptionIndex
          : currentQuestion.options.indexOf(currentQuestion.correctAnswer);

      if (index === correctIdx) {
        soundFX.playCorrect();
      } else {
        soundFX.playIncorrect();
      }
    }
  };

  // Submit Logic with guaranteed single-execution lock
  const handleSubmitQuiz = async () => {
    if (isSubmitting || hasSubmittedRef.current || !quiz) return;
    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    timer.stop();

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const answerDetails = questions.map((q) => {
      const selected = userAnswers[q.id];
      const correctIdx =
        q.correctOptionIndex !== undefined && q.correctOptionIndex >= 0
          ? q.correctOptionIndex
          : q.options.indexOf(q.correctAnswer);

      const isAnswered = selected !== undefined && selected !== null;
      const isCorrect = isAnswered && selected === correctIdx;

      if (!isAnswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      return {
        question_id: q.id,
        selected_option_index: isAnswered ? selected : null,
        is_correct: isCorrect,
      };
    });

    const totalQuestions = questions.length;
    const accuracy =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const timeBonus = Math.floor(timer.remainingSeconds / 5);
    const xpEarned = Math.round((quiz.xp_reward * correctCount) / Math.max(1, totalQuestions)) + timeBonus;

    const attempt: TimedQuizAttempt = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: user?.id || 'guest',
      timed_quiz_id: quiz.id,
      language_id: quiz.language_id,
      score: correctCount * 10,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      incorrect_answers: incorrectCount,
      unanswered: unansweredCount,
      time_limit_seconds: quiz.time_limit_seconds,
      time_taken_seconds: timer.elapsedSeconds,
      time_remaining_seconds: timer.remainingSeconds,
      completed: true,
      xp_earned: xpEarned,
      accuracy_percentage: accuracy,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      user_answers: answerDetails,
    };

    const result = await quizService.submitTimedQuizAttempt(attempt);

    if (!result.isDuplicate && xpEarned > 0) {
      await addXp(xpEarned);
    }

    if (soundEnabled) {
      soundFX.playVictory();
    }

    navigate(`/quiz/timed/${quiz.id}/results`, {
      state: {
        attempt: result.attempt,
        quiz,
        newAchievements: result.newAchievements,
        newBadges: result.newBadges,
      },
    });
  };

  useEffect(() => {
    handleAutoTimeout.current = handleSubmitQuiz;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 font-sans">
        <div className="w-8 h-8 rounded-full border-3 border-black border-t-transparent animate-spin" />
        <p className="text-xs text-black font-bold">Loading timed challenge for {currentLang.name}...</p>
      </div>
    );
  }

  // Strict language mismatch view
  if (isMismatch && mismatchedQuiz) {
    const quizLang = getLanguageById(mismatchedQuiz.language_id);
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 font-sans">
        <div className="w-12 h-12 bg-[#FFE57F] text-black rounded-[4px] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-black" />
        </div>
        <h2 className="text-xl font-black text-black">Language Mismatch Detected</h2>
        <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
          This speed sprint is designed for <strong>{quizLang.name}</strong>, but your current active learning language is <strong>{currentLang.name}</strong>.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={async () => {
              await setLearningLanguage(quizLang.code);
            }}
          >
            Switch to {quizLang.name}
          </Button>
          <Link to="/quiz/timed">
            <Button variant="outline">View {currentLang.name} Sprints</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 font-sans">
        <div className="w-12 h-12 bg-[#FFE57F] text-black rounded-[4px] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6 text-black" />
        </div>
        <h2 className="text-xl font-black text-black">No Timed Quiz Available for {currentLang.name}</h2>
        <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
          Speed challenges for {currentLang.name} are currently being prepared. Check back soon or practice regular lessons!
        </p>
        <Link to="/learn">
          <Button variant="primary">Go to Lessons</Button>
        </Link>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.min(100, Math.max(0, (timeRemaining / timeLimit) * 100));
  const selectedIdx = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Bar with Timer and Progress */}
      <div className="bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-black uppercase tracking-wider bg-[#FFE57F] px-2 py-0.5 border border-black rounded">
              {quiz.mode}
            </span>
            <span className="text-black font-black">•</span>
            <span className="text-xs font-bold text-black">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Real-time Countdown Urgency Box */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] font-mono font-black text-sm tracking-wider ${timerColorClasses}`}
            >
              <Clock className="w-4 h-4 text-black" />
              <span>{timer.formattedRemaining}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSubmitQuiz}
              className="text-xs"
            >
              Submit Early
            </Button>
          </div>
        </div>

        {/* Visual Countdown Progress Bar */}
        <ProgressBar value={progressPercent} variant={progressVariant} />
      </div>

      {/* Main Question Card */}
      <div className="bg-white border-3 border-black rounded-[6px] shadow-[6px_6px_0px_#000] p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-black uppercase tracking-wider bg-[#A6FAFF] px-2 py-0.5 border border-black rounded">
              {quiz.title}
            </span>
            <span className="text-xs font-black text-black">
              {answeredCount} / {questions.length} Answered
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-black leading-snug">
            {currentQuestion.prompt}
          </h2>

          {currentQuestion.marathiPrompt && (
            <div className="p-3.5 bg-[#FFE57F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] flex items-center justify-between">
              <div>
                <span className="text-lg font-black text-black block">
                  {currentQuestion.marathiPrompt}
                </span>
                {currentQuestion.romanPrompt && (
                  <span className="text-xs font-bold text-neutral-800 italic">
                    {currentQuestion.romanPrompt}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => speechService.speak(currentQuestion.marathiPrompt!, { lang: quiz.language_id === 'mr' ? 'mr-IN' : 'hi-IN' })}
                className="p-2 bg-white border border-black rounded-[4px] shadow-[1px_1px_0px_#000] text-black hover:bg-neutral-100 transition-none cursor-pointer"
                title="Listen Pronunciation"
              >
                <Volume2 className="w-4 h-4 text-black" />
              </button>
            </div>
          )}
        </div>

        {/* Options Grid */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-[4px] border-2 border-black font-bold text-sm sm:text-base flex items-center justify-between cursor-pointer active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-none ${
                  isSelected
                    ? 'bg-[#A6FAFF] shadow-[4px_4px_0px_#000] text-black translate-x-[2px] translate-y-[2px]'
                    : 'bg-white shadow-[4px_4px_0px_#000] hover:bg-[#FDF8F5] text-black'
                }`}
              >
                <span>{opt}</span>
                <span
                  className={`w-6 h-6 rounded-[4px] border-2 border-black flex items-center justify-center text-xs font-black font-mono shadow-[1px_1px_0px_#000] ${
                    isSelected
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Pagination navigation controls */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-black">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1.5 overflow-x-auto px-2">
            {questions.map((q, idx) => {
              const isAns = userAnswers[q.id] !== undefined;
              const isCurr = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-[4px] border-2 border-black text-xs font-black transition-none cursor-pointer ${
                    isCurr
                      ? 'bg-black text-white shadow-[2px_2px_0px_#000]'
                      : isAns
                      ? 'bg-[#B8FF9F] text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-black hover:bg-[#FDF8F5] shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {currentIndex < questions.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitQuiz}
              isLoading={isSubmitting}
              rightIcon={<CheckCircle className="w-4 h-4" />}
            >
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
