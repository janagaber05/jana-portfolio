import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useScrollAnimations(enabled = true) {
  const initRef = useRef(false);

  useEffect(() => {
    if (!enabled || initRef.current) return undefined;

    const workSection = document.querySelector('#work');
    const inner = document.querySelector('#work .inner');
    if (!workSection || !inner) return undefined;

    initRef.current = true;

    const ctx = gsap.context(() => {
      const getScrollDistance = () => Math.max(inner.scrollWidth - window.innerWidth, 0);

      gsap.to(inner, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          id: 'work-horizontal',
          trigger: workSection,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          end: () => `+=${getScrollDistance()}`,
          onEnter: () => {
            gsap.set(workSection, { clearProps: 'transform' });
          },
        },
      });

      gsap.utils.toArray('.fade-section').forEach((el) => {
        if (el.id === 'about') return;

        gsap.from(el, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        });
      });
    }, workSection);

    const refreshId = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(refreshId);
      initRef.current = false;
      ctx.revert();
    };
  }, [enabled]);
}
