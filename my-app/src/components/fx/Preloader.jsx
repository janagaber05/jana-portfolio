import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useSiteContent } from '../../context/SiteContentContext';
import defaultContent from '../../data/defaultContent.json';
import { shouldSkipHomeIntro } from '../../utils/visitState';

export const REVEAL_EVENT = 'jana:reveal';

let revealed = false;

export function hasRevealed() {
  return revealed;
}

function markRevealed() {
  if (revealed) return;
  revealed = true;
  window.dispatchEvent(new CustomEvent(REVEAL_EVENT));
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldShowPreloader() {
  if (typeof window === 'undefined') return false;
  if (prefersReducedMotion()) {
    markRevealed();
    return false;
  }
  if (shouldSkipHomeIntro()) {
    markRevealed();
    return false;
  }
  return true;
}

export default function Preloader() {
  const { content } = useSiteContent();
  const [active] = useState(shouldShowPreloader);
  const [gone, setGone] = useState(!active);
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const wipeRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const lettersRef = useRef([]);

  const loadLabel = content?.hero?.loadLabel || defaultContent.hero?.loadLabel || 'Load Jana';

  useLayoutEffect(() => {
    if (!active) return undefined;

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.classList.add('fx-scroll-lock');
    document.documentElement.style.overflow = 'hidden';
    window.__janaLenis?.stop?.();

    return () => {
      document.documentElement.classList.remove('fx-scroll-lock');
      document.documentElement.style.overflow = prevOverflow;
      window.__janaLenis?.start?.();
    };
  }, [active]);

  useEffect(() => {
    if (!active || !rootRef.current) return undefined;

    const letters = lettersRef.current.filter(Boolean);
    const counter = { value: 0 };
    const fillProxy = { fill: 100 };

    const ctx = gsap.context(() => {
      gsap.set(letters, { y: 40, opacity: 0 });
      gsap.set(wipeRef.current, { scaleY: 0, transformOrigin: '50% 100%' });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          setGone(true);
        },
      });

      tl.to(letters, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.07,
      }, 0.1);

      tl.to(counter, {
        value: 100,
        duration: 1.6,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (countRef.current) {
            countRef.current.textContent = String(Math.round(counter.value)).padStart(3, '0');
          }
        },
      }, 0.35);

      tl.to(fillProxy, {
        fill: 0,
        duration: 1.6,
        ease: 'power1.inOut',
        onUpdate: () => {
          letters.forEach((el) => {
            el.style.setProperty('--fill', `${fillProxy.fill}%`);
          });
        },
      }, 0.35);

      tl.to(wipeRef.current, {
        scaleY: 1,
        duration: 0.55,
        ease: 'power2.inOut',
      }, '+=0.05');

      tl.to(wipeRef.current, {
        scaleY: 0,
        transformOrigin: '50% 0%',
        duration: 0.45,
        ease: 'power2.inOut',
        onStart: () => {
          markRevealed();
          window.__janaLenis?.start?.();
          document.documentElement.classList.remove('fx-scroll-lock');
          document.documentElement.style.overflow = '';
        },
      });

      tl.to(topRef.current, {
        yPercent: -101,
        duration: 1,
        ease: 'expo.inOut',
      }, '-=0.05');

      tl.to(bottomRef.current, {
        yPercent: 101,
        duration: 1,
        ease: 'expo.inOut',
      }, '<');
    }, rootRef);

    return () => {
      ctx.revert();
      window.__janaLenis?.start?.();
      document.documentElement.classList.remove('fx-scroll-lock');
      document.documentElement.style.overflow = '';
      if (!revealed) markRevealed();
    };
  }, [active]);

  if (gone) return null;

  const chars = ['J', 'A', 'N', 'A'];

  return (
    <div className="fx-preloader" ref={rootRef} aria-hidden="true">
      <div className="fx-preloader-half fx-preloader-half-top" ref={topRef} />
      <div className="fx-preloader-half fx-preloader-half-bottom" ref={bottomRef} />
      <div className="fx-preloader-wipe" ref={wipeRef} />
      <div className="fx-preloader-word">
        {chars.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="fx-preloader-letter"
            data-char={char}
            ref={(node) => {
              lettersRef.current[index] = node;
            }}
            style={{ '--fill': '100%' }}
          >
            {char}
          </span>
        ))}
      </div>
      <div className="fx-preloader-meta">
        <span>{loadLabel}</span>
        <span className="fx-preloader-count" ref={countRef}>000</span>
      </div>
    </div>
  );
}
