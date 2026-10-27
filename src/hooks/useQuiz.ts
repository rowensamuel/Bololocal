import { useState, useEffect } from 'react';
import { Quiz } from '../types/quiz';
import { quizService } from '../services/quizService';
import { useAuth } from '../context/AuthContext';

export interface UseQuizReturn {
  quiz: Quiz | null;
  mismatchedQuiz: Quiz | null;
  loading: boolean;
  isLanguageMismatch: boolean;
  currentLanguageId: string;
}

export const useQuiz = (quizId?: string, explicitLanguageId?: string): UseQuizReturn => {
  const { user } = useAuth();
  const currentLang = explicitLanguageId || user?.learning_language_id || 'mr';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [mismatchedQuiz, setMismatchedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLanguageMismatch, setIsLanguageMismatch] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadQuiz = async () => {
      if (quizId) {
        const found = await quizService.getQuizById(quizId);
        if (!isMounted) return;

        if (found) {
          if (found.language_id.toLowerCase() === currentLang.toLowerCase()) {
            setQuiz(found);
            setMismatchedQuiz(null);
            setIsLanguageMismatch(false);
          } else {
            // Strict Language Mismatch: Do NOT silently substitute another quiz!
            setQuiz(null);
            setMismatchedQuiz(found);
            setIsLanguageMismatch(true);
          }
        } else {
          // If the quizId is not found, attempt to find a quiz for the active language
          const alt = await quizService.getQuizForLanguage(currentLang);
          if (!isMounted) return;
          setQuiz(alt || null);
          setMismatchedQuiz(null);
          setIsLanguageMismatch(false);
        }
      } else {
        // No specific quizId requested: Load default quiz for current active learning language
        const defaultQuiz = await quizService.getQuizForLanguage(currentLang);
        if (!isMounted) return;
        setQuiz(defaultQuiz || null);
        setMismatchedQuiz(null);
        setIsLanguageMismatch(false);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, [quizId, currentLang]);

  return {
    quiz,
    mismatchedQuiz,
    loading,
    isLanguageMismatch,
    currentLanguageId: currentLang,
  };
};
