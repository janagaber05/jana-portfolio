import { useEffect, useRef } from 'react';

const COLORS = ['#ffd5fb', '#e0306b', '#6d0101'];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export default function InkTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (prefersReducedMotion() || !isFinePointer()) {
      canvas.style.display = 'none';
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const parent = canvas.parentElement;
    const specks = [];
    let raf = 0;
    let visible = true;
    let lastX = 0;
    let lastY = 0;
    let hasLast = false;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth || 1;
      height = parent.clientHeight || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spray = (x, y, speed) => {
      const count = Math.min(10, 2 + Math.floor(speed / 8));
      for (let i = 0; i < count; i += 1) {
        if (specks.length >= 900) specks.shift();
        const drip = Math.random() < 0.04;
        specks.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          r: 0.6 + Math.random() * (1.2 + Math.min(speed / 40, 2.5)),
          life: 1,
          decay: 0.006 + Math.random() * 0.012,
          vx: (Math.random() - 0.5) * 0.6,
          vy: drip ? 0.4 + Math.random() * 1.2 : (Math.random() - 0.5) * 0.4,
          color: COLORS[(Math.random() * COLORS.length) | 0],
        });
      }
    };

    const onMove = (event) => {
      if (!visible) return;
      const rect = parent.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (!hasLast) {
        lastX = x;
        lastY = y;
        hasLast = true;
        return;
      }
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / 6));
      for (let i = 1; i <= steps; i += 1) {
        const t = i / steps;
        spray(lastX + dx * t, lastY + dy * t, dist);
      }
      lastX = x;
      lastY = y;
    };

    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = specks.length - 1; i >= 0; i -= 1) {
        const s = specks[i];
        s.life -= s.decay;
        if (s.life <= 0) {
          specks.splice(i, 1);
          continue;
        }
        s.x += s.vx;
        s.y += s.vy;
        ctx.globalAlpha = Math.max(0, s.life) * 0.85;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();
    raf = window.requestAnimationFrame(tick);
    parent.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (!visible) hasLast = false;
      },
      { threshold: 0.05 },
    );
    io.observe(parent);

    return () => {
      window.cancelAnimationFrame(raf);
      parent.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  return <canvas className="fx-ink" ref={canvasRef} aria-hidden="true" />;
}
