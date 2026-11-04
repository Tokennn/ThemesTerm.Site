import { useRef, useState } from 'react';
import { gsap, useGSAP, out, spring, prefersReducedMotion } from '../lib/motion.js';
import { Leaf } from '../components/icons.jsx';
import Termi from './Termi.jsx';
import { PAGES, ORDER } from './pages.js';

// Les pages 404 vivent un dossier plus bas que l'accueil (farm/, gear/…)
const HOME = '../';

export default function NotFound({ page }) {
  const info = PAGES[page] ?? { label: '', title: "We can't find this page", text: 'It may have moved, or never existed.' };
  const root = useRef(null);
  const [still] = useState(prefersReducedMotion);

  const { contextSafe } = useGSAP((_, contextSafe) => {
    document.documentElement.classList.remove('pre');
    if (still) return;
    const q = gsap.utils.selector(root);

    // Entrée : les deux « 4 » glissent, Termi surgit au milieu (le « 0 »), puis le texte
    const tl = gsap.timeline({ defaults: { immediateRender: true } });
    tl.from(q('.nf-top > *'), { opacity: 0, y: -18, duration: .7, ease: out, stagger: .07 }, 0)
      .from(q('.nf-four.left'), { opacity: 0, x: -80, filter: 'blur(16px)', duration: 1, ease: out }, .15)
      .from(q('.nf-four.right'), { opacity: 0, x: 80, filter: 'blur(16px)', duration: 1, ease: out }, .15)
      .from(q('.termi'), { opacity: 0, y: 140, scale: .55, duration: 1.1, ease: spring, transformOrigin: '50% 100%' }, .35)
      .from(q('[data-nf="rise"]'), { opacity: 0, y: 26, duration: .85, ease: out, stagger: .09 }, .75);

    // Vie au repos
    gsap.to(q('.termi-all'), { y: -9, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(q('.termi-shadow'), { scaleX: .84, opacity: .1, svgOrigin: '110 248', duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.fromTo(q('.termi-sprout'), { rotation: -8 }, { rotation: 8, svgOrigin: '110 52', duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(q('.termi-cursor'), { opacity: 0, duration: .01, repeat: -1, yoyo: true, repeatDelay: .5 });

    const blink = gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 1.6 });
    blink.to(q('.termi-eye'), { scaleY: .1, transformOrigin: '50% 50%', duration: .08, ease: 'power1.in' })
      .to(q('.termi-eye'), { scaleY: 1, duration: .14, ease: 'power1.out' })
      .to(q('.termi-eye'), { scaleY: .1, duration: .07, ease: 'power1.in' }, '+=0.12')
      .to(q('.termi-eye'), { scaleY: 1, duration: .14, ease: 'power1.out' });

    const wave = gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 1.3 });
    wave.to(q('.termi-arm-r'), { rotation: -26, svgOrigin: '186 140', duration: .22, ease: 'sine.inOut' })
      .to(q('.termi-arm-r'), { rotation: 10, duration: .22, ease: 'sine.inOut', repeat: 3, yoyo: true })
      .to(q('.termi-arm-r'), { rotation: 0, duration: .4, ease: out });

    // Les yeux suivent le pointeur
    const face = q('.termi-face')[0], svg = q('.termi')[0];
    const toX = gsap.quickTo(face, 'x', { duration: .5, ease: 'power3' });
    const toY = gsap.quickTo(face, 'y', { duration: .5, ease: 'power3' });
    const look = contextSafe(e => {
      const r = svg.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2);
      const dy = (e.clientY - (r.top + r.height * .45)) / (innerHeight / 2);
      toX(gsap.utils.clamp(-1, 1, dx) * 9);
      toY(gsap.utils.clamp(-1, 1, dy) * 6);
    });
    addEventListener('pointermove', look);
    return () => removeEventListener('pointermove', look);
  }, { scope: root, dependencies: [still] });

  // Un clic sur Termi : il s'écrase puis saute
  const jump = contextSafe(() => {
    if (still) return;
    const body = root.current.querySelector('.termi');
    gsap.timeline()
      .to(body, { scaleY: .82, scaleX: 1.12, transformOrigin: '50% 100%', duration: .14, ease: 'power2.in' })
      .to(body, { y: -70, scaleY: 1.08, scaleX: .94, duration: .32, ease: 'power2.out' })
      .to(body, { y: 0, scaleY: 1, scaleX: 1, duration: .9, ease: spring });
  });

  return (
    <div className="nf" ref={root}>
      <div className="nf-card">
        <header className="nf-top">
          <a className="nf-logo" href={HOME}><Leaf />Quentin.C</a>
          <nav className="nf-nav" aria-label="Main">
            <a href={HOME}>Home</a>
            {ORDER.map(key => (
              <a key={key} href={`../${key}/`} aria-current={key === page ? 'page' : undefined}>
                {PAGES[key].label}
              </a>
            ))}
          </nav>
        </header>

        <main className="nf-main">
          <div className="nf-stage">
            <span className="nf-four left" aria-hidden="true">4</span>
            <button type="button" className="nf-termi" onClick={jump} aria-label="Make Termi jump">
              <Termi />
            </button>
            <span className="nf-four right" aria-hidden="true">4</span>
          </div>
          <p className="nf-code" data-nf="rise">404 · {info.label || 'Not found'}</p>
          <h1 className="nf-title" data-nf="rise">{info.title}</h1>
          <p className="nf-text" data-nf="rise">{info.text}</p>
          <div className="nf-actions" data-nf="rise">
            <a className="nf-btn primary" href={HOME}>Back to the meadow</a>
            <a className="nf-btn" href={`${HOME}#footer`}>Install ThemesTerm</a>
          </div>
        </main>
      </div>
    </div>
  );
}
