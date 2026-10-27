import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-tight select-none cursor-pointer whitespace-nowrap transition-transform duration-75 border-2 border-black rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50 disabled:pointer-events-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 min-h-[34px] shadow-[3px_3px_0px_#000]',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 min-h-[42px] shadow-[4px_4px_0px_#000]',
    lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5 min-h-[48px] shadow-[5px_5px_0px_#000]',
  };

  const variantStyles = {
    primary: 'bg-[#A6FAFF] text-black hover:bg-[#8EE9EF]',
    secondary: 'bg-[#FFFFFF] text-black hover:bg-[#F2F0EB]',
    accent: 'bg-[#FFC29F] text-black hover:bg-[#F2B08B]',
    success: 'bg-[#B8FF9F] text-black hover:bg-[#A3EB89]',
    danger: 'bg-[#FF8A8A] text-black hover:bg-[#F07575]',
    outline: 'bg-transparent text-black hover:bg-black/5',
    ghost: 'bg-transparent text-black hover:bg-black/5 border-transparent shadow-none active:translate-x-0 active:translate-y-0',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-3.5 w-3.5 text-current" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
