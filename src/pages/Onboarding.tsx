import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  AlertTriangle,
  User,
} from '../components/common/Icons';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { LearningGoal, NativeLanguage, TargetLanguage, DailyGoalMinutes } from '../types/user';
import { mockLanguages } from '../data/mockLanguages';
import { userService } from '../services/userService';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, register } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Onboarding states
  const [username, setUsername] = useState(user?.username || '');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState('');

  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage>('Hindi');
  const [learningLanguage, setLearningLanguage] = useState<TargetLanguage>('Marathi');
  const [goal, setGoal] = useState<LearningGoal>('Daily Conversation');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<DailyGoalMinutes>(15);
  const [confidenceLevel, setConfidenceLevel] = useState('Complete beginner');
  const [isFinishing, setIsFinishing] = useState(false);

  // Sync initial username if user becomes available
  useEffect(() => {
    if (user?.username && !username) {
      setUsername(user.username);
    }
  }, [user]);

  // Username validation & uniqueness check with debounce
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    if (clean.length < 3 || clean.length > 25 || !/^[a-z0-9_]+$/.test(clean)) {
      setUsernameStatus('invalid');
      setUsernameError('3-25 characters: lowercase letters, numbers, and underscores only.');
      return;
    }

    if (user && user.username?.toLowerCase() === clean) {
      setUsernameStatus('available');
      setUsernameError('');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const existing = await userService.getUserByUsername(clean);
        if (existing && existing.id !== user?.id && existing.auth_user_id !== user?.auth_user_id) {
          setUsernameStatus('taken');
          setUsernameError(`"${clean}" is already taken. Please choose another.`);
        } else {
          setUsernameStatus('available');
          setUsernameError('');
        }
      } catch {
        setUsernameStatus('available');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, user]);

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      const selectedLang = mockLanguages.find((l) => l.name === learningLanguage) || mockLanguages[0];
      const nativeLangObj = mockLanguages.find((l) => l.name === nativeLanguage) || mockLanguages[1];
      const cleanUsername = username.trim().toLowerCase() || `user_${Date.now().toString().slice(-4)}`;

      if (!user) {
        await register(
          cleanUsername,
          `${cleanUsername}@bololocal.com`,
          'Learner@123',
          cleanUsername
        );
      }

      await updateUserProfile({
        username: cleanUsername,
        native_language_id: nativeLangObj.code,
        learning_language_id: selectedLang.code,
        nativeLanguage,
        learningLanguage,
        goal,
        daily_goal: dailyGoalMinutes,
        dailyGoalMinutes,
        level: confidenceLevel === 'Complete beginner' ? 'Beginner' : 'Intermediate',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setIsFinishing(false);
    }
  };

  const progressPercent = Math.round((step / totalSteps) * 100);

  const canProceedFromStep1 =
    username.trim().length >= 3 &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'invalid' &&
    usernameStatus !== 'checking';

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-black font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between pb-6 border-b-2 border-black">
        <Logo size="sm" to="/" />
        <span className="text-xs font-black uppercase tracking-wider bg-[#FFE57F] px-2.5 py-1 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
          Step {step} of {totalSteps}
        </span>
      </div>

      {/* Main Wizard Card */}
      <div className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="mb-6">
          <ProgressBar value={progressPercent} variant="cyan" showLabel />
        </div>

        <div className="bg-white border-3 border-black rounded-[6px] shadow-[6px_6px_0px_#000] p-6 sm:p-8">
          {/* STEP 1: UNIQUE USERNAME */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-black bg-[#A6FAFF] px-2 py-0.5 border border-black inline-block">
                  Step 1 • Profile Identity
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-black">
                  Choose your unique username
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-neutral-600">
                  This will be your learner handle on leaderboards, quizzes, and certificates.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">
                  Unique Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black font-bold">
                    @
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="learner_name"
                    maxLength={25}
                    className={`w-full pl-9 pr-10 py-3 rounded-[4px] border-2 border-black font-bold text-sm shadow-[3px_3px_0px_#000] focus:outline-none transition-none ${
                      usernameStatus === 'available'
                        ? 'bg-[#B8FF9F]'
                        : usernameStatus === 'taken' || usernameStatus === 'invalid'
                        ? 'bg-[#FFA6F6]'
                        : 'bg-white focus:bg-[#A6FAFF]'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                    {usernameStatus === 'checking' && (
                      <span className="text-xs font-bold text-neutral-600">Checking...</span>
                    )}
                    {usernameStatus === 'available' && (
                      <Check className="w-4 h-4 text-black" />
                    )}
                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                      <AlertTriangle className="w-4 h-4 text-black" />
                    )}
                  </div>
                </div>

                {usernameStatus === 'available' && (
                  <p className="text-xs text-black font-bold flex items-center gap-1 bg-[#B8FF9F] px-2 py-1 border border-black rounded-[4px] shadow-[2px_2px_0px_#000] w-fit">
                    <Check className="w-3.5 h-3.5 text-black" />
                    Username is available!
                  </p>
                )}
                {usernameError && (
                  <p className="text-xs text-black font-bold bg-[#FFA6F6] px-2 py-1 border border-black rounded-[4px] shadow-[2px_2px_0px_#000] w-fit">
                    {usernameError}
                  </p>
                )}
                <p className="text-[11px] font-semibold text-neutral-600">
                  Allowed: Lowercase letters, numbers, and underscores (3-25 characters).
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: NATIVE / PRIMARY LANGUAGE */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-black bg-[#FFE57F] px-2 py-0.5 border border-black inline-block">
                  Step 2 • Native Reference
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-black">
                  What is your primary native language?
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-neutral-600">
                  We'll use this language to provide translations, phonetic guides, and explanations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                {mockLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setNativeLanguage(lang.name as NativeLanguage)}
                    className={`p-3 border-2 border-black rounded-[4px] text-left cursor-pointer flex items-center justify-between transition-none ${
                      nativeLanguage === lang.name
                        ? 'bg-[#A6FAFF] shadow-[3px_3px_0px_#000] translate-x-[1px] translate-y-[1px]'
                        : 'bg-white shadow-[2px_2px_0px_#000] hover:bg-[#FDF8F5]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-black text-xs">
                        {lang.name}
                      </div>
                      <span className="text-[10px] font-semibold text-neutral-600">{lang.native_name}</span>
                    </div>
                    {nativeLanguage === lang.name && (
                      <div className="w-5 h-5 rounded-[4px] bg-black text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: TARGET LEARNING LANGUAGE */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-black bg-[#FFC29F] px-2 py-0.5 border border-black inline-block">
                  Step 3 • Target Language
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-black">
                  Which regional language do you want to master?
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-neutral-600">
                  Choose from all 10 supported Indian languages. Courses and vocabulary will adapt.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                {mockLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLearningLanguage(lang.name as TargetLanguage)}
                    className={`p-3 border-2 border-black rounded-[4px] text-left cursor-pointer flex items-center justify-between transition-none ${
                      learningLanguage === lang.name
                        ? 'bg-[#FFE57F] shadow-[3px_3px_0px_#000] translate-x-[1px] translate-y-[1px]'
                        : 'bg-white shadow-[2px_2px_0px_#000] hover:bg-[#FDF8F5]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-black text-xs">
                        {lang.name}
                      </div>
                      <span className="text-[10px] font-semibold text-neutral-700">{lang.greeting}</span>
                    </div>
                    {learningLanguage === lang.name && (
                      <div className="w-5 h-5 rounded-[4px] bg-black text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: GOAL & COMMITMENT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-black bg-[#B8FF9F] px-2 py-0.5 border border-black inline-block">
                  Step 4 • Learning Goal & Pace
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-black">
                  What is your primary goal and daily commitment?
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'Daily Conversation' as LearningGoal, title: 'Daily Living', desc: 'Market, transit, neighbours' },
                    { id: 'College' as LearningGoal, title: 'Campus & College', desc: 'Hostel, canteen, peer chats' },
                    { id: 'Work' as LearningGoal, title: 'Professional & Work', desc: 'Colleagues, clients, trade' },
                    { id: 'Travel' as LearningGoal, title: 'Travel & Tourism', desc: 'Sightseeing, trains, hotels' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id)}
                      className={`p-3 border-2 border-black rounded-[4px] text-left cursor-pointer transition-none ${
                        goal === item.id
                          ? 'bg-[#A6FAFF] shadow-[3px_3px_0px_#000] translate-x-[1px] translate-y-[1px]'
                          : 'bg-white shadow-[2px_2px_0px_#000] hover:bg-[#FDF8F5]'
                      }`}
                    >
                      <div className="font-bold text-black text-xs">{item.title}</div>
                      <p className="text-[11px] font-semibold text-neutral-600 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2">
                    Daily Practice Goal
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { mins: 5 as DailyGoalMinutes, label: 'Casual', desc: '5m / day' },
                      { mins: 15 as DailyGoalMinutes, label: 'Regular', desc: '15m / day' },
                      { mins: 20 as DailyGoalMinutes, label: 'Intensive', desc: '20m / day' },
                    ].map((item) => (
                      <button
                        key={item.mins}
                        type="button"
                        onClick={() => setDailyGoalMinutes(item.mins)}
                        className={`p-3 border-2 border-black rounded-[4px] text-center cursor-pointer transition-none ${
                          dailyGoalMinutes === item.mins
                            ? 'bg-[#FFC29F] shadow-[3px_3px_0px_#000] font-black'
                            : 'bg-white shadow-[2px_2px_0px_#000] hover:bg-[#FDF8F5] text-black font-semibold'
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1 text-black" />
                        <div className="text-sm font-black">{item.mins}m</div>
                        <div className="text-[10px] font-semibold text-neutral-600">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUMMARY & CONFIRMATION */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-black bg-[#FFA6F6] px-2 py-0.5 border border-black inline-block">
                  Step 5 • Ready to Learn
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-black">
                  Review your personalized profile
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-neutral-600">
                  Everything is set up to start speaking right away!
                </p>
              </div>

              <div className="p-5 bg-[#FFE57F] border-2 border-black rounded-[4px] shadow-[4px_4px_0px_#000] space-y-3">
                <div className="flex items-center gap-2 font-black text-black text-sm">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Your Learning Journey</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                    <span className="text-neutral-500 block text-[10px] uppercase font-black">Username</span>
                    <span className="font-black text-black font-mono">@{username || user?.username}</span>
                  </div>
                  <div className="bg-white p-2.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                    <span className="text-neutral-500 block text-[10px] uppercase font-black">Target Language</span>
                    <span className="font-black text-black">{learningLanguage}</span>
                  </div>
                  <div className="bg-white p-2.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                    <span className="text-neutral-500 block text-[10px] uppercase font-black">Native Language</span>
                    <span className="font-black text-black">{nativeLanguage}</span>
                  </div>
                  <div className="bg-white p-2.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                    <span className="text-neutral-500 block text-[10px] uppercase font-black">Daily Commitment</span>
                    <span className="font-black text-black">{dailyGoalMinutes} mins / day</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-black">
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                variant="primary"
                size="md"
                disabled={step === 1 && !canProceedFromStep1}
                onClick={() => setStep(step + 1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleFinish}
                isLoading={isFinishing}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Learning
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-xl w-full mx-auto text-center text-xs font-bold text-neutral-600 pt-6">
        BOLOLOCAL • Real-World Spoken Language Fluency
      </div>
    </div>
  );
};
