import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle,
  Sparkles,
  Trophy,
  HelpCircle,
  MessageSquare,
  Volume2,
  ArrowRight,
  ChevronRight,
} from '../components/common/Icons';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AudioButton } from '../components/common/AudioButton';
import { VocabularyCard } from '../components/learning/VocabularyCard';
import { PhraseCard } from '../components/learning/PhraseCard';
import { useLessons } from '../hooks/useLessons';
import { useLearning } from '../context/LearningContext';
import { mockLessons } from '../data/mockData';

export const Lesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { lessons } = useLessons();
  const { completedLessonIds, completeLesson, addXp } = useLearning();

  const [activeTab, setActiveTab] = useState<'objectives' | 'vocab' | 'phrases' | 'dialogue' | 'takeaways'>('objectives');
  const [hasCompletedInSession, setHasCompletedInSession] = useState(false);

  // Find lesson matching active language lessons first
  const currentLesson =
    lessons.find((l) => l.id === lessonId) ||
    lessons[0] ||
    mockLessons.find((l) => l.id === lessonId) ||
    mockLessons[0];

  const isAlreadyCompleted = completedLessonIds.includes(currentLesson.id);
  const xpValue = currentLesson.xpReward || 50;

  const objectives = currentLesson.learningObjectives || [
    'Introduce yourself and ask basic questions politely',
    'Understand everyday greetings and appropriate responses',
    'Pronounce nasal and retroflex consonants naturally',
  ];
  const usefulPhrases = currentLesson.usefulPhrases || [
    {
      id: 'ph-fallback-1',
      marathi: 'नमस्कार, कसे आहात?',
      roman: 'Namaskar, kase aahat?',
      english: 'Hello, how are you?',
      category: 'Greetings',
      context: 'Polite daytime greeting for everyone.',
      tags: ['Greeting'],
    },
    {
      id: 'ph-fallback-2',
      marathi: 'मी मजेत आहे.',
      roman: 'Mee majet aahe.',
      english: 'I am doing well.',
      category: 'Greetings',
      context: 'Standard positive answer.',
      tags: ['Greeting'],
    },
  ];
  const dialogue = currentLesson.dialogue || [
    {
      speaker: 'Friend',
      marathi: 'नमस्कार! कसे आहात तुम्ही?',
      roman: 'Namaskar! Kase aahat tumhi?',
      english: 'Hello! How are you?',
    },
    {
      speaker: 'You',
      marathi: 'नमस्कार, मी छान आहे. तुम्ही सांगा?',
      roman: 'Namaskar, mee chhan aahe. Tumhi saanga?',
      english: 'Hello, I am good. What about you?',
    },
  ];
  const takeaways = currentLesson.summaryTakeaways || [
    'Use polite daily greetings across the region',
    'Pay attention to respectful pronouns when addressing elders',
    'Practice speaking out loud to build natural cadence',
  ];

  const handleFinishLesson = async () => {
    if (isAlreadyCompleted || hasCompletedInSession) return;
    setHasCompletedInSession(true);
    await completeLesson(currentLesson.id);
  };

  const nextLessonIndex = lessons.findIndex((l) => l.id === currentLesson.id) + 1;
  const nextLesson = nextLessonIndex > 0 && nextLessonIndex < lessons.length ? lessons[nextLessonIndex] : undefined;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black hover:bg-[#FFE57F] px-2 py-1 border border-black rounded transition-none"
        >
          <ArrowLeft className="w-4 h-4 text-black" />
          <span>Back to All Lessons</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            Unit {currentLesson.number} of 10
          </Badge>
          <Badge
            variant={
              currentLesson.difficulty === 'Beginner' ? 'green' : 'cyan'
            }
            size="sm"
          >
            {currentLesson.difficulty}
          </Badge>
          {(isAlreadyCompleted || hasCompletedInSession) && (
            <span className="flex items-center gap-1 text-[11px] font-black uppercase text-black bg-[#B8FF9F] px-2 py-0.5 rounded-[4px] border border-black shadow-[1px_1px_0px_#000]">
              <CheckCircle className="w-3.5 h-3.5 text-black" /> Done
            </span>
          )}
        </div>
      </div>

      {/* Lesson Header Banner */}
      <div className="p-6 sm:p-8 rounded-[6px] bg-white border-3 border-black shadow-[6px_6px_0px_#000] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-black text-black">
              {currentLesson.marathiTitle}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              {currentLesson.title}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neutral-700 leading-relaxed max-w-2xl mt-1">
              {currentLesson.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[2px_2px_0px_#000] text-center">
              <Sparkles className="w-4 h-4 text-black mx-auto" />
              <span className="text-xs font-black text-black block mt-0.5">
                +{currentLesson.xpReward} XP
              </span>
            </div>
            <div className="p-3 rounded-[4px] bg-[#A6FAFF] border-2 border-black shadow-[2px_2px_0px_#000] text-center">
              <Clock className="w-4 h-4 text-black mx-auto" />
              <span className="text-xs font-black text-black block mt-0.5">
                {currentLesson.durationMinutes}m
              </span>
            </div>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 border-t-2 border-black overflow-x-auto">
          {[
            { id: 'objectives', label: 'Objectives', count: objectives.length },
            { id: 'vocab', label: 'Key Vocabulary', count: currentLesson.vocabulary.length },
            { id: 'phrases', label: 'Spoken Phrases', count: usefulPhrases.length },
            { id: 'dialogue', label: 'Dialogue Studio', count: dialogue.length },
            { id: 'takeaways', label: 'Summary & Quiz', count: takeaways.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-[4px] border-2 border-black text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#FFE57F] shadow-[3px_3px_0px_#000]'
                  : 'bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_#000]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black text-white font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content Panel based on Tab */}
      <div className="space-y-6">
        {/* TAB 1: OBJECTIVES */}
        {activeTab === 'objectives' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-4">
              <h3 className="text-lg font-black uppercase tracking-wider text-black">
                What you will be able to speak after this lesson:
              </h3>

              <div className="space-y-2.5">
                {objectives.map((obj, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-[4px] bg-[#FDF8F5] border-2 border-black shadow-[2px_2px_0px_#000]"
                  >
                    <div className="w-5 h-5 rounded-[2px] bg-[#B8FF9F] border border-black text-black flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span className="text-sm text-black font-bold">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Tip */}
            {currentLesson.culturalTip && (
              <div className="p-4 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[3px_3px_0px_#000] flex items-start gap-3">
                <div className="space-y-0.5 text-xs text-black leading-relaxed">
                  <span className="font-black uppercase tracking-wider block">
                    Regional Cultural Context:
                  </span>
                  <p className="font-semibold">{currentLesson.culturalTip}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setActiveTab('vocab')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start with Vocabulary
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: VOCABULARY */}
        {activeTab === 'vocab' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-black">
                  Core Vocabulary ({currentLesson.vocabulary.length})
                </h3>
                <p className="text-xs font-semibold text-neutral-600">
                  Click the listen icon to practice authentic pronunciation.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('phrases')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Phrases
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentLesson.vocabulary.map((vocab) => (
                <VocabularyCard key={vocab.id} item={vocab} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PHRASES */}
        {activeTab === 'phrases' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black uppercase tracking-wider text-black">
                  Spoken Phrases for Real Life ({usefulPhrases.length})
                </h3>
                <p className="text-xs font-semibold text-neutral-600">
                  Complete situational sentences with transliteration and cultural context.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('dialogue')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Try Dialogue
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {usefulPhrases.map((phrase) => (
                <PhraseCard key={phrase.id} phrase={phrase} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DIALOGUE */}
        {activeTab === 'dialogue' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-6">
              <div className="flex items-center justify-between border-b-2 border-black pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-black" />
                    <h3 className="text-lg font-black uppercase tracking-wider text-black">
                      Interactive Dialogue Simulation
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-neutral-600">
                    Listen to natural conversational back-and-forth exchanges.
                  </p>
                </div>
                <Badge variant="cyan" size="sm">
                  Full Audio Enabled
                </Badge>
              </div>

              {/* Turns */}
              <div className="space-y-4">
                {dialogue.map((turn, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-[4px] bg-[#FDF8F5] border-2 border-black shadow-[3px_3px_0px_#000] flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <span className="text-xs font-black uppercase tracking-wider block text-black">
                        {turn.speaker}
                      </span>
                      <p className="text-xl font-black text-black leading-snug">
                        {turn.marathi}
                      </p>
                      <p className="text-xs font-bold text-neutral-800">
                        {turn.roman}
                      </p>
                      <p className="text-xs text-neutral-700 italic font-semibold">
                        "{turn.english}"
                      </p>
                    </div>

                    <div className="shrink-0 self-start sm:self-center">
                      <AudioButton
                        textToSpeak={turn.marathi}
                        variant="button"
                        size="sm"
                        label="Play Audio"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setActiveTab('takeaways')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Review Summary & Quiz
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUMMARY & COMPLETE */}
        {activeTab === 'takeaways' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-wider text-black">
                  Key Takeaways
                </h3>
                <p className="text-xs font-semibold text-neutral-600">
                  Quick rules of thumb to remember when speaking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {takeaways.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[2px_2px_0px_#000] space-y-2 text-xs"
                  >
                    <div className="w-6 h-6 rounded-[2px] bg-black text-white flex items-center justify-center font-black text-xs font-mono">
                      {idx + 1}
                    </div>
                    <p className="text-black font-bold leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link to={currentLesson.quizId ? `/quiz/${currentLesson.quizId}` : '/quiz'} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    leftIcon={<HelpCircle className="w-4 h-4" />}
                  >
                    Test Knowledge with Quiz
                  </Button>
                </Link>

                {!isAlreadyCompleted && !hasCompletedInSession ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto"
                    onClick={handleFinishLesson}
                    rightIcon={<Trophy className="w-5 h-5" />}
                  >
                    Complete Lesson & Claim +{currentLesson.xpReward} XP
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-black uppercase text-black bg-[#B8FF9F] border-2 border-black px-3 py-2 rounded-[4px] shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-black" />
                      Lesson Completed! (+{currentLesson.xpReward} XP)
                    </span>
                    {nextLesson && (
                      <Link to={`/lesson/${nextLesson.id}`}>
                        <Button
                          variant="primary"
                          size="md"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          Next: Unit {nextLesson.number}
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
