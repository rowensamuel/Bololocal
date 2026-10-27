import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Users,
  Globe,
  BookOpen,
  FileText,
  Compass,
  MessageSquareQuote,
  HelpCircle,
  ArrowLeft,
  Shield,
  Timer,
  Trophy,
  Award,
  BarChart2,
  MapPin,
  LogOut,
  Database,
  Menu,
} from '../components/common/Icons';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: Layers, end: true },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Languages', path: '/admin/languages', icon: Globe },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Lessons', path: '/admin/lessons', icon: FileText },
    { name: 'Vocabulary', path: '/admin/vocabulary', icon: Compass },
    { name: 'Phrases', path: '/admin/phrases', icon: MessageSquareQuote },
    { name: 'Situations', path: '/admin/situations', icon: MapPin },
    { name: 'Quizzes', path: '/admin/quizzes', icon: HelpCircle },
    { name: 'Timed Quizzes', path: '/admin/timed-quizzes', icon: Timer },
    { name: 'Achievements', path: '/admin/achievements', icon: Trophy },
    { name: 'Badges', path: '/admin/badges', icon: Award },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-[#1A1A17] text-white">
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b-2 border-black bg-black sticky top-0 z-10">
          <Logo size="sm" variant="light" to="/admin" />
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-white bg-[#52634F] text-white">
            Admin
          </span>
        </div>

        <nav className="p-2.5 space-y-1">
          <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-widest text-[#9E9D95]">
            Curriculum & System
          </div>
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold border-2 transition-all ${
                    isActive
                      ? 'bg-[#52634F] text-white border-white shadow-[2px_2px_0px_#FFF]'
                      : 'border-transparent text-[#D8D6CE] hover:border-[#666] hover:bg-[#282824]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t-2 border-black bg-black sticky bottom-0 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5 border border-[#444] bg-[#111]">
          <div className="h-6 w-6 border border-white bg-[#52634F] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
            {user?.avatar_url || user?.avatarUrl ? (
              <img
                src={user.avatar_url || user.avatarUrl}
                alt={user.name || user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.name || user?.full_name || 'A')[0].toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-bold text-white leading-tight">
              {user?.full_name || user?.name || 'Administrator'}
            </span>
            <span className="truncate text-[10px] text-[#A0A09A]">
              Super Admin
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 border-2 border-black bg-[#FAF9F6] text-[#121310] hover:bg-[#ECEAE4] text-xs font-bold shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Student View</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 border-2 border-black bg-[#BA2D27] text-white hover:bg-[#9B231E] text-xs font-bold shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F2ED] text-[#121310]">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden lg:flex w-60 border-r-2 border-black flex-col shrink-0 sticky top-0 h-screen select-none overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw] border-r-2 border-black h-full overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 bg-[#FAF9F6] border-b-2 border-black px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-[#121310] min-w-0 font-bold">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1 border-2 border-black bg-[#ECEAE4] hover:bg-[#FAF9F6] mr-1 shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              aria-label="Open admin navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Shield className="w-4 h-4 text-[#52634F] shrink-0" />
            <span className="font-extrabold text-[#121310] truncate">Admin Console</span>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline truncate text-[#4A4B45]">Curriculum & System Management</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000] ${
                isSupabaseConfigured
                  ? 'bg-[#2C6E49] text-white'
                  : 'bg-[#E6B022] text-black'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSupabaseConfigured
                  ? 'Supabase Connected'
                  : 'Supabase Pending'}
              </span>
              <span className="sm:hidden">
                {isSupabaseConfigured ? 'Connected' : 'Pending'}
              </span>
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-5 lg:p-7 flex-1 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
