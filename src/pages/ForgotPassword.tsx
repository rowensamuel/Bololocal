import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from '../components/common/Icons';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your account email address.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPasswordForEmail(email.trim().toLowerCase());
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-neutral-600">
          Enter your registered email address and we'll trigger your password reset.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#FFA6F6] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-xs text-black font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isSent ? (
        <div className="space-y-4">
          <div className="p-4 bg-[#B8FF9F] border-2 border-black rounded-[4px] shadow-[4px_4px_0px_#000] text-xs font-semibold text-black space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-black">
              <CheckCircle className="w-5 h-5 text-black shrink-0" />
              <span>Check your inbox</span>
            </div>
            <p>
              We've dispatched password reset instructions to <strong>{email}</strong>. Follow the instructions to set your new password.
            </p>
          </div>

          <Link to="/login" className="block">
            <Button variant="outline" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            leftIcon={<Mail className="w-4 h-4 text-black" />}
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
            Send Reset Link
          </Button>

          <div className="pt-2 text-center text-xs font-semibold text-neutral-700">
            Remembered your password?{' '}
            <Link to="/login" className="font-black text-black underline hover:bg-[#FFE57F] px-1 py-0.5 rounded transition-none">
              Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
