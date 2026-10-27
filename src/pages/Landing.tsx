import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Volume2,
  CheckCircle,
  Trophy,
  Compass,
  Bot,
  Flame,
  Shield,
  ChevronRight,
  Zap,
} from '../components/common/Icons';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AudioButton } from '../components/common/AudioButton';
import { mockSituations } from '../data/mockData';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDF8F5] text-black font-sans flex flex-col selection:bg-[#A6FAFF] selection:text-black">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" showTagline />

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-black">
            <a href="#why" className="px-2 py-1 hover:bg-[#FFE57F] border border-transparent hover:border-black rounded transition-none">
              Why Bololocal
            </a>
            <a href="#how-it-works" className="px-2 py-1 hover:bg-[#A6FAFF] border border-transparent hover:border-black rounded transition-none">
              How It Works
            </a>
            <a href="#situations" className="px-2 py-1 hover:bg-[#B8FF9F] border border-transparent hover:border-black rounded transition-none">
              Situations
            </a>
            <a href="#ai-tutor" className="px-2 py-1 hover:bg-[#FFA6F6] border border-transparent hover:border-black rounded transition-none">
              AI Tutor
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Learning
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b-2 border-black bg-[#FDF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFE57F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-black text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-black" />
                <span>Conversational Regional Language Learning</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.08]">
                Don't Just Translate. <br />
                <span className="bg-[#A6FAFF] px-2 border-2 border-black inline-block mt-2 shadow-[4px_4px_0px_#000]">
                  Learn to Speak.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-black font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Learn Marathi, Hindi, and regional Indian languages through real street dialogues, practical situations, interactive voice exercises, and AI roleplay. Built for students, travelers, and professionals.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/onboarding" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Start Learning Free
                  </Button>
                </Link>
                <Link to="/learn" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full">
                    Explore 10 Lessons
                  </Button>
                </Link>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs font-bold text-black">
                <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                  <CheckCircle className="w-4 h-4 text-black" /> 10 Indian Regional Languages
                </span>
                <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                  <CheckCircle className="w-4 h-4 text-black" /> Real Street Situations
                </span>
                <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                  <CheckCircle className="w-4 h-4 text-black" /> Interactive Native Audio
                </span>
              </div>
            </div>

            {/* Right Interactive Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white p-6 border-3 border-black rounded-[6px] shadow-[8px_8px_0px_#000] space-y-4">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#B8FF9F] border-2 border-black" />
                    <span className="text-xs font-black uppercase tracking-wider text-black">Street Dialogue Simulator</span>
                  </div>
                  <Badge variant="orange" size="sm">
                    Pune Auto Ride
                  </Badge>
                </div>

                {/* Simulated Conversation Snippet */}
                <div className="space-y-3 text-xs font-medium">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-[4px] bg-[#A6FAFF] border-2 border-black flex items-center justify-center font-black text-black shrink-0 text-xs shadow-[2px_2px_0px_#000]">
                      YOU
                    </div>
                    <div className="bg-white border-2 border-black text-black p-3 rounded-[4px] shadow-[3px_3px_0px_#000] space-y-1 max-w-[85%]">
                      <p className="font-bold text-sm">काका, स्टेशनला मिटरने चालणार का?</p>
                      <p className="text-[11px] font-semibold text-neutral-600">Kaka, station-la meter ne chaalnar ka?</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start justify-end">
                    <div className="bg-[#FFE57F] border-2 border-black text-black p-3 rounded-[4px] shadow-[3px_3px_0px_#000] space-y-1 text-right max-w-[85%]">
                      <p className="font-bold text-sm">हो, बसा! सुटे पैसे आहेत का?</p>
                      <p className="text-[11px] font-semibold text-neutral-700">"Yes, hop in! Do you have exact change?"</p>
                    </div>
                    <div className="w-8 h-8 rounded-[4px] bg-[#FFC29F] border-2 border-black flex items-center justify-center font-black text-black shrink-0 text-xs shadow-[2px_2px_0px_#000]">
                      KAKA
                    </div>
                  </div>
                </div>

                {/* Pronunciation preview */}
                <div className="p-3 bg-[#B8FF9F] border-2 border-black rounded-[4px] shadow-[4px_4px_0px_#000] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black block">
                      Native Audio Player
                    </span>
                    <p className="font-bold text-black text-base">
                      पाणी (Water)
                    </p>
                  </div>
                  <AudioButton textToSpeak="पाणी" variant="pill" size="sm" label="Pronounce" />
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold">
                  <span className="text-black">Spoken local phrasing</span>
                  <Link to="/practice" className="text-black underline hover:bg-[#A6FAFF] px-1 py-0.5 rounded transition-none">
                    Try Practice Arena →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY BOLOLOCAL */}
      <section id="why" className="py-20 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-black uppercase tracking-widest bg-[#FFE57F] px-2 py-1 border-2 border-black inline-block shadow-[2px_2px_0px_#000]">
              The Core Problem
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              Why Traditional Language Apps Fail Regional Learners
            </h2>
            <p className="text-sm font-medium text-neutral-700 leading-relaxed">
              Global apps teach formal textbook grammar like "The apple is red". Bololocal teaches you how to bargain with auto drivers, ask for chai, and build confidence in local workplaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[6px_6px_0px_#000] space-y-4">
              <div className="w-12 h-12 bg-[#A6FAFF] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] flex items-center justify-center text-black font-black text-xl">
                1
              </div>
              <h3 className="text-lg font-black text-black">Context-First, Not Textbook-Heavy</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Start speaking high-utility survival phrases on Day 1. Grammar is integrated naturally into real conversations without tedious conjugation drills.
              </p>
            </div>

            <div className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[6px_6px_0px_#000] space-y-4">
              <div className="w-12 h-12 bg-[#FFC29F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] flex items-center justify-center text-black font-black text-xl">
                2
              </div>
              <h3 className="text-lg font-black text-black">Spoken Phrasing & Respect Levels</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Learn natural spoken honorifics (Kaka, Tai, Dada, Bhau) and street vocabulary used across Maharashtra, Gujarat, Tamil Nadu, and Bengal.
              </p>
            </div>

            <div className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[6px_6px_0px_#000] space-y-4">
              <div className="w-12 h-12 bg-[#B8FF9F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] flex items-center justify-center text-black font-black text-xl">
                3
              </div>
              <h3 className="text-lg font-black text-black">AI Conversation Partner</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Practice roleplay dialogues without fear or hesitation. Make mistakes freely with an AI tutor that explains vocabulary and usage tips immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-[#FDF8F5] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black text-black uppercase tracking-widest bg-[#FFA6F6] px-2 py-1 border-2 border-black inline-block shadow-[2px_2px_0px_#000]">
              Structured Framework
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              How Bololocal Works
            </h2>
            <p className="text-sm font-medium text-neutral-700">
              A communicative method engineered to get you speaking within your first 15 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                bg: 'bg-[#A6FAFF]',
                title: 'Pick a Situation',
                desc: 'Select your immediate context: College, Market, Auto Rickshaw, or Restaurant.',
              },
              {
                step: '02',
                bg: 'bg-[#FFE57F]',
                title: 'Learn Key Phrases',
                desc: 'Listen to native audio, review phonetic transliterations, and absorb local nuances.',
              },
              {
                step: '03',
                bg: 'bg-[#FFC29F]',
                title: 'Speed Challenges',
                desc: 'Lock in muscle memory through multiple-choice, speed translation, and timed quizzes.',
              },
              {
                step: '04',
                bg: 'bg-[#B8FF9F]',
                title: 'AI Roleplay Arena',
                desc: 'Engage in natural street roleplays with the AI tutor and receive immediate feedback.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-3">
                <span className={`inline-block px-3 py-1 ${item.bg} border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-lg font-black font-mono`}>
                  {item.step}
                </span>
                <h3 className="text-base font-black text-black">{item.title}</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. REAL-LIFE SITUATIONS */}
      <section id="situations" className="py-20 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-black text-black uppercase tracking-widest bg-[#B8FF9F] px-2 py-1 border-2 border-black inline-block shadow-[2px_2px_0px_#000]">
                Contextual Learning
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                Everyday Situations Across India
              </h2>
              <p className="text-sm font-medium text-neutral-700 max-w-xl">
                Phrases categorized by everyday real-world encounters so you never feel tongue-tied.
              </p>
            </div>
            <Link to="/phrases">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Categories
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockSituations.slice(0, 4).map((sit) => (
              <div
                key={sit.id}
                className="p-6 border-2 border-black rounded-[6px] bg-white shadow-[4px_4px_0px_#000] hover:bg-[#FDF8F5] transition-none space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase px-2 py-0.5 bg-[#A6FAFF] border border-black rounded-[4px]">
                      {sit.category}
                    </span>
                    <span className="text-xs font-bold text-neutral-600">
                      {sit.phraseCount} phrases
                    </span>
                  </div>
                  <h3 className="text-base font-black text-black">{sit.title}</h3>
                  <p className="text-xs font-medium text-neutral-700 leading-relaxed">{sit.description}</p>
                </div>
                <Link
                  to={`/phrases?category=${encodeURIComponent(sit.category)}`}
                  className="inline-flex items-center gap-1 text-xs font-black text-black underline pt-2 hover:bg-[#FFE57F] w-fit"
                >
                  <span>Explore phrases</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LEARNING FEATURES HIGHLIGHT */}
      <section className="py-20 bg-[#FDF8F5] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black text-black uppercase tracking-widest bg-[#FFC29F] px-2 py-1 border-2 border-black inline-block shadow-[2px_2px_0px_#000]">
              Built For Retention
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              Engineered for Real Spoken Fluency
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                accent: 'bg-[#A6FAFF]',
                title: 'Structured 10-Lesson Path',
                desc: 'From essential greetings and local food items to navigating transport and emergency clinics.',
              },
              {
                icon: Volume2,
                accent: 'bg-[#FFA6F6]',
                title: 'Pronunciation Player',
                desc: 'Listen to every single word and phrase with crystal-clear audio tuned for Indian speech cadence.',
              },
              {
                icon: Compass,
                accent: 'bg-[#FFE57F]',
                title: 'Searchable Vocabulary Vault',
                desc: 'Filter words by frequency, category, or difficulty level with native script and transliteration.',
              },
              {
                icon: Trophy,
                accent: 'bg-[#B8FF9F]',
                title: 'Gamified Progress & Badges',
                desc: 'Maintain daily streaks, collect XP rewards, and earn milestone badges as your confidence grows.',
              },
              {
                icon: Bot,
                accent: 'bg-[#FFC29F]',
                title: 'AI Language Tutor',
                desc: 'Ask questions in English or Hindi and receive immediate contextual phrases with usage notes.',
              },
              {
                icon: Shield,
                accent: 'bg-[#A6FAFF]',
                title: 'Culturally Sensitive Honorifics',
                desc: 'Learn subtle distinctions between formal respect and friendly casual banter in regional contexts.',
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-3">
                  <div className={`w-11 h-11 ${feat.accent} border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-black flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-base font-black text-black">{feat.title}</h3>
                  <p className="text-xs font-medium text-neutral-700 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. AI TUTOR SPOTLIGHT */}
      <section id="ai-tutor" className="py-20 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#A6FAFF] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] text-black text-xs font-black uppercase tracking-wider">
                <Bot className="w-4 h-4 text-black" />
                <span>Next-Gen Language Companion</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-snug">
                Meet Your 24/7 Street Speaking Assistant
              </h2>
              <p className="text-sm font-medium text-neutral-700 leading-relaxed">
                Stuck at a Pune restaurant or Mumbai railway station? Simply tell Bololocal what you want to communicate in English or Hindi, and receive the authentic spoken phrase with audio, pronunciation, and cultural context.
              </p>
              <div className="pt-2">
                <Link to="/practice">
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Try AI Language Tutor
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[#FDF8F5] text-black p-6 border-3 border-black rounded-[6px] shadow-[8px_8px_0px_#000] space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
                  <div className="w-9 h-9 rounded-[4px] bg-[#FFE57F] border-2 border-black text-black flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
                    <Bot className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-black uppercase tracking-wider">Bololocal AI Tutor</h3>
                    <p className="text-[11px] font-bold text-neutral-600">Contextual Spoken Assistant</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-medium">
                  <div className="p-3 bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] text-black font-semibold">
                    <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-0.5">Prompt:</span>
                    "Mujhe Marathi mein restaurant mein order karna hai."
                  </div>
                  <div className="p-4 bg-[#B8FF9F] border-2 border-black rounded-[4px] shadow-[4px_4px_0px_#000] space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-black">Spoken Phrasing:</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-black text-black">
                        मला एक वडा पाव पाहिजे.
                      </p>
                      <AudioButton textToSpeak="मला एक वडा पाव पाहिजे." variant="pill" size="sm" />
                    </div>
                    <p className="text-xs font-bold text-black">
                      Mala ek vada pav pahije.
                    </p>
                    <p className="text-xs font-medium text-neutral-800">
                      Meaning: "I would like one vada pav."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PROGRESS & GAMIFICATION PREVIEW */}
      <section className="py-20 bg-[#FDF8F5] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black text-black uppercase tracking-widest bg-[#FFE57F] px-2 py-1 border-2 border-black inline-block shadow-[2px_2px_0px_#000]">
              Daily Habit
            </span>
            <h2 className="text-3xl font-black text-black tracking-tight">
              Maintain Daily Momentum
            </h2>
            <p className="text-sm font-medium text-neutral-700">
              Micro-learning cycles engineered into 10–15 minute daily exercises.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-1">
              <div className="w-10 h-10 mx-auto bg-[#FFC29F] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] flex items-center justify-center">
                <Flame className="w-5 h-5 text-black" />
              </div>
              <div className="text-2xl font-black text-black">Daily Streak</div>
              <p className="text-xs font-bold text-neutral-600">Continuous Rhythm</p>
            </div>
            <div className="p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-1">
              <div className="w-10 h-10 mx-auto bg-[#A6FAFF] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <div className="text-2xl font-black text-black">XP Rewards</div>
              <p className="text-xs font-bold text-neutral-600">Points & Milestones</p>
            </div>
            <div className="p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-1">
              <div className="w-10 h-10 mx-auto bg-[#FFE57F] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-black" />
              </div>
              <div className="text-2xl font-black text-black">Badges</div>
              <p className="text-xs font-bold text-neutral-600">Skill Achievements</p>
            </div>
            <div className="p-5 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-1">
              <div className="w-10 h-10 mx-auto bg-[#B8FF9F] border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-black" />
              </div>
              <div className="text-2xl font-black text-black">Lessons</div>
              <p className="text-xs font-bold text-neutral-600">Curated Curriculum</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="py-20 bg-[#FFE57F] border-b-2 border-black text-black text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Speak Confidently?
          </h2>
          <p className="text-sm sm:text-base font-medium text-black max-w-xl mx-auto leading-relaxed">
            Begin learning practical Indian regional languages naturally with zero fear and authentic pronunciation.
          </p>
          <div className="pt-2">
            <Link to="/onboarding">
              <Button variant="primary" size="lg" className="border-3" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Your Learning Path
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-white text-black py-12 border-t-2 border-black text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <Logo size="sm" to="/" />
            <p className="text-xs font-semibold text-neutral-700 max-w-sm leading-relaxed">
              BOLOLOCAL is an AI-powered Indian language learning platform dedicated to making conversational regional languages accessible and practical for all.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-black">Product</h4>
            <ul className="space-y-1.5 font-bold">
              <li><Link to="/learn" className="hover:underline">Explore Lessons</Link></li>
              <li><Link to="/practice" className="hover:underline">Practice Arena</Link></li>
              <li><Link to="/vocabulary" className="hover:underline">Vocabulary Vault</Link></li>
              <li><Link to="/phrases" className="hover:underline">Useful Phrases</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-black">Platform</h4>
            <ul className="space-y-1.5 font-bold">
              <li><Link to="/login" className="hover:underline">Learner Login</Link></li>
              <li><Link to="/register" className="hover:underline">Create Account</Link></li>
              <li><Link to="/admin" className="hover:underline">Admin Portal</Link></li>
              <li><span className="bg-[#B8FF9F] px-1.5 py-0.5 border border-black rounded text-[11px]">Made in India</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t-2 border-black text-center text-xs font-bold text-neutral-600">
          © {new Date().getFullYear()} BOLOLOCAL. "Don't Just Translate. Learn to Speak." All rights reserved.
        </div>
      </footer>
    </div>
  );
};
