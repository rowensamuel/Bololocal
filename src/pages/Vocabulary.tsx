import React, { useState, useEffect } from 'react';
import { VocabularyCard } from '../components/learning/VocabularyCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { vocabularyService } from '../services/vocabularyService';
import { getLanguageById } from '../data/mockLanguages';
import { VocabularyItem } from '../types/lesson';

export const Vocabulary: React.FC = () => {
  const { user } = useAuth();
  const { bookmarkedVocabIds } = useLearning();

  const currentLang = getLanguageById(user?.learning_language_id || 'mr');
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setSelectedCategory('All');
    setSearchTerm('');
    const loadVocab = async () => {
      setIsLoading(true);
      const [words, cats] = await Promise.all([
        vocabularyService.getAllVocabulary(currentLang.code),
        vocabularyService.getCategories(currentLang.code),
      ]);
      if (isMounted) {
        setVocabulary(words);
        setCategories(cats);
        setIsLoading(false);
      }
    };
    loadVocab();
    return () => {
      isMounted = false;
    };
  }, [currentLang.code]);

  const filteredWords = vocabulary.filter((item) => {
    const term = searchTerm.toLowerCase();
    const wordText = item.marathi || '';
    const matchesSearch =
      !term ||
      item.english.toLowerCase().includes(term) ||
      item.roman.toLowerCase().includes(term) ||
      wordText.toLowerCase().includes(term) ||
      (item.hindi && item.hindi.toLowerCase().includes(term));

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const matchesBookmarks = !onlyBookmarked || bookmarkedVocabIds.includes(item.id);

    return matchesSearch && matchesCategory && matchesBookmarks;
  });

  return (
    <div className="space-y-8">
      {/* Neo-Brutalist Header Banner */}
      <div className="bg-[#B8FF9F] p-6 sm:p-8 rounded-[6px] border-2 border-black shadow-[6px_6px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="yellow" size="sm">
              Vocabulary Vault
            </Badge>
            <span className="text-xs font-black uppercase tracking-wider text-black">
              {vocabulary.length} {currentLang.name} Spoken Words
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
            {currentLang.name} Word Library
          </h1>
          <p className="text-sm font-medium text-black max-w-xl">
            Master essential daily vocabulary with authentic {currentLang.script} script, phonetic romanization, and verified street pronunciation.
          </p>
        </div>

        <button
          onClick={() => setOnlyBookmarked(!onlyBookmarked)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[4px] border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
            onlyBookmarked
              ? 'bg-[#FFA6F6] text-black'
              : 'bg-white text-black hover:bg-stone-50'
          }`}
        >
          <svg className={`w-4 h-4 ${onlyBookmarked ? 'fill-black' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>Bookmarked ({bookmarkedVocabIds.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${currentLang.name} words, English translation, or phonetics...`}
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1 shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-[4px] border-2 border-black text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                selectedCategory === cat
                  ? 'bg-[#FFE57F] text-black'
                  : 'bg-white text-black hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Word Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-sm font-black uppercase text-black">
          Loading {currentLang.name} words...
        </div>
      ) : filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWords.map((item) => (
            <VocabularyCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No words found"
          description={`No ${currentLang.name} vocabulary matched your search query or active filter.`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('All');
            setOnlyBookmarked(false);
          }}
        />
      )}
    </div>
  );
};
