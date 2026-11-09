import { useEffect, useRef } from 'react';
import { parseMetricValue } from '../../utils/projectTheme';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isStatMetric(value, parsed) {
  const text = String(value || '').trim();
  if (!text) return false;
  if (parsed.number == null || Number.isNaN(parsed.number)) return false;
  // Big number treatment only for short stats like "89%", "4.7", "-40%"
  return text.length <= 10;
}

export default function MetricCountUp({ value, label, className = '' }) {
  const valueRef = useRef(null);
  const parsed = parseMetricValue(value);
  const asStat = isStatMetric(value, parsed);

  useEffect(() => {
    const el = valueRef.current;
    if (!el) return undefined;

    if (prefersReducedMotion() || !asStat) {
      el.textContent = parsed.display;
      return undefined;
    }

    let raf = 0;
    let started = false;
    const decimals = String(parsed.number).includes('.')
      ? String(parsed.number).split('.')[1].length
      : 0;
    const duration = 1100;

    const run = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) ** 3;
        const current = parsed.number * eased;
        el.textContent = `${parsed.prefix}${current.toFixed(decimals)}${parsed.suffix}`;
        if (t < 1) raf = window.requestAnimationFrame(tick);
        else el.textContent = parsed.display;
      };
      raf = window.requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        run();
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);

    return () => {
      window.cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [asStat, parsed.display, parsed.number, parsed.prefix, parsed.suffix]);

  return (
    <article className={className}>
      <p
        className={`cs-metric-value${asStat ? '' : ' is-text'}`}
        ref={valueRef}
      >
        {parsed.display}
      </p>
      {label ? <p className="cs-metric-label">{label}</p> : null}
    </article>
  );
}
