import { useLayoutEffect, useRef } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import logo from './assets/logo/Asset 3.png';

gsap.registerPlugin(ScrollTrigger);

/** SplitText-style char split (SplitText is Club GSAP — same animation output) */
function splitIntoChars(element) {
  const text = element.textContent;
  element.textContent = '';
  const chars = [];
  [...text].forEach((char) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00A0' : char;
    element.appendChild(span);
    chars.push(span);
  });
  return chars;
}

const heroStyles = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  -webkit-font-smoothing: antialiased;
  background: #6D0101;
  color: #FCF4F0;
  overflow-x: hidden;
}
#root { min-height: 100vh; }

/* ── Loading gate ── */
.loading-gate {
  position: fixed; inset: 0; z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  background: #1A1A1A;
}
.loading-gate__text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 80px;
  font-weight: 500;
  color: #FCF4F0;
  line-height: 1;
  opacity: 0;
}

/* ── Nav ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; padding: 1.5rem 2.5rem;
  background: transparent;
}
.nav__logo img { height: 32px; width: auto; display: block; }
.nav__links { display: flex; gap: 2rem; justify-self: center; }
.nav__links a {
  color: #FCF4F0; text-decoration: none; font-size: 0.72rem;
  letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.85;
}
.nav__links a:hover { opacity: 1; }
.nav__right { display: flex; align-items: center; gap: 2rem; justify-self: end; }
.nav__cta {
  color: #FCF4F0; text-decoration: none; font-size: 0.72rem;
  letter-spacing: 0.1em; text-transform: lowercase;
}
.nav__socials { display: flex; gap: 1.25rem; }
.nav__socials a {
  color: #FCF4F0; text-decoration: none; font-size: 0.72rem;
  letter-spacing: 0.08em; text-transform: lowercase; opacity: 0.7;
}

/* ── Hero ── */
.hero {
  position: relative;
  height: 100vh;
  min-height: 600px;
  background: #6D0101;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6rem 2.5rem 4rem;
}
.hero__content { max-width: 100%; }
.hero__headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(64px, 12vw, 140px);
  font-weight: 500;
  line-height: 0.95;
  color: #FCF4F0;
  letter-spacing: -0.02em;
}
.hero__line {
  display: block;
  overflow: hidden;
}
.hero__line .char {
  display: inline-block;
  will-change: transform, opacity;
}
.hero__subline {
  margin-top: 1.75rem;
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #FFD5FB;
  opacity: 0;
}
.hero__scroll-cue {
  position: absolute;
  bottom: 2.5rem;
  left: 2.5rem;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #FCF4F0;
  opacity: 0;
  will-change: transform, opacity;
}

.scroll-spacer { height: 100vh; background: #6D0101; }

@media (max-width: 768px) {
  .nav { padding: 1rem 1.25rem; grid-template-columns: 1fr auto; }
  .nav__links, .nav__socials { display: none; }
  .hero { padding: 5rem 1.25rem 4rem; }
  .hero__scroll-cue { left: 1.25rem; bottom: 1.5rem; }
}
`;

function Hero() {
  const loadingGateRef = useRef(null);
  const loadingTextRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const sublineRef = useRef(null);
  const scrollCueRef = useRef(null);
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const loadingGate = loadingGateRef.current;
    const loadingText = loadingTextRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const subline = sublineRef.current;
    const scrollCue = scrollCueRef.current;
    const nav = navRef.current;

    if (!loadingGate || !loadingText || !line1 || !line2 || !subline || !scrollCue || !nav) return;

    const line1Chars = splitIntoChars(line1);
    const line2Chars = splitIntoChars(line2);

    gsap.set(line1Chars, { y: 80, opacity: 0 });
    gsap.set(line2Chars, { y: 80, opacity: 0 });
    gsap.set(subline, { opacity: 0, y: 20 });
    gsap.set(scrollCue, { opacity: 0, y: 0 });

    const tl = gsap.timeline();

    // 1. Loading gate
    tl.fromTo(loadingText, { opacity: 0 }, { opacity: 1, duration: 0.6 })
      .to(loadingGate, {
        opacity: 0,
        duration: 0.6,
        delay: 1,
        onComplete: () => {
          loadingGate.style.display = 'none';
        },
      })
      // 2. Hero text reveal
      .addLabel('heroStart')
      .to(line1Chars, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.04,
        ease: 'power3.out',
      })
      .to(
        line2Chars,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.04,
          ease: 'power3.out',
        },
        'heroStart+=0.2',
      )
      // 3. Subline fade in
      .fromTo(
        subline,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        'heroStart+=1.2',
      )
      // 4. Scroll cue
      .to(scrollCue, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 'heroStart+=1.9')
      .to(scrollCue, {
        y: 8,
        duration: 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

    const navTrigger = ScrollTrigger.create({
      start: '80px top',
      onEnter: () => {
        gsap.to(nav, { backgroundColor: '#1A1A1A', duration: 0.3 });
      },
      onLeaveBack: () => {
        gsap.to(nav, { backgroundColor: 'transparent', duration: 0.3 });
      },
    });

    return () => {
      tl.kill();
      navTrigger.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="site">
      <style>{heroStyles}</style>

      <div className="loading-gate" ref={loadingGateRef}>
        <span className="loading-gate__text" ref={loadingTextRef}>JG</span>
      </div>

      <header className="nav" ref={navRef}>
        <a href="/" className="nav__logo" aria-label="Home">
          <img src={logo} alt="Jana" />
        </a>
        <nav className="nav__links" aria-label="Main">
          <a href="#home">Home</a>
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="nav__right">
          <a href="mailto:janagaber2910@gmail.com" className="nav__cta">get in touch</a>
          <div className="nav__socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">linkedin</a>
          </div>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero__content">
          <h1 className="hero__headline">
            <span className="hero__line" ref={line1Ref}>JANA</span>
            <span className="hero__line" ref={line2Ref}>DESIGNER.</span>
          </h1>
          <p className="hero__subline" ref={sublineRef}>UX · UI · GRAPHIC · CAIRO</p>
        </div>
        <div className="hero__scroll-cue" ref={scrollCueRef}>scroll ↓</div>
      </section>

      <div className="scroll-spacer" aria-hidden="true" />
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <Hero /> },
]);

export default router;
