export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
}

export function getDevicePixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, 2);
}

export function getPerformanceTier(): 'low' | 'medium' | 'high' {
  if (!isMobileDevice()) return 'high';
  // Rough heuristic based on device memory and cores
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  const memory = nav.deviceMemory || 4;
  const cores = nav.hardwareConcurrency || 4;
  if (memory <= 2 || cores <= 2) return 'low';
  if (memory <= 4 || cores <= 4) return 'medium';
  return 'high';
}
