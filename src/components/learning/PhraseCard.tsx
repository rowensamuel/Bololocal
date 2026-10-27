import React from 'react';
import { Bookmark, Sparkles, MessageSquare } from '../common/Icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AudioButton } from '../common/AudioButton';
import { UsefulPhrase } from '../../types/phrase';
import { useLearning } from '../../context/LearningContext';

export interface PhraseCardProps {
  phrase: UsefulPhrase;
}

export const PhraseCard: React.FC<PhraseCardProps> = ({ phrase }) => {
  const { bookmarkedPhraseIds, toggleBookmarkPhrase } = useLearning();
  const isBookmarked = bookmarkedPhraseIds.includes(phrase.id);

  return (
    <div className="bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] p-5 flex flex-col justify-between gap-4 font-sans">
      {/* Category header & Bookmark */}
      <div className="flex items-center justify-between">
        <Badge variant="cyan" size="sm">
          {phrase.category}
        </Badge>
        <div className="flex items-center gap-2">
          <AudioButton textToSpeak={phrase.marathi} variant="pill" label="Listen" />
          <button
            type="button"
            onClick={() => toggleBookmarkPhrase(phrase.id)}
            className={`p-1.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer ${
              isBookmarked ? 'bg-[#FFE57F]' : 'bg-white hover:bg-neutral-100'
            }`}
            title={isBookmarked ? 'Saved phrase' : 'Save phrase'}
            aria-label="Save phrase"
          >
            <Bookmark className={`w-3.5 h-3.5 text-black ${isBookmarked ? 'fill-black' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Phrase Text */}
      <div className="space-y-1.5">
        <p className="text-xl sm:text-2xl font-black text-black leading-snug">
          {phrase.marathi}
        </p>
        <p className="text-xs font-bold text-neutral-800 tracking-wide">
          {phrase.roman}
        </p>
        <p className="text-xs text-neutral-700 font-medium italic">
          "{phrase.english}"
        </p>
      </div>

      {/* Context Badge / Card */}
      <div className="bg-[#FFE57F] border-2 border-black rounded-[4px] shadow-[3px_3px_0px_#000] p-3 space-y-1 text-black">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5 text-black" />
          <span>Real-life Context</span>
        </div>
        <p className="text-xs font-semibold leading-relaxed">
          {phrase.context}
        </p>
        {phrase.culturalInsight && (
          <p className="text-[11px] font-bold pt-1 border-t border-black">
            💡 Local tip: {phrase.culturalInsight}
          </p>
        )}
      </div>
    </div>
  );
};
