import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PhraseCard } from '../components/learning/PhraseCard';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { phraseService } from '../services/phraseService';
import { getLanguageById } from '../data/mockLanguages';
import { UsefulPhrase } from '../types/phrase';

export const Phrases: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { bookmarkedPhraseIds } = useLearning();

  const currentLang = getLanguageById(user?.learning_language_id || 'mr');
  const [phrases, setPhrases] = useState<UsefulPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlySaved, setOnlySaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!searchParams.get('category')) {
      setSelectedCategory('All');
    }
    setSearchTerm('');
    const load = async () => {
      setIsLoading(true);
      const data = await phraseService.getPhrases(currentLang.code);
      if (isMounted) {
        setPhrases(data);
        setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [currentLang.code, searchParams]);

  useEffect(() => {
    const catQuery = searchParams.get('category');
    if (catQuery) {
      setSelectedCategory(catQuery);
    }
  }, [searchParams]);

  const categories = [
    'All',
    'College',
    'Restaurant',
    'Shopping',
    'Travel',
    'Auto / Taxi',
    'Railway Station',
    'Hospital',
    'Daily Conversation',
  ];

  const filteredPhrases = phrases.filter((phrase) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (phrase.marathi && phrase.marathi.includes(searchTerm)) ||
      (phrase.roman && phrase.roman.toLowerCase().includes(term)) ||
      (phrase.english && phrase.english.toLowerCase().includes(term)) ||
      (phrase.context && phrase.context.toLowerCase().includes(term));

    const matchesCategory =
      selectedCategory === 'All' || phrase.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesSaved = !onlySaved || bookmarkedPhraseIds.includes(phrase.id);

    return matchesSearch && matchesCategory && matchesSaved;
  });

  return (
    <div className="space-y-8">
      {/* Neo-Brutalist Header Banner */}
      <div className="bg-[#A6FAFF] p-6 sm:p-8 rounded-[6px] border-2 border-black shadow-[6px_6px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="pink" size="sm">
              Context-First Learning
            </Badge>
            <span className="text-xs font-black uppercase tracking-wider text-black">
              {phrases.length} {currentLang.name} Street Phrases
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
            Spoken {currentLang.name} Phrases
          </h1>
          <p className="text-sm font-medium text-black max-w-xl">
            Real spoken sentences for auto rickshaws, street food stalls, college campus, railway counters, and local bazaars.
          </p>
        </div>

        <button
          onClick={() => setOnlySaved(!onlySaved)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[4px] border-2 border-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
            onlySaved
              ? 'bg-[#FFA6F6] text-black'
              : 'bg-white text-black hover:bg-stone-50'
          }`}
        >
          <svg className={`w-4 h-4 ${onlySaved ? 'fill-black' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>Saved Phrases ({bookmarkedPhraseIds.length})</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${currentLang.name} phrases, English translation, or context...`}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1 shrink-0 mr-1">
            Context:
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

      {/* Phrase Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-sm font-black uppercase text-black">
          Loading {currentLang.name} spoken phrases...
        </div>
      ) : filteredPhrases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPhrases.map((phrase) => (
            <PhraseCard key={phrase.id} phrase={phrase} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No phrases found"
          description={`No ${currentLang.name} phrases matched your search term or active category.`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('All');
            setOnlySaved(false);
          }}
        />
      )}
    </div>
  );
};
