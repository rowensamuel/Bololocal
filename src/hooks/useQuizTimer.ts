import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseQuizTimerOptions {
  initialSeconds: number;
  autoStart?: boolean;
  onTimeout?: () => void;
  onTick?: (remaining: number) => void;
}

export interface UseQuizTimerReturn {
  remainingSeconds: number;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isExpired: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newSeconds?: number) => void;
  stop: () => void;
  formattedRemaining: string;
  formattedElapsed: string;
}

export const formatTimerSeconds = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Authoritative, drift-free quiz timer using real wall-clock timestamps (Date.now()).
 * Completely immune to Chromium background tab throttling, interval jitter, and double-ticks.
 */
export const useQuizTimer = ({
  initialSeconds,
  autoStart = true,
  onTimeout,
  onTick,
}: UseQuizTimerOptions): UseQuizTimerReturn => {
  const [totalDuration, setTotalDuration] = useState<number>(Math.max(1, initialSeconds));
  const [remainingSeconds, setRemainingSeconds] = useState<number>(Math.max(0, initialSeconds));
  const [isRunning, setIsRunning] = useState<boolean>(autoStart && initialSeconds > 0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(initialSeconds <= 0);

  // References for interval and timestamp calculation
  const timerIntervalRef = useRef<number | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const pausedRemainingMsRef = useRef<number | null>(null);

  // Callback references
  const onTimeoutRef = useRef(onTimeout);
  const onTickRef = useRef(onTick);
  const hasTimedOutRef = useRef<boolean>(false);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Clean interval helper
  const clearTimerInterval = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Stop timer completely
  const stop = useCallback(() => {
    clearTimerInterval();
    targetEndTimeRef.current = null;
    pausedRemainingMsRef.current = null;
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimerInterval]);

  // Pause timer (saves remaining milliseconds)
  const pause = useCallback(() => {
    if (isRunning && !isPaused && !isExpired && targetEndTimeRef.current !== null) {
      clearTimerInterval();
      const remainingMs = Math.max(0, targetEndTimeRef.current - Date.now());
      pausedRemainingMsRef.current = remainingMs;
      setRemainingSeconds(Math.ceil(remainingMs / 1000));
      setIsPaused(true);
      setIsRunning(false);
    }
  }, [isRunning, isPaused, isExpired, clearTimerInterval]);

  // Resume paused timer
  const resume = useCallback(() => {
    if (isPaused && !isExpired) {
      const remainingMs = pausedRemainingMsRef.current ?? remainingSeconds * 1000;
      if (remainingMs > 0) {
        targetEndTimeRef.current = Date.now() + remainingMs;
        pausedRemainingMsRef.current = null;
        setIsPaused(false);
        setIsRunning(true);
      }
    }
  }, [isPaused, isExpired, remainingSeconds]);

  // Start fresh timer
  const start = useCallback(() => {
    if (!isExpired && remainingSeconds > 0) {
      clearTimerInterval();
      targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
      pausedRemainingMsRef.current = null;
      setIsPaused(false);
      setIsRunning(true);
      hasTimedOutRef.current = false;
    }
  }, [isExpired, remainingSeconds, clearTimerInterval]);

  // Reset timer to full duration
  const reset = useCallback(
    (newSeconds?: number) => {
      clearTimerInterval();
      const targetSec = Math.max(0, newSeconds !== undefined ? newSeconds : totalDuration);
      if (newSeconds !== undefined) {
        setTotalDuration(Math.max(1, newSeconds));
      }
      setRemainingSeconds(targetSec);
      setIsExpired(targetSec <= 0);
      setIsPaused(false);
      hasTimedOutRef.current = false;
      pausedRemainingMsRef.current = null;

      if (autoStart && targetSec > 0) {
        targetEndTimeRef.current = Date.now() + targetSec * 1000;
        setIsRunning(true);
      } else {
        targetEndTimeRef.current = null;
        setIsRunning(false);
      }
    },
    [clearTimerInterval, totalDuration, autoStart]
  );

  // Synchronize when initialSeconds prop updates asynchronously (e.g. quiz loads)
  useEffect(() => {
    const sec = Math.max(0, initialSeconds);
    setTotalDuration(Math.max(1, sec));
    setRemainingSeconds(sec);
    setIsExpired(sec <= 0);
    hasTimedOutRef.current = false;
    pausedRemainingMsRef.current = null;

    if (autoStart && sec > 0) {
      targetEndTimeRef.current = Date.now() + sec * 1000;
      setIsRunning(true);
      setIsPaused(false);
    } else {
      targetEndTimeRef.current = null;
      setIsRunning(false);
    }
  }, [initialSeconds, autoStart]);

  // Authoritative interval loop
  useEffect(() => {
    if (!isRunning || isPaused || isExpired) {
      clearTimerInterval();
      return;
    }

    // Ensure targetEndTimeRef is set
    if (targetEndTimeRef.current === null) {
      targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    }

    const checkTime = () => {
      if (targetEndTimeRef.current === null) return;
      const remainingMs = targetEndTimeRef.current - Date.now();
      const nextRemaining = Math.max(0, Math.ceil(remainingMs / 1000));

      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0) {
        clearTimerInterval();
        targetEndTimeRef.current = null;
        setIsRunning(false);
        setIsExpired(true);

        if (!hasTimedOutRef.current) {
          hasTimedOutRef.current = true;
          // Defer timeout execution cleanly to next tick
          setTimeout(() => {
            onTimeoutRef.current?.();
          }, 0);
        }
      } else {
        onTickRef.current?.(nextRemaining);
      }
    };

    // Run checkTime every 250ms for high responsiveness, avoiding tick drift
    timerIntervalRef.current = window.setInterval(checkTime, 250);

    return () => {
      clearTimerInterval();
    };
  }, [isRunning, isPaused, isExpired, clearTimerInterval, remainingSeconds]);

  const elapsedSeconds = Math.max(0, totalDuration - remainingSeconds);

  return {
    remainingSeconds,
    elapsedSeconds,
    isRunning,
    isPaused,
    isExpired,
    start,
    pause,
    resume,
    reset,
    stop,
    formattedRemaining: formatTimerSeconds(remainingSeconds),
    formattedElapsed: formatTimerSeconds(elapsedSeconds),
  };
};
