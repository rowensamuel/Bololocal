import React, { useState } from 'react';
import { ArrowRight } from '../common/Icons';
import { Button } from '../ui/Button';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = 'Type in Hindi, English, or regional language...',
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 font-sans">
      <div className="relative flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full rounded-[4px] border-2 border-black bg-white px-4 py-3 text-sm font-bold text-black placeholder:text-neutral-500 shadow-[3px_3px_0px_#000] focus:outline-none focus:bg-[#A6FAFF] transition-none"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={!text.trim() || isLoading}
        isLoading={isLoading}
        className="px-4 py-3 rounded-[4px] shrink-0"
        aria-label="Send message"
      >
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
};
