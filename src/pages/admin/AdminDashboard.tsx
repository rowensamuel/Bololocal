import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  Compass,
  Plus,
  ArrowRight,
  Shield,
  BarChart3,
} from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/common/StatCard';
import { mockVocabulary, mockPhrases, mockLessons } from '../../data/mockData';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8D6CE] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#252622] tracking-tight">
            Curriculum Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#666760] mt-0.5">
            Monitor educational content, active language tracks, and learner activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/vocabulary">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Word
            </Button>
          </Link>
          <Link to="/admin/phrases">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Phrase
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Users"
          value="1,420"
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          title="Courses"
          value="1"
          subtitle="Marathi MVP"
          icon={<BookOpen className="w-4 h-4" />}
        />
        <StatCard
          title="Lessons"
          value={mockLessons.length}
          subtitle="10 Units"
          icon={<FileText className="w-4 h-4" />}
        />
        <StatCard
          title="Vocabulary"
          value={mockVocabulary.length}
          subtitle="Word Vault"
          icon={<Compass className="w-4 h-4" />}
        />
        <StatCard
          title="Phrases"
          value={mockPhrases.length}
          subtitle="Situational"
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <StatCard
          title="Active Learners"
          value="348"
          subtitle="Past 24h"
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      {/* Tables Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Lessons (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8D6CE] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#666760]">
                Curriculum Units (Spoken Marathi)
              </h3>
              <Link to="/admin/lessons" className="text-xs font-semibold text-[#52634F] hover:underline">
                Manage All Lessons
              </Link>
            </div>

            <div className="divide-y divide-[#D8D6CE] text-xs">
              {mockLessons.slice(0, 5).map((l) => (
                <div key={l.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#252622] font-mono text-[11px] shrink-0">
                        UNIT {l.number}
                      </span>
                      <span className="font-semibold text-[#252622] truncate">{l.title}</span>
                    </div>
                    <p className="text-[11px] text-[#666760] font-marathi truncate">
                      {l.marathiTitle}
                    </p>
                  </div>
                  <Badge variant={l.difficulty === 'Beginner' ? 'success' : 'accent'} size="sm">
                    {l.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Links & Platform Health (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card padding="md" className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#666760] border-b border-[#D8D6CE] pb-2">
              Content Quick Actions
            </h3>

            <div className="space-y-2 text-xs">
              <Link
                to="/admin/vocabulary"
                className="flex items-center justify-between p-2.5 rounded-sm bg-[#ECEAE4] hover:bg-[#E2DFD6] border border-[#D8D6CE] text-[#252622] transition-colors"
              >
                <span>Inspect Marathi Vocabulary Vault</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#666760]" />
              </Link>

              <Link
                to="/admin/phrases"
                className="flex items-center justify-between p-2.5 rounded-sm bg-[#ECEAE4] hover:bg-[#E2DFD6] border border-[#D8D6CE] text-[#252622] transition-colors"
              >
                <span>Manage Situational Dialogue Phrases</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#666760]" />
              </Link>

              <Link
                to="/admin/quizzes"
                className="flex items-center justify-between p-2.5 rounded-sm bg-[#ECEAE4] hover:bg-[#E2DFD6] border border-[#D8D6CE] text-[#252622] transition-colors"
              >
                <span>Edit Multiple-Choice & Listening Quizzes</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#666760]" />
              </Link>

              <Link
                to="/admin/languages"
                className="flex items-center justify-between p-2.5 rounded-sm bg-[#ECEAE4] hover:bg-[#E2DFD6] border border-[#D8D6CE] text-[#252622] transition-colors"
              >
                <span>Language Matrix & Roadmaps</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#666760]" />
              </Link>
            </div>
          </Card>

          <Card padding="md" className="border-[#35664A]/30 bg-[#ECEAE4] space-y-1.5 text-xs text-[#252622]">
            <div className="flex items-center gap-1.5 font-bold text-[#35664A]">
              <Shield className="w-4 h-4 text-[#35664A]" />
              <span>Service Layer Connected to Supabase</span>
            </div>
            <p className="leading-relaxed text-[#666760] text-[11px]">
              All admin modules query through unified database services, providing resilient fallback caching and direct PostgreSQL persistence.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
