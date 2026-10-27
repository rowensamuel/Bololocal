export function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number; progress: number } {
  const levels = [
    { level: 1, title: 'Shuruat (Beginner)', minXp: 0, maxXp: 200 },
    { level: 2, title: 'Navashikhu (Explorer)', minXp: 200, maxXp: 600 },
    { level: 3, title: 'Bhashik (Conversationalist)', minXp: 600, maxXp: 1200 },
    { level: 4, title: 'Pragnya (Confident Speaker)', minXp: 1200, maxXp: 2500 },
    { level: 5, title: 'Praveen (Marathi Fluent)', minXp: 2500, maxXp: 5000 },
  ];

  const current = levels.find((l) => xp >= l.minXp && xp < l.maxXp) || levels[levels.length - 1];
  const range = current.maxXp - current.minXp;
  const currentProgress = Math.min(100, Math.max(0, Math.round(((xp - current.minXp) / range) * 100)));

  return {
    level: current.level,
    title: current.title,
    nextLevelXp: current.maxXp,
    progress: currentProgress,
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
