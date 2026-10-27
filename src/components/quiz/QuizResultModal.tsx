import React from 'react';
import { Trophy, Clock, Zap, CheckCircle, RotateCcw, ArrowRight } from '../common/Icons';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface QuizResultModalProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  timeSpentSeconds: number;
  onReview: () => void;
  onRetry: () => void;
  onContinue: () => void;
}

export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  isOpen,
  score,
  totalQuestions,
  xpEarned,
  timeSpentSeconds,
  onReview,
  onRetry,
  onContinue,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getPerformanceMessage = () => {
    if (percentage === 100) return 'उत्कृष्ट! Perfect Score! You have mastered this lesson.';
    if (percentage >= 80) return 'खूप छान! (Great job!) You are building strong regional language skills.';
    if (percentage >= 60) return 'चांगला प्रयत्न! Good effort. Review the few tricky words!';
    return 'सराव करा! Keep practicing, you will get it very soon!';
  };

  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  return (
    <Modal isOpen={isOpen} onClose={onContinue} maxWidth="md">
      <div className="text-center space-y-5 py-2 font-sans">
        {/* Badge Icon */}
        <div className="inline-flex p-4 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[4px_4px_0px_#000] text-black">
          <Trophy className="w-10 h-10 text-black" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-black tracking-tight">Quiz Completed!</h2>
          <p className="text-xs sm:text-sm font-semibold text-neutral-700 mt-1">
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-[4px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-center">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
              Score
            </span>
            <div className="text-lg sm:text-xl font-black text-black">
              {score}/{totalQuestions}
            </div>
            <span className="text-[11px] font-bold text-black bg-[#B8FF9F] px-1.5 py-0.2 border border-black rounded">
              {percentage}%
            </span>
          </div>

          <div className="space-y-0.5 border-x-2 border-black">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
              XP Earned
            </span>
            <div className="text-lg sm:text-xl font-black text-black flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 text-black" />
              <span>+{xpEarned}</span>
            </div>
            <span className="text-[11px] font-bold text-black bg-[#FFE57F] px-1.5 py-0.2 border border-black rounded">
              Bonus Added
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
              Time
            </span>
            <div className="text-lg sm:text-xl font-black text-black flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-black" />
              <span>{timeFormatted}</span>
            </div>
            <span className="text-[11px] font-bold text-black bg-[#A6FAFF] px-1.5 py-0.2 border border-black rounded">
              Paced well
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={onContinue}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue Learning
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReview}
              leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              Review Answers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
