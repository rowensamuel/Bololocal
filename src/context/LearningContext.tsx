import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { lessonService } from '../services/lessonService';
import { progressService } from '../services/progressService';
import { speakText } from '../utils/speech';
import { useAuth } from './AuthContext';

interface LearningContextType {
  completedLessonIds: string[];
  completeLesson: (lessonId: string) => Promise<void>;
  isLessonCompleted: (lessonId: string) => boolean;
  totalXp: number;
  streakDays: number;
  addXp: (amount: number) => Promise<void>;
  playPronunciation: (text: string, langCode?: string) => Promise<boolean>;
  isSpeaking: boolean;
  bookmarkedVocabIds: string[];
  toggleBookmarkVocab: (vocabId: string) => void;
  bookmarkedPhraseIds: string[];
  toggleBookmarkPhrase: (phraseId: string) => void;
  completeQuiz: (quizId: string, score: number, xpEarned: number) => void;
  resetProgress: () => void;
  refreshProgress: () => Promise<void>;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const learningLanguageId = user?.learning_language_id || 'mr';

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookmarkedVocabIds, setBookmarkedVocabIds] = useState<string[]>([]);
  const [bookmarkedPhraseIds, setBookmarkedPhraseIds] = useState<string[]>([]);

  // Load progress when user or learning language changes
  const loadUserProgress = useCallback(async () => {
    if (!user) {
      setCompletedLessonIds([]);
      setTotalXp(0);
      setStreakDays(1);
      setBookmarkedVocabIds([]);
      setBookmarkedPhraseIds([]);
      return;
    }

    try {
      const prog = await progressService.getLanguageProgress(user.id, user.learning_language_id || 'mr');
      setCompletedLessonIds(prog.completed_lesson_ids || []);
      setTotalXp(prog.total_xp || 0);
      setStreakDays(prog.streak_days || 1);
      setBookmarkedVocabIds(prog.bookmarked_vocab_ids || []);
      setBookmarkedPhraseIds(prog.bookmarked_phrase_ids || []);
    } catch {
      // Fallback
    }
  }, [user]);

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  const completeLesson = async (lessonId: string) => {
    await lessonService.markLessonCompleted(lessonId, userId, learningLanguageId);
    const newCompleted = completedLessonIds.includes(lessonId)
      ? completedLessonIds
      : [...completedLessonIds, lessonId];
    setCompletedLessonIds(newCompleted);

    const xpReward = 50;
    const newXp = totalXp + xpReward;
    setTotalXp(newXp);

    if (user) {
      await progressService.updateLanguageProgress(user.id, learningLanguageId, {
        completed_lesson_ids: newCompleted,
        total_xp: newXp,
      });
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessonIds.includes(lessonId);
  };

  const addXp = async (amount: number) => {
    const newXp = totalXp + amount;
    setTotalXp(newXp);
    if (user) {
      await progressService.updateLanguageProgress(user.id, learningLanguageId, {
        total_xp: newXp,
      });
    }
  };

  const playPronunciation = async (text: string, langCode?: string) => {
    setIsSpeaking(true);
    const targetLang = langCode || learningLanguageId;
    const success = await speakText(text, targetLang, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
    setIsSpeaking(false);
    return success;
  };

  const toggleBookmarkVocab = (vocabId: string) => {
    const updated = bookmarkedVocabIds.includes(vocabId)
      ? bookmarkedVocabIds.filter((id) => id !== vocabId)
      : [...bookmarkedVocabIds, vocabId];
    setBookmarkedVocabIds(updated);

    if (user) {
      progressService.updateLanguageProgress(user.id, learningLanguageId, {
        bookmarked_vocab_ids: updated,
      });
    }
  };

  const toggleBookmarkPhrase = (phraseId: string) => {
    const updated = bookmarkedPhraseIds.includes(phraseId)
      ? bookmarkedPhraseIds.filter((id) => id !== phraseId)
      : [...bookmarkedPhraseIds, phraseId];
    setBookmarkedPhraseIds(updated);

    if (user) {
      progressService.updateLanguageProgress(user.id, learningLanguageId, {
        bookmarked_phrase_ids: updated,
      });
    }
  };

  const completeQuiz = (_quizId: string, _score: number, xpEarned: number) => {
    addXp(xpEarned);
  };

  const resetProgress = () => {
    setCompletedLessonIds([]);
    setTotalXp(0);
    setStreakDays(1);
    setBookmarkedVocabIds([]);
    setBookmarkedPhraseIds([]);
  };

  return (
    <LearningContext.Provider
      value={{
        completedLessonIds,
        completeLesson,
        isLessonCompleted,
        totalXp,
        streakDays,
        addXp,
        playPronunciation,
        isSpeaking,
        bookmarkedVocabIds,
        toggleBookmarkVocab,
        bookmarkedPhraseIds,
        toggleBookmarkPhrase,
        completeQuiz,
        resetProgress,
        refreshProgress: loadUserProgress,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
