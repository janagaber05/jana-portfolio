import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  clearHomeScrollRestore,
  saveHomeScrollPosition,
  shouldSkipHomeIntro,
} from '../utils/visitState';
import { cleanupScrollEffects, scrollToTop } from '../utils/scrollCleanup';

export default function RouteChangeHandler({ children }) {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const previousHashRef = useRef(location.hash);

  useEffect(() => {
    const pathChanged = previousPathRef.current !== location.pathname;
    const hashChanged = previousHashRef.current !== location.hash;

    if (!pathChanged && !hashChanged) return;

    const leavingHome = previousPathRef.current === '/';
    const enteringHome = location.pathname === '/';

    if (leavingHome && pathChanged) {
      saveHomeScrollPosition(window.scrollY);
    }

    cleanupScrollEffects();

    if (enteringHome && location.hash) {
      clearHomeScrollRestore();
    } else if (!(enteringHome && shouldSkipHomeIntro())) {
      scrollToTop();
    }

    previousPathRef.current = location.pathname;
    previousHashRef.current = location.hash;
  }, [location.pathname, location.hash]);

  return children;
}
