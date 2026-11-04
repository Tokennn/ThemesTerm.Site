import { useEffect, useRef } from 'react';
import { Play } from './icons.jsx';
import { asset, forceMuted } from '../lib/media.js';

// Clips rendus à partir du vrai code ThemesTerm : tools/make_demos.py (sortie dans public/)
const CARDS = [
  { video: 'theme1', kicker: 'Thème 1', title: 'Terminal classique', label: 'Thème 1 : terminal classique' },
  { video: 'theme2', kicker: 'Thème 2', title: 'ThemesTerm, au choix', label: "Thème 2 : ThemesTerm, le terminal qu'on choisit" },
];

function Card({ video, kicker, title, label, still }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    forceMuted(v);
    if (still) { v.pause(); v.currentTime = 0; } else v.play().catch(() => {});
  }, [still]);

  return (
    <a className="card anim" data-reveal="card" href="#" aria-label={label}>
      <video
        ref={ref}
        src={asset(`${video}.mp4`)}
        poster={asset(`${video}.jpg`)}
        muted loop playsInline autoPlay={!still}
        preload="metadata" disablePictureInPicture aria-hidden="true"
      />
      <span className="card-label">
        <Play />
        <span className="card-text"><small>{kicker}</small><strong>{title}</strong></span>
      </span>
    </a>
  );
}

export default function Chapters({ still }) {
  return (
    <section className="chapters" id="chapters" aria-labelledby="chapters-title">
      <div className="chapters-head">
        <h2 className="display chapters-title anim" data-reveal="head" id="chapters-title">CHAPTERS</h2>
      </div>
      <div className="cards">
        {CARDS.map(c => <Card key={c.video} {...c} still={still} />)}
      </div>
    </section>
  );
}
