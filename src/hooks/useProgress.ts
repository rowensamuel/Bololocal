import { useState, useEffect } from 'react';
import { UserProgress, Badge } from '../types/progress';
import { progressService } from '../services/progressService';

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([progressService.getUserProgress(), progressService.getBadges()]).then(
      ([progData, badgeData]) => {
        setProgress(progData);
        setBadges(badgeData);
        setLoading(false);
      }
    );
  }, []);

  return { progress, badges, loading };
};
