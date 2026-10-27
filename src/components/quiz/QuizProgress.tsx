import React from 'react';
import { ProgressBar } from '../ui/ProgressBar';

export interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  score,
}) => {
  const percentage = Math.round(((currentQuestion - 1) / totalQuestions) * 100);

  return (
    <div className="w-full space-y-2 font-sans">
      <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-black">
        <span>
          Question <span className="bg-[#FFE57F] px-1.5 py-0.5 border border-black rounded">{currentQuestion}</span> of{' '}
          <span className="bg-neutral-100 px-1.5 py-0.5 border border-black rounded">{totalQuestions}</span>
        </span>
        <span className="bg-[#B8FF9F] px-2 py-0.5 border border-black rounded shadow-[2px_2px_0px_#000]">
          Score: {score} / {currentQuestion - 1 > 0 ? currentQuestion - 1 : 0}
        </span>
      </div>
      <ProgressBar value={percentage} variant="cyan" />
    </div>
  );
};
