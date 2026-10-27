import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareQuote } from './Icons';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  to?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'dark',
  to = '/',
  showTagline = false,
}) => {
  const sizeClasses = {
    sm: { icon: 'w-4 h-4', box: 'w-7 h-7', text: 'text-base', badge: 'text-[9px] px-1' },
    md: { icon: 'w-4 h-4', box: 'w-8 h-8', text: 'text-lg', badge: 'text-[10px] px-1.5' },
    lg: { icon: 'w-5 h-5', box: 'w-10 h-10', text: 'text-xl', badge: 'text-xs px-2' },
  };

  const isLight = variant === 'light';

  const content = (
    <div className="flex flex-col select-none">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex items-center justify-center border-2 border-black ${sizeClasses[size].box} ${
            isLight
              ? 'bg-[#E26D24] text-white shadow-[2px_2px_0px_#FAF9F6]'
              : 'bg-[#52634F] text-[#FAF9F6] shadow-[2px_2px_0px_#000]'
          }`}
        >
          <MessageSquareQuote className={sizeClasses[size].icon} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${sizeClasses[size].text} ${
                isLight ? 'text-[#FAF9F6]' : 'text-[#121310]'
              }`}
            >
              BOLO<span className={isLight ? 'text-[#E26D24]' : 'text-[#52634F]'}>LOCAL</span>
            </span>
            <span
              className={`font-bold border-2 border-black ${
                isLight
                  ? 'bg-[#E26D24] text-white shadow-[1px_1px_0px_#FAF9F6]'
                  : 'bg-[#E6B022] text-[#121310] shadow-[1px_1px_0px_#000]'
              } ${sizeClasses[size].badge} uppercase tracking-wider`}
            >
              मराठी
            </span>
          </div>
          {showTagline && (
            <span
              className={`text-xs font-semibold tracking-normal ${
                isLight ? 'text-[#ECEAE4]' : 'text-[#4A4B45]'
              }`}
            >
              Don't Just Translate. Learn to Speak.
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform">
        {content}
      </Link>
    );
  }

  return content;
};
