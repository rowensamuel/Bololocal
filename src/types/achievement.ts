export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'timed_quiz' | 'streak' | 'accuracy' | 'special';
  condition_type: string;
  condition_value: number | string;
  language_id?: string;
  is_active: boolean;
  xp_reward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}
