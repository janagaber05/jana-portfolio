import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function BeforeAfterSlider({ before, after, caption = '' }) {
  const [pos, setPos] = useState(50);
  const rootRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const el = rootRef.current;
    if (!el) return undefined;
    let done = false;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || done) return;
      done = true;
      setPos(35);
      window.setTimeout(() => setPos(50), 520);
      io.disconnect();
    }, { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const setFromClientX = (clientX) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, next)));
  };

  return (
    <div className="cs-ba" ref={rootRef}>
      <div
        className="cs-ba-frame"
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setFromClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          setFromClientX(event.clientX);
        }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
      >
        <img src={before} alt="Before" className="cs-ba-img" loading="lazy" decoding="async" />
        <div
          className="cs-ba-after"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img src={after} alt="After" className="cs-ba-img" loading="lazy" decoding="async" />
        </div>
        <div className="cs-ba-handle" style={{ left: `${pos}%` }} aria-hidden="true">
          <span />
        </div>
        <input
          className="cs-ba-range"
          type="range"
          min="4"
          max="96"
          value={pos}
          aria-valuemin={4}
          aria-valuemax={96}
          aria-valuenow={Math.round(pos)}
          aria-label="Before and after comparison"
          onChange={(event) => setPos(Number(event.target.value))}
        />
      </div>
      {caption ? <p className="cs-ba-caption">{caption}</p> : null}
    </div>
  );
}
