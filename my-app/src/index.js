import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { scrollToTop } from './utils/scrollCleanup';
import { peekHomeSection, shouldSkipHomeIntro } from './utils/visitState';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const path = window.location.pathname.replace(/\/$/, '') || '/';
const isHome = path === '/';
const hashSection = (window.location.hash || '').replace(/^#/, '');
const savedSection = peekHomeSection();
const shouldKeepPlace = isHome && shouldSkipHomeIntro() && (
  (hashSection && hashSection !== 'home')
  || (savedSection && savedSection !== 'home')
);

// First visit stays at the hero intro. Returning visits keep your place.
if (!shouldKeepPlace) {
  scrollToTop();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
