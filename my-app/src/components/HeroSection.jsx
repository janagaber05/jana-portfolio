import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import heroImage from '../assets/jana hero.png';
import logo from '../assets/logo/Asset 3.png';
import defaultContent from '../data/defaultContent.json';
import { useSiteContent } from '../context/SiteContentContext';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { filterNavLinks, scrollToNavTarget } from '../utils/navScroll';
import {
  markHomeIntroPlayed,
  peekHomeSection,
  saveHomeScrollPosition,
  shouldSkipHomeIntro,
} from '../utils/visitState';
import LanyardBadge from './ui/lanyard-badge';
import { IdCardBack, IdCardFront } from './ui/IdCardFaces';
import styles from './HeroSection.module.css';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_ROLES = ['DESIGNER', 'RESEARCHER', 'PROTOTYPER', 'CREATOR'];

export default function HeroSection() {
  const { content } = useSiteContent();
  const hero = content?.hero || defaultContent.hero;

  const navRef = useRef(null);
  const heroRef = useRef(null);
  const rolesRef = useRef(null);
  const taglineRef = useRef(null);
  const lenisRef = useRef(null);
  const motionInitRef = useRef(false);

  const [menuOpen, setMenuOpen] = useState(false);

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

  const heroImg = resolveMediaUrl(hero?.heroImage, heroImage);
  const logoSrc = resolveMediaUrl(hero?.logo, logo);
  const roles = useMemo(() => {
    const next = (hero?.roles?.length ? hero.roles : DEFAULT_ROLES)
      .map((role) => String(role || '').trim())
      .filter(Boolean)
      .slice(0, 4);
    while (next.length < 4) next.push(DEFAULT_ROLES[next.length]);
    return next;
  }, [hero?.roles]);

  const badgeName = hero?.badgeName || 'JANA';
  const badgeTitle = hero?.badgeTitle || 'UX/UI Designer';
  const badgeTagline = hero?.badgeTagline || 'Designing apps people love';

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)) });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', () => {
      saveHomeScrollPosition(window.scrollY);
      ScrollTrigger.update();
    });

    markHomeIntroPlayed();

    if (shouldSkipHomeIntro()) {
      requestAnimationFrame(() => {
        const targetId = (window.location.hash || '').replace(/^#/, '') || peekHomeSection();
        if (targetId && targetId !== 'home' && document.getElementById(targetId)) {
          scrollToNavTarget(`#${targetId}`, lenis, { immediate: true });
        }
      });
    }

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const heroEl = heroRef.current;
    const roleNodes = rolesRef.current?.querySelectorAll('[data-role]');
    const tagline = taglineRef.current;
    if (!heroEl || motionInitRef.current) return undefined;
    motionInitRef.current = true;

    const skip = shouldSkipHomeIntro();
    const ctx = gsap.context(() => {
      if (skip) {
        if (roleNodes?.length) gsap.set(roleNodes, { opacity: 1, y: 0 });
        if (tagline) gsap.set(tagline, { opacity: 1, y: 0 });
        return;
      }

      if (roleNodes?.length) gsap.set(roleNodes, { opacity: 0, y: 18 });
      if (tagline) gsap.set(tagline, { opacity: 0, y: 12 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (roleNodes?.length) {
        tl.to(roleNodes, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
        }, 0.35);
      }
      if (tagline) {
        tl.to(tagline, {
          opacity: 1,
          y: 0,
          duration: 0.55,
        }, 0.65);
      }
    }, heroEl);

    const nav = navRef.current;
    const setNavOverDark = (active) => {
      if (!nav) return;
      nav.classList.toggle(styles.navOnDark, active);
    };

    const triggers = ['#contact'].map((selector) => {
      const section = document.querySelector(selector);
      if (!section) return null;
      return ScrollTrigger.create({
        trigger: section,
        start: 'top 72px',
        end: 'bottom 72px',
        onEnter: () => setNavOverDark(true),
        onLeave: () => setNavOverDark(false),
        onEnterBack: () => setNavOverDark(true),
        onLeaveBack: () => setNavOverDark(false),
      });
    }).filter(Boolean);

    ScrollTrigger.refresh();

    return () => {
      motionInitRef.current = false;
      triggers.forEach((t) => t.kill());
      ctx.revert();
    };
  }, [hero]);

  const navLinks = filterNavLinks(hero.navLinks);
  const [roleTL, roleTR, roleBL, roleBR] = roles;

  return (
    <>
      <div className={styles.pageBackdrop} aria-hidden="true" />

      <header className={`${styles.siteHeader} ${menuOpen ? styles.siteHeaderMenuOpen : ''}`}>
        <nav className={`${styles.nav} ${styles.navHeroDark} ${menuOpen ? styles.navMenuOpen : ''}`} ref={navRef}>
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
              {(hero.navSocials || []).map((link) => (
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
            {(hero.navSocials || []).map((link) => (
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

      <section className={styles.hero} id="home" ref={heroRef} aria-label="Introduction">
        <div className={styles.roles} ref={rolesRef} aria-hidden="true">
          <span className={`${styles.role} ${styles.roleTL}`} data-role>{roleTL}</span>
          <span className={`${styles.role} ${styles.roleTR}`} data-role>{roleTR}</span>
          <span className={`${styles.role} ${styles.roleBL}`} data-role>{roleBL}</span>
          <span className={`${styles.role} ${styles.roleBR}`} data-role>{roleBR}</span>
        </div>

        <div className={styles.lanyardStage}>
          <LanyardBadge
            height="100%"
            cardWidth={220}
            flipButton={false}
            name={badgeName}
            role={badgeTitle}
            title={badgeName}
            subtitle={badgeTitle}
            strapText="jana portfolio"
            strapLabel="JANA"
            strapColor="#6d0101"
            inkColor="#ffd5fb"
            cardColor="#fcf4f0"
            front={(
              <IdCardFront
                imageUrl={heroImg}
                name={badgeName}
                role={badgeTitle}
                roleLineTwo="Creator"
                availableLabel="Available for hire"
                barcodeLabel="10 2024"
              />
            )}
            back={(
              <IdCardBack
                title="What I do"
                quote={badgeTagline}
                handle="@jana"
                barcodeLabel="10 2024"
              />
            )}
            className={styles.lanyard}
          />
        </div>

        <p className={styles.tagline} ref={taglineRef}>
          {badgeTagline}
        </p>

        <div className={styles.scrollCue} aria-hidden="true">
          <span className={styles.scrollText}>{hero.scrollCue || 'scroll'}</span>
          <span className={styles.scrollLine} />
        </div>
      </section>
    </>
  );
}
