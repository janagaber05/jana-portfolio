import logo from '../assets/logo/Asset 3.png';
import { useSiteContent } from '../context/SiteContentContext';
import { resolveMediaUrl } from '../utils/mediaUrl';
import styles from './ContactSection.module.css';

export default function ContactSection() {
  const { content } = useSiteContent();
  const contact = content?.contact;

  if (!contact) return null;

  const footerLogoSrc = resolveMediaUrl(contact.footerLogo, logo);

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

      <header className={styles.topRow}>
        <p className={styles.topLabel}>{contact.topLabel}</p>
        <span className={styles.availableBadge}>
          <span className={styles.pulseDot} aria-hidden="true" />
          {contact.availableBadge}
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

      <footer className={styles.bottomRow}>
        <p className={styles.closingLine}>{contact.closingLine}</p>
        <div className={styles.bottomRight}>
          <img src={footerLogoSrc} alt="Jana" className={styles.footerLogo} />
          <p className={styles.copyright}>{contact.copyright}</p>
        </div>
      </footer>
    </section>
  );
}
