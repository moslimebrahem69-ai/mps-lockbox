import { useEffect } from "react";

export const AUTO_LOCK_KEY = "mps.autolock.minutes";
export const DEFAULT_AUTO_LOCK_MINUTES = 5;

export function readAutoLockMinutes(): number {
  if (typeof window === "undefined") return DEFAULT_AUTO_LOCK_MINUTES;
  const raw = window.localStorage.getItem(AUTO_LOCK_KEY);
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_AUTO_LOCK_MINUTES;
}

/** Locks the vault after a period of no interaction. */
export function useAutoLock(onLock: () => void) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onLock, readAutoLockMinutes() * 60_000);
    };

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
      "focus",
    ];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [onLock]);
}
