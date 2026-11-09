import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, Environment, useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import styles from './WorkSpraySection.module.css';

export const MONEY_GUN_URL = '/assets/money_gun.glb';

/** Tip barrel down toward the pile (deg). */
const TIP_REST = -14;
const TIP_KICK = -22;

/**
 * Fit the camera so the entire gun (after tip) sits inside the canvas
 * with a little margin — fixes the “huge cropped blob” framing bug.
 */
function FitCamera({ targetRef }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const group = targetRef.current;
    if (!group) return undefined;

    const fit = () => {
      group.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(group);
      if (box.isEmpty()) return;

      const center = box.getCenter(new THREE.Vector3());
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      // ~0.78 = fill most of the canvas; full gun still in frame
      const dist = (sphere.radius * 0.78) / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));

      camera.position.set(center.x + 0.04, center.y + 0.02, center.z + dist);
      camera.near = Math.max(0.05, dist / 100);
      camera.far = dist * 20;
      camera.lookAt(center);
      camera.updateProjectionMatrix();
    };

    // Fit after layout + once more next frame (GLB materials settle)
    fit();
    const id = window.requestAnimationFrame(fit);
    const onResize = () => fit();
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener('resize', onResize);
    };
  }, [camera, size.width, size.height, targetRef]);

  return null;
}

function MoneyGunModel({ firing = false, groupRef }) {
  const { scene } = useGLTF(MONEY_GUN_URL);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((node) => {
      if (!node.isMesh) return;
      // Gun only — hide the attached hand mesh
      if (/hand/i.test(node.name) || /hand/i.test(node.parent?.name || '')) {
        node.visible = false;
        return;
      }
      node.castShadow = true;
      node.receiveShadow = true;
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        const cloned = materials.map((mat) => {
          const next = mat.clone();
          next.envMapIntensity = 1.05;
          next.needsUpdate = true;
          return next;
        });
        node.material = Array.isArray(node.material) ? cloned : cloned[0];
      }
    });

    return clone;
  }, [scene]);

  const rest = useMemo(
    () => ({
      rotZ: THREE.MathUtils.degToRad(TIP_REST),
      posX: 0,
    }),
    [],
  );
  const kick = useMemo(
    () => ({
      rotZ: THREE.MathUtils.degToRad(TIP_KICK),
      posX: 0.08,
    }),
    [],
  );

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.z = rest.rotZ;
    group.position.x = rest.posX;
  }, [groupRef, rest]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = firing ? kick : rest;
    const t = 1 - Math.exp(-delta * (firing ? 28 : 14));
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, target.rotZ, t);
    group.position.x = THREE.MathUtils.lerp(group.position.x, target.posX, t);
  });

  return (
    <group ref={groupRef}>
      {/*
        Side profile: camera on +Z looks at X/Y.
        Barrel along −X (left), tip via rotZ.
      */}
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  );
}

useGLTF.preload(MONEY_GUN_URL);

function GunFallback() {
  return (
    <mesh rotation={[0, 0, THREE.MathUtils.degToRad(TIP_REST)]}>
      <boxGeometry args={[1.6, 0.55, 0.3]} />
      <meshStandardMaterial color="#6D0101" roughness={0.35} metalness={0.4} />
    </mesh>
  );
}

/**
 * Uploaded money_gun.glb — full side profile, auto-fitted in the canvas.
 */
export default function PortfolioGun({ firing = false, onFire, disabled = false }) {
  const groupRef = useRef(null);
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    useGLTF.preload(MONEY_GUN_URL);
  }, []);

  return (
    <motion.button
      type="button"
      className={styles.gunButton}
      aria-label="Spray my work"
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => {
        event.preventDefault();
        if (!disabled) onFire?.(event);
      }}
      whileHover={disabled || reduceMotion ? undefined : { scale: 1.015 }}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.985 }}
    >
      <div className={styles.gunCanvas}>
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [0, 0, 6], fov: 28, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ pointerEvents: 'none' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[2.4, 3.2, 4]} intensity={1.3} color="#fff7f2" />
          <directionalLight position={[-2.5, 1, 2]} intensity={0.35} color="#ffd5fb" />
          <Suspense fallback={<GunFallback />}>
            <MoneyGunModel
              firing={firing && !reduceMotion}
              groupRef={groupRef}
            />
            <FitCamera targetRef={groupRef} />
            <Environment preset="studio" />
          </Suspense>
        </Canvas>
      </div>
    </motion.button>
  );
}
