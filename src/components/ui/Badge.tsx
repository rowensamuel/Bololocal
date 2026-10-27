import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'primary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'neutral'
    | 'outline'
    | 'pink'
    | 'cyan'
    | 'orange'
    | 'green'
    | 'yellow';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px] font-bold',
    md: 'px-2 py-0.5 text-xs font-bold',
  };

  const variantStyles: Record<string, string> = {
    primary: 'bg-[#A6FAFF] text-black border-2 border-black',
    accent: 'bg-[#FFC29F] text-black border-2 border-black',
    success: 'bg-[#B8FF9F] text-black border-2 border-black',
    warning: 'bg-[#FFE57F] text-black border-2 border-black',
    error: 'bg-[#FF8A8A] text-black border-2 border-black',
    pink: 'bg-[#FFA6F6] text-black border-2 border-black',
    cyan: 'bg-[#A6FAFF] text-black border-2 border-black',
    orange: 'bg-[#FFC29F] text-black border-2 border-black',
    green: 'bg-[#B8FF9F] text-black border-2 border-black',
    yellow: 'bg-[#FFE57F] text-black border-2 border-black',
    neutral: 'bg-white text-black border-2 border-black',
    outline: 'bg-transparent text-black border-2 border-black',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 uppercase tracking-wider whitespace-nowrap rounded-[4px] shadow-[2px_2px_0px_#000] ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
