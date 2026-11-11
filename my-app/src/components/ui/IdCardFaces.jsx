import { useState } from 'react';
import styles from './IdCardFaces.module.css';

const DEFAULT_DOINGS = [
  {
    key: 'designer',
    name: 'Designer',
    blurb: 'UX research, flows & polished UI',
    iconClass: styles.roleIconDesigner,
    glyph: '◇',
  },
  {
    key: 'builder',
    name: 'Builder',
    blurb: 'Prototypes ready for handoff',
    iconClass: styles.roleIconBuilder,
    glyph: '</>',
  },
  {
    key: 'creator',
    name: 'Creator',
    blurb: 'Stories, systems & visuals',
    iconClass: styles.roleIconCreator,
    glyph: '▶',
  },
];

function PhotoArea({ imageUrl, monogram = 'JG' }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(imageUrl) && !failed;

  return (
    <div className={styles.photoWrap}>
      {showPhoto ? (
        <img
          className={styles.photo}
          src={imageUrl}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.photoFallback} aria-hidden="true">{monogram}</span>
      )}
    </div>
  );
}

export function IdCardFront({
  imageUrl,
  name = 'JANA',
  role = 'UX/UI Designer',
  roleLineTwo = '',
  availableLabel = 'Available for hire',
  barcodeLabel = '10 2024',
}) {
  const monogram = String(name || 'JG')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'JG';

  return (
    <div className={styles.face}>
      <div className={styles.content}>
        <PhotoArea imageUrl={imageUrl} monogram={monogram === 'J' ? 'JG' : monogram} />

        <div className={styles.frontBody}>
          <div className={styles.nameRow}>
            <h2 className={styles.personName}>{name}</h2>
            <span className={styles.signature} aria-hidden="true">{name}</span>
          </div>

          <p className={styles.personRole}>
            {role}
            {roleLineTwo ? (
              <>
                <br />
                {roleLineTwo.startsWith('+') ? roleLineTwo : `+ ${roleLineTwo}`}
              </>
            ) : null}
          </p>

          <div className={styles.frontFooter}>
            <span className={styles.availability}>
              <span className={styles.availDot} aria-hidden="true" />
              {availableLabel}
            </span>
            <div className={styles.barcodeBlock} aria-hidden="true">
              <span className={styles.barcode} />
              <span className={styles.barcodeLabel}>{barcodeLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IdCardBack({
  title = 'What I do',
  doings = DEFAULT_DOINGS,
  quote = 'Designing apps people love',
  handle = '@jana',
  barcodeLabel = '10 2024',
}) {
  return (
    <div className={styles.face}>
      <div className={styles.content}>
        <div className={styles.backBody}>
          <h3 className={styles.backTitle}>{title}</h3>

          <ul className={styles.roleList}>
            {doings.map((item) => (
              <li key={item.key || item.name} className={styles.roleItem}>
                <span className={`${styles.roleIcon} ${item.iconClass || ''}`} aria-hidden="true">
                  {item.glyph || '•'}
                </span>
                <div className={styles.roleCopy}>
                  <p className={styles.roleName}>{item.name}</p>
                  {item.blurb ? <p className={styles.roleBlurb}>{item.blurb}</p> : null}
                </div>
              </li>
            ))}
          </ul>

          <p className={styles.backQuote}>{quote}</p>

          <div className={styles.backFooter}>
            <span className={styles.handle}>{handle}</span>
            <div className={styles.barcodeBlock} aria-hidden="true">
              <span className={styles.barcode} />
              <span className={styles.barcodeLabel}>{barcodeLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
