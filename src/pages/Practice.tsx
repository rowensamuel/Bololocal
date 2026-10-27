import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChatMessage } from '../components/ai/ChatMessage';
import { ChatInput } from '../components/ai/ChatInput';
import { ScenarioCard } from '../components/ai/ScenarioCard';
import { RolePlayModal } from '../components/ai/RolePlayModal';
import { AIMessage, RolePlayScenario } from '../types/ai';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { getLanguageById } from '../data/mockLanguages';

export const Practice: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const initialMode = modeParam === 'roleplay' ? 'roleplay' : 'tutor';

  const { user } = useAuth();
  const { addXp } = useLearning();
  const currentLang = getLanguageById(user?.learning_language_id || 'mr');

  const [activeMode, setActiveMode] = useState<'tutor' | 'roleplay'>(initialMode);
  const [scenarios, setScenarios] = useState<RolePlayScenario[]>([]);

  // AI Tutor Chat State
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `${currentLang.greeting} I am your BOLOLOCAL ${currentLang.name} Tutor. Ask me how to speak in ${currentLang.name}, request vocabulary for daily life, or practice polite sentences.`,
      marathiScript: currentLang.greeting,
      romanTransliteration: currentLang.name,
      meaning: currentLang.greeting_meaning,
      timestamp: 'Just now',
      suggestedReplies: [
        'How do I say "Where is the railway station?"',
        'How do I politely order tea or food?',
        'Give me 3 phrases for everyday conversation',
      ],
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI Role Play State
  const [selectedScenario, setSelectedScenario] = useState<RolePlayScenario | null>(null);
  const [isRolePlayModalOpen, setIsRolePlayModalOpen] = useState(false);

  useEffect(() => {
    if (modeParam === 'roleplay' || modeParam === 'tutor') {
      setActiveMode(modeParam);
    }
  }, [modeParam]);

  useEffect(() => {
    setChatMessages([
      {
        id: `init-${currentLang.code}-${Date.now()}`,
        sender: 'ai',
        text: `${currentLang.greeting} I am your BOLOLOCAL ${currentLang.name} Tutor. Ask me how to speak in ${currentLang.name}, request vocabulary for daily life, or practice polite sentences.`,
        marathiScript: currentLang.greeting,
        romanTransliteration: currentLang.name,
        meaning: currentLang.greeting_meaning,
        timestamp: 'Just now',
        suggestedReplies: [
          `How do I say "Where is the railway station?" in ${currentLang.name}?`,
          `How do I politely order tea or food in ${currentLang.name}?`,
          `Give me 3 phrases for everyday conversation in ${currentLang.name}`,
        ],
      },
    ]);
    const list = aiService.getScenarios(currentLang.code);
    setScenarios(list);
  }, [currentLang.code]);

  const handleModeChange = (mode: 'tutor' | 'roleplay') => {
    setActiveMode(mode);
    setSearchParams({ mode });
  };

  const handleSendMessage = async (userText: string) => {
    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const aiResponse = await aiService.generateTutorResponse(userText, 'General', currentLang.code);
      setChatMessages((prev) => [...prev, aiResponse]);
      await addXp(10);
    } catch {
      // Fallback
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleStartRolePlay = (scenario: RolePlayScenario) => {
    setSelectedScenario(scenario);
    setIsRolePlayModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Neo-Brutalist Mode Switcher Banner */}
      <div className="bg-[#FFE57F] p-6 sm:p-8 rounded-[6px] border-2 border-black shadow-[6px_6px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              AI Practice Arena
            </Badge>
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Zero Judgment • Instant Phonetics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
            Conversational {currentLang.name} Lab
          </h1>
          <p className="text-sm font-medium text-black max-w-xl">
            Switch between direct interactive tutoring in {currentLang.name} or step into street-level role-play simulations.
          </p>
        </div>

        {/* Neo-Brutalist Segmented Mode Selector */}
        <div className="flex p-1.5 rounded-[6px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] self-start sm:self-center shrink-0 gap-1.5">
          <button
            onClick={() => handleModeChange('tutor')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === 'tutor'
                ? 'bg-[#A6FAFF] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-black border-2 border-transparent hover:bg-stone-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 01-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L4.2 15.3" />
            </svg>
            <span>AI Tutor</span>
          </button>

          <button
            onClick={() => handleModeChange('roleplay')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === 'roleplay'
                ? 'bg-[#FFA6F6] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : 'text-black border-2 border-transparent hover:bg-stone-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Role-play Scenarios</span>
          </button>
        </div>
      </div>

      {/* MODE A: AI LANGUAGE TUTOR */}
      {activeMode === 'tutor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Conversation Container (8 cols) */}
          <div className="lg:col-span-8 flex flex-col h-[650px] bg-white rounded-[6px] border-2 border-black shadow-[6px_6px_0px_#000] overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#FDF8F5]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black">
                  <span className="text-black text-sm">AI</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase">
                    BOLOLOCAL {currentLang.name} Tutor
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 border border-black animate-pulse" />
                    <span>Active & Ready</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setChatMessages([
                    {
                      id: `init-${Date.now()}`,
                      sender: 'ai',
                      text: `${currentLang.greeting} Let's restart our ${currentLang.name} conversation. What would you like to speak about?`,
                      timestamp: 'Just now',
                    },
                  ])
                }
                className="px-3 py-1 bg-white border-2 border-black rounded-[4px] text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-[#FFE57F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1"
                title="Reset Chat"
              >
                <span>Reset</span>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
              {chatMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSelectSuggestion={(reply) => handleSendMessage(reply)}
                />
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-2 p-3 bg-[#FFE57F] border-2 border-black rounded-[4px] w-fit shadow-[2px_2px_0px_#000] text-xs font-black">
                  <div className="w-2 h-2 rounded-full bg-black animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-black animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-black animate-bounce [animation-delay:0.4s]" />
                  <span>Thinking in {currentLang.name}...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t-2 border-black bg-[#FDF8F5]">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isAiLoading}
                placeholder={`Ask in English, Hindi, or ${currentLang.name}...`}
              />
            </div>
          </div>

          {/* Right Sidebar: Helpful Prompts & Context (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card padding="md" className="space-y-3 bg-[#B8FF9F]">
              <div className="flex items-center gap-2 text-black">
                <span className="text-base font-black">💡</span>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Tips for Practice
                </h4>
              </div>
              <ul className="text-xs font-bold text-black space-y-2 leading-relaxed">
                <li className="p-2 bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                  • "How do I respectfully ask for the bill?"
                </li>
                <li className="p-2 bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                  • "Explain the grammar of polite pronouns in {currentLang.name}."
                </li>
                <li className="p-2 bg-white border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000]">
                  • "What are 5 essential street words for auto rickshaws?"
                </li>
              </ul>
            </Card>

            <Card padding="md" className="bg-[#A6FAFF] space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-black block">
                Earn +10 XP per Exchange
              </span>
              <p className="text-xs font-medium text-black">
                Every spoken exchange with your tutor contributes to your daily learning streak and unlocks proficiency badges.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* MODE B: ROLE-PLAY SCENARIOS */}
      {activeMode === 'roleplay' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">
                Choose a Speaking Scenario ({scenarios.length})
              </h3>
              <p className="text-xs font-bold text-stone-600">
                Step into interactive real-life dialogues in {currentLang.name}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scen) => (
              <ScenarioCard
                key={scen.id}
                scenario={scen}
                onStart={() => handleStartRolePlay(scen)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Role Play Modal */}
      {selectedScenario && (
        <RolePlayModal
          isOpen={isRolePlayModalOpen}
          scenario={selectedScenario}
          onClose={() => {
            setIsRolePlayModalOpen(false);
            setSelectedScenario(null);
          }}
        />
      )}
    </div>
  );
};
