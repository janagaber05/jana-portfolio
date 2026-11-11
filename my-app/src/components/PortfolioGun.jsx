import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import styles from './WorkSpraySection.module.css';

export const MONEY_GUN_URL = '/assets/money_gun.glb';

/** Tip barrel down toward the pile (deg). */
const TIP_REST = -14;
const TIP_KICK = -22;
const LOGO_TEXT = 'MY WORK';

/** Site brand palette — keep the gun on-brand without editing the .glb. */
const BRAND = {
  burgundy: new THREE.Color('#6d0101'),
  burgundyDeep: new THREE.Color('#4a0000'),
  cream: new THREE.Color('#fcf4f0'),
  pink: new THREE.Color('#ffd5fb'),
  ink: new THREE.Color('#141214'),
};

function brandifyMaterial(node, mat) {
  if (!mat || !mat.color) return mat;
  const name = `${node.name || ''} ${node.parent?.name || ''}`.toLowerCase();
  const next = mat.clone();
  const c = next.color;
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);

  // Explicit mesh names from the Sketchfab model
  if (/body|barrel|slide|housing|shell|receiver/i.test(name)) {
    next.color.copy(BRAND.burgundy);
    if ('roughness' in next) next.roughness = 0.42;
    if ('metalness' in next) next.metalness = 0.12;
  } else if (/grip|handle|trigger|mag|clip|stock|butt/i.test(name)) {
    next.color.copy(BRAND.ink);
    if ('roughness' in next) next.roughness = 0.55;
    if ('metalness' in next) next.metalness = 0.05;
  } else if (/screw|pin|spring|metal|chrome|silver|bolt|ring|clip_metal/i.test(name)) {
    next.color.copy(BRAND.cream);
    if ('roughness' in next) next.roughness = 0.28;
    if ('metalness' in next) next.metalness = 0.65;
  } else if (/money|bill|cash|note|paper/i.test(name)) {
    next.color.copy(BRAND.pink);
    if ('roughness' in next) next.roughness = 0.7;
    if ('metalness' in next) next.metalness = 0;
  } else if (hsl.s > 0.25 && (hsl.h < 0.08 || hsl.h > 0.92)) {
    // Warm / red plastics → burgundy
    next.color.copy(hsl.l > 0.35 ? BRAND.burgundy : BRAND.burgundyDeep);
    if ('roughness' in next) next.roughness = Math.min(0.5, next.roughness ?? 0.45);
    if ('metalness' in next) next.metalness = Math.min(0.18, next.metalness ?? 0.1);
  } else if (hsl.l > 0.62) {
    // Lights / metals → cream
    next.color.copy(BRAND.cream);
    if ('metalness' in next) next.metalness = Math.max(0.35, next.metalness ?? 0.4);
    if ('roughness' in next) next.roughness = Math.min(0.35, next.roughness ?? 0.3);
  } else if (hsl.l < 0.28) {
    // Darks → ink
    next.color.copy(BRAND.ink);
  } else {
    // Mid neutrals lean burgundy so the whole prop reads on-brand
    next.color.copy(BRAND.burgundy);
    if ('roughness' in next) next.roughness = 0.48;
    if ('metalness' in next) next.metalness = 0.08;
  }

  if ('envMapIntensity' in next) next.envMapIntensity = 1.05;
  next.needsUpdate = true;
  return next;
}

function createLogoDecal(model, logo) {
  const logoBox = new THREE.Box3().setFromObject(logo);
  const body = model.getObjectByName('body');
  if (logoBox.isEmpty() || !body) return null;
  const bodyBox = new THREE.Box3().setFromObject(body);
  const size = logoBox.getSize(new THREE.Vector3());
  const center = logoBox.getCenter(new THREE.Vector3());
  const w = size.x * 1.02;
  const h = Math.max(size.y, size.x * 0.22);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = Math.max(128, Math.round((1024 * h) / w));
  const draw = () => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const font = (px) => `${px}px "Bebas Neue", Impact, "Arial Black", sans-serif`;
    let fontSize = canvas.height * 0.95;
    ctx.font = font(fontSize);
    while (ctx.measureText(LOGO_TEXT).width > canvas.width * 0.9 && fontSize > 20) {
      fontSize -= 4;
      ctx.font = font(fontSize);
    }
    ctx.fillText(LOGO_TEXT, canvas.width / 2, canvas.height / 2 + fontSize * 0.05);
  };
  draw();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  document.fonts?.load('100px "Bebas Neue"').then(() => {
    draw();
    texture.needsUpdate = true;
  }).catch(() => {});
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({
      map: texture,
      emissive: 0xffffff,
      emissiveMap: texture,
      emissiveIntensity: 0.55,
      transparent: true,
      roughness: 0.45,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    }),
  );
  plane.userData.isJanaLogo = true;
  plane.position.set(
    center.x,
    center.y,
    Math.max(bodyBox.max.z, logoBox.max.z) + size.z * 0.02 + 0.001,
  );
  return plane;
}

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

    scene.add(new THREE.AmbientLight(0xfcf4f0, 0.72));
    const key = new THREE.DirectionalLight(0xfff7f2, 1.35);
    key.position.set(2.4, 3.2, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffd5fb, 0.48);
    fill.position.set(-2.5, 1, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x6d0101, 0.28);
    rim.position.set(0.5, -1.5, -2.5);
    scene.add(rim);

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
        model.updateMatrixWorld(true);
        const logo = model.getObjectByName('logo');
        if (logo) {
          const decal = createLogoDecal(model, logo);
          logo.traverse((child) => {
            if (child.isMesh) child.visible = false;
          });
          if (decal) model.add(decal);
        }
        model.traverse((node) => {
          if (!node.isMesh) return;
          if (node.userData.isJanaLogo) return;
          if (/hand/i.test(node.name) || /hand/i.test(node.parent?.name || '')) {
            node.visible = false;
            return;
          }
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            const branded = materials.map((mat) => brandifyMaterial(node, mat));
            node.material = Array.isArray(node.material) ? branded : branded[0];
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
          mats.forEach((mat) => {
            if (!mat) return;
            mat.map?.dispose?.();
            mat.emissiveMap?.dispose?.();
            mat.dispose?.();
          });
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
