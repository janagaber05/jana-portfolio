import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function parseWords(text) {
  return String(text || '')
    .split(/\s*[·•|,/]+\s*/)
    .map((w) => w.trim())
    .filter(Boolean);
}

/** Repeat words until the marquee is wide enough to scroll seamlessly. */
function fillWords(words, minCount = 8) {
  const base = words.length ? words : ['DESIGN', 'RESEARCH', 'PROTOTYPE'];
  const out = [];
  while (out.length < minCount) {
    out.push(...base);
  }
  return out;
}

function TapeTrack({ words, className }) {
  const filled = fillWords(words);
  const chunk = (
    <span className="fx-tape-chunk">
      {filled.map((word, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`${word}-${index}`} className="fx-tape-item">
          {word}
          <span className="fx-tape-spin" aria-hidden="true">✺</span>
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

  const tapeAWords = wordsA;
  const tapeBWords = wordsB.length ? wordsB : wordsA;

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
      const speed = (1.05 + Math.min(Math.abs(velocity), 24)) * dir * dt;

      offsetA -= speed;
      offsetB += speed * 0.9;

      const halfA = tracks[0].scrollWidth / 2 || 1;
      const halfB = tracks[1].scrollWidth / 2 || 1;
      if (offsetA <= -halfA) offsetA += halfA;
      if (offsetA > 0) offsetA -= halfA;
      if (offsetB <= -halfB) offsetB += halfB;
      if (offsetB > 0) offsetB -= halfB;

      tracks[0].style.transform = `translate3d(${offsetA.toFixed(2)}px,0,0)`;
      tracks[1].style.transform = `translate3d(${offsetB.toFixed(2)}px,0,0)`;
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
  }, [tapeAWords, tapeBWords]);

  if (!tapeAWords.length && !tapeBWords.length) return null;

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
      <TapeTrack words={tapeAWords.length ? tapeAWords : tapeBWords} className="fx-tape-a" />
      <TapeTrack words={tapeBWords.length ? tapeBWords : tapeAWords} className="fx-tape-b" />
    </div>
  );
}
