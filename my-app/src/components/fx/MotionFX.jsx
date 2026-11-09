import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const MAGNET_SELECTORS = [
  'header nav a',
  'header .navCta, header [class*="navCta"]',
  'header [class*="navSocials"] a',
  '#contact a[href^="http"], #contact a[href^="mailto"]',
  '#work button',
  '#about a',
  '[data-magnetic]',
].join(',');

const CONFETTI = ['✦', '✺', '♥', '✿', '★', 'J', 'G'];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function isEditableTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

export default function MotionFX() {
  const progressRef = useRef(null);
  const grainRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const progress = progressRef.current;
    let raf = 0;
    let target = 0;

    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      target = Math.min(1, Math.max(0, window.scrollY / max));
    };

    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      if (!progress) return;
      progress.style.transform = `scaleX(${target})`;
    };

    onScroll();
    raf = window.requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      if (grainRef.current) grainRef.current.style.animation = 'none';
    }
  }, []);

  /* Custom cursor + magnet + tilt + contact spotlight (fine pointer only) */
  useEffect(() => {
    if (!isFinePointer()) return undefined;

    const reduced = prefersReducedMotion();
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    document.documentElement.classList.add('fx-cursor-on');

    const xToDot = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
    const yToDot = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
    const xToRing = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const yToRing = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

    let hidden = false;

    const setRingSize = (size) => {
      gsap.to(ring, {
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    const updateCursorState = (target) => {
      const viewEl = target?.closest?.('[data-cursor="view"]');
      const interactive = target?.closest?.('a, button, [role="button"]');

      ring.classList.remove('is-hover', 'is-view', 'is-down');
      ring.textContent = '';

      if (viewEl) {
        ring.classList.add('is-view');
        ring.textContent = viewEl.getAttribute('data-cursor-label') || 'view';
        setRingSize(96);
        return;
      }

      if (interactive) {
        ring.classList.add('is-hover');
        setRingSize(72);
        return;
      }

      setRingSize(44);
    };

    const onMove = (event) => {
      if (hidden) {
        hidden = false;
        dot.classList.remove('fx-cursor-hidden');
        ring.classList.remove('fx-cursor-hidden');
      }

      xToDot(event.clientX);
      yToDot(event.clientY);
      xToRing(event.clientX);
      yToRing(event.clientY);

      const under = document.elementFromPoint(event.clientX, event.clientY);
      updateCursorState(under);

      if (!reduced) {
        // Magnetic pull (delegated)
        const magnet = under?.closest?.(MAGNET_SELECTORS);
        if (
          magnet
          && !magnet.closest('[data-cursor]')
          && !magnet.closest('[data-no-magnet]')
        ) {
          const rect = magnet.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const strength = rect.width > 180 ? 0.18 : 0.38;
          gsap.to(magnet, {
            x: (event.clientX - cx) * strength,
            y: (event.clientY - cy) * strength,
            duration: 0.35,
            ease: 'power3.out',
            overwrite: 'auto',
          });
          magnet.dataset.fxMagnet = '1';
        }

        document.querySelectorAll('[data-fx-magnet="1"]').forEach((el) => {
          if (el === magnet) return;
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.35)',
            overwrite: 'auto',
            onComplete: () => {
              delete el.dataset.fxMagnet;
            },
          });
        });

        // 3D tilt
        const tilt = under?.closest?.('.about-photo, [data-tilt]');
        if (tilt) {
          const rect = tilt.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          gsap.to(tilt, {
            rotateX: -py * 14,
            rotateY: px * 14,
            transformPerspective: 900,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          tilt.dataset.fxTilt = '1';
        } else {
          document.querySelectorAll('[data-fx-tilt="1"]').forEach((el) => {
            gsap.to(el, {
              rotateX: 0,
              rotateY: 0,
              duration: 0.6,
              ease: 'power3.out',
              overwrite: 'auto',
              onComplete: () => {
                delete el.dataset.fxTilt;
              },
            });
          });
        }
      }

      // Contact spotlight
      const contact = document.getElementById('contact');
      if (contact) {
        const rect = contact.getBoundingClientRect();
        if (
          event.clientX >= rect.left
          && event.clientX <= rect.right
          && event.clientY >= rect.top
          && event.clientY <= rect.bottom
        ) {
          const mx = ((event.clientX - rect.left) / rect.width) * 100;
          const my = ((event.clientY - rect.top) / rect.height) * 100;
          contact.style.setProperty('--mx', `${mx.toFixed(2)}%`);
          contact.style.setProperty('--my', `${my.toFixed(2)}%`);
        }
      }
    };

    const onDown = () => {
      ring.classList.add('is-down');
      setRingSize(30);
    };

    const onUp = (event) => {
      ring.classList.remove('is-down');
      updateCursorState(document.elementFromPoint(event.clientX, event.clientY));
    };

    const onLeave = () => {
      hidden = true;
      dot.classList.add('fx-cursor-hidden');
      ring.classList.add('fx-cursor-hidden');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      document.documentElement.classList.remove('fx-cursor-on');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.querySelectorAll('[data-fx-magnet="1"], [data-fx-tilt="1"]').forEach((el) => {
        gsap.set(el, {
          x: 0, y: 0, rotateX: 0, rotateY: 0,
        });
        delete el.dataset.fxMagnet;
        delete el.dataset.fxTilt;
      });
    };
  }, []);

  /* Easter egg: type "jana" */
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let buffer = '';
    let toastTimer = 0;

    const burst = (x, y) => {
      for (let i = 0; i < 34; i += 1) {
        const node = document.createElement('span');
        node.className = 'fx-confetti';
        node.textContent = CONFETTI[(Math.random() * CONFETTI.length) | 0];
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        document.body.appendChild(node);
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 160;
        gsap.fromTo(
          node,
          { x: 0, y: 0, opacity: 1, scale: 0.4, rotation: Math.random() * 40 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 40,
            opacity: 0,
            scale: 1.1,
            duration: 0.9 + Math.random() * 0.5,
            ease: 'power2.out',
            onComplete: () => node.remove(),
          },
        );
      }

      const toast = document.createElement('div');
      toast.className = 'fx-toast';
      toast.textContent = 'you found me ✦ hi from jana';
      document.body.appendChild(toast);
      gsap.fromTo(toast, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35 });
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        gsap.to(toast, {
          opacity: 0,
          y: 8,
          duration: 0.3,
          onComplete: () => toast.remove(),
        });
      }, 2200);
    };

    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    const onMove = (event) => {
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const onKey = (event) => {
      if (isEditableTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (!key || key.length !== 1) return;
      buffer = (buffer + key.toLowerCase()).slice(-4);
      if (buffer === 'jana') {
        buffer = '';
        burst(lastX, lastY);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(toastTimer);
      document.querySelectorAll('.fx-confetti, .fx-toast').forEach((el) => el.remove());
    };
  }, []);

  return (
    <>
      <div className="fx-progress" ref={progressRef} aria-hidden="true" />
      <div className="fx-grain" ref={grainRef} aria-hidden="true" />
      <div className="fx-cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="fx-cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
