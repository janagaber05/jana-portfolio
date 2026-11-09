import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './WorkSpraySection.module.css';

export const MONEY_GUN_URL = '/assets/money_gun.glb';

/** Tip barrel down toward the pile (deg). */
const TIP_REST = -14;
const TIP_KICK = -22;

function fitCamera(camera, target) {
  target.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(target);
  if (box.isEmpty()) return;

  const center = box.getCenter(new THREE.Vector3());
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const dist = (sphere.radius * 0.78) / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));

  camera.position.set(center.x + 0.04, center.y + 0.02, center.z + dist);
  camera.near = Math.max(0.05, dist / 100);
  camera.far = dist * 20;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

/**
 * Uploaded money_gun.glb — full side profile, auto-fitted in the canvas.
 * Vanilla three.js (no R3F) so CRA production builds don't crash on broken
 * webpack re-exports like ACESFilmicToneMapping → undefined.V.
 */
export default function PortfolioGun({ firing = false, onFire, disabled = false }) {
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const firingRef = useRef(firing);
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    firingRef.current = firing && !reduceMotion;
  }, [firing, reduceMotion]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const width = mount.clientWidth || 280;
    const height = mount.clientHeight || 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const key = new THREE.DirectionalLight(0xfff7f2, 1.3);
    key.position.set(2.4, 3.2, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffd5fb, 0.35);
    fill.position.set(-2.5, 1, 2);
    scene.add(fill);

    const group = new THREE.Group();
    group.rotation.z = THREE.MathUtils.degToRad(TIP_REST);
    scene.add(group);
    groupRef.current = group;

    const rest = {
      rotZ: THREE.MathUtils.degToRad(TIP_REST),
      posX: 0,
    };
    const kick = {
      rotZ: THREE.MathUtils.degToRad(TIP_KICK),
      posX: 0.08,
    };

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    const loader = new GLTFLoader();

    loader.load(
      MONEY_GUN_URL,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene.clone(true);
        model.traverse((node) => {
          if (!node.isMesh) return;
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
              if ('envMapIntensity' in next) next.envMapIntensity = 1.05;
              next.needsUpdate = true;
              return next;
            });
            node.material = Array.isArray(node.material) ? cloned : cloned[0];
          }
        });

        // Center the model in the group
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        group.add(model);
        fitCamera(camera, group);
      },
      undefined,
      (err) => {
        console.error('[PortfolioGun] GLB load failed:', err);
      },
    );

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      if (group.children.length) fitCamera(camera, group);
    };
    window.addEventListener('resize', onResize);

    const tick = () => {
      frameId = window.requestAnimationFrame(tick);
      const delta = clock.getDelta();
      const target = firingRef.current ? kick : rest;
      const t = 1 - Math.exp(-delta * (firingRef.current ? 28 : 14));
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, target.rotZ, t);
      group.position.x = THREE.MathUtils.lerp(group.position.x, target.posX, t);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      groupRef.current = null;
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose?.();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat) => mat?.dispose?.());
        }
      });
    };
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
      <div className={styles.gunCanvas} ref={mountRef} />
    </motion.button>
  );
}
