import React from 'react';
import { CheckCircle, XCircle } from '../common/Icons';

export interface QuizOptionProps {
  label: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean | null;
  isSubmitted?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const QuizOption: React.FC<QuizOptionProps> = ({
  label,
  index,
  isSelected,
  isCorrect,
  isSubmitted,
  disabled,
  onClick,
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const prefix = letters[index] || String(index + 1);

  let stateStyles =
    'bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-black hover:bg-[#FDF8F5]';

  if (isSubmitted) {
    if (isCorrect) {
      stateStyles = 'bg-[#B8FF9F] border-2 border-black shadow-[4px_4px_0px_#000] text-black font-bold';
    } else if (isSelected && !isCorrect) {
      stateStyles = 'bg-[#FFA6F6] border-2 border-black shadow-[4px_4px_0px_#000] text-black font-bold';
    } else {
      stateStyles = 'bg-neutral-100 border-2 border-black shadow-none text-neutral-400 opacity-60';
    }
  } else if (isSelected) {
    stateStyles = 'bg-[#A6FAFF] border-2 border-black shadow-[4px_4px_0px_#000] text-black font-black translate-x-[2px] translate-y-[2px]';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-between w-full p-4 rounded-[4px] text-left text-sm sm:text-base font-bold cursor-pointer disabled:cursor-default active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-none ${stateStyles}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-[4px] border-2 border-black text-xs font-black font-mono shadow-[2px_2px_0px_#000] ${
            isSelected
              ? 'bg-black text-white'
              : 'bg-white text-black'
          }`}
        >
          {prefix}
        </span>
        <span className="font-bold">{label}</span>
      </div>

      {isSubmitted && isCorrect && (
        <CheckCircle className="w-5 h-5 text-black shrink-0" />
      )}
      {isSubmitted && isSelected && !isCorrect && (
        <XCircle className="w-5 h-5 text-black shrink-0" />
      )}
    </button>
  );
};
