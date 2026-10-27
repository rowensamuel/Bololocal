import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'md',
  ...props
}) => {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-7',
  };

  return (
    <div
      className={`bg-white text-black border-2 border-black rounded-[6px] shadow-[6px_6px_0px_#000] transition-transform duration-75 ${
        hoverEffect ? 'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000]' : ''
      } ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
