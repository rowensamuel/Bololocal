import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Shield, AlertTriangle } from '../components/common/Icons';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!usernameOrEmail || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login(usernameOrEmail, password);
      if (loggedUser.role === 'admin' || loggedUser.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username, email, or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setUsernameOrEmail(u);
    setPassword(p);
    setError('');
    setIsLoading(true);
    try {
      const loggedUser = await login(u, p);
      if (loggedUser.role === 'admin' || loggedUser.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username, email, or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Sign In to BOLOLOCAL
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-neutral-600">
          Don't Just Translate. Learn to Speak.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#FFA6F6] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-xs text-black font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username or Email"
          type="text"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          placeholder="e.g. rohan_sharma or user@example.com"
          leftIcon={<User className="w-4 h-4 text-black" />}
          required
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-black">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-black underline hover:bg-[#FFE57F] px-1 rounded transition-none"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4 text-black" />}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Demo Credentials & Instant Sign In */}
      <div className="p-4 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-3 text-xs">
        <span className="font-black text-black block text-[11px] uppercase tracking-wider">
          One-Click Instant Sign In
        </span>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickLogin('admin', 'Admin@123')}
            className="px-3 py-1.5 bg-[#FFE57F] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-black font-black uppercase text-xs active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-black" /> Sign In as Admin
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleQuickLogin('test_marathi', 'Pass@123')}
            className="px-3 py-1.5 bg-[#A6FAFF] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-black font-black uppercase text-xs active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-black" /> Sign In as Learner
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-neutral-600">
          <span>Autofill credentials:</span>
          <button
            type="button"
            onClick={() => {
              setUsernameOrEmail('admin');
              setPassword('Admin@123');
            }}
            className="text-black font-bold underline hover:bg-[#FFE57F] cursor-pointer"
          >
            admin / Admin@123
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setUsernameOrEmail('test_marathi');
              setPassword('Pass@123');
            }}
            className="text-black font-bold underline hover:bg-[#A6FAFF] cursor-pointer"
          >
            test_marathi / Pass@123
          </button>
        </div>
      </div>

      <div className="pt-1 text-center text-xs font-semibold text-neutral-700">
        Don't have an account?{' '}
        <Link to="/register" className="font-black text-black underline hover:bg-[#FFE57F] px-1 py-0.5 rounded transition-none">
          Create Account
        </Link>
      </div>

      <div className="p-3 bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-[11px] font-bold text-black flex items-center gap-2">
        <Shield className="w-4 h-4 text-black shrink-0" />
        <span>Authenticated through Supabase PostgreSQL & Row Level Security.</span>
      </div>
    </div>
  );
};
