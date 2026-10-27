import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Shield, Menu, Globe, Timer } from './Icons';
import { useAuth } from '../../context/AuthContext';
import { useLearning } from '../../context/LearningContext';
import { mockLanguages, getLanguageById } from '../../data/mockLanguages';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onOpenMobileMenu }) => {
  const { user, isAdmin, setLearningLanguage } = useAuth();
  const { totalXp, streakDays } = useLearning();
  const location = useLocation();

  const activeLangId = user?.learning_language_id || 'mr';
  const currentLanguage = getLanguageById(activeLangId);

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path === '/dashboard') return 'Learning Dashboard';
    if (path === '/learn') return `Learn ${currentLanguage.name}`;
    if (path.startsWith('/lesson')) return 'Lesson Studio';
    if (path === '/vocabulary') return 'Vocabulary Vault';
    if (path === '/phrases') return 'Useful Phrases';
    if (path === '/practice') return 'Practice Arena';
    if (path === '/quiz/timed') return 'Timed Quizzes';
    if (path.startsWith('/quiz/timed')) return 'Speed Challenge';
    if (path.startsWith('/quiz')) return 'Knowledge Quiz';
    if (path === '/progress') return 'Progress & Growth';
    if (path === '/achievements') return 'Achievements & Badges';
    if (path === '/profile') return 'Profile & Settings';
    if (path.startsWith('/admin')) return 'Admin Center';
    return 'BOLOLOCAL';
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b-2 border-black bg-[#FAF9F6] px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="border-2 border-black p-1 text-[#121310] bg-[#ECEAE4] hover:bg-[#FAF9F6] md:hidden shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-[#121310] leading-tight truncate">
            {getPageTitle()}
          </h1>
          {subtitle && <p className="text-[11px] text-[#4A4B45] truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Dynamic Learning Language Selector */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 border-2 border-black bg-[#FAF9F6] shadow-[2px_2px_0px_#000] text-xs font-bold text-[#121310]">
          <Globe className="w-3.5 h-3.5 text-[#52634F]" />
          <select
            value={activeLangId}
            onChange={(e) => setLearningLanguage(e.target.value)}
            className="bg-transparent border-none p-0 text-xs font-bold text-[#121310] focus:ring-0 cursor-pointer pr-1"
            title="Switch current learning language"
          >
            {mockLanguages.map((l) => (
              <option key={l.id} value={l.code}>
                {l.name} ({l.native_name})
              </option>
            ))}
          </select>
        </div>

        {/* Timed Quiz shortcut */}
        <Link
          to="/quiz/timed"
          className="hidden md:flex items-center gap-1 px-2.5 py-0.5 border-2 border-black bg-[#E6B022] hover:bg-[#D9A316] text-[#121310] shadow-[2px_2px_0px_#000] text-xs font-bold transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          title="Take a Timed Quiz Sprint"
        >
          <Timer className="w-3.5 h-3.5 text-black" />
          <span>Sprint</span>
        </Link>

        {/* Streak Tag */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 border-2 border-black bg-[#FAF9F6] shadow-[2px_2px_0px_#000] text-[#E26D24] text-xs font-bold"
          title="Current Daily Streak"
        >
          <Flame className="w-3.5 h-3.5 text-[#E26D24]" />
          <span>{streakDays}d</span>
        </div>

        {/* XP Tag */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 border-2 border-black bg-[#FAF9F6] shadow-[2px_2px_0px_#000] text-[#121310] text-xs font-bold font-mono"
          title="Total XP Earned"
        >
          <span>{totalXp} XP</span>
        </div>

        {/* Admin Link ONLY if user is ADMIN */}
        {isAdmin && (
          <Link
            to="/admin"
            className="hidden lg:flex items-center gap-1 px-2.5 py-0.5 border-2 border-black bg-[#52634F] text-[#FAF9F6] hover:bg-[#435340] shadow-[2px_2px_0px_#000] text-xs font-bold transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            title="Switch to Admin Console"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        )}

        {/* User Profile Avatar */}
        <Link
          to="/profile"
          className="flex items-center border-2 border-black bg-[#FAF9F6] shadow-[2px_2px_0px_#000] p-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          aria-label="User profile"
        >
          <div className="h-6 w-6 bg-[#121310] text-[#FAF9F6] flex items-center justify-center font-bold text-xs overflow-hidden">
            {user?.avatar_url || user?.avatarUrl ? (
              <img
                src={user.avatar_url || user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.name || 'U')[0].toUpperCase()
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};
