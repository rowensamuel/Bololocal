import { ProficiencyLevel } from './user';

export interface Course {
  id: string;
  language_id: string;
  title: string;
  language: string;
  description: string;
  level: ProficiencyLevel;
  totalLessons: number;
  completedLessons: number;
  estimatedHours: number;
  coverImage?: string;
  badge?: string;
  enrolledCount?: number;
}
