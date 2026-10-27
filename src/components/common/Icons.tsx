import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

const baseProps: React.SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ChevronDown: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronUp: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export const ChevronLeft: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ChevronRight: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ArrowLeft: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const ArrowRight: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const Check: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CheckCircle: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
export const CheckCircle2 = CheckCircle;

export const X: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const XCircle: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const Plus: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const Search: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const Edit: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
export const Edit2 = Edit;
export const Edit3 = Edit;

export const Trash: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
export const Trash2 = Trash;

export const Menu: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const Volume2: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

export const VolumeX: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export const Layers: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const BookOpen: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const Compass: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export const MessageSquareQuote: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
  </svg>
);
export const MessageSquare = MessageSquareQuote;

export const BarChart3: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
export const BarChart2 = BarChart3;
export const BarChart = BarChart3;

export const Award: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

export const Trophy: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H7" />
    <path d="M14 14.66V17c0 .55.45 1 1 1h2" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

export const User: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Users: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const LogOut: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const Shield: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const ShieldAlert: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const Timer: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <line x1="10" y1="2" x2="14" y2="2" />
    <line x1="12" y1="14" x2="15" y2="11" />
    <circle cx="12" cy="14" r="8" />
  </svg>
);
export const Clock = Timer;

export const RefreshCw: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const Globe: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const FileText: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const HelpCircle: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const MapPin: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Database: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const Flame: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.88-1.5-3.5-1.5-5.5 0-1.5 1-2.5 1-2.5s-.5 1.5-.5 2.5c0 1.5 1.5 2.5 1.5 4a3.5 3.5 0 1 1-7 0c0-1.5 1-2.5 1.5-4 .5 1.5.5 2.5 0 3.5z" />
  </svg>
);

export const Zap: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const Sparkles: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M12 3l1.9 5.6L19 10.5l-5.1 1.9L12 18l-1.9-5.6L5 10.5l5.1-1.9z" />
  </svg>
);

export const Filter: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const Mail: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const Lock: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Key: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M21 2l-2 2m-1.5 1.5L14 9l-3-3L8 9l3 3-6.5 6.5a2.12 2.12 0 0 0 3 3L14 15l3 3 3-3-3-3 3.5-3.5z" />
  </svg>
);

export const Eye: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOff: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const AlertCircle: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const AlertTriangle: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const Info: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const Send: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const Heart: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const Settings: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const Bot: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

export const RotateCcw: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export const Play: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const Target: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const Bookmark: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg {...baseProps} className={className} {...props}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

