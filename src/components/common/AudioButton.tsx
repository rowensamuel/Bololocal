import React, { useState } from 'react';
import { Volume2 } from './Icons';
import { speakMarathi } from '../../utils/speech';

export interface AudioButtonProps {
  textToSpeak: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon-only' | 'button' | 'pill';
  label?: string;
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToSpeak,
  size = 'md',
  variant = 'button',
  label = 'Listen',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPlaying) return;

    setIsPlaying(true);
    await speakMarathi(textToSpeak, {
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const sizeClasses = {
    sm: 'p-1 text-xs min-h-[30px]',
    md: 'px-2 py-1 text-xs min-h-[34px]',
    lg: 'px-3 py-1.5 text-sm min-h-[38px]',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={handlePlay}
        title={`Listen to pronunciation for ${textToSpeak}`}
        aria-label={`Listen to ${textToSpeak}`}
        className={`inline-flex items-center justify-center border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-transform cursor-pointer ${
          isPlaying
            ? 'bg-[#B8FF9F] text-black'
            : 'bg-[#A6FAFF] text-black hover:bg-[#8EE9EF]'
        } ${sizeClasses[size]} ${className}`}
      >
        <Volume2 className={iconSizes[size]} />
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handlePlay}
        title="Listen to pronunciation"
        aria-label={`Listen to ${textToSpeak}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-transform cursor-pointer text-xs font-bold ${
          isPlaying
            ? 'bg-[#B8FF9F] text-black'
            : 'bg-[#A6FAFF] text-black hover:bg-[#8EE9EF]'
        } ${className}`}
      >
        <Volume2 className={iconSizes.sm} />
        <span>{isPlaying ? 'Playing...' : label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={`inline-flex items-center justify-center gap-1.5 font-bold border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-transform cursor-pointer select-none ${
        isPlaying
          ? 'bg-[#B8FF9F] text-black'
          : 'bg-[#A6FAFF] text-black hover:bg-[#8EE9EF]'
      } ${sizeClasses[size]} ${className}`}
      aria-label={`Listen to ${textToSpeak}`}
    >
      <Volume2 className={iconSizes[size]} />
      <span>{isPlaying ? 'Speaking...' : label}</span>
    </button>
  );
};
