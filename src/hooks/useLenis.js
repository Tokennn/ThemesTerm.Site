import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/motion.js';

/**
 * Défilement fluide Lenis, cadencé par le ticker de GSAP pour que ScrollTrigger
 * voie exactement la même position. Liens d'ancre (#chapters) animés.
 * Coupé en mouvement réduit ; sur écran tactile, le défilement natif est gardé.
 */
export default function useLenis(enabled) {
  useEffect(() => {
    // Arrivée depuis une autre page avec une ancre (ex. une 404 → ../#footer) : React n'avait
    // pas encore rendu la cible quand le navigateur a voulu y sauter, on y va maintenant.
    let target = null;
    try { target = location.hash && document.querySelector(location.hash); } catch { /* ancre invalide */ }

    if (!enabled) {
      target?.scrollIntoView();
      return;
    }
    const lenis = new Lenis({ anchors: true, lerp: 0.1 });
    const tick = time => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const frame = target ? requestAnimationFrame(() => lenis.scrollTo(target)) : 0;
    return () => {
      cancelAnimationFrame(frame);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [enabled]);
}
