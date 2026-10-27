import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge as UiBadge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { achievementService } from '../services/achievementService';
import { badgeService } from '../services/badgeService';
import { Achievement } from '../types/achievement';
import { Badge as BadgeType } from '../types/badge';
import { getLanguageById } from '../data/mockLanguages';

export const Achievements: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'badges' ? 'badges' : 'achievements';
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges'>(initialTab);

  const { user } = useAuth();
  const { totalXp, streakDays } = useLearning();
  const currentLang = getLanguageById(user?.learning_language_id || 'mr');

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchIds, setUnlockedAchIds] = useState<Set<string>>(new Set());
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      const [allAchs, userAchs, allBadges, userBadges] = await Promise.all([
        achievementService.getAllAchievements(),
        user?.id ? achievementService.getUserAchievements(user.id) : Promise.resolve([]),
        badgeService.getAllBadges(),
        user?.id ? badgeService.getUserBadges(user.id) : Promise.resolve([]),
      ]);

      if (isMounted) {
        setAchievements(allAchs);
        setUnlockedAchIds(new Set(userAchs.map((a) => a.achievement_id)));
        setBadges(allBadges);
        setUnlockedBadgeIds(new Set(userBadges.map((b) => b.badge_id)));
        setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleTabChange = (tab: 'achievements' | 'badges') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-8">
      {/* Neo-Brutalist Header */}
      <div className="bg-[#FFA6F6] p-6 sm:p-8 rounded-[6px] border-2 border-black shadow-[6px_6px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UiBadge variant="yellow" size="sm">
              Gamification & Rewards
            </UiBadge>
            <span className="text-xs font-black uppercase tracking-wider text-black">
              {activeTab === 'achievements'
                ? `${unlockedAchIds.size} of ${achievements.length} Unlocked`
                : `${unlockedBadgeIds.size} of ${badges.length} Earned`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
            Milestones & Badges
          </h1>
          <p className="text-sm font-medium text-black max-w-xl">
            Celebrate every victory in your spoken {currentLang.name} journey—from first greetings to rapid conversational street fluency.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-[4px] bg-white border-2 border-black shadow-[3px_3px_0px_#000] text-center min-w-[90px]">
            <span className="text-xl">🔥</span>
            <span className="text-xs font-black text-black block mt-0.5">
              {streakDays} Day Streak
            </span>
          </div>
          <div className="p-3 rounded-[4px] bg-[#FFE57F] border-2 border-black shadow-[3px_3px_0px_#000] text-center min-w-[90px]">
            <span className="text-xl">⚡</span>
            <span className="text-xs font-black text-black block mt-0.5">
              {totalXp} XP
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Neo-Brutalist Tabs */}
      <div className="flex p-1.5 rounded-[6px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] gap-2 w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('achievements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-[#FFE57F] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
              : 'text-black border-2 border-transparent hover:bg-stone-100'
          }`}
        >
          <span>🏆 Achievements ({unlockedAchIds.size}/{achievements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('badges')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-[#A6FAFF] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
              : 'text-black border-2 border-transparent hover:bg-stone-100'
          }`}
        >
          <span>🎖️ Badges ({unlockedBadgeIds.size}/{badges.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm font-black uppercase text-black">
          Loading gamification metrics...
        </div>
      ) : activeTab === 'achievements' ? (
        /* Achievements Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((ach) => {
            const isUnlocked = unlockedAchIds.has(ach.id);
            return (
              <Card
                key={ach.id}
                padding="lg"
                className={`flex flex-col justify-between gap-4 transition-all ${
                  isUnlocked ? 'bg-white' : 'bg-[#F4F4F0] opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-[4px] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center shrink-0 ${
                      isUnlocked ? 'bg-[#FFE57F]' : 'bg-stone-200 text-stone-400'
                    }`}
                  >
                    <span className="text-2xl">{isUnlocked ? '🏆' : '🔒'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-black text-sm uppercase">{ach.name}</span>
                      {isUnlocked && (
                        <span className="text-emerald-600 font-black text-sm">✓</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-stone-700 mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-black text-xs">
                  <span className="inline-flex items-center gap-1 font-black text-black bg-[#FFE57F] px-2 py-0.5 rounded-[4px] border-2 border-black shadow-[1px_1px_0px_#000]">
                    +{ach.xp_reward} XP
                  </span>
                  <span className="text-[11px] font-black uppercase text-black">
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Badges Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const isUnlocked = unlockedBadgeIds.has(badge.id);
            return (
              <Card
                key={badge.id}
                padding="lg"
                className={`flex flex-col justify-between gap-4 transition-all ${
                  isUnlocked ? 'bg-white' : 'bg-[#F4F4F0] opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-[4px] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center shrink-0 text-2xl ${
                      isUnlocked ? 'bg-[#A6FAFF]' : 'bg-stone-200 grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-black text-sm uppercase">{badge.name}</span>
                      {isUnlocked && (
                        <span className="text-emerald-600 font-black text-sm">✓</span>
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-black bg-[#FFE57F] px-1.5 py-0.5 rounded-[4px] border-2 border-black inline-block mt-1">
                      {badge.rarity}
                    </span>
                    <p className="text-xs font-medium text-stone-700 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-black text-xs">
                  <span className="text-[11px] font-black uppercase text-black">
                    {isUnlocked ? 'Earned' : 'Locked'}
                  </span>
                  {badge.xp_bonus && (
                    <span className="font-black text-black text-[11px] bg-[#B8FF9F] px-2 py-0.5 rounded-[4px] border-2 border-black">
                      +{badge.xp_bonus} XP Bonus
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
