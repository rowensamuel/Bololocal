import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Filter,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Clock,
} from '../components/common/Icons';
import { LessonCard } from '../components/learning/LessonCard';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useLessons } from '../hooks/useLessons';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { getLanguageById } from '../data/mockLanguages';

export const Learn: React.FC = () => {
  const { user } = useAuth();
  const currentLang = getLanguageById(user?.learning_language_id || 'mr');

  const { lessons, loading: isLoading } = useLessons(currentLang.code);
  const { completedLessonIds } = useLearning();

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const filteredLessons = lessons.filter((lesson) => {
    if (selectedDifficulty === 'All') return true;
    return lesson.difficulty === selectedDifficulty;
  });

  const matchingCompletedCount = completedLessonIds.filter((id) =>
    lessons.some((l) => l.id === id)
  ).length;

  const completionPercent = Math.round(
    (matchingCompletedCount / (lessons.length || 1)) * 100
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Course Overview Header */}
      <div className="bg-white border-3 border-black rounded-[6px] p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-[4px] bg-[#FFE57F] text-black border border-black shadow-[1px_1px_0px_#000] uppercase tracking-wider">
                Flagship Curriculum
              </span>
              <span className="text-xs font-bold text-neutral-600">
                {lessons.length} Spoken Units
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Spoken {currentLang.name} Foundation Course
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-700 max-w-2xl leading-relaxed">
              Step-by-step communicative mastery designed for everyday speaking. Build genuine fluency and vocabulary in {currentLang.name}.
            </p>
          </div>

          <div className="p-4 rounded-[4px] bg-[#A6FAFF] border-2 border-black shadow-[3px_3px_0px_#000] shrink-0 min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-black">
              <span>Course Progress</span>
              <span className="font-mono text-sm">{completionPercent}%</span>
            </div>
            <ProgressBar value={completionPercent} variant="green" />
            <span className="text-[11px] font-bold text-black block text-right">
              {matchingCompletedCount} of {lessons.length} lessons finished
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 pt-3 border-t-2 border-black overflow-x-auto pb-1">
          <span className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-black" /> Filter Level:
          </span>
          {['All', 'Beginner', 'Intermediate'].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1 border-2 border-black rounded-[4px] text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-none ${
                selectedDifficulty === diff
                  ? 'bg-[#FFE57F] shadow-[2px_2px_0px_#000]'
                  : 'bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_#000]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-wider text-black">
            {currentLang.name} Units ({filteredLessons.length})
          </h3>
          <span className="text-xs font-bold text-neutral-600">
            Click any lesson to start speaking practice
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-black font-bold">Loading {currentLang.name} lessons...</div>
        ) : filteredLessons.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 font-bold">No lessons found matching this filter.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={completedLessonIds.includes(lesson.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
