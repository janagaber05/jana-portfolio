import { useEffect } from 'react';
import { hasRevealed, REVEAL_EVENT } from './Preloader';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=?!/<>✦';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function scrambleWord(wordEl) {
  if (!wordEl || wordEl.dataset.scrambling === '1') return;
  const chars = Array.from(wordEl.querySelectorAll('.fx-role-char'));
  if (!chars.length) return;

  wordEl.dataset.scrambling = '1';
  let settled = 0;

  chars.forEach((charEl, index) => {
    const finalChar = charEl.dataset.final || charEl.textContent || '';
    let ticks = 0;
    const maxTicks = 6 + index;

    const id = window.setInterval(() => {
      ticks += 1;
      if (ticks >= maxTicks) {
        charEl.textContent = finalChar;
        window.clearInterval(id);
        settled += 1;
        if (settled >= chars.length) {
          wordEl.dataset.scrambling = '0';
        }
        return;
      }
      charEl.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }, 55);
  });
}

/** Split role text into per-letter tokens (spaces → nbsp). */
export function splitRoleChars(text) {
  return Array.from(String(text || '')).map((char) => (char === ' ' ? '\u00A0' : char));
}

/**
 * Scramble-in + letter magnet for hero role words.
 * @param {React.RefObject} rolesRef
 * @param {string} rolesKey dependency so CMS role swaps re-bind
 */
export function useKineticRoles(rolesRef, rolesKey) {
  useEffect(() => {
    const root = rolesRef.current;
    if (!root) return undefined;

    const words = Array.from(root.querySelectorAll('[data-role]'));
    if (!words.length) return undefined;

    const reduced = prefersReducedMotion();
    const fine = isFinePointer();
    const timeouts = [];

    const runScramble = () => {
      if (reduced) return;
      words.forEach((word, i) => {
        timeouts.push(window.setTimeout(() => scrambleWord(word), i * 140));
      });
    };

    const onReveal = () => runScramble();
    if (hasRevealed()) {
      runScramble();
    } else {
      window.addEventListener(REVEAL_EVENT, onReveal, { once: true });
    }

    const onEnter = (event) => {
      if (reduced) return;
      scrambleWord(event.currentTarget);
    };

    words.forEach((word) => {
      word.addEventListener('mouseenter', onEnter);
    });

    if (reduced || !fine) {
      return () => {
        window.removeEventListener(REVEAL_EVENT, onReveal);
        timeouts.forEach((id) => window.clearTimeout(id));
        words.forEach((word) => word.removeEventListener('mouseenter', onEnter));
      };
    }

    const letters = Array.from(root.querySelectorAll('.fx-role-char'));
    const centers = new Map();
    const state = new Map();
    let raf = 0;
    let visible = true;
    let mx = 0;
    let my = 0;
    let hasPointer = false;
    let fontsCancelled = false;
    const hero = root.closest('section') || root;

    const measure = () => {
      letters.forEach((el) => {
        const rect = el.getBoundingClientRect();
        centers.set(el, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        if (!state.has(el)) {
          state.set(el, {
            y: 0, sy: 1, skew: 0, white: 0,
          });
        }
      });
    };

    const onMove = (event) => {
      mx = event.clientX;
      my = event.clientY;
      hasPointer = true;
    };

    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      if (!visible || !hasPointer) return;

      const radius = Math.max(220, window.innerWidth * 0.18);

      letters.forEach((el) => {
        const c = centers.get(el);
        const s = state.get(el);
        if (!c || !s) return;

        const dx = mx - c.x;
        const dy = my - c.y;
        const d = Math.hypot(dx, dy) || 1;
        const falloff = Math.max(0, 1 - d / radius) ** 2;
        const targetY = (dy / d) * 26 * falloff;
        const targetSy = 1 + 0.42 * falloff;
        const targetSkew = (dx / d) * 14 * falloff;
        const targetWhite = falloff;

        s.y += (targetY - s.y) * 0.14;
        s.sy += (targetSy - s.sy) * 0.14;
        s.skew += (targetSkew - s.skew) * 0.14;
        s.white += (targetWhite - s.white) * 0.14;

        el.style.transform = `translateY(${s.y.toFixed(2)}px) scaleY(${s.sy.toFixed(3)}) skewX(${s.skew.toFixed(2)}deg)`;
        if (s.white > 0.02) {
          const mix = Math.round(s.white * 255);
          el.style.color = `rgb(${mix},${mix},${mix})`;
          el.style.textShadow = `0 0 ${8 + s.white * 18}px rgba(255,213,251,${(0.25 + s.white * 0.55).toFixed(2)})`;
        } else {
          el.style.color = '';
          el.style.textShadow = '';
        }
      });
    };

    measure();
    raf = window.requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', measure, { passive: true });

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!fontsCancelled) measure();
      });
    }

    const remesureId = window.setTimeout(measure, 1200);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.05 },
    );
    io.observe(hero);

    return () => {
      fontsCancelled = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(remesureId);
      timeouts.forEach((id) => window.clearTimeout(id));
      window.removeEventListener(REVEAL_EVENT, onReveal);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', measure);
      words.forEach((word) => word.removeEventListener('mouseenter', onEnter));
      io.disconnect();
      letters.forEach((el) => {
        el.style.transform = '';
        el.style.color = '';
        el.style.textShadow = '';
      });
    };
  }, [rolesRef, rolesKey]);
}
