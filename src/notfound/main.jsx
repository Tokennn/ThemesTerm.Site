import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './notfound.css';
import NotFound from './NotFound.jsx';

// Chaque dossier (farm/, gear/, chapters/, crew/) indique sa page via <body data-page>
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotFound page={document.body.dataset.page} />
  </StrictMode>,
);
