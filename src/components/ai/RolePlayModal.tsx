import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Bot,
  User,
  CheckCircle,
  AlertTriangle,
  Trophy,
  ArrowRight,
  RotateCcw,
} from '../common/Icons';
import { RolePlayScenario, RolePlayResult } from '../../types/ai';
import { aiService } from '../../services/aiService';
import { AudioButton } from '../common/AudioButton';
import { Button } from '../ui/Button';
import { useLearning } from '../../context/LearningContext';

export interface RolePlayModalProps {
  scenario: RolePlayScenario | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DialogueLine {
  sender: 'ai' | 'user';
  text: string;
  roman?: string;
  english?: string;
}

export const RolePlayModal: React.FC<RolePlayModalProps> = ({
  scenario,
  isOpen,
  onClose,
}) => {
  const { addXp } = useLearning();
  const [messages, setMessages] = useState<DialogueLine[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evaluation, setEvaluation] = useState<RolePlayResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scenario && isOpen) {
      setMessages([
        {
          sender: 'ai',
          text: scenario.initialAIMessage,
          roman: scenario.initialAIRoman,
          english: scenario.initialAIMeaning,
        },
      ]);
      setTurnCount(0);
      setIsCompleted(false);
      setEvaluation(null);
      setInputVal('');
    }
  }, [scenario, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen || !scenario) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isTyping) return;

    const userLine: DialogueLine = {
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userLine]);
    setInputVal('');
    setIsTyping(true);

    const nextTurn = turnCount + 1;
    setTurnCount(nextTurn);

    // AI responds
    const response = await aiService.generateRolePlayTurn(text, scenario, nextTurn);
    setMessages((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: response.text,
        roman: response.roman,
        english: response.english,
      },
    ]);
    setIsTyping(false);

    // Finish scenario after 3 turns
    if (nextTurn >= 3) {
      setTimeout(() => {
        const evalResult = aiService.getMockRolePlayEvaluation();
        setEvaluation(evalResult);
        setIsCompleted(true);
        addXp(60);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setMessages([
      {
        sender: 'ai',
        text: scenario.initialAIMessage,
        roman: scenario.initialAIRoman,
        english: scenario.initialAIMeaning,
      },
    ]);
    setTurnCount(0);
    setIsCompleted(false);
    setEvaluation(null);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-[6px] shadow-[8px_8px_0px_#000] border-3 border-black flex flex-col h-[90vh] max-h-[700px] overflow-hidden">
        {/* Header with situation info and exit */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#FFE57F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-white border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-black leading-none">
                  {scenario.title}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-[4px] bg-[#A6FAFF] border border-black text-black">
                  {scenario.situation}
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-800 mt-0.5">
                Speaking with: <span className="font-black text-black">{scenario.partnerRole}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[4px] bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-black hover:bg-neutral-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer"
            title="Exit conversation"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Goal Banner */}
        <div className="px-5 py-2.5 bg-[#A6FAFF] border-b-2 border-black text-xs font-bold text-black flex items-center justify-between">
          <span>Goal: {scenario.goal}</span>
          <span className="font-mono font-black text-black bg-white px-2 py-0.5 border border-black rounded shadow-[1px_1px_0px_#000]">
            Turn {turnCount}/3
          </span>
        </div>

        {/* Conversation Dialogue or Completed Report */}
        {!isCompleted ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FDF8F5]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${
                    msg.sender === 'ai' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-[4px] bg-[#FFE57F] border-2 border-black text-black flex items-center justify-center text-xs font-black shrink-0 mt-1 shadow-[2px_2px_0px_#000]">
                      <Bot className="w-4 h-4 text-black" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-[4px] p-4 text-sm border-2 border-black ${
                      msg.sender === 'ai'
                        ? 'bg-white text-black shadow-[4px_4px_0px_#000]'
                        : 'bg-[#A6FAFF] text-black shadow-[4px_4px_0px_#000]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-black text-base sm:text-lg leading-relaxed text-black">
                        {msg.text}
                      </p>
                      {msg.sender === 'ai' && (
                        <AudioButton textToSpeak={msg.text} variant="icon-only" size="sm" />
                      )}
                    </div>
                    {msg.roman && (
                      <p className="text-xs font-bold text-neutral-800 mt-1">
                        {msg.roman}
                      </p>
                    )}
                    {msg.english && (
                      <p className="text-xs text-neutral-700 italic font-medium mt-0.5">
                        "{msg.english}"
                      </p>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-[4px] bg-white border-2 border-black text-black flex items-center justify-center text-xs font-black shrink-0 mt-1 shadow-[2px_2px_0px_#000]">
                      <User className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs font-bold text-black pl-10">
                  <span className="bg-[#FFE57F] px-2 py-0.5 border border-black rounded">AI partner is replying...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested quick phrases to tap */}
            <div className="p-3 bg-white border-t-2 border-black flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              <span className="text-[11px] font-black uppercase text-neutral-500 w-full mb-0.5">
                Suggested replies:
              </span>
              {scenario.suggestedPhrases.map((phrase, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(phrase.marathi)}
                  className="px-2.5 py-1 rounded-[4px] text-xs font-bold bg-[#B8FF9F] text-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer"
                >
                  {phrase.marathi} <span className="text-neutral-600">({phrase.english})</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t-2 border-black">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Type your response in Marathi, Hindi, or English..."
                  className="flex-1 rounded-[4px] border-2 border-black bg-white px-3.5 py-2.5 text-sm font-bold text-black shadow-[2px_2px_0px_#000] focus:outline-none focus:bg-[#A6FAFF]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!inputVal.trim() || isTyping}
                  className="px-4"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* Role-play Evaluation Summary */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center bg-[#FDF8F5]">
            <div className="inline-flex p-4 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[4px_4px_0px_#000] text-black">
              <Trophy className="w-10 h-10 text-black" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-black">
                Conversation Completed!
              </h3>
              <p className="text-xs font-semibold text-neutral-700 mt-1">
                You successfully navigated the {scenario.situation} roleplay scenario.
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-[4px] bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] font-black text-neutral-500 uppercase">Vocabulary</span>
                <p className="text-xl font-black text-black mt-0.5">
                  {evaluation?.vocabularyUsed} words
                </p>
              </div>
              <div className="p-3 rounded-[4px] bg-[#B8FF9F] border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] font-black text-black uppercase">Grammar</span>
                <p className="text-xl font-black text-black mt-0.5">
                  {evaluation?.grammarAccuracy}%
                </p>
              </div>
              <div className="p-3 rounded-[4px] bg-[#FFA6F6] border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] font-black text-black uppercase">Mistakes</span>
                <p className="text-xl font-black text-black mt-0.5">
                  {evaluation?.mistakesCount}
                </p>
              </div>
              <div className="p-3 rounded-[4px] bg-[#A6FAFF] border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="text-[10px] font-black text-black uppercase">New Phrases</span>
                <p className="text-xl font-black text-black mt-0.5">
                  +{evaluation?.newPhrasesLearned}
                </p>
              </div>
            </div>

            {/* Strengths & Tips */}
            <div className="text-left space-y-3 p-4 rounded-[4px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] text-xs">
              <div className="space-y-1.5">
                <span className="font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-black" />
                  What went well:
                </span>
                <ul className="list-disc pl-5 text-neutral-800 font-medium space-y-0.5">
                  {evaluation?.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 pt-2 border-t-2 border-black">
                <span className="font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-black" />
                  Areas to polish:
                </span>
                <ul className="list-disc pl-5 text-neutral-800 font-medium space-y-0.5">
                  {evaluation?.improvementTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={handleRestart}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Try Scenario Again
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={onClose}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Complete & Exit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
