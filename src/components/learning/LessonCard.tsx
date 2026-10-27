import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Lock, ArrowRight, Clock, BookOpen } from '../common/Icons';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { Lesson } from '../../types/lesson';

export interface LessonCardProps {
  lesson: Lesson;
  isCompleted?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, isCompleted = false }) => {
  const progressPercent = isCompleted
    ? 100
    : Math.round((lesson.completedActivities / lesson.totalActivities) * 100);

  return (
    <div
      className={`border-2 border-black rounded-[6px] shadow-[4px_4px_0px_#000] p-5 flex flex-col justify-between gap-4 font-sans ${
        lesson.isLocked ? 'opacity-60 bg-neutral-100 shadow-none' : 'bg-white'
      }`}
    >
      <div>
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-black text-black font-mono tracking-wider bg-neutral-100 px-2 py-0.5 border border-black rounded">
            LESSON {lesson.number}
          </span>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                lesson.difficulty === 'Beginner'
                  ? 'green'
                  : lesson.difficulty === 'Intermediate'
                  ? 'cyan'
                  : 'orange'
              }
              size="sm"
            >
              {lesson.difficulty}
            </Badge>
            {isCompleted ? (
              <span className="flex items-center gap-1 text-[11px] font-black uppercase text-black bg-[#B8FF9F] px-2 py-0.5 rounded-[4px] border border-black shadow-[1px_1px_0px_#000]">
                <CheckCircle className="w-3.5 h-3.5 text-black" />
                <span>Done</span>
              </span>
            ) : lesson.isLocked ? (
              <span className="flex items-center gap-1 text-xs font-bold text-neutral-500">
                <Lock className="w-3.5 h-3.5 text-black" />
                <span>Locked</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-black text-black leading-snug">
          {lesson.title}
        </h3>
        <p className="text-xs font-medium text-neutral-700 mt-1 line-clamp-2 leading-relaxed">
          {lesson.shortDescription}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs font-bold text-black mt-3 pt-3 border-t-2 border-black">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-black" />
            {lesson.durationMinutes} mins
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-black" />
            {lesson.totalActivities} activities
          </span>
        </div>
      </div>

      {/* Progress & CTA */}
      <div className="space-y-3 pt-2">
        {!lesson.isLocked && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-black text-black">
              <span>Completion</span>
              <span>{progressPercent}%</span>
            </div>
            <ProgressBar
              value={progressPercent}
              variant={isCompleted ? 'green' : 'cyan'}
            />
          </div>
        )}

        {lesson.isLocked ? (
          <Button variant="outline" size="sm" className="w-full opacity-50 cursor-not-allowed" disabled>
            <Lock className="w-3.5 h-3.5 mr-1.5" /> Locked
          </Button>
        ) : (
          <Link to={`/lesson/${lesson.id}`} className="block">
            <Button
              variant={isCompleted ? 'outline' : 'primary'}
              size="sm"
              className="w-full"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {isCompleted ? 'Review Lesson' : progressPercent > 0 ? 'Continue' : 'Start Lesson'}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
