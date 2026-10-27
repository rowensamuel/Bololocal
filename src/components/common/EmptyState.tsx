import React from 'react';
import { Search, AlertCircle, FileText } from './Icons';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  type?: 'empty' | 'search' | 'error';
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  type = 'empty',
  actionLabel,
  onAction,
  className = '',
}) => {
  const icon = {
    empty: <FileText className="w-6 h-6 text-black" />,
    search: <Search className="w-6 h-6 text-black" />,
    error: <AlertCircle className="w-6 h-6 text-[#BA2D27]" />,
  }[type];

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] ${className}`}
    >
      <div className="p-3 bg-[#A6FAFF] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] mb-3">
        {icon}
      </div>
      <h3 className="text-base font-black text-black">{title}</h3>
      <p className="text-xs text-[#555555] max-w-sm mt-1 mb-4 leading-normal font-medium">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
