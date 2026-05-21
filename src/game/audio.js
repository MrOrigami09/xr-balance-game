let calm;
let tension;
let danger;

export function initAudio() {
  if (calm) return;

  calm = new Audio("/assets/sounds/calm.mp3");
  tension = new Audio("/assets/sounds/tension.mp3");
  danger = new Audio("/assets/sounds/danger.mp3");

  ;[calm, tension, danger].forEach(audio => {
    audio.loop = true;
    audio.volume = 0;
  });

  calm.volume = 0.35;

  calm.play().catch(() => {});
}

function stopAll() {
  ;[calm, tension, danger].forEach(audio => {
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  });
}

export function updateAudio(balance) {

  if (!calm) return;

  const diff = Math.abs(balance.difference);

  stopAll();

  if (diff === 0) {
    calm.volume = 0.35;
    calm.play();
  }

  else if (diff <= 3) {
    tension.volume = 0.35;
    tension.play();
  }

  else {
    danger.volume = 0.45;
    danger.play();
  }
}