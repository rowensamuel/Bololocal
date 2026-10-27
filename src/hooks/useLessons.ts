import { useState, useEffect } from 'react';
import { Lesson } from '../types/lesson';
import { lessonService } from '../services/lessonService';
import { useAuth } from '../context/AuthContext';

export const useLessons = (languageId?: string) => {
  const { user } = useAuth();
  const targetLanguage = languageId || user?.learning_language_id || 'mr';

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    lessonService.getLessons(targetLanguage).then((data) => {
      setLessons(data);
      setLoading(false);
    });
  }, [targetLanguage]);

  return { lessons, loading };
};
