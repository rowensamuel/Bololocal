import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  height?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'success' | 'cyan' | 'pink' | 'orange' | 'yellow' | 'green';
  variant?: string; // alias for color
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 'md',
  color = 'cyan',
  variant,
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightStyles = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
  };

  const activeColor = variant || color;

  const colorStyles: Record<string, string> = {
    primary: 'bg-[#A6FAFF]',
    accent: 'bg-[#FFC29F]',
    success: 'bg-[#B8FF9F]',
    cyan: 'bg-[#A6FAFF]',
    pink: 'bg-[#FFA6F6]',
    orange: 'bg-[#FFC29F]',
    yellow: 'bg-[#FFE57F]',
    green: 'bg-[#B8FF9F]',
    emerald: 'bg-[#B8FF9F]',
    indigo: 'bg-[#A6FAFF]',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-bold text-black mb-1">
          <span>PROGRESS</span>
          <span className="font-mono">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] overflow-hidden ${heightStyles[height]}`}>
        <div
          className={`h-full transition-all duration-150 ${colorStyles[activeColor] || 'bg-[#A6FAFF]'} ${percentage > 0 && percentage < 100 ? 'border-r-2 border-black' : ''}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
