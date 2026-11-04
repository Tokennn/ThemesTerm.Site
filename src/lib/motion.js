import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Ressort amorti (ω = 13, ζ = 0,42) utilisé comme easing GSAP : léger rebond du titre. */
export const spring = (() => {
  const w = 13, z = 0.42, wd = w * Math.sqrt(1 - z * z), T = 1.1;
  return p => {
    if (p >= 1) return 1;
    const t = p * T;
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  };
})();

/** Sortie douce : la même courbe que les transitions CSS, cubic-bezier(.2, .8, .2, 1). */
export const out = CustomEase.create('out', 'M0,0 C0.2,0.8 0.2,1 1,1');

/** Unités de la maquette → px : 1u = largeur / 1440 sur ordinateur, 1px sur téléphone. */
export const unit = el => {
  const w = el?.clientWidth ?? window.innerWidth;
  return w > 820 ? w / 1440 : 1;
};
