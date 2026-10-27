import React from 'react';
import { Users, Flame, Award, Globe } from '../../components/common/Icons';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/common/StatCard';
import { mockLanguages } from '../../data/mockLanguages';

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b-2 border-black pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-[#121310]">
          Platform Analytics & Learning Metrics
        </h2>
        <p className="text-xs text-[#4A4B45] mt-0.5">
          Monitor learner retention, active languages, completion rates, and daily practice streaks.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value="1,420"
          subtitle="+14% this month"
          icon={<Users className="w-4 h-4 text-black" />}
        />
        <StatCard
          title="Daily Streaks"
          value="892"
          subtitle="Avg 5.4 days"
          icon={<Flame className="w-4 h-4 text-[#E26D24]" />}
        />
        <StatCard
          title="Quiz Completion"
          value="88.4%"
          subtitle="4,200+ attempts"
          icon={<Award className="w-4 h-4 text-[#2C6E49]" />}
        />
        <StatCard
          title="Active Tracks"
          value="8"
          subtitle="Indian languages"
          icon={<Globe className="w-4 h-4 text-[#52634F]" />}
        />
      </div>

      {/* Language Breakdown Table */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-sm font-black text-[#121310] uppercase tracking-wider">
          Enrollment & Engagement by Language
        </h3>

        <div className="border-2 border-black overflow-x-auto shadow-[2px_2px_0px_#000]">
          <table className="w-full text-xs text-left min-w-[500px]">
            <thead className="bg-[#ECEAE4] text-black border-b-2 border-black font-black uppercase tracking-wider">
              <tr>
                <th className="p-3">Language</th>
                <th className="p-3">Code</th>
                <th className="p-3">Learners</th>
                <th className="p-3">Lessons Done</th>
                <th className="p-3">Avg Accuracy</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-[#121310] font-medium bg-[#FAF9F6]">
              {mockLanguages.map((l) => (
                <tr key={l.code} className="hover:bg-[#ECEAE4]/60 transition-colors">
                  <td className="p-3 font-bold text-[#121310] flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                    <span className="text-[#4A4B45] font-normal">({l.native_name})</span>
                  </td>
                  <td className="p-3 font-mono font-bold uppercase">{l.code}</td>
                  <td className="p-3 font-bold">
                    {l.code === 'mr' ? '640' : l.code === 'hi' ? '320' : l.code === 'bn' ? '180' : '90'}
                  </td>
                  <td className="p-3">
                    {l.code === 'mr' ? '1,840' : l.code === 'hi' ? '920' : l.code === 'bn' ? '410' : '150'}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#2C6E49]">91.4%</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 border border-black bg-[#2C6E49] text-white font-bold text-[9px] uppercase">
                      Live
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
