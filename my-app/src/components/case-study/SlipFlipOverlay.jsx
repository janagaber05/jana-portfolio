import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { consumeProjectTransition } from '../fx/transitionStore';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function SlipFlipOverlay({ slug, title }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const data = consumeProjectTransition(slug);
    const el = overlayRef.current;
    if (!data?.rect || !el || prefersReducedMotion()) {
      if (el) el.style.display = 'none';
      return undefined;
    }

    const { rect, color, title: slipTitle } = data;
    gsap.set(el, {
      display: 'grid',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      background: color,
      borderRadius: 18,
    });

    const label = el.querySelector('.cs-flip-label');
    if (label) label.textContent = slipTitle || title || '';

    const tl = gsap.timeline({
      defaults: { ease: 'expo.inOut' },
      onComplete: () => {
        gsap.set(el, { display: 'none' });
      },
    });

    tl.to(el, {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0,
      duration: 0.8,
    }, 0);

    if (label) {
      tl.to(label, {
        scale: 1.8,
        y: -window.innerHeight * 0.12,
        duration: 0.8,
      }, 0);
      tl.to(label, { opacity: 0, duration: 0.25 }, 0.7);
    }

    tl.to(el, { opacity: 0, duration: 0.35 }, 0.75);

    return () => {
      tl.kill();
    };
  }, [slug, title]);

  return (
    <div className="cs-slip-flip" ref={overlayRef} aria-hidden="true">
      <span className="cs-flip-label" />
    </div>
  );
}
