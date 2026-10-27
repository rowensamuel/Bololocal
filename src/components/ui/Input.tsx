import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-black">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-black pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full border-2 border-black rounded-[4px] bg-white px-3 py-2 text-xs sm:text-sm text-black placeholder:text-black/40 shadow-[3px_3px_0px_#000] focus:outline-none focus:shadow-[4px_4px_0px_#A6FAFF] focus:bg-[#FAFDFD] transition-all ${
            leftIcon ? 'pl-9' : ''
          } ${
            error
              ? 'border-[#BA2D27] focus:shadow-[4px_4px_0px_#BA2D27]'
              : 'border-black'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#BA2D27] font-bold">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#555555] font-medium">{helperText}</p>}
    </div>
  );
};
