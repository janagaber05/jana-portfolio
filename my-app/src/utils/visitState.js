const INTRO_KEY = 'jana:homeIntroPlayed';
const SCROLL_KEY = 'jana:homeScrollY';

function readIntroPlayed() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

function readSavedScroll() {
  try {
    const value = Number(sessionStorage.getItem(SCROLL_KEY) || 0);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  } catch {
    return 0;
  }
}

let homeIntroPlayed = readIntroPlayed();
let savedHomeScrollY = readSavedScroll();

export function markHomeIntroPlayed() {
  homeIntroPlayed = true;
  try {
    sessionStorage.setItem(INTRO_KEY, '1');
  } catch {
    // ignore storage errors
  }
}

export function shouldSkipHomeIntro() {
  return homeIntroPlayed;
}

export function saveHomeScrollPosition(y) {
  savedHomeScrollY = Math.max(0, y || 0);
  try {
    sessionStorage.setItem(SCROLL_KEY, String(savedHomeScrollY));
  } catch {
    // ignore storage errors
  }
}

export function peekHomeScrollRestore() {
  if (savedHomeScrollY > 0) return savedHomeScrollY;
  return readSavedScroll();
}

export function consumeHomeScrollRestore() {
  const y = peekHomeScrollRestore();
  savedHomeScrollY = 0;
  return y;
}

export function clearHomeScrollRestore() {
  savedHomeScrollY = 0;
  try {
    sessionStorage.removeItem(SCROLL_KEY);
  } catch {
    // ignore storage errors
  }
}
