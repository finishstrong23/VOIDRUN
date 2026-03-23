import { useEffect } from 'react';

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    if (active && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(wl => {
        wakeLock = wl;
      }).catch(() => {});
    }
    return () => {
      wakeLock?.release();
    };
  }, [active]);
}
