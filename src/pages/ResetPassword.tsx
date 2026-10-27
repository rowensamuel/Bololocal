import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle, AlertTriangle } from '../components/common/Icons';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.updatePassword(password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Reset link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Set New Password
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-neutral-600">
          Enter your new password below to secure your account.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#FFA6F6] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-xs text-black font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="p-4 bg-[#B8FF9F] border-2 border-black rounded-[4px] shadow-[4px_4px_0px_#000] text-xs font-semibold text-black space-y-2 text-center">
          <CheckCircle className="w-6 h-6 text-black mx-auto" />
          <div className="font-black text-sm text-black">Password Updated!</div>
          <p>Your password has been successfully reset. Redirecting to sign in...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            leftIcon={<Lock className="w-4 h-4 text-black" />}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type new password"
            leftIcon={<Lock className="w-4 h-4 text-black" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Update Password
          </Button>

          <div className="pt-2 text-center text-xs font-semibold text-neutral-700">
            <Link to="/login" className="font-black text-black underline hover:bg-[#FFE57F] px-1 py-0.5 rounded transition-none">
              Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
