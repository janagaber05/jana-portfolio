import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import heroImage from '../assets/jana hero.png';
import heroAnimated from '../assets/jana_animated.png';
import logo from '../assets/logo/Asset 3.png';
import { useSiteContent } from '../context/SiteContentContext';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { scrollToTop } from '../utils/scrollCleanup';
import { filterNavLinks, scrollToNavTarget } from '../utils/navScroll';
import {
  consumeHomeScrollRestore,
  markHomeIntroPlayed,
  shouldSkipHomeIntro,
} from '../utils/visitState';
import styles from './HeroSection.module.css';

gsap.registerPlugin(ScrollTrigger);

const LOAD_STEPS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

export default function HeroSection() {
  const { content } = useSiteContent();
  const hero = content?.hero;
  const gateRef = useRef(null);
  const loadPctRef = useRef(null);
  const navRef = useRef(null);
  const imageWrapRef = useRef(null);
  const imageStackRef = useRef(null);
  const blendOverlayRef = useRef(null);
  const darkVignetteRef = useRef(null);
  const hoverRevealRef = useRef(null);
  const portraitBaseRef = useRef(null);
  const portraitHoverRef = useRef(null);
  const isPortraitHoveringRef = useRef(false);
  const autoRevealTweenRef = useRef(null);
  const signatureRef = useRef(null);
  const nextBlockRef = useRef(null);
  const lockBtnRef = useRef(null);
  const scrollCueRef = useRef(null);
  const marqueeRef = useRef(null);
  const heroRef = useRef(null);
  const pageBackdropRef = useRef(null);
  const logoOverlayRef = useRef(null);
  const scrollStripsRef = useRef(null);
  const stripTrackOneRef = useRef(null);
  const stripTrackTwoRef = useRef(null);
  const isScrollShrinkingRef = useRef(false);
  const resumeHoverRef = useRef(null);
  const wasScrolledRef = useRef(false);

  const [scrollLocked, setScrollLocked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenisRef = useRef(null);
  const introPlayedRef = useRef(false);
  const scrollAnimInitRef = useRef(false);
  const hoverInitRef = useRef(false);

  const skipIntro = shouldSkipHomeIntro();

  const applySkipIntroState = useCallback(() => {
    const gate = gateRef.current;
    const imageWrap = imageWrapRef.current;
    const marquee = marqueeRef.current;
    const signature = signatureRef.current;
    const nextBlock = nextBlockRef.current;
    const lockBtn = lockBtnRef.current;
    const scrollCue = scrollCueRef.current;

    if (gate) gate.style.display = 'none';
    if (imageWrap) {
      gsap.set(imageWrap, { xPercent: -50, yPercent: -50, opacity: 1, y: 0 });
    }
    gsap.set([marquee, signature, nextBlock, lockBtn, scrollCue].filter(Boolean), { opacity: 1 });
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleNavClick = useCallback((event, href) => {
    const raw = (href || '').trim();
    if (!raw || raw.startsWith('mailto:') || raw.startsWith('http')) return;

    event.preventDefault();
    closeMenu();

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToNavTarget(raw, lenisRef.current);
        ScrollTrigger.refresh();
      });
    });
  }, [closeMenu]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu]);

  useLayoutEffect(() => {
    if (!hero || !skipIntro) return;
    applySkipIntroState();
  }, [hero, skipIntro, applySkipIntroState]);

  const heroImg = resolveMediaUrl(hero?.heroImage, heroImage);
  const heroAnim = resolveMediaUrl(hero?.heroAnimated, heroAnimated);
  const logoSrc = resolveMediaUrl(hero?.logo, logo);
  const stripRepeat = hero?.stripRepeat || 10;

  useEffect(() => {
    [heroImg, heroAnim].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [heroImg, heroAnim]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)) });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener('refresh', onRefresh);

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const restoreY = shouldSkipHomeIntro() ? consumeHomeScrollRestore() : 0;
    if (restoreY > 0) {
      window.scrollTo({ top: restoreY, left: 0, behavior: 'instant' });
      lenis.scrollTo(restoreY, { immediate: true });
    } else {
      scrollToTop();
      lenis.scrollTo(0, { immediate: true });
    }
    ScrollTrigger.refresh();
    if (restoreY > 0) {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    return () => {
      cancelAnimationFrame(rafId);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!lenisRef.current) return;
    const shouldLock = scrollLocked || menuOpen;
    if (shouldLock) {
      lenisRef.current.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenisRef.current.start();
      document.body.style.overflow = '';
    }
  }, [scrollLocked, menuOpen]);

  // Cursor spotlight + automatic idle reveal on portrait
  useEffect(() => {
    if (!hero || hoverInitRef.current) return;

    const wrap = imageWrapRef.current;
    const reveal = hoverRevealRef.current;
    if (!wrap || !reveal) return;

    hoverInitRef.current = true;

    const REVEAL_RADIUS = 110;
    const mask = { x: 0, y: 0, r: 0 };

    const applyMask = () => {
      const gradient = `radial-gradient(circle ${mask.r}px at ${mask.x}px ${mask.y}px, #000 0%, #000 68%, transparent 100%)`;
      reveal.style.webkitMaskImage = gradient;
      reveal.style.maskImage = gradient;
    };

    const getLocalMaskPoint = (e) => {
      const rect = reveal.getBoundingClientRect();
      const scaleX = reveal.offsetWidth / rect.width || 1;
      const scaleY = reveal.offsetHeight / rect.height || 1;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const stopAutoReveal = () => {
      autoRevealTweenRef.current?.kill();
      autoRevealTweenRef.current = null;
    };

    const startAutoReveal = () => {
      if (isPortraitHoveringRef.current) return;
      stopAutoReveal();

      const w = reveal.offsetWidth;
      const h = reveal.offsetHeight;
      if (!w || !h) return;

      autoRevealTweenRef.current = gsap.timeline({ repeat: -1, repeatDelay: 1.5 })
        .set(mask, { r: 105, x: w * 0.5, y: h * 0.52, onUpdate: applyMask })
        .to(mask, {
          x: w * 0.44,
          y: h * 0.24,
          duration: 2.4,
          ease: 'sine.inOut',
          onUpdate: applyMask,
        })
        .to(mask, {
          x: w * 0.56,
          y: h * 0.27,
          duration: 2.1,
          ease: 'sine.inOut',
          onUpdate: applyMask,
        })
        .to(mask, {
          x: w * 0.5,
          y: h * 0.42,
          duration: 2,
          ease: 'sine.inOut',
          onUpdate: applyMask,
        })
        .to(mask, {
          x: w * 0.47,
          y: h * 0.6,
          duration: 2.2,
          ease: 'sine.inOut',
          onUpdate: applyMask,
        })
        .to(mask, {
          r: 0,
          duration: 0.7,
          ease: 'power2.in',
          onUpdate: applyMask,
        });
    };

    const onEnter = (e) => {
      if (isScrollShrinkingRef.current) return;
      isPortraitHoveringRef.current = true;
      stopAutoReveal();
      gsap.killTweensOf(mask);

      const point = getLocalMaskPoint(e);
      mask.x = point.x;
      mask.y = point.y;
      applyMask();

      gsap.to(mask, {
        r: REVEAL_RADIUS,
        duration: 0.35,
        ease: 'power2.out',
        onUpdate: applyMask,
      });
    };

    const onMove = (e) => {
      if (isScrollShrinkingRef.current || !isPortraitHoveringRef.current) return;
      const point = getLocalMaskPoint(e);
      gsap.to(mask, {
        x: point.x,
        y: point.y,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto',
        onUpdate: applyMask,
      });
    };

    const onLeave = () => {
      isPortraitHoveringRef.current = false;
      gsap.to(mask, {
        r: 0,
        duration: 0.35,
        ease: 'power2.in',
        onUpdate: applyMask,
        onComplete: startAutoReveal,
      });
    };

    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);

    const autoStartTimer = setTimeout(startAutoReveal, 3200);
    resumeHoverRef.current = startAutoReveal;

    return () => {
      hoverInitRef.current = false;
      clearTimeout(autoStartTimer);
      resumeHoverRef.current = null;
      stopAutoReveal();
      gsap.killTweensOf(mask);
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
    };
  }, [hero]);

  useEffect(() => {
    if (!hero || skipIntro) return undefined;
    if (introPlayedRef.current) return undefined;

    const ctx = gsap.context(() => {
      const gate = gateRef.current;
      const loadPct = loadPctRef.current;
      const nav = navRef.current;
      const heroEl = heroRef.current;
      const imageWrap = imageWrapRef.current;
      const marquee = marqueeRef.current;
      const signature = signatureRef.current;
      const nextBlock = nextBlockRef.current;
      const lockBtn = lockBtnRef.current;
      const scrollCue = scrollCueRef.current;

      if (!gate || !loadPct || !nav || !imageWrap || !heroEl) return;

      introPlayedRef.current = true;

      gsap.set(imageWrap, { xPercent: -50, yPercent: -50 });
      gsap.set(loadPct, { textContent: '0%' });
      gsap.set(imageWrap, { opacity: 0, y: 40 });
      gsap.set([marquee, signature, nextBlock, lockBtn, scrollCue], { opacity: 0 });

      const tl = gsap.timeline();
      const pctObj = { val: 0 };

      // Step 1 — Load gate (like "Load Norris")
      tl.to(pctObj, {
        val: 100,
        duration: 1.6,
        ease: 'none',
        onUpdate: () => {
          const step = LOAD_STEPS.reduce((prev, curr) =>
            (pctObj.val >= curr ? curr : prev), 0);
          loadPct.textContent = `${step}%`;
        },
      })
        .to(gate, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            gate.style.display = 'none';
            markHomeIntroPlayed();
          },
        })
        // Portrait rises in
        .to(
          imageWrap,
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          '-=0.1',
        )
        // UI chrome
        .to(marquee, { opacity: 1, duration: 0.5 }, '-=0.3')
        .to(signature, { opacity: 1, duration: 0.5 }, '-=0.4')
        .to(nextBlock, { opacity: 1, duration: 0.5 }, '-=0.4')
        .to(lockBtn, { opacity: 1, duration: 0.5 }, '-=0.4')
        .to(scrollCue, { opacity: 1, duration: 0.5 }, '-=0.4')
        // Scroll cue bounce
        .to(
          scrollCue,
          { y: 8, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 },
          '-=0.2',
        );

      // Nav scroll
      ScrollTrigger.create({
        trigger: document.body,
        start: '80px top',
        onEnter: () => {
          gsap.to(nav, {
            backgroundColor: 'rgba(252, 244, 240, 0.92)',
            boxShadow: '0 1px 0 rgba(26, 26, 26, 0.08)',
            duration: 0.3,
          });
        },
        onLeaveBack: () => {
          gsap.to(nav, {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            duration: 0.3,
          });
        },
      });

    });

    return () => ctx.revert();
  }, [hero, skipIntro]);

  useEffect(() => {
    if (!hero || scrollAnimInitRef.current) return undefined;

    scrollAnimInitRef.current = true;

    const heroEl = heroRef.current;
    const imageWrap = imageWrapRef.current;
    const hoverReveal = hoverRevealRef.current;
    const marquee = marqueeRef.current;
    const signature = signatureRef.current;
    const nextBlock = nextBlockRef.current;
    const lockBtn = lockBtnRef.current;
    const scrollCue = scrollCueRef.current;
    const scrollStrips = scrollStripsRef.current;
    const stripTrackOne = stripTrackOneRef.current;
    const stripTrackTwo = stripTrackTwoRef.current;
    const nav = navRef.current;
    const pageBackdrop = pageBackdropRef.current;
    const blendOverlay = blendOverlayRef.current;
    const darkVignette = darkVignetteRef.current;
    const imageStack = imageStackRef.current;
    const logoOverlay = logoOverlayRef.current;
    const photoStrip = document.querySelector('#work');
    const portfolioMain = document.querySelector('main');
    if (!heroEl) return;

    const uiChrome = [signature, nextBlock, lockBtn, scrollCue].filter(Boolean);

    const ctx = gsap.context(() => {
      if (logoOverlay) {
        gsap.set(logoOverlay, { xPercent: -50, yPercent: -50, opacity: 0, scale: 1.05 });
      }

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: '+=100%',
          pin: heroEl,
          scrub: 1.5,
          invalidateOnRefresh: true,
          onLeave: () => {
            if (nav) nav.classList.remove(styles.navOnDark);
            if (photoStrip) gsap.set(photoStrip, { clearProps: 'transform' });
          },
          onLeaveBack: () => {
            if (photoStrip) gsap.set(photoStrip, { clearProps: 'transform' });
          },
          onUpdate: (self) => {
            const progress = self.progress;
            isScrollShrinkingRef.current = progress > 0.04;

            if (imageWrap) {
              imageWrap.style.pointerEvents = progress > 0.08 ? 'none' : 'auto';
            }

            if (nav) {
              nav.classList.toggle(styles.navOnDark, progress > 0.12);
            }

            const stripsPlaying = progress > 0.34;
            if (stripTrackOne) {
              stripTrackOne.style.animationPlayState = stripsPlaying ? 'running' : 'paused';
            }
            if (stripTrackTwo) {
              stripTrackTwo.style.animationPlayState = stripsPlaying ? 'running' : 'paused';
            }

            if (progress > 0.04) {
              wasScrolledRef.current = true;
              autoRevealTweenRef.current?.kill();
              autoRevealTweenRef.current = null;
            } else if (wasScrolledRef.current && progress < 0.02) {
              wasScrolledRef.current = false;
              if (hoverReveal) gsap.set(hoverReveal, { opacity: 1 });
              resumeHoverRef.current?.();
            }
          },
        },
      });

      scrollTl.fromTo(
        heroEl,
        { scale: 1, borderRadius: '0px', backgroundColor: '#FCF4F0' },
        { scale: 0.78, borderRadius: '28px', backgroundColor: '#1A1A1A', ease: 'none' },
        0,
      );

      scrollTl.fromTo(
        document.body,
        { backgroundColor: '#FCF4F0' },
        { backgroundColor: '#1A1A1A', ease: 'none' },
        0,
      );

      scrollTl.fromTo(
        document.documentElement,
        { backgroundColor: '#FCF4F0' },
        { backgroundColor: '#1A1A1A', ease: 'none' },
        0,
      );

      if (pageBackdrop) {
        scrollTl.fromTo(
          pageBackdrop,
          { backgroundColor: '#FCF4F0' },
          { backgroundColor: '#1A1A1A', ease: 'none' },
          0,
        );
      }

      if (portfolioMain) {
        scrollTl.fromTo(
          portfolioMain,
          { backgroundColor: '#FCF4F0' },
          { backgroundColor: '#1A1A1A', ease: 'none' },
          0,
        );
      }

      if (photoStrip) {
        scrollTl.fromTo(
          photoStrip,
          { backgroundColor: '#FCF4F0' },
          { backgroundColor: '#1A1A1A', ease: 'none' },
          0,
        );
      }

      if (hoverReveal) {
        scrollTl.fromTo(hoverReveal, { opacity: 1 }, { opacity: 0, ease: 'none' }, 0.08);
      }

      if (marquee) {
        scrollTl.fromTo(marquee, { opacity: 1 }, { opacity: 0, ease: 'none' }, 0.1);
      }

      if (uiChrome.length) {
        scrollTl.fromTo(uiChrome, { opacity: 1 }, { opacity: 0, ease: 'none' }, 0.1);
      }

      if (blendOverlay) {
        scrollTl.fromTo(blendOverlay, { opacity: 1 }, { opacity: 0, ease: 'none' }, 0.12);
      }

      if (darkVignette) {
        scrollTl.fromTo(darkVignette, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0.18);
      }

      if (imageStack) {
        scrollTl.fromTo(imageStack, { opacity: 1 }, { opacity: 0.38, ease: 'none' }, 0.2);
      }

      if (logoOverlay) {
        scrollTl.fromTo(
          logoOverlay,
          { opacity: 0, scale: 1.05, xPercent: -50, yPercent: -50 },
          { opacity: 1, scale: 1.22, ease: 'none' },
          0.35,
        );
      }

      if (scrollStrips) {
        scrollTl.fromTo(
          scrollStrips,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, ease: 'none' },
          0.35,
        );
      }

      const setNavOverDark = (active) => {
        if (!nav) return;
        nav.classList.toggle(styles.navOnDark, active);
      };

      ['#contact'].forEach((selector) => {
        const section = document.querySelector(selector);
        if (!section) return;

        ScrollTrigger.create({
          trigger: section,
          start: 'top 72px',
          end: 'bottom 72px',
          onEnter: () => setNavOverDark(true),
          onLeave: () => setNavOverDark(false),
          onEnterBack: () => setNavOverDark(true),
          onLeaveBack: () => setNavOverDark(false),
        });
      });
    });

    ScrollTrigger.refresh();
    if (shouldSkipHomeIntro()) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        applySkipIntroState();
      });
    }

    return () => {
      scrollAnimInitRef.current = false;
      ctx.revert();
    };
  }, [hero, applySkipIntroState]);

  const onImagePointerDown = useCallback((e) => e.stopPropagation(), []);

  if (!hero) return null;

  const navLinks = filterNavLinks(hero.navLinks);

  return (
    <>
      <div className={styles.pageBackdrop} ref={pageBackdropRef} aria-hidden="true" />

      <div className={styles.loadingGate} ref={gateRef}>
        <p className={styles.loadLabel}>{hero.loadLabel}</p>
        <span className={styles.loadPct} ref={loadPctRef}>0%</span>
      </div>

      <header className={`${styles.siteHeader} ${menuOpen ? styles.siteHeaderMenuOpen : ''}`}>
        <nav className={`${styles.nav} ${menuOpen ? styles.navMenuOpen : ''}`} ref={navRef}>
          <a
            href="#home"
            className={styles.navLogo}
            aria-label="Home"
            onClick={(event) => handleNavClick(event, '#home')}
          >
            <img src={logoSrc} alt="Jana" />
          </a>
          <div className={styles.navLinks}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className={styles.navRight}>
            <a href={`mailto:${hero.email}`} className={styles.navCta}>
              {hero.navCta || 'get in touch'}
            </a>
            <div className={styles.navSocials}>
              {hero.navSocials.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
            <button
              type="button"
              className={`${styles.navBurger} ${menuOpen ? styles.navBurgerOpen : ''}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="site-mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
            </button>
          </div>
        </nav>

        <div
          id="site-mobile-menu"
          className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
          aria-hidden={!menuOpen}
        >
          <nav className={styles.mobileMenuNav} aria-label="Mobile">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href={`mailto:${hero.email}`}
            className={styles.mobileMenuCta}
            onClick={closeMenu}
          >
            {hero.navCta || 'get in touch'}
          </a>
          <div className={styles.mobileMenuSocials}>
            {hero.navSocials.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <section className={styles.hero} id="home" ref={heroRef}>
        <div className={styles.heroBgText} ref={marqueeRef} aria-hidden="true">
          <p className={styles.heroBgLine}>{hero.bgLineOne}</p>
          <p className={styles.heroBgLineWide}>{hero.bgLineTwo}</p>
        </div>

        <div className={styles.scrollStrips} ref={scrollStripsRef} aria-hidden="true">
          <div className={styles.scrollStrip}>
            <div
              className={`${styles.stripTrack} ${styles.stripTrackLeft} ${styles.stripOne}`}
              ref={stripTrackOneRef}
            >
              {Array.from({ length: stripRepeat }).map((_, i) => (
                <span key={`s1-${i}`}>{hero.stripLineOne}</span>
              ))}
            </div>
          </div>
          <div className={styles.scrollStrip}>
            <div
              className={`${styles.stripTrack} ${styles.stripTrackRight} ${styles.stripTwo}`}
              ref={stripTrackTwoRef}
            >
              {Array.from({ length: stripRepeat }).map((_, i) => (
                <span key={`s2-${i}`}>{hero.stripLineTwo}</span>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`${styles.imageWrap} ${skipIntro ? styles.imageWrapVisible : ''}`}
          ref={imageWrapRef}
          onPointerDown={onImagePointerDown}
        >
          <div className={styles.imageStack} ref={imageStackRef}>
            <img
              ref={portraitBaseRef}
              className={`${styles.portrait} ${styles.portraitBase}`}
              src={heroImg}
              alt="Jana"
              draggable={false}
            />
            <div className={styles.hoverReveal} ref={hoverRevealRef}>
              <img
                ref={portraitHoverRef}
                className={styles.portraitHover}
                src={heroAnim}
                alt=""
                draggable={false}
                aria-hidden="true"
              />
            </div>
            <div className={styles.blendOverlay} ref={blendOverlayRef} aria-hidden="true" />
            <div className={styles.darkVignette} ref={darkVignetteRef} aria-hidden="true" />
          </div>
        </div>

        <img
          ref={logoOverlayRef}
          className={styles.logoOverlay}
          src={logoSrc}
          alt=""
          draggable={false}
          aria-hidden="true"
        />

        <svg className={styles.signature} ref={signatureRef} viewBox="0 0 200 80" aria-hidden="true">
          <path d="M10,55 C40,20 70,70 100,35 C120,15 150,60 190,25" />
        </svg>

        <div className={styles.nextBlock} ref={nextBlockRef}>
          <span className={styles.nextLabel}>{hero.nextLabel}</span>
          <span className={styles.nextValue}>{hero.nextValue}</span>
        </div>

        <button
          type="button"
          className={styles.lockBtn}
          ref={lockBtnRef}
          onClick={() => setScrollLocked((v) => !v)}
        >
          {scrollLocked ? hero.lockBtnLocked : hero.lockBtnUnlocked}
        </button>

        <div className={styles.scrollCue} ref={scrollCueRef}>
          <span className={styles.scrollText}>{hero.scrollCue}</span>
          <span className={styles.scrollLine} />
        </div>
      </section>
    </>
  );
}
