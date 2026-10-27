import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Trophy,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ArrowLeft,
} from '../components/common/Icons';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { courseService } from '../services/courseService';
import { lessonService } from '../services/lessonService';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { Course as CourseType } from '../types/course';
import { Lesson } from '../types/lesson';
import { getLanguageById } from '../data/mockLanguages';

export const Course: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { completedLessonIds } = useLearning();

  const userLang = user?.learning_language_id || 'mr';
  const currentLang = getLanguageById(userLang);

  const [course, setCourse] = useState<CourseType | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadCourseData = async () => {
      setLoading(true);
      let foundCourse: CourseType | undefined;
      if (courseId) {
        foundCourse = await courseService.getCourseById(courseId);
      }
      if (!foundCourse) {
        const langCourses = await courseService.getCourses(userLang);
        foundCourse = langCourses[0];
      }

      if (!isMounted) return;

      setCourse(foundCourse || null);

      const targetLang = foundCourse?.language_id || userLang;
      const langLessons = await lessonService.getLessons(targetLang);

      if (isMounted) {
        setLessons(langLessons);
        setLoading(false);
      }
    };

    loadCourseData();
    return () => {
      isMounted = false;
    };
  }, [courseId, userLang]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 font-sans">
        <div className="w-8 h-8 rounded-full border-3 border-black border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-black font-bold">Loading course details for {currentLang.name}...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-20 text-center space-y-4 font-sans">
        <h2 className="text-xl font-black text-black">No Course Found</h2>
        <p className="text-xs font-semibold text-neutral-600">We could not find a curriculum for this language.</p>
        <Link to="/learn">
          <Button variant="primary">Return to Lessons</Button>
        </Link>
      </div>
    );
  }

  const courseLang = getLanguageById(course.language_id);
  const totalLessons = lessons.length || course.totalLessons || 1;
  const completedCount = completedLessonIds.filter((id) =>
    lessons.some((l) => l.id === id)
  ).length;
  const completionPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="space-y-8 font-sans">
      {/* Back Link */}
      <Link
        to="/learn"
        className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black hover:bg-[#FFE57F] px-2 py-1 border border-black rounded transition-none"
      >
        <ArrowLeft className="w-4 h-4 text-black" />
        <span>Back to All Courses</span>
      </Link>

      {/* Course Banner */}
      <div className="bg-[#FFE57F] text-black border-3 border-black rounded-[6px] p-6 sm:p-10 shadow-[6px_6px_0px_#000] relative space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-[4px] bg-[#A6FAFF] text-black border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider">
                {courseLang.name} Curriculum
              </span>
              <span className="text-xs font-black uppercase tracking-wider bg-white px-2 py-0.5 border border-black rounded">
                {course.level} Level
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neutral-800 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-black pt-2">
              <span className="flex items-center gap-1.5 bg-white px-2 py-1 border border-black rounded shadow-[1px_1px_0px_#000]">
                <BookOpen className="w-4 h-4 text-black" />
                {totalLessons} Practical Units
              </span>
              <span className="flex items-center gap-1.5 bg-white px-2 py-1 border border-black rounded shadow-[1px_1px_0px_#000]">
                <Clock className="w-4 h-4 text-black" />
                ~{course.estimatedHours || 12} Hours Total
              </span>
              <span className="flex items-center gap-1.5 bg-white px-2 py-1 border border-black rounded shadow-[1px_1px_0px_#000]">
                <Trophy className="w-4 h-4 text-black" />
                Certificate Ready
              </span>
            </div>
          </div>

          {/* Quick Progress Box */}
          <div className="p-5 rounded-[4px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] shrink-0 min-w-[220px] space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase text-black">
              <span>Course Progress</span>
              <span className="font-mono">{completionPercent}%</span>
            </div>
            <ProgressBar value={completionPercent} variant="green" />
            <span className="text-[11px] font-bold text-black block">
              {completedCount} of {totalLessons} Lessons Done
            </span>
            <Link to="/learn" className="block pt-1">
              <Button variant="primary" size="sm" className="w-full">
                Go to Lesson Studio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Syllabus / Lessons list */}
      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider text-black">
          Course Syllabus Breakdown ({courseLang.name})
        </h3>

        <div className="divide-y-2 divide-black rounded-[6px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
          {lessons.map((lesson) => {
            const isDone = completedLessonIds.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FDF8F5] transition-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-black font-mono bg-neutral-100 px-2 py-0.5 border border-black rounded">
                      UNIT {lesson.number}
                    </span>
                    <Badge variant="cyan" size="sm">
                      {lesson.difficulty}
                    </Badge>
                    {isDone && (
                      <span className="text-[11px] font-black uppercase text-black bg-[#B8FF9F] px-2 py-0.5 rounded-[4px] border border-black shadow-[1px_1px_0px_#000] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-black" /> Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-black">
                    {lesson.title}
                  </h4>
                  <p className="text-xs font-medium text-neutral-700 line-clamp-1">
                    {lesson.shortDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-bold text-neutral-600 hidden sm:inline">
                    {lesson.durationMinutes} mins
                  </span>
                  <Link to={`/lesson/${lesson.id}`}>
                    <Button variant={isDone ? 'outline' : 'primary'} size="sm">
                      {isDone ? 'Review' : 'Start'}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
