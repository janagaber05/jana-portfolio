import { useState } from 'react';

export default function InsightFlipCard({ number, title, text }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`cs-flip${flipped ? ' is-flipped' : ''}`}
      aria-pressed={flipped}
      onClick={() => setFlipped((v) => !v)}
      onMouseEnter={() => {
        if (window.matchMedia('(hover: hover)').matches) setFlipped(true);
      }}
      onMouseLeave={() => {
        if (window.matchMedia('(hover: hover)').matches) setFlipped(false);
      }}
    >
      <span className="cs-flip-inner">
        <span className="cs-flip-face cs-flip-front">
          <span className="cs-flip-number">{number}</span>
          <span className="cs-flip-title">{title}</span>
          <span className="cs-flip-hint">Tap to read</span>
        </span>
        <span className="cs-flip-face cs-flip-back">
          <span className="cs-flip-back-text">{text}</span>
        </span>
      </span>
    </button>
  );
}
