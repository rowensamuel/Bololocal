import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, CheckCircle, AlertTriangle } from '../components/common/Icons';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
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
      const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const cleanEmail = email.trim().toLowerCase();

      await register(name, cleanEmail, password, cleanUsername);

      setSuccessMessage('Account created successfully! Redirecting to setup your profile...');
      setTimeout(() => {
        navigate('/onboarding');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Username or email may already be registered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Create Account
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-neutral-600">
          "Don't Just Translate. Learn to Speak." Start your regional language journey.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#FFA6F6] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-xs text-black font-bold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-[#B8FF9F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-xs text-black font-bold flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rohan Sharma"
          leftIcon={<User className="w-4 h-4 text-black" />}
          required
        />

        <Input
          label="Unique Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          placeholder="e.g. rohan_sharma"
          leftIcon={<User className="w-4 h-4 text-black" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          leftIcon={<Mail className="w-4 h-4 text-black" />}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          leftIcon={<Lock className="w-4 h-4 text-black" />}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-type password"
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
          Create Account
        </Button>
      </form>

      <div className="pt-2 text-center text-xs font-semibold text-neutral-700">
        Already have an account?{' '}
        <Link to="/login" className="font-black text-black underline hover:bg-[#FFE57F] px-1 py-0.5 rounded transition-none">
          Sign In
        </Link>
      </div>
    </div>
  );
};
