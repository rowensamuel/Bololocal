import React from 'react';
import { Card } from '../ui/Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    text: string;
    isPositive?: boolean;
  };
  colorScheme?: 'cyan' | 'orange' | 'green' | 'pink' | 'yellow' | 'indigo' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorScheme = 'cyan',
}) => {
  const schemeStyles: Record<string, string> = {
    cyan: 'bg-[#A6FAFF]',
    orange: 'bg-[#FFC29F]',
    green: 'bg-[#B8FF9F]',
    pink: 'bg-[#FFA6F6]',
    yellow: 'bg-[#FFE57F]',
    indigo: 'bg-[#A6FAFF]',
    emerald: 'bg-[#B8FF9F]',
    amber: 'bg-[#FFE57F]',
  };

  return (
    <Card padding="md" className="flex items-start justify-between bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000]">
      <div className="space-y-1 min-w-0">
        <span className="text-[11px] font-black text-[#555555] uppercase tracking-wider block truncate">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-black text-black">
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-bold px-1.5 py-0.2 border border-black rounded-[2px] ${
                trend.isPositive ? 'bg-[#B8FF9F] text-black' : 'bg-[#FF8A8A] text-black'
              }`}
            >
              {trend.text}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-[#555555] font-medium truncate">{subtitle}</p>}
      </div>
      <div
        className={`w-9 h-9 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-black flex items-center justify-center shrink-0 ${schemeStyles[colorScheme]}`}
      >
        {icon}
      </div>
    </Card>
  );
};
