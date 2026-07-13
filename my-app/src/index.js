import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { scrollToTop } from './utils/scrollCleanup';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

scrollToTop();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
