import logo from '../assets/logo/Asset 3.png';
import ContactForm from './ContactForm';
import { useSiteContent } from '../context/SiteContentContext';
import { getAvailabilityLabel } from '../utils/publishFilters';
import { scrollToNavTarget } from '../utils/navScroll';
import { resolveMediaUrl } from '../utils/mediaUrl';
import styles from './ContactSection.module.css';

function FooterNavLink({ link }) {
  const handleClick = (event) => {
    if (!link.href?.startsWith('#')) return;
    event.preventDefault();
    scrollToNavTarget(link.href);
  };

  return (
    <a href={link.href} className={styles.footerLink} onClick={handleClick}>
      {link.label}
    </a>
  );
}

export default function ContactSection() {
  const { content } = useSiteContent();
  const contact = content?.contact;

  if (!contact) return null;

  const footerLogoSrc = resolveMediaUrl(contact.footerLogo, logo);
  const footerNav = contact.footerNav?.length ? contact.footerNav : [];
  const footerServices = contact.footerServices?.length ? contact.footerServices : [];

  const handleBackToTop = (event) => {
    event.preventDefault();
    scrollToNavTarget('#home');
  };

  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.marqueeWrap} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {Array.from({ length: contact.marqueeRepeat }).map((_, i) => (
            <span key={i}>{contact.marqueeText}</span>
          ))}
        </div>
      </div>

      <div className={styles.rings} aria-hidden="true">
        <span className={styles.ringOuter} />
        <span className={styles.ringInner} />
      </div>

      <div className={styles.contactInner}>
        <header className={styles.topRow}>
          <p className={styles.topLabel}>{contact.topLabel}</p>
          <span className={styles.availableBadge}>
            <span className={styles.pulseDot} aria-hidden="true" />
            {getAvailabilityLabel(content)}
          </span>
        </header>

        <div className={styles.middle}>
          <h2 className={styles.headline}>
            <span className={styles.headlineCream}>
              {contact.headlineLine1}
              <br />
              {contact.headlineLine2}
            </span>
            <span className={styles.headlineAccent}>{contact.headlineAccent}</span>
          </h2>

          <div className={styles.divider} aria-hidden="true" />

          <p className={styles.locationBadge}>
            <span className={styles.locationDot} aria-hidden="true" />
            {contact.location}
            <span className={styles.locationDot} aria-hidden="true" />
          </p>

          <a href={`mailto:${contact.email}`} className={styles.emailLink}>
            {contact.email}
          </a>

          <ContactForm contact={contact} />

          {contact.showResume && contact.resumeUrl ? (
            <a
              href={resolveMediaUrl(contact.resumeUrl)}
              className={styles.resumeLink}
              target="_blank"
              rel="noreferrer"
            >
              {contact.resumeLabel || 'Download CV'} ↓
            </a>
          ) : null}

          <nav className={styles.socialRow} aria-label="Social links">
            {contact.socials.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={styles.socialPill}
                target="_blank"
                rel="noreferrer"
              >
                <span className={styles.socialLabel}>{link.label}</span>
                <span className={styles.socialArrow} aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      <footer className={styles.bottomRow}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
            <img src={footerLogoSrc} alt="Jana" className={styles.footerLogo} />
            <p className={styles.footerTagline}>{contact.footerTagline}</p>
            <p className={styles.closingLine}>{contact.closingLine}</p>
          </div>

          {footerNav.length ? (
            <nav className={styles.footerColumn} aria-label="Footer navigation">
              <p className={styles.footerColumnTitle}>Explore</p>
              <ul className={styles.footerList}>
                {footerNav.map((link) => (
                  <li key={link.label}>
                    <FooterNavLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {footerServices.length ? (
            <div className={styles.footerColumn}>
              <p className={styles.footerColumnTitle}>Services</p>
              <ul className={styles.footerList}>
                {footerServices.map((service) => (
                  <li key={service}>
                    <span className={styles.footerMetaItem}>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={styles.footerColumn}>
            <p className={styles.footerColumnTitle}>Connect</p>
            <ul className={styles.footerList}>
              <li>
                <a href={`mailto:${contact.email}`} className={styles.footerLink}>
                  {contact.email}
                </a>
              </li>
              <li>
                <span className={styles.footerMetaItem}>{contact.location}</span>
              </li>
              {contact.footerNote ? (
                <li>
                  <span className={styles.footerMetaItem}>{contact.footerNote}</span>
                </li>
              ) : null}
            </ul>
            <button type="button" className={styles.backToTop} onClick={handleBackToTop}>
              Back to top ↑
            </button>
          </div>
          </div>

          <div className={styles.footerBar}>
            <p className={styles.copyright}>{contact.copyright}</p>
            <p className={styles.footerCredit}>Cairo, Egypt · Portfolio 2026</p>
          </div>
        </div>
      </footer>
    </section>
  );
}
