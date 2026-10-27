import React, { useState } from 'react';
import { Bookmark, ChevronDown, ChevronUp } from '../common/Icons';
import { Badge } from '../ui/Badge';
import { AudioButton } from '../common/AudioButton';
import { VocabularyItem } from '../../types/lesson';
import { useLearning } from '../../context/LearningContext';

export interface VocabularyCardProps {
  item: VocabularyItem;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({ item }) => {
  const { bookmarkedVocabIds, toggleBookmarkVocab } = useLearning();
  const [showExample, setShowExample] = useState(false);
  const isBookmarked = bookmarkedVocabIds.includes(item.id);

  return (
    <div className="bg-white border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] p-5 flex flex-col justify-between gap-3 font-sans">
      {/* Top row: Category & Bookmark */}
      <div className="flex items-center justify-between">
        <Badge variant="cyan" size="sm">
          {item.category}
        </Badge>
        <button
          type="button"
          onClick={() => toggleBookmarkVocab(item.id)}
          className={`p-1.5 border-2 border-black rounded-[4px] shadow-[2px_2px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none cursor-pointer ${
            isBookmarked ? 'bg-[#FFE57F]' : 'bg-white hover:bg-neutral-100'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark word'}
          aria-label="Bookmark word"
        >
          <Bookmark className={`w-3.5 h-3.5 text-black ${isBookmarked ? 'fill-black' : ''}`} />
        </button>
      </div>

      {/* Main Marathi Word & Transliteration */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl sm:text-3xl font-black text-black">
            {item.marathi}
          </span>
          <AudioButton textToSpeak={item.marathi} variant="icon-only" size="sm" />
        </div>
        <p className="text-xs font-bold text-neutral-800 tracking-wide">
          {item.roman}
        </p>
        <p className="text-xs text-neutral-700 font-semibold">
          {item.english}
        </p>
        {item.hindi && (
          <p className="text-xs font-medium text-neutral-500">
            हिन्दी: {item.hindi}
          </p>
        )}
      </div>

      {/* Expandable Example Sentence */}
      {item.exampleSentence && (
        <div className="pt-2 border-t-2 border-black">
          <button
            type="button"
            onClick={() => setShowExample(!showExample)}
            className="flex items-center justify-between w-full text-xs font-bold text-black hover:bg-[#FFE57F] px-1 py-0.5 rounded transition-none cursor-pointer"
          >
            <span>Example in action</span>
            {showExample ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {showExample && (
            <div className="mt-2 p-3 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[2px_2px_0px_#000] text-xs space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-black">
                  {item.exampleSentence}
                </span>
                <AudioButton
                  textToSpeak={item.exampleSentence}
                  variant="icon-only"
                  size="sm"
                />
              </div>
              {item.exampleRoman && (
                <p className="text-neutral-800 font-bold">{item.exampleRoman}</p>
              )}
              {item.exampleEnglish && (
                <p className="text-neutral-700 italic font-medium">{item.exampleEnglish}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
