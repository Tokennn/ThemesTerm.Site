import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Accueil + une page 404 par lien du menu pas encore construit
const PAGES = ['farm', 'gear', 'chapters', 'crew'];

export default defineConfig({
  plugins: [react()],
  base: './', // le dossier dist/ marche depuis n'importe quel chemin d'hébergement
  build: {
    rollupOptions: {
      input: Object.fromEntries([
        ['main', resolve(import.meta.dirname, 'index.html')],
        ...PAGES.map(p => [p, resolve(import.meta.dirname, p, 'index.html')]),
      ]),
    },
  },
  server: { port: 3456, strictPort: true, host: '127.0.0.1' },
  preview: { port: 3456, strictPort: true, host: '127.0.0.1' },
});
