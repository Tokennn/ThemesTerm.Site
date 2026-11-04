import { useEffect, useRef } from 'react';
import { asset, forceMuted } from '../lib/media.js';

// 1.mp4 passe d'un plan ensoleillé au plan du nuage à 2,83 s : on ne montre que le nuage.
const START = 2.875;
const FADE = 0.9; // durée du fondu entre les deux lecteurs (comme la transition CSS)
const SRC = `${asset('1.mp4')}#t=${START}`;

/** Peint `src` en « cover », en petit, sur le canevas flouté qui remplit les bandes autour du clip. */
function paint(canvas, src) {
  if (!canvas.offsetWidth) return; // caché sur téléphone
  const ctx = canvas.getContext('2d');
  const h = Math.max(1, Math.round((canvas.width * canvas.offsetHeight) / canvas.offsetWidth));
  if (canvas.height !== h) canvas.height = h;
  const sw = src.videoWidth || src.naturalWidth;
  const sh = src.videoHeight || src.naturalHeight;
  if (!sw) return;
  const k = Math.max(canvas.width / sw, canvas.height / sh);
  ctx.drawImage(src, (canvas.width - sw * k) / 2, (canvas.height - sh * k) / 2, sw * k, sh * k);
}

/**
 * Le clip 16:9 en entier, posé sur une copie floutée de lui-même.
 * Deux lecteurs se relaient en fondu à chaque boucle : la dernière image du clip ne
 * correspond pas à la première.
 */
export default function Scene({ still }) {
  const canvasRef = useRef(null);
  const posterRef = useRef(null);
  const videoRefs = [useRef(null), useRef(null)];

  // Fond flouté depuis l'affiche dès qu'elle est chargée.
  useEffect(() => {
    const canvas = canvasRef.current, poster = posterRef.current;
    const draw = () => paint(canvas, poster);
    if (poster.complete) draw();
    else poster.addEventListener('load', draw, { once: true });
    return () => poster.removeEventListener('load', draw);
  }, []);

  // Boucle sans à-coup + copie floutée qui suit la vidéo (~12 i/s suffisent sous un flou).
  useEffect(() => {
    if (still) return;
    const videos = videoRefs.map(r => r.current);
    const canvas = canvasRef.current;
    const timers = [];
    let current = 0, painted = 0, raf = 0;

    const cleanups = videos.map((v, i) => {
      forceMuted(v);
      const onMeta = () => { if (v.currentTime < START) v.currentTime = START; }; // si #t= est ignoré
      const onTime = () => {
        if (i !== current || !v.duration || v.duration - v.currentTime > FADE + 0.15) return;
        const next = videos[1 - i];
        current = 1 - i;
        next.currentTime = START;
        next.play().catch(() => {});
        next.style.zIndex = 2;
        v.style.zIndex = 1;
        next.classList.add('on');
        timers.push(setTimeout(() => { v.classList.remove('on'); v.pause(); }, FADE * 1000 + 200));
      };
      v.addEventListener('loadedmetadata', onMeta, { once: true });
      v.addEventListener('timeupdate', onTime);
      return () => {
        v.removeEventListener('loadedmetadata', onMeta);
        v.removeEventListener('timeupdate', onTime);
      };
    });
    videos[0].play().catch(() => {});

    const follow = now => {
      if (now - painted > 80 && videos[current].readyState >= 2) {
        painted = now;
        paint(canvas, videos[current]);
      }
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      cleanups.forEach(c => c());
      videos.forEach(v => v.pause());
    };
  }, [still]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="scene" aria-hidden="true">
      <canvas ref={canvasRef} className="backdrop" width="96" height="86" />
      <div className="clip">
        <img ref={posterRef} src={asset('1-poster.jpg')} width="1920" height="1080" alt="" fetchPriority="high" />
        {!still && (
          <>
            <video ref={videoRefs[0]} className="on" src={SRC} muted playsInline preload="auto" disablePictureInPicture />
            <video ref={videoRefs[1]} src={SRC} muted playsInline preload="auto" disablePictureInPicture />
          </>
        )}
      </div>
    </div>
  );
}
