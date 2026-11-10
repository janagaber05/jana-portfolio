import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { getScreenDisplayCrop, getScreenImageSrc } from '../../utils/caseStudyImage';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function pickFrameVariant(src) {
  // Portrait → phone; landscape/unknown → laptop
  if (!src) return 'phone';
  return 'phone';
}

export default function DeviceFrame({
  src,
  alt = '',
  crop = null,
  variant = 'phone',
  className = '',
  priority = false,
  tilt = false,
  bob = false,
  onClick,
  children,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      if (bob) {
        gsap.to(el, {
          y: 8,
          duration: 2.4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }
    }, el);

    if (!tilt || !isFinePointer()) {
      return () => ctx.revert();
    }

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        rotateX: -py * 10,
        rotateY: px * 10,
        transformPerspective: 1000,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const onLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      ctx.revert();
    };
  }, [tilt, bob]);

  const imageSrc = src || '';
  const displayCrop = crop;

  return (
    <div
      ref={rootRef}
      className={`cs-device cs-device-${variant} ${className}`.trim()}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="cs-device-bezel">
        {variant === 'laptop' ? <span className="cs-device-camera" aria-hidden="true" /> : null}
        <div className="cs-device-screen">
          {imageSrc ? (
            <button
              type="button"
              className="cs-device-hit"
              onClick={onClick}
              data-cursor={onClick ? 'view' : undefined}
              aria-label={alt || 'View screen'}
            >
              {/*
                Use positioned <img> crop math (same as FramedImage), not
                background-position %, which resolves differently and can
                leave screens looking blank/shifted.
              */}
              <span className="cs-device-img" role="img" aria-label={alt}>
                <img
                  src={imageSrc}
                  alt=""
                  decoding="async"
                  fetchPriority={priority ? 'high' : undefined}
                  width={390}
                  height={844}
                  className={displayCrop ? 'cs-device-img-crop' : 'cs-device-img-cover'}
                  style={displayCrop ? {
                    width: `${(1 / displayCrop.width) * 100}%`,
                    height: `${(1 / displayCrop.height) * 100}%`,
                    left: `${-(displayCrop.x / displayCrop.width) * 100}%`,
                    top: `${-(displayCrop.y / displayCrop.height) * 100}%`,
                  } : undefined}
                />
              </span>
            </button>
          ) : children}
        </div>
      </div>
      {variant === 'laptop' ? <div className="cs-device-base" aria-hidden="true" /> : null}
    </div>
  );
}

export function ScreenInFrame({ screen, onInspect, ...rest }) {
  const src = getScreenImageSrc(screen);
  const crop = getScreenDisplayCrop(screen);
  return (
    <DeviceFrame
      src={src}
      alt={screen?.alt || screen?.label || 'Screen'}
      crop={crop}
      onClick={onInspect ? () => onInspect(screen) : undefined}
      {...rest}
    />
  );
}
