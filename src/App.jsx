import { useRef, useState } from 'react';
import Scene from './components/Scene.jsx';
import Topbar from './components/Topbar.jsx';
import Copy from './components/Copy.jsx';
import Chapters from './components/Chapters.jsx';
import Footer from './components/Footer.jsx';
import useLenis from './hooks/useLenis.js';
import { gsap, ScrollTrigger, useGSAP, out, prefersReducedMotion, spring, unit } from './lib/motion.js';

// Ce que fait chaque élément à l'entrée (attribut data-enter / data-reveal du composant).
const POSES = {
  drop: u => ({ opacity: 0, y: -26 * u, duration: 0.75, ease: out }),
  unblur: () => ({ opacity: 0, filter: 'blur(14px)', duration: 0.8, ease: out }),
  spring: u => ({ opacity: 0, y: 70 * u, scale: 0.96, filter: 'blur(18px)', duration: 1.1, ease: spring }),
  rise: u => ({ opacity: 0, y: 30 * u, duration: 0.85, ease: out }),
};
// Une fois arrivé, on rend la main au CSS (les survols animent `transform`).
const CLEAR = 'all'; // les éléments animés n'ont pas d'autre style en ligne

export default function App() {
  const page = useRef(null), hero = useRef(null);
  const [still] = useState(prefersReducedMotion);
  useLenis(!still);

  useGSAP((_, contextSafe) => {
    const root = document.documentElement;
    if (still) { root.classList.remove('pre'); return; }

    const u = unit(hero.current);
    const q = gsap.utils.selector(page);
    const from = (kind, extra) => ({ ...POSES[kind](u), clearProps: CLEAR, immediateRender: true, ...extra });

    // Haut de page : une seule timeline (barre, kicker, titre en ressort, texte et boutons).
    const tl = gsap.timeline();
    tl.from(q('[data-enter="drop"]'), from('drop', { stagger: 0.08 }), 0)
      .from(q('[data-enter="unblur"]'), from('unblur'), 0.28)
      .from(q('[data-enter="spring"]'), from('spring', { stagger: 0.16 }), 0.5)
      .from(q('[data-enter="rise"]'), from('rise', { stagger: 0.09 }), 1.12);

    // « Chapters » : à la suite du haut s'il est déjà visible, sinon quand on y arrive en défilant.
    const head = q('[data-reveal="head"]'), cards = q('[data-reveal="card"]');
    gsap.set([...head, ...cards], { opacity: 0, y: 30 * u });
    // contextSafe : ce qui est créé plus tard (déclencheurs, tweens) est aussi nettoyé au démontage.
    const reveal = (els, trigger, start) => ScrollTrigger.create({
      trigger, start, once: true,
      onEnter: contextSafe(() => gsap.to(els, {
        opacity: 1, y: 0, duration: 0.85, ease: out, stagger: 0.09, clearProps: CLEAR,
      })),
    });
    tl.call(contextSafe(() => {
      reveal(head, head[0], 'top bottom');
      reveal(cards, cards[0], 'top 92%');
    }), null, 1.12 + 3 * 0.09);

    // Footer (où mène « Watch preview ») : texte, terminaux d'installation, bas de page.
    const foot = q('[data-reveal="foot"]');
    gsap.set(foot, { opacity: 0, y: 30 * u });
    reveal(foot, '.footer', 'top 85%');

    root.classList.remove('pre');
  }, { scope: page, dependencies: [still] });

  return (
    <div ref={page}>
      <main className="hero" id="top" ref={hero}>
        <Scene still={still} />
        <Topbar />
        <Copy />
        <Chapters still={still} />
      </main>
      <Footer />
    </div>
  );
}
