import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function parseWords(text) {
  return String(text || '')
    .split(/\s*[·•|]\s*/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function TapeTrack({ words, className }) {
  const chunk = (
    <span className="fx-tape-chunk">
      {words.map((word, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`${word}-${index}`}>
          {word}
          <span className="fx-tape-spin" aria-hidden="true"> ✺ </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`fx-tape ${className}`} aria-hidden="true">
      <div className="fx-tape-track">
        {chunk}
        {chunk}
      </div>
    </div>
  );
}

export default function VelocityTapes({
  text = '',
  altText = '',
  from = '#141214',
  to = '#F2F1EE',
  dark = false,
}) {
  const rootRef = useRef(null);
  const wordsA = useMemo(() => parseWords(text), [text]);
  const wordsB = useMemo(
    () => parseWords(altText || text),
    [altText, text],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const tracks = Array.from(root.querySelectorAll('.fx-tape-track'));
    if (tracks.length < 2) return undefined;

    if (prefersReducedMotion()) {
      return undefined;
    }

    let visible = false;
    let offsetA = 0;
    let offsetB = 0;
    let velocity = 0;
    let skew = 0;
    let lastScroll = window.scrollY || 0;
    let dir = 1;

    const onScroll = () => {
      const y = window.scrollY || 0;
      const dy = y - lastScroll;
      lastScroll = y;
      if (Math.abs(dy) < 0.1) return;
      dir = dy > 0 ? 1 : -1;
      velocity += dy * 0.35;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = () => {
      if (!visible) {
        velocity *= 0.9;
        return;
      }

      const dt = Math.min(2.2, Math.max(0.5, gsap.ticker.deltaRatio()));
      velocity *= 0.9;
      const speed = (1.1 + Math.min(Math.abs(velocity), 28)) * dir * dt;

      offsetA -= speed;
      offsetB += speed * 0.92;

      const halfA = tracks[0].scrollWidth / 2 || 1;
      const halfB = tracks[1].scrollWidth / 2 || 1;
      if (offsetA <= -halfA) offsetA += halfA;
      if (offsetA > 0) offsetA -= halfA;
      if (offsetB <= -halfB) offsetB += halfB;
      if (offsetB > 0) offsetB -= halfB;

      const targetSkew = Math.max(-14, Math.min(14, -velocity * 0.35));
      skew += (targetSkew - skew) * 0.12;

      tracks[0].style.transform = `translate3d(${offsetA.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      tracks[1].style.transform = `translate3d(${offsetB.toFixed(2)}px,0,0) skewX(${(-skew).toFixed(2)}deg)`;
    };

    gsap.ticker.add(tick);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '200px 0px', threshold: 0 },
    );
    io.observe(root);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
      tracks.forEach((track) => {
        track.style.transform = '';
      });
    };
  }, []);

  if (!wordsA.length) return null;

  return (
    <div
      ref={rootRef}
      className={`fx-tapes${dark ? ' is-dark' : ''}`}
      style={{ '--fx-tape-from': from, '--fx-tape-to': to }}
      aria-hidden="true"
    >
      <div className="fx-tapes-split">
        <span />
        <span />
      </div>
      <TapeTrack words={wordsA} className="fx-tape-a" />
      <TapeTrack words={wordsB.length ? wordsB : wordsA} className="fx-tape-b" />
    </div>
  );
}
