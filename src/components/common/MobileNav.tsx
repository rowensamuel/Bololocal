import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers,
  BookOpen,
  Compass,
  MessageSquareQuote,
  User,
  Timer,
  Shield,
  X,
  BarChart3,
  Award,
  Zap,
} from './Icons';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const bottomItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Layers },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Sprint', path: '/quiz/timed', icon: Timer },
    { name: 'Practice', path: '/practice', icon: Zap },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const drawerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Layers },
    { name: 'Learn Language', path: '/learn', icon: BookOpen },
    { name: 'Timed Quizzes', path: '/quiz/timed', icon: Timer },
    { name: 'Practice Arena', path: '/practice', icon: Zap },
    { name: 'Vocabulary Vault', path: '/vocabulary', icon: Compass },
    { name: 'Useful Phrases', path: '/phrases', icon: MessageSquareQuote },
    { name: 'Progress Tracking', path: '/progress', icon: BarChart3 },
    { name: 'Achievements & Badges', path: '/achievements', icon: Award },
    { name: 'Profile & Settings', path: '/profile', icon: User },
    ...(isAdmin ? [{ name: 'Admin Console', path: '/admin', icon: Shield }] : []),
  ];

  return (
    <>
      {/* Bottom Docked Navigation Bar for touchscreens */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around border-t-2 border-black bg-white px-1 md:hidden">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 text-xs font-bold transition-all ${
                  isActive
                    ? 'text-black font-black underline underline-offset-4 decoration-2 decoration-[#E26D24]'
                    : 'text-[#555555] hover:text-black'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] leading-tight uppercase tracking-wider">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Drawer Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-[#FDF8F5] border-r-2 border-black h-full flex flex-col justify-between p-4 shadow-[8px_0px_0px_#000]">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b-2 border-black">
                <Logo size="sm" to="/dashboard" />
                <button
                  onClick={onClose}
                  className="p-1 border-2 border-black rounded-[4px] bg-[#FF8A8A] text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              <div className="py-3 space-y-1.5 overflow-y-auto max-h-[70vh]">
                {drawerLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 border-2 text-xs font-bold transition-all rounded-[4px] min-h-[40px] ${
                        isActive
                          ? 'bg-[#A6FAFF] text-black border-black shadow-[2px_2px_0px_#000]'
                          : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[2px_2px_0px_#000]'
                      }`
                    }
                  >
                    <link.icon className="w-4 h-4 text-black" />
                    <span>{link.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t-2 border-black text-[11px] font-black uppercase text-black text-center">
              BOLOLOCAL • Real-Life Spoken Practice
            </div>
          </div>
        </div>
      )}
    </>
  );
};
