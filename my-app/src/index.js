import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { scrollToTop } from './utils/scrollCleanup';
import { peekHomeScrollRestore, shouldSkipHomeIntro } from './utils/visitState';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const path = window.location.pathname.replace(/\/$/, '') || '/';
const isHome = path === '/';
const hasHash = Boolean(window.location.hash);
const restoreY = peekHomeScrollRestore();
const shouldRestoreHome = isHome && shouldSkipHomeIntro() && restoreY > 0 && !hasHash;

// Keep scroll for a returning home visit; only force top on first intro / other pages.
if (!shouldRestoreHome) {
  scrollToTop();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
