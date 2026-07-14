const INTRO_KEY = 'jana:homeIntroPlayed';
const SCROLL_KEY = 'jana:homeScrollY';
const SECTION_KEY = 'jana:homeSection';

const HOME_SECTIONS = ['home', 'work', 'about', 'process', 'contact'];

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

function readSavedSection() {
  try {
    const value = sessionStorage.getItem(SECTION_KEY) || '';
    return HOME_SECTIONS.includes(value) ? value : '';
  } catch {
    return '';
  }
}

let homeIntroPlayed = readIntroPlayed();
let savedHomeScrollY = readSavedScroll();
let savedHomeSection = readSavedSection();

export function markHomeIntroPlayed() {
  homeIntroPlayed = true;
  try {
    sessionStorage.setItem(INTRO_KEY, '1');
  } catch {
    // ignore
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
    // ignore
  }
}

export function saveHomeSection(sectionId) {
  const next = HOME_SECTIONS.includes(sectionId) ? sectionId : 'home';
  savedHomeSection = next;
  try {
    sessionStorage.setItem(SECTION_KEY, next);
  } catch {
    // ignore
  }
}

export function peekHomeSection() {
  return savedHomeSection || readSavedSection() || '';
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
  savedHomeSection = 'home';
  try {
    sessionStorage.removeItem(SCROLL_KEY);
    sessionStorage.setItem(SECTION_KEY, 'home');
  } catch {
    // ignore
  }
}

export { HOME_SECTIONS };
