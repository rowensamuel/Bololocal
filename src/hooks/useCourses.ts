import { useState, useEffect } from 'react';
import { Course } from '../types/course';
import { courseService } from '../services/courseService';
import { useAuth } from '../context/AuthContext';

export const useCourses = (languageId?: string) => {
  const { user } = useAuth();
  const targetLanguage = languageId || user?.learning_language_id || 'mr';

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    courseService.getCourses(targetLanguage).then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, [targetLanguage]);

  return { courses, loading };
};
