let calm;
let tension;
let danger;
let drag;
let audioEnabled = false;
let dragTargetVolume = 0;
let dragCurrentVolume = 0;
let dragFadeFrameId = null;
let dragLastMotionAt = 0;
let dragLastFrameAt = 0;

export const BALANCE_SOUND_CONFIG = {
  enabled: true,
  minAngle: 0.035,
  maxAngle: 1.2,
  maxVolume: 0.38,
  fadeDuration: 220,
  cooldown: 180,
  path: "/assets/sounds/drag.mp3",
};

export function initAudio() {
  if (calm) return;

  calm = new Audio("/assets/sounds/calm.mp3");
  tension = new Audio("/assets/sounds/tension.mp3");
  danger = new Audio("/assets/sounds/danger.mp3");
  drag = new Audio(BALANCE_SOUND_CONFIG.path);

  ;[calm, tension, danger].forEach(audio => {
    audio.loop = true;
    audio.volume = 0;
  });

  drag.loop = true;
  drag.preload = "auto";
  drag.volume = 0;

  calm.volume = 0.35;
}

function stopMusicTracks() {
  ;[calm, tension, danger].forEach(audio => {
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  });
}

function stopBalanceDrag(immediate = false) {
  dragTargetVolume = 0;

  if (!drag) return;

  if (!immediate) {
    if (dragCurrentVolume === 0 && dragTargetVolume === 0) return;

    startDragFade();
    return;
  }

  if (dragFadeFrameId) {
    cancelAnimationFrame(dragFadeFrameId);
    dragFadeFrameId = null;
  }

  drag.pause();
  drag.currentTime = 0;
  drag.volume = 0;
  dragCurrentVolume = 0;
}

export function toggleAudio() {
  audioEnabled = !audioEnabled;
  initAudio();

  if (!audioEnabled) {
    stopMusicTracks();
    stopBalanceDrag(true);
  }

  return audioEnabled;
}

export function isAudioEnabled() {
  return audioEnabled;
}

export function updateBalanceDragSound(angleDelta) {
  if (!BALANCE_SOUND_CONFIG.enabled || !audioEnabled) {
    stopBalanceDrag();
    return;
  }

  initAudio();

  const now = performance.now();
  const movement = Math.abs(angleDelta);
  const hasMovement = movement >= BALANCE_SOUND_CONFIG.minAngle;

  if (hasMovement) {
    dragLastMotionAt = now;
    setBalanceDragVolume(getBalanceDragVolume(movement));
    return;
  }

  if (now - dragLastMotionAt > BALANCE_SOUND_CONFIG.cooldown) {
    setBalanceDragVolume(0);
  }
}

export function updateAudio(balance) {

  if (!audioEnabled) {
    stopMusicTracks();
    stopBalanceDrag(true);
    return;
  }

  initAudio();

  const diff = Math.abs(balance.difference);

  stopMusicTracks();

  if (diff === 0) {
    calm.volume = 0.35;
    calm.play().catch(() => {});
  }

  else if (diff <= 3) {
    tension.volume = 0.35;
    tension.play().catch(() => {});
  }

  else {
    danger.volume = 0.45;
    danger.play().catch(() => {});
  }
}

function getBalanceDragVolume(movement) {
  const normalized =
    (movement - BALANCE_SOUND_CONFIG.minAngle) /
    (BALANCE_SOUND_CONFIG.maxAngle - BALANCE_SOUND_CONFIG.minAngle);

  return clamp(normalized, 0.12, 1) * BALANCE_SOUND_CONFIG.maxVolume;
}

function setBalanceDragVolume(volume) {
  dragTargetVolume = clamp(volume, 0, BALANCE_SOUND_CONFIG.maxVolume);

  if (dragTargetVolume > 0 && drag?.paused) {
    drag.play().catch(() => {});
  }

  startDragFade();
}

function startDragFade() {
  if (dragFadeFrameId) return;

  dragLastFrameAt = performance.now();
  dragFadeFrameId = requestAnimationFrame(fadeBalanceDrag);
}

function fadeBalanceDrag(time) {
  if (!drag) {
    dragFadeFrameId = null;
    return;
  }

  const elapsed = Math.max(0, time - dragLastFrameAt);
  const amount = Math.min(1, elapsed / BALANCE_SOUND_CONFIG.fadeDuration);

  dragLastFrameAt = time;
  dragCurrentVolume = lerp(dragCurrentVolume, dragTargetVolume, amount);
  drag.volume = clamp(dragCurrentVolume, 0, BALANCE_SOUND_CONFIG.maxVolume);

  if (dragTargetVolume === 0 && dragCurrentVolume < 0.01) {
    drag.pause();
    drag.currentTime = 0;
    drag.volume = 0;
    dragCurrentVolume = 0;
    dragFadeFrameId = null;
    return;
  }

  if (Math.abs(dragCurrentVolume - dragTargetVolume) < 0.005) {
    dragCurrentVolume = dragTargetVolume;
    drag.volume = dragTargetVolume;
    dragFadeFrameId = null;
    return;
  }

  dragFadeFrameId = requestAnimationFrame(fadeBalanceDrag);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}
