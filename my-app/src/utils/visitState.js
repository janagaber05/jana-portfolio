let homeIntroPlayed = false;
let savedHomeScrollY = 0;

export function markHomeIntroPlayed() {
  homeIntroPlayed = true;
}

export function shouldSkipHomeIntro() {
  return homeIntroPlayed;
}

export function saveHomeScrollPosition(y) {
  savedHomeScrollY = Math.max(0, y || 0);
}

export function consumeHomeScrollRestore() {
  const y = savedHomeScrollY;
  savedHomeScrollY = 0;
  return y;
}

export function clearHomeScrollRestore() {
  savedHomeScrollY = 0;
}
