import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import styles from './WorkSpraySection.module.css';

const PortfolioGun = lazy(() => import('./PortfolioGun'));

const BRAND = {
  burgundy: '#6D0101',
  burgundyDeep: '#4A0000',
  burgundyMid: '#8A1212',
  pink: '#FFD5FB',
  pinkSoft: '#FFE8F9',
  cream: '#FCF4F0',
  blush: '#F4CFC2',
  ink: '#1A1A1A',
};

const SLIP_PALETTE = [
  BRAND.burgundy,
  BRAND.pink,
  BRAND.cream,
  BRAND.ink,
  BRAND.burgundyMid,
  BRAND.blush,
  BRAND.pinkSoft,
  BRAND.burgundyDeep,
];

const BURST_GAP_MS = 90;
const SPRAY_CHUNK = 6;
const SLIP_W = 200;
const SLIP_H = 118;
const FLIGHT_MS = 820;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function isLightColor(color) {
  const c = String(color || '').toUpperCase();
  const lights = [BRAND.cream, BRAND.pink, BRAND.pinkSoft, BRAND.blush]
    .map((x) => x.toUpperCase());
  if (lights.includes(c)) return true;
  if (c.startsWith('#') && c.length === 7) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 170;
  }
  return false;
}

function slipColorFor(project, index) {
  const accent = String(project?.accent || '').toUpperCase();
  const brandAccents = [BRAND.burgundy, BRAND.pink, BRAND.cream, BRAND.ink]
    .map((c) => c.toUpperCase());
  if (accent && brandAccents.includes(accent) && index % 2 === 0) {
    return project.accent;
  }
  return SLIP_PALETTE[index % SLIP_PALETTE.length];
}

function buildCatalog(projects) {
  return (projects || []).map((project, index) => ({
    id: `project-${project.slug || project.id || index}`,
    type: 'project',
    index: project.index || String(index + 1).padStart(2, '0'),
    title: project.title,
    tag: project.tag || 'Case study',
    year: project.year || '',
    role: project.role || '',
    client: project.client || '',
    blurb: project.summary || '',
    color: slipColorFor(project, index),
    href: `/work/${project.slug}`,
    description: project.summary || '',
    tags: [
      project.tag,
      project.year,
      ...(project.tools || []).slice(0, 2),
    ].filter(Boolean),
    thumbnail: project.thumbnail,
    project,
  }));
}

function makeSettle() {
  return {
    ox: rand(-3, 3),
    oy: rand(-3, 3),
    rot: rand(-3, 3),
  };
}

function waitFrames(n = 2) {
  return new Promise((resolve) => {
    let left = n;
    const step = () => {
      left -= 1;
      if (left <= 0) resolve();
      else window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  });
}

function SlipContent({ slip }) {
  return (
    <>
      <div className={styles.slipTop}>
        <span className={styles.slipIndex}>{slip.index}</span>
        {slip.year ? <span className={styles.slipYear}>{slip.year}</span> : null}
      </div>
      <span className={styles.slipTitle}>{slip.title}</span>
      <span className={styles.slipTag}>{slip.tag}</span>
      {(slip.role || slip.client) ? (
        <span className={styles.slipMeta}>
          {[slip.role, slip.client].filter(Boolean).join(' · ')}
        </span>
      ) : null}
      {slip.blurb ? (
        <span className={styles.slipBlurb}>{slip.blurb}</span>
      ) : null}
    </>
  );
}

function ProjectDrawer({ project, onClose }) {
  return (
    <AnimatePresence>
      {project ? (
        <>
          <motion.div
            key="scrim"
            className={styles.drawerScrim}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <button type="button" className={styles.drawerClose} onClick={onClose}>
              Close
            </button>
            <div className={styles.drawerCover}>
              {project.thumbnail ? (
                <img src={project.thumbnail} alt="" />
              ) : (
                <span style={{ background: project.color }}>{project.title}</span>
              )}
            </div>
            <h3 className={styles.drawerTitle}>{project.title}</h3>
            <p className={styles.drawerDesc}>
              {project.description || project.tag}
            </p>
            {project.tags?.length ? (
              <ul className={styles.drawerTags}>
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            <Link
              to={project.href || '/work'}
              className={styles.drawerCta}
              onClick={onClose}
            >
              View case study →
            </Link>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function FlyingSlip({ flight, slip, onLand }) {
  const done = useRef(false);
  const textColor = isLightColor(slip.color) ? BRAND.burgundy : BRAND.cream;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      onLand(flight.id);
    }, FLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [flight.id, onLand]);

  return (
    <motion.div
      className={`${styles.slip} ${styles.slipFlying}`}
      style={{ background: slip.color, color: textColor }}
      initial={{
        x: flight.fromX,
        y: flight.fromY,
        rotate: flight.spin,
        scale: 0.4,
        opacity: 1,
      }}
      animate={{
        x: flight.toX,
        y: flight.toY,
        rotate: flight.settle.rot,
        scale: 1,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        mass: 0.92,
      }}
    >
      <SlipContent slip={slip} />
    </motion.div>
  );
}

function LandedSlip({ slip, settle, onProjectClick }) {
  const textColor = isLightColor(slip.color) ? BRAND.burgundy : BRAND.cream;

  return (
    <motion.button
      type="button"
      className={styles.slip}
      style={{ background: slip.color, color: textColor }}
      initial={false}
      animate={{
        x: settle.ox,
        y: settle.oy,
        rotate: settle.rot,
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      whileHover={{
        y: settle.oy - 5,
        rotate: settle.rot * 0.15,
        scale: 1.03,
        zIndex: 12,
        boxShadow: '0 14px 28px rgba(17,17,17,0.22)',
      }}
      onClick={() => onProjectClick(slip)}
    >
      <SlipContent slip={slip} />
    </motion.button>
  );
}

export default function WorkSpraySection({
  projects = [],
  moreWorkLabel = 'View more',
}) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const pileRef = useRef(null);
  const muzzleRef = useRef(null);
  const sprayBusyRef = useRef(false);
  const autoFiredRef = useRef(false);
  const itemsRef = useRef([]);
  const flightsRef = useRef([]);
  const slotRefs = useRef(new Map());

  const catalog = useMemo(() => buildCatalog(projects), [projects]);
  const catalogMap = useMemo(
    () => new Map(catalog.map((item) => [item.id, item])),
    [catalog],
  );

  // { id, settle, status: 'reserved' | 'landed' }
  const [items, setItems] = useState([]);
  const [flights, setFlights] = useState([]);
  const [busy, setBusy] = useState(false);
  const [firing, setFiring] = useState(false);
  const [selected, setSelected] = useState(null);

  itemsRef.current = items;
  flightsRef.current = flights;

  const counterRaw = useMotionValue(0);
  const counterSpring = useSpring(counterRaw, { stiffness: 160, damping: 22 });
  const [counterDisplay, setCounterDisplay] = useState(0);

  useEffect(() => {
    const unsub = counterSpring.on('change', (v) => setCounterDisplay(Math.round(v)));
    return () => unsub();
  }, [counterSpring]);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const setSlotRef = useCallback((id) => (node) => {
    if (node) slotRefs.current.set(id, node);
    else slotRefs.current.delete(id);
  }, []);

  const onFlightLand = useCallback((id) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'landed' } : item,
      ),
    );
  }, []);

  /**
   * 1) Reserve real flex slots (ghosts) so layout is final
   * 2) Measure those slots + muzzle
   * 3) Stagger flights from muzzle → measured slot
   * 4) Reveal landed card in the same slot (no snap)
   */
  const launchBatch = useCallback(async (ids) => {
    if (!ids.length) return;

    const reserved = ids.map((id) => ({
      id,
      settle: makeSettle(),
      status: 'reserved',
    }));

    setItems((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const next = reserved.filter((r) => !existing.has(r.id));
      return [...prev, ...next];
    });

    counterRaw.set(counterRaw.get() + ids.length);

    if (reducedMotion) {
      setItems((prev) =>
        prev.map((item) =>
          ids.includes(item.id) ? { ...item, status: 'landed' } : item,
        ),
      );
      return;
    }

    // Let flex layout paint the reserved ghosts before measuring
    await waitFrames(3);

    const muzzle = muzzleRef.current;
    if (!muzzle) {
      setItems((prev) =>
        prev.map((item) =>
          ids.includes(item.id) ? { ...item, status: 'landed' } : item,
        ),
      );
      return;
    }

    const muzzleBox = muzzle.getBoundingClientRect();
    const fromX = muzzleBox.left - SLIP_W * 0.08;
    const fromY = muzzleBox.top + muzzleBox.height / 2 - SLIP_H / 2;

    // Snapshot destinations from the real reserved DOM slots
    const destinations = ids.map((id) => {
      const node = slotRefs.current.get(id);
      const item = itemsRef.current.find((entry) => entry.id === id);
      const settle = item?.settle || makeSettle();
      if (!node) {
        return { id, settle, toX: fromX, toY: fromY };
      }
      const box = node.getBoundingClientRect();
      return {
        id,
        settle,
        toX: box.left + settle.ox,
        toY: box.top + settle.oy,
      };
    });

    await new Promise((resolve) => {
      let i = 0;
      const tick = () => {
        const dest = destinations[i];
        setFlights((prev) => {
          if (prev.some((f) => f.id === dest.id)) return prev;
          return [
            ...prev,
            {
              id: dest.id,
              fromX,
              fromY,
              toX: dest.toX,
              toY: dest.toY,
              spin: rand(-28, 28),
              settle: dest.settle,
            },
          ];
        });
        setFiring(true);
        window.setTimeout(() => setFiring(false), 140);

        i += 1;
        if (i < destinations.length) {
          window.setTimeout(tick, BURST_GAP_MS);
        } else {
          window.setTimeout(resolve, FLIGHT_MS + 80);
        }
      };
      tick();
    });
  }, [counterRaw, reducedMotion]);

  const shufflePile = useCallback(() => {
    setItems((prev) =>
      shuffle(prev).map((item) => ({
        ...item,
        settle: makeSettle(),
        status: 'landed',
      })),
    );
    setFiring(true);
    window.setTimeout(() => setFiring(false), 180);
  }, []);

  const sprayBurst = useCallback(async () => {
    if (sprayBusyRef.current || !catalog.length) return;
    if (flightsRef.current.length) return;

    sprayBusyRef.current = true;
    setBusy(true);

    const shown = new Set(itemsRef.current.map((item) => item.id));
    const unseen = catalog.filter((item) => !shown.has(item.id));

    if (!unseen.length) {
      shufflePile();
      window.setTimeout(() => {
        sprayBusyRef.current = false;
        setBusy(false);
      }, 350);
      return;
    }

    const batch = unseen.slice(0, SPRAY_CHUNK).map((s) => s.id);
    await launchBatch(batch);
    sprayBusyRef.current = false;
    setBusy(false);
  }, [catalog, launchBatch, shufflePile]);

  const sprayBurstRef = useRef(sprayBurst);
  sprayBurstRef.current = sprayBurst;

  const cleanUp = useCallback(() => {
    if (sprayBusyRef.current) return;
    if (!items.length && !flights.length) return;
    sprayBusyRef.current = true;
    setBusy(true);
    setSelected(null);
    setFlights([]);
    setItems([]);
    counterRaw.set(0);
    window.setTimeout(() => {
      sprayBusyRef.current = false;
      setBusy(false);
    }, 200);
  }, [counterRaw, flights.length, items.length]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !catalog.length) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !autoFiredRef.current) {
          autoFiredRef.current = true;
          window.setTimeout(() => sprayBurstRef.current?.(), 360);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [catalog.length]);

  if (!projects.length) return null;

  return (
    <section id="work" className={styles.section} ref={sectionRef}>
      <div className={styles.layout}>
        <div className={styles.left}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Selected work
          </p>

          <h2 className={styles.title}>My Work</h2>

          <p className={styles.lede}>
            Pull the trigger — each slip is a project.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnPrimary}
              onMouseDown={(event) => event.preventDefault()}
              onClick={sprayBurst}
              disabled={busy}
            >
              Spray my work
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={cleanUp}
              disabled={(!items.length && !flights.length) || busy}
            >
              Clean up
            </button>
            <p className={styles.counter} aria-live="polite">
              {counterDisplay} PROJECTS SPRAYED
            </p>
          </div>

          <div className={styles.pileHeader}>
            <p className={styles.pileLabel}>Click a project</p>
            <Link to="/work" className={styles.viewMore}>
              {moreWorkLabel}
              <span aria-hidden="true"> →</span>
            </Link>
          </div>

          <div className={styles.pile} ref={pileRef}>
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const slip = catalogMap.get(item.id);
                if (!slip) return null;
                const reserved = item.status === 'reserved';
                return (
                  <motion.div
                    key={item.id}
                    ref={setSlotRef(item.id)}
                    className={styles.slipSlot}
                    layout={!reserved}
                    initial={false}
                    exit={{
                      y: 36,
                      opacity: 0,
                      transition: {
                        duration: reducedMotion ? 0 : 0.25,
                        delay: reducedMotion ? 0 : index * 0.025,
                      },
                    }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 380, damping: 26 }
                    }
                    style={{ width: SLIP_W, height: SLIP_H }}
                  >
                    {item.status === 'landed' ? (
                      <LandedSlip
                        slip={slip}
                        settle={item.settle}
                        onProjectClick={setSelected}
                      />
                    ) : (
                      <div
                        className={styles.slipGhost}
                        style={{ width: SLIP_W, height: SLIP_H }}
                        aria-hidden="true"
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.gunAnchor}>
            <span className={styles.muzzle} ref={muzzleRef} aria-hidden="true" />
            <Suspense fallback={<div className={styles.gunCanvas} aria-hidden="true" />}>
              <PortfolioGun
                firing={firing}
                onFire={sprayBurst}
                disabled={busy}
              />
            </Suspense>
          </div>
        </div>
      </div>

      <div className={styles.flightLayer} aria-hidden="true">
        {flights.map((flight) => {
          const slip = catalogMap.get(flight.id);
          if (!slip) return null;
          return (
            <FlyingSlip
              key={flight.id}
              flight={flight}
              slip={slip}
              onLand={onFlightLand}
            />
          );
        })}
      </div>

      <ProjectDrawer project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
