import { useState, useEffect } from 'react';
import { isMobileDevice } from '../../utils/device';

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(isMobileDevice);

  useEffect(() => {
    const check = () => setMobile(isMobileDevice());
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return mobile;
}
