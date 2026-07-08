import { useEffect, useRef, useCallback, useState } from 'react';

const STORAGE_KEY = 'idleTimeoutMinutes';
const DEFAULT_TIMEOUT_MINUTES = 5;

export function getIdleTimeoutMinutes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : DEFAULT_TIMEOUT_MINUTES;
}

export function setIdleTimeoutMinutes(minutes) {
  localStorage.setItem(STORAGE_KEY, String(minutes));
}

/**
 * useIdleTimeout
 * Tracks user inactivity and fires onLogout after the configured idle period.
 * Shows a 60-second (or 50% of timeout if < 2 min) warning countdown before logout.
 */
export default function useIdleTimeout(onLogout) {
  const [warningVisible, setWarningVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  // Use refs to avoid stale closures and prevent re-render loops
  const idleTimerRef   = useRef(null);
  const warnTimerRef   = useRef(null);
  const countdownRef   = useRef(null);
  const warningRef     = useRef(false); // mirrors warningVisible without causing re-renders
  const onLogoutRef    = useRef(onLogout);

  // Keep onLogout ref current without needing it as a dep
  useEffect(() => { onLogoutRef.current = onLogout; }, [onLogout]);

  const clearAll = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(warnTimerRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearAll();

    // Reset visible state only via ref check to avoid loop
    if (warningRef.current) {
      warningRef.current = false;
      setWarningVisible(false);
    }

    const totalMs = getIdleTimeoutMinutes() * 60 * 1000;

    // Warning fires 60 s before logout, but at most 50% into the timer
    const warnLeadMs  = Math.min(60_000, totalMs * 0.5);
    const warnAfterMs = totalMs - warnLeadMs;
    const warnSecs    = Math.round(warnLeadMs / 1000);

    // Schedule warning
    warnTimerRef.current = setTimeout(() => {
      warningRef.current = true;
      setWarningVisible(true);
      setSecondsLeft(warnSecs);

      countdownRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warnAfterMs);

    // Schedule logout
    idleTimerRef.current = setTimeout(() => {
      clearAll();
      warningRef.current = false;
      setWarningVisible(false);
      onLogoutRef.current();
    }, totalMs);
  }, [clearAll]); // intentionally omit onLogout — use ref

  // Called by "I'm Still Here" button
  const resetTimer = useCallback(() => {
    startTimers();
  }, [startTimers]);

  // Dismiss warning and reset
  const dismissWarning = useCallback(() => {
    warningRef.current = false;
    setWarningVisible(false);
    startTimers();
  }, [startTimers]);

  // Attach activity listeners — only depends on stable refs, never on warningVisible
  useEffect(() => {
    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      // Only reset if warning is NOT showing — don't interrupt the countdown
      if (!warningRef.current) {
        startTimers();
      }
    };

    EVENTS.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    startTimers(); // kick off on mount

    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, handleActivity));
      clearAll();
    };
  }, [startTimers, clearAll]); // stable — startTimers / clearAll are memoised with useCallback

  return { warningVisible, secondsLeft, resetTimer: dismissWarning };
}
