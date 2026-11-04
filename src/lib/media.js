/** Chemin d'un fichier de public/ (marche aussi quand le site est servi depuis un sous-dossier). */
export const asset = name => `${import.meta.env.BASE_URL}${name}`;

/**
 * Coupe le son d'une vidéo pour de bon : React pose `muted` comme propriété seulement,
 * et certains navigateurs (Safari iOS) exigent l'attribut pour la lecture automatique.
 */
export const forceMuted = video => {
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
};
