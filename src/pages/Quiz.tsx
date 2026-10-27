import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
} from '../components/common/Icons';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { QuizOption } from '../components/quiz/QuizOption';
import { QuizResultModal } from '../components/quiz/QuizResultModal';
import { AudioButton } from '../components/common/AudioButton';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useQuiz } from '../hooks/useQuiz';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { quizService } from '../services/quizService';
import { QuizQuestion } from '../types/quiz';
import { getLanguageById } from '../data/mockLanguages';

interface QuestionAnswerState {
  selected: number;
  isSubmitted: boolean;
  isCorrect: boolean;
}

export const Quiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user, setLearningLanguage } = useAuth();
  const { addXp, completeQuiz } = useLearning();

  const { quiz, mismatchedQuiz, loading: isLoading, isLanguageMismatch, currentLanguageId } = useQuiz(quizId);
  const currentLang = getLanguageById(currentLanguageId);

  const questions = quiz?.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, QuestionAnswerState>>({});

  // Time tracker
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const hasAwardedXpRef = useRef<boolean>(false);

  // Reset quiz state when quiz or language changes
  useEffect(() => {
    setCurrentIndex(0);
    setUserAnswers({});
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setIsResultOpen(false);
    setIsReviewMode(false);
    hasAwardedXpRef.current = false;
  }, [quiz?.id, currentLanguageId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isResultOpen) {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, isResultOpen]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 font-sans">
        <div className="w-8 h-8 rounded-full border-3 border-black border-t-transparent animate-spin" />
        <p className="text-xs text-black font-bold">Loading quiz questions for {currentLang.name}...</p>
      </div>
    );
  }

  // Language mismatch: Never silently substitute! Present user with options.
  if (isLanguageMismatch && mismatchedQuiz) {
    const quizLang = getLanguageById(mismatchedQuiz.language_id);
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 font-sans">
        <div className="w-12 h-12 bg-[#FFE57F] text-black rounded-[4px] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-black" />
        </div>
        <h2 className="text-xl font-black text-black">Language Mismatch Detected</h2>
        <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
          This quiz is designed for <strong>{quizLang.name}</strong>, but your current active learning language is <strong>{currentLang.name}</strong>.
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
          <Link to="/learn">
            <Button variant="outline">Back to Lessons</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Proper empty state when no quiz exists for active language
  if (!quiz || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 font-sans">
        <div className="w-12 h-12 bg-[#FFE57F] text-black rounded-[4px] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6 text-black" />
        </div>
        <h2 className="text-xl font-black text-black">No Quiz Available for {currentLang.name} Yet</h2>
        <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
          Quizzes for {currentLang.name} are currently expanding. You can practice vocabulary words, explore lessons, or switch languages in your profile.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/learn">
            <Button variant="primary">Return to Lessons</Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline">Change Language</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion: QuizQuestion = questions[currentIndex];
  const correctOptionIndex =
    currentQuestion.correctOptionIndex !== undefined && currentQuestion.correctOptionIndex >= 0
      ? currentQuestion.correctOptionIndex
      : currentQuestion.options.indexOf(currentQuestion.correctAnswer);

  const currentAnswerState = userAnswers[currentQuestion.id];
  const selectedOptionIndex = currentAnswerState?.selected ?? null;
  const isAnswerSubmitted = currentAnswerState?.isSubmitted ?? false;
  const isCorrect = currentAnswerState?.isCorrect ?? false;

  // Authoritative score calculated directly from userAnswers snapshot
  const score = Object.values(userAnswers).filter((a) => a.isCorrect).length;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selected: idx,
        isSubmitted: false,
        isCorrect: false,
      },
    }));
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || isAnswerSubmitted) return;
    const correct = selectedOptionIndex === correctOptionIndex;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selected: selectedOptionIndex,
        isSubmitted: true,
        isCorrect: correct,
      },
    }));
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final score accurately from submitted answers
      const finalAnswers = { ...userAnswers };
      const finalScore = Object.values(finalAnswers).filter((a) => a.isCorrect).length;
      const finalXp = finalScore * 20 + 30; // base reward + question bonus

      if (!hasAwardedXpRef.current) {
        hasAwardedXpRef.current = true;
        const attemptId = `qa-${quiz.id}-${Date.now()}`;
        await quizService.submitQuizAttempt({
          id: attemptId,
          user_id: user?.id || 'guest',
          quiz_id: quiz.id,
          language_id: quiz.language_id,
          score: finalScore,
          totalQuestions: questions.length,
          xpEarned: finalXp,
          completedAt: new Date().toISOString(),
        });
        await completeQuiz(quiz.id, finalScore, finalXp);
      }
      setIsResultOpen(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setIsResultOpen(false);
    setIsReviewMode(false);
    hasAwardedXpRef.current = false;
  };

  const handleReview = () => {
    setIsResultOpen(false);
    setIsReviewMode(true);
    setCurrentIndex(0);
  };

  const handleContinueLearning = () => {
    setIsResultOpen(false);
    navigate('/learn');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-black">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black hover:bg-[#FFE57F] px-2 py-1 border border-black rounded transition-none"
        >
          <ArrowLeft className="w-4 h-4 text-black" />
          <span>Exit Quiz</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="sm">
            {quiz.title}
          </Badge>
          <span className="text-xs text-black font-black font-mono bg-white px-2 py-0.5 border border-black rounded shadow-[1px_1px_0px_#000]">
            ⏱ {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress Bar & Question Counter */}
      <QuizProgress
        currentQuestion={currentIndex + 1}
        totalQuestions={questions.length}
        score={score * 20}
      />

      {/* Main Question Card */}
      <div className="bg-white border-3 border-black rounded-[6px] shadow-[6px_6px_0px_#000] p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-black uppercase tracking-wider bg-[#FFE57F] px-2 py-0.5 border border-black rounded">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-600 uppercase">
                {currentQuestion.type === 'translation'
                  ? 'Translation'
                  : currentQuestion.type === 'fill-in-the-blank'
                  ? 'Fill in Blank'
                  : 'Multiple Choice'}
              </span>
              {(currentQuestion.marathiPrompt || currentQuestion.prompt) && (
                <AudioButton
                  textToSpeak={currentQuestion.marathiPrompt || currentQuestion.prompt}
                  variant="icon-only"
                  size="sm"
                />
              )}
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-black">
            {currentQuestion.prompt}
          </h3>

          {currentQuestion.marathiPrompt && (
            <div className="p-3 bg-[#A6FAFF] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] flex items-center justify-between">
              <div>
                <span className="font-black text-black text-lg block">
                  {currentQuestion.marathiPrompt}
                </span>
                {currentQuestion.romanPrompt && (
                  <span className="text-xs font-bold text-neutral-800 italic">
                    {currentQuestion.romanPrompt}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => (
            <QuizOption
              key={idx}
              label={opt}
              index={idx}
              isSelected={selectedOptionIndex === idx}
              isCorrect={idx === correctOptionIndex}
              isSubmitted={isAnswerSubmitted}
              onClick={() => handleSelectOption(idx)}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t-2 border-black flex items-center justify-between">
          <div className="text-xs font-bold">
            {isAnswerSubmitted && isCorrect && (
              <span className="text-black bg-[#B8FF9F] px-2 py-1 border border-black rounded shadow-[2px_2px_0px_#000] flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-black" /> Correct answer! (+20 XP)
              </span>
            )}
            {isAnswerSubmitted && !isCorrect && (
              <span className="text-black bg-[#FFA6F6] px-2 py-1 border border-black rounded shadow-[2px_2px_0px_#000] flex items-center gap-1">
                <XCircle className="w-4 h-4 text-black" /> Incorrect
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <Button
                variant="outline"
                size="md"
                onClick={handlePrevQuestion}
              >
                Previous
              </Button>
            )}

            {!isAnswerSubmitted ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitAnswer}
                disabled={selectedOptionIndex === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleNextQuestion}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
              </Button>
            )}
          </div>
        </div>

        {/* Explanation when submitted */}
        {isAnswerSubmitted && currentQuestion.explanation && (
          <div className="p-4 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-medium space-y-1">
            <span className="font-black text-black uppercase tracking-wider block">Learning Note:</span>
            <p className="font-semibold text-black">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* Review Mode Bar */}
      {isReviewMode && (
        <div className="p-4 rounded-[4px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black flex items-center justify-between">
          <div className="text-xs">
            <span className="font-black uppercase tracking-wider block">Reviewing Answers</span>
            <span className="font-bold text-neutral-600">Score: {score}/{questions.length}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry Quiz
            </Button>
            <Button variant="primary" size="sm" onClick={handleContinueLearning}>
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Result Modal */}
      <QuizResultModal
        isOpen={isResultOpen}
        score={score}
        totalQuestions={questions.length}
        xpEarned={score * 20 + 30}
        timeSpentSeconds={elapsedSeconds}
        onRetry={handleRetry}
        onReview={handleReview}
        onContinue={handleContinueLearning}
      />
    </div>
  );
};
