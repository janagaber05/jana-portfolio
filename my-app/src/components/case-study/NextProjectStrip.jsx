import { useRef } from 'react';
import gsap from 'gsap';
import { getCoverImage } from '../../utils/projectTheme';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function NextProjectStrip({ next, nextCaseStudy, onNavigate }) {
  const rootRef = useRef(null);
  const wipeRef = useRef(null);
  if (!next) return null;

  const cover = getCoverImage(nextCaseStudy, next);
  const accent = next.accent || '#6D0101';

  const handleClick = (event) => {
    event.preventDefault();
    if (prefersReducedMotion()) {
      onNavigate(event, next.slug);
      return;
    }

    const wipe = wipeRef.current;
    const root = rootRef.current;
    if (!wipe || !root) {
      onNavigate(event, next.slug);
      return;
    }

    const rect = root.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    wipe.style.background = accent;
    gsap.fromTo(
      wipe,
      { clipPath: `circle(0% at ${x}% ${y}%)`, opacity: 1 },
      {
        clipPath: `circle(150% at ${x}% ${y}%)`,
        duration: 0.75,
        ease: 'power3.inOut',
        onComplete: () => onNavigate(event, next.slug),
      },
    );
  };

  return (
    <a
      href={`/work/${next.slug}`}
      className="cs-next"
      ref={rootRef}
      data-cursor="view"
      data-cursor-label="next"
      onClick={handleClick}
      onMouseMove={(event) => {
        if (prefersReducedMotion()) return;
        const preview = rootRef.current?.querySelector('.cs-next-preview');
        if (!preview) return;
        const rect = rootRef.current.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        gsap.to(preview, { x: px * 28, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      }}
    >
      <div
        className="cs-next-preview"
        style={{
          backgroundColor: accent,
          backgroundImage: cover ? `url(${cover})` : undefined,
        }}
        aria-hidden="true"
      />
      <div className="cs-next-content">
        <p className="cs-next-label">Next project</p>
        <p className="cs-next-title">{next.title}</p>
      </div>
      <div className="cs-next-wipe" ref={wipeRef} aria-hidden="true" />
    </a>
  );
}
