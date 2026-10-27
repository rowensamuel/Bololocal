import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layers,
  BookOpen,
  Compass,
  MessageSquareQuote,
  BarChart3,
  Award,
  LogOut,
  Shield,
  ShieldAlert,
  Timer,
  Zap,
} from './Icons';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';

export interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', onCloseMobile }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Layers },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Timed Quizzes', path: '/quiz/timed', icon: Timer, badge: 'Speed' },
    { name: 'Practice', path: '/practice', icon: Zap, badge: 'Sprint' },
    { name: 'Vocabulary', path: '/vocabulary', icon: Compass },
    { name: 'Useful Phrases', path: '/phrases', icon: MessageSquareQuote },
    { name: 'Progress', path: '/progress', icon: BarChart3 },
    { name: 'Achievements', path: '/achievements', icon: Award },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`flex flex-col justify-between w-64 border-r-2 border-black bg-[#FAF9F6] h-screen select-none sticky top-0 shrink-0 ${className}`}
    >
      <div>
        {/* Logo Section */}
        <div className="h-14 px-5 flex items-center border-b-2 border-black bg-[#FAF9F6]">
          <Logo size="sm" to="/dashboard" />
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]">
          <div className="px-2 py-1 text-[10px] font-black tracking-widest text-[#121310] uppercase">
            Curriculum
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#52634F] text-[#FAF9F6] border-2 border-black shadow-[2px_2px_0px_#000]'
                      : 'text-[#121310] border-2 border-transparent hover:border-black hover:bg-[#FAF9F6] hover:shadow-[2px_2px_0px_#000]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#FAF9F6]' : 'text-black'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 border border-black uppercase ${
                          isActive
                            ? 'bg-[#E6B022] text-black'
                            : 'bg-[#ECEAE4] text-black'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Admin link only visible to ADMIN */}
          {isAdmin && (
            <div className="pt-2">
              <div className="px-2 py-1 text-[10px] font-black tracking-widest text-[#52634F] uppercase">
                Admin Area
              </div>
              <NavLink
                to="/admin"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all border-2 border-black ${
                    isActive
                      ? 'bg-[#52634F] text-white shadow-[2px_2px_0px_#000]'
                      : 'bg-[#ECEAE4] text-[#121310] hover:bg-[#FAF9F6] shadow-[2px_2px_0px_#000]'
                  }`
                }
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Profile & Role */}
      <div className="p-3 border-t-2 border-black bg-[#ECEAE4] space-y-2">
        {/* Role Indicator */}
        <div className="flex items-center justify-between p-2 bg-[#FAF9F6] border-2 border-black shadow-[2px_2px_0px_#000] text-xs">
          <div className="flex items-center gap-1.5 text-[#121310]">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 font-black text-white bg-[#52634F] px-1.5 py-0.5 border border-black text-[9px] uppercase">
                <Shield className="w-2.5 h-2.5" /> ADMIN
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-black text-black bg-[#ECEAE4] px-1.5 py-0.5 border border-black text-[9px] uppercase">
                LEARNER
              </span>
            )}
            <span className="text-[10px] font-bold text-[#4A4B45]">Status</span>
          </div>
          <span className="text-[9px] text-[#FAF9F6] font-black bg-[#2C6E49] px-1.5 py-0.5 border border-black uppercase">
            Active
          </span>
        </div>

        {/* Profile Link */}
        <NavLink
          to="/profile"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 border-2 border-black text-xs font-bold transition-all ${
              isActive
                ? 'bg-[#FAF9F6] text-black shadow-[2px_2px_0px_#000]'
                : 'bg-[#FAF9F6]/80 text-[#121310] hover:bg-[#FAF9F6] shadow-[1px_1px_0px_#000]'
            }`
          }
        >
          <div className="h-6 w-6 border border-black bg-black text-[#FAF9F6] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
            {user?.avatar_url || user?.avatarUrl ? (
              <img src={user.avatar_url || user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              (user?.name || 'U')[0].toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-bold text-[#121310] leading-tight">
              {user?.full_name || user?.name || 'Learner'}
            </span>
            <span className="truncate text-[10px] text-[#4A4B45] font-medium">
              Profile & Settings
            </span>
          </div>
        </NavLink>

        <div className="flex items-center justify-between pt-1 text-xs px-1">
          {isAdmin ? (
            <NavLink
              to="/admin"
              onClick={handleNavClick}
              className="flex items-center gap-1 text-[#52634F] font-bold hover:underline"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </NavLink>
          ) : (
            <span className="text-[10px] font-bold text-[#4A4B45]">BoloLocal v1.0</span>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[#BA2D27] font-bold hover:underline cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
