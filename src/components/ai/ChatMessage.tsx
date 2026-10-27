import React, { useState } from 'react';
import { Bot, User, HelpCircle, ChevronDown, ChevronUp } from '../common/Icons';
import { AIMessage } from '../../types/ai';
import { AudioButton } from '../common/AudioButton';

export interface ChatMessageProps {
  message: AIMessage;
  onSelectSuggestion?: (text: string) => void;
  onExplain?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectSuggestion,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex gap-3 my-3 font-sans ${isAI ? 'justify-start' : 'justify-end'}`}>
      {isAI && (
        <div className="w-8 h-8 rounded-[4px] bg-[#FFE57F] border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] mt-1">
          <Bot className="w-4 h-4 text-black" />
        </div>
      )}

      <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
        <div
          className={`p-4 rounded-[4px] text-sm leading-relaxed border-2 border-black ${
            isAI
              ? 'bg-white text-black shadow-[4px_4px_0px_#000]'
              : 'bg-[#A6FAFF] text-black shadow-[4px_4px_0px_#000]'
          }`}
        >
          {/* Main message text */}
          <div className="whitespace-pre-line font-bold">{message.text}</div>

          {/* If structured regional phrase present in AI response */}
          {isAI && message.marathiScript && (
            <div className="mt-3 p-3 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[2px_2px_0px_#000] space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl font-black text-black">
                  {message.marathiScript}
                </span>
                <AudioButton
                  textToSpeak={message.marathiScript}
                  variant="pill"
                  size="sm"
                  label="Listen"
                />
              </div>
              {message.romanTransliteration && (
                <p className="text-xs font-bold text-neutral-800">
                  {message.romanTransliteration}
                </p>
              )}
              {message.meaning && (
                <p className="text-xs text-neutral-700 italic font-semibold">
                  Meaning: {message.meaning}
                </p>
              )}
            </div>
          )}

          {/* AI Helper explanation toggle */}
          {isAI && message.explanation && (
            <div className="mt-2 pt-2 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="inline-flex items-center gap-1 text-xs font-black text-black uppercase tracking-wider hover:bg-[#FFE57F] px-1 rounded transition-none cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-black" />
                <span>{showExplanation ? 'Hide Grammar Note' : 'Explain Grammar'}</span>
                {showExplanation ? (
                  <ChevronUp className="w-3 h-3 text-black" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-black" />
                )}
              </button>

              {showExplanation && (
                <div className="mt-2 p-3 rounded-[4px] bg-[#FDF8F5] text-xs font-semibold text-black leading-relaxed border-2 border-black shadow-[2px_2px_0px_#000]">
                  {message.explanation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Suggested Follow-ups */}
        {isAI && message.suggestedReplies && message.suggestedReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.suggestedReplies.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion?.(reply)}
                className="px-3 py-1 rounded-[4px] text-xs font-black bg-[#B8FF9F] text-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer text-left"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div
          className={`text-[10px] font-bold text-neutral-500 px-1 ${
            isAI ? 'text-left' : 'text-right'
          }`}
        >
          {message.timestamp}
        </div>
      </div>

      {!isAI && (
        <div className="w-8 h-8 rounded-[4px] bg-white border-2 border-black text-black flex items-center justify-center shrink-0 mt-1 font-black text-xs shadow-[2px_2px_0px_#000]">
          <User className="w-4 h-4 text-black" />
        </div>
      )}
    </div>
  );
};
