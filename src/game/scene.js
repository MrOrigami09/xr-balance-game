import { updateBalanceDragSound } from "./audio";

// Ajusta aqui escala, rotacion y altura de cada modelo GLB.
// rotation corrige la orientacion propia del asset; side yaw mira hacia el centro.
const MODEL_CONFIG = {
  ogre: {
    path: "/assets/models/Ogre.glb",
    scale: "0.28 0.28 0.28",
    rotation: "0 90 0",
    verticalOffset: 0.02,
    labelY: 1.1,
  },
  goblin: {
    path: "/assets/models/Goblin.glb",
    scale: "0.75 0.75 0.75",
    // Si el Goblin mira al lado incorrecto, ajustar este valor.
    rotation: "0 90 0",
    verticalOffset: 0,
    labelY: 1.18,
  },
};

const SIDE_CONFIG = {
  LEFT: {
    color: "#38bdf8",
    emissive: "#0284c7",
    modelKey: "ogre",
    startX: -1.05,
    direction: -1,
    yaw: 0,
  },
  RIGHT: {
    color: "#fb923c",
    emissive: "#ea580c",
    modelKey: "goblin",
    startX: 1.05,
    direction: 1,
    yaw: 180,
  },
};

const BALANCE_END_CONFIG = {
  alphaColor: "#7dd3fc",
  omegaColor: "#fdba74",
  alphaGlow: "#38bdf8",
  omegaGlow: "#fb923c",
  // Ajustar largo de la cuerda aqui.
  chainLength: 0.52,
  chainRadius: 0.012,
  chainSpacing: 0.07,
  chainLinks: 5,
  // Ajustar tamano del diamante aqui.
  diamondSize: 0.22,
  verticalOffset: -0.04,
  // Ajustar posicion respecto a la barra aqui.
  leftPosition: [-2.55, -0.18, 0],
  rightPosition: [2.55, -0.18, 0],
};

// Ajusta aqui posicion, escala, rotacion y brillo de la luna.
const MOON_CONFIG = {
  path: "/assets/models/Moon.glb",
  position: "-3.1 5.35 -6.15",
  scale: "0.03 0.03 0.03",
  rotation: "0 -18 0",
  lightColor: "#dbeafe",
  glowColor: "#bfdbfe",
};

// Ajusta aqui rutas, escala, rotacion, altura y posiciones de torres.
const TOWER_CONFIG = {
  ALPHA: {
    path: "/assets/models/Tower-ogre.glb",
    color: "#38bdf8",
    emissive: "#0284c7",
    // Ajustar escala de torres Ogre aqui.
    scale: "1.8 1.8 1.5",
    rotation: "0 28 0",
    verticalOffset: 0,
    positions: [
      [-3.7, -6.35, 24],
      [-1.85, -6.9, 12],
      [-4.55, -3.95, 58],
      [-3.75, -1.7, 78],
    ],
  },
  OMEGA: {
    path: "/assets/models/Tower-goblin.glb",
    color: "#fb923c",
    emissive: "#ea580c",
    scale: "0.52 0.52 0.52",
    rotation: "0 -28 0",
    verticalOffset: 0,
    positions: [
      [3.7, -6.35, -24],
      [1.85, -6.9, -12],
      [4.55, -3.95, -58],
      [3.75, -1.7, -78],
    ],
  },
};

const STATE_CONFIG = {
  stable: {
    sky: "#030712",
    leftLight: 1.05,
    rightLight: 1.05,
    ring: "#facc15",
    hudGlow: "#38bdf8",
    status: "#ffffff",
    wrapperClass: "xr-state-stable",
  },
  left: {
    sky: "#051426",
    leftLight: 1.55,
    rightLight: 0.82,
    ring: "#fde68a",
    hudGlow: "#38bdf8",
    status: "#7dd3fc",
    wrapperClass: "xr-state-left",
  },
  right: {
    sky: "#1c1006",
    leftLight: 0.82,
    rightLight: 1.55,
    ring: "#fbbf24",
    hudGlow: "#fb923c",
    status: "#fdba74",
    wrapperClass: "xr-state-right",
  },
  critical: {
    sky: "#160816",
    leftLight: 1.8,
    rightLight: 1.8,
    ring: "#f97316",
    hudGlow: "#f97316",
    status: "#fecaca",
    wrapperClass: "xr-state-critical",
  },
};

let sceneWrapper = null;
let arenaHud = null;
let arenaHudPanel = null;
let arenaHudGlow = null;
let balancePivot = null;
let balanceBar = null;
let sceneStatus = null;
let sceneScore = null;
let leftWeight = null;
let rightWeight = null;
let avatarRoot = null;
let starRoot = null;
let towerRoot = null;
let moonRoot = null;
let cloudRoot = null;
let particleRoot = null;
let sky = null;
let leftGlow = null;
let rightGlow = null;
let keyLight = null;
let moonLight = null;
let innerArenaRing = null;
let outerArenaRing = null;
let arenaPlatform = null;
let animationFrameId = null;

let targetRotation = 0;
let currentRotation = 0;
let rotationVelocity = 0;
let targetLeftCount = 0;
let targetRightCount = 0;
let currentLeftScale = 1;
let currentRightScale = 1;
let wobbleEnergy = 0;
let activeVisualState = "stable";
let lastHudValue = "";
let lastBalanceSoundRotation = 0;

export function initSceneElements() {
  sceneWrapper = document.querySelector(".scene-wrapper");
  arenaHud = document.querySelector("#arena-hud");
  arenaHudPanel = document.querySelector("#arena-hud-panel");
  arenaHudGlow = document.querySelector("#arena-hud-glow");
  balancePivot = document.querySelector("#balance-pivot");
  balanceBar = document.querySelector("#balance-bar");
  sceneStatus = document.querySelector("#scene-status");
  sceneScore = document.querySelector("#scene-score");
  leftWeight = document.querySelector("#left-weight");
  rightWeight = document.querySelector("#right-weight");
  avatarRoot = document.querySelector("#avatar-root");
  starRoot = document.querySelector("#star-root");
  towerRoot = document.querySelector("#tower-root");
  moonRoot = document.querySelector("#moon-root");
  cloudRoot = document.querySelector("#cloud-root");
  particleRoot = document.querySelector("#particle-root");
  sky = document.querySelector("#xr-sky");
  leftGlow = document.querySelector("#left-glow");
  rightGlow = document.querySelector("#right-glow");
  keyLight = document.querySelector("#key-light");
  moonLight = document.querySelector("#moon-light");
  innerArenaRing = document.querySelector("#inner-arena-ring");
  outerArenaRing = document.querySelector("#outer-arena-ring");
  arenaPlatform = document.querySelector("#arena-platform");

  createBalanceEnds();
  createStars();
  createMoon();
  createTowers();
  createClouds();
  createParticles();
  applyVisualState("stable");

  if (!animationFrameId) {
    animateBalance();
  }
}

export function updateScene(balance, currentPlayerId = null) {
  const {
    leftCount,
    rightCount,
    leftPlayers = [],
    rightPlayers = [],
    rotation,
    state,
    visualState = "stable",
    absDifference = 0,
  } = balance;

  if (rotation !== targetRotation) {
    wobbleEnergy = Math.min(2.6, 0.8 + Math.abs(rotation - targetRotation) / 14);
  }

  targetRotation = rotation;
  targetLeftCount = leftCount;
  targetRightCount = rightCount;

  renderAvatars("LEFT", leftPlayers, currentPlayerId);
  renderAvatars("RIGHT", rightPlayers, currentPlayerId);
  applyVisualState(absDifference >= 4 ? "critical" : visualState);

  updateArenaHud(state, leftCount, rightCount);
}

function animateBalance(time = 0) {
  const difference = targetRightCount - targetLeftCount;
  const tension = Math.min(Math.abs(difference), 8);
  const spring = (targetRotation - currentRotation) * 0.035;
  const damping = activeVisualState === "stable" ? 0.84 : 0.88;
  const criticalPulse = activeVisualState === "critical" ? Math.sin(time * 0.012) * 0.45 : 0;
  const wobble = Math.sin(time * 0.006) * wobbleEnergy * (0.55 + tension * 0.08);

  rotationVelocity = (rotationVelocity + spring) * damping;
  currentRotation += rotationVelocity;
  wobbleEnergy = Math.max(0, wobbleEnergy * 0.965 - 0.002);
  const displayedRotation = currentRotation + wobble + criticalPulse;
  const balanceMovement = Math.abs(displayedRotation - lastBalanceSoundRotation);

  updateBalanceDragSound(balanceMovement);
  lastBalanceSoundRotation = displayedRotation;

  currentLeftScale = lerp(currentLeftScale, 1 + targetLeftCount * 0.17, 0.085);
  currentRightScale = lerp(currentRightScale, 1 + targetRightCount * 0.17, 0.085);

  if (balancePivot) {
    balancePivot.setAttribute(
      "rotation",
      `0 0 ${displayedRotation}`
    );
  } else if (balanceBar) {
    balanceBar.setAttribute(
      "rotation",
      `0 0 ${displayedRotation}`
    );
  }

  updateWeight(leftWeight, BALANCE_END_CONFIG.leftPosition, currentLeftScale, -currentRotation);
  updateWeight(rightWeight, BALANCE_END_CONFIG.rightPosition, currentRightScale, currentRotation);

  animationFrameId = requestAnimationFrame(animateBalance);
}

function updateWeight(weight, position, scale, rotationInfluence) {
  if (!weight) return;

  const [x, baseY, z] = position;
  const y =
    baseY +
    BALANCE_END_CONFIG.verticalOffset -
    Math.max(scale - 1, 0) * 0.06 +
    rotationInfluence / 125;

  weight.setAttribute("position", `${x} ${y} ${z}`);
  weight.setAttribute("scale", "1 1 1");
}

function renderAvatars(side, players, currentPlayerId) {
  if (!avatarRoot) return;

  const activeIds = new Set(players.map(player => String(player.id)));
  const existing = new Map(
    Array.from(avatarRoot.querySelectorAll(`[data-side="${side}"]`)).map(
      avatar => [avatar.dataset.playerId, avatar]
    )
  );

  players.forEach((player, index) => {
    const id = String(player.id);
    const avatar = existing.get(id) || createAvatar(player, side);
    const { x, y, z } = getAvatarPosition(side, index, players.length);
    const rig = avatar.querySelector("[data-avatar-rig]");
    const label = avatar.querySelector("[data-alias]");
    const halo = avatar.querySelector("[data-current-halo]");
    const isCurrent = currentPlayerId && id === String(currentPlayerId);

    avatar.dataset.exiting = "false";
    avatar.setAttribute("position", `${x} ${y} ${z}`);
    avatar.setAttribute("rotation", `0 ${SIDE_CONFIG[side].yaw} 0`);
    avatar.setAttribute("scale", isCurrent ? "1.14 1.14 1.14" : "1 1 1");
    label.setAttribute("value", player.alias || "Jugador");
    halo.setAttribute("visible", isCurrent ? "true" : "false");

    if (rig) {
      rig.setAttribute("animation__idle", getIdleAnimation(index, isCurrent));
    }

    existing.delete(id);
  });

  existing.forEach((avatar, id) => {
    if (!activeIds.has(id)) removeAvatarWithExit(avatar);
  });
}

function createAvatar(player, side) {
  const config = SIDE_CONFIG[side];
  const modelConfig = MODEL_CONFIG[config.modelKey];
  const avatar = document.createElement("a-entity");
  const rig = document.createElement("a-entity");
  const model = document.createElement("a-entity");
  const fallback = document.createElement("a-entity");

  avatar.dataset.playerId = String(player.id);
  avatar.dataset.side = side;
  avatar.dataset.exiting = "false";
  avatar.setAttribute("class", "player-avatar");
  avatar.setAttribute("scale", "0.08 0.08 0.08");
  avatar.setAttribute(
    "animation__enter",
    "property: scale; to: 1 1 1; dur: 360; easing: easeOutBack"
  );

  rig.dataset.avatarRig = "";

  model.dataset.avatarModel = "";
  model.setAttribute("gltf-model", `url(${modelConfig.path})`);
  model.setAttribute("position", `0 ${modelConfig.verticalOffset} 0`);
  model.setAttribute("rotation", modelConfig.rotation);
  model.setAttribute("scale", modelConfig.scale);
  model.addEventListener("model-loaded", () => {
    fallback.setAttribute("visible", "false");
  });
  model.addEventListener("model-error", () => {
    fallback.setAttribute("visible", "true");
  });

  fallback.dataset.avatarFallback = "";
  fallback.setAttribute("visible", "true");

  const body = document.createElement("a-cylinder");
  body.setAttribute("position", "0 0.28 0");
  body.setAttribute("radius", "0.16");
  body.setAttribute("height", "0.52");
  body.setAttribute("segments-radial", "16");
  body.setAttribute(
    "material",
    `color: ${config.color}; emissive: ${config.emissive}; emissiveIntensity: 0.2; roughness: 0.4; metalness: 0.25`
  );

  const head = document.createElement("a-sphere");
  head.setAttribute("position", "0 0.66 0");
  head.setAttribute("radius", "0.18");
  head.setAttribute(
    "material",
    `color: #e0f2fe; emissive: ${config.emissive}; emissiveIntensity: 0.08; roughness: 0.35`
  );

  fallback.append(body, head);

  const baseRing = document.createElement("a-ring");
  baseRing.setAttribute("position", "0 0.04 0");
  baseRing.setAttribute("rotation", "-90 0 0");
  baseRing.setAttribute("radius-inner", "0.22");
  baseRing.setAttribute("radius-outer", "0.3");
  baseRing.setAttribute(
    "material",
    `color: ${config.color}; emissive: ${config.emissive}; emissiveIntensity: 0.28`
  );

  const currentHalo = document.createElement("a-ring");
  currentHalo.dataset.currentHalo = "";
  currentHalo.setAttribute("visible", "false");
  currentHalo.setAttribute("position", "0 0.08 0");
  currentHalo.setAttribute("rotation", "-90 0 0");
  currentHalo.setAttribute("radius-inner", "0.34");
  currentHalo.setAttribute("radius-outer", "0.43");
  currentHalo.setAttribute(
    "material",
    "color: #ffffff; emissive: #ffffff; emissiveIntensity: 0.38; opacity: 0.92; transparent: true"
  );
  currentHalo.setAttribute(
    "animation__pulse",
    "property: scale; dir: alternate; dur: 900; easing: easeInOutSine; loop: true; to: 1.18 1.18 1.18"
  );

  const label = document.createElement("a-text");
  label.dataset.alias = "";
  label.setAttribute("value", player.alias || "Jugador");
  label.setAttribute("position", `0 ${modelConfig.labelY} 0`);
  label.setAttribute("align", "center");
  label.setAttribute("color", "#ffffff");
  label.setAttribute("width", "2.4");

  rig.append(model, fallback, baseRing, currentHalo, label);
  avatar.append(rig);
  avatarRoot.appendChild(avatar);
  return avatar;
}

function removeAvatarWithExit(avatar) {
  if (avatar.dataset.exiting === "true") return;

  avatar.dataset.exiting = "true";
  avatar.setAttribute(
    "animation__exit",
    "property: scale; to: 0.05 0.05 0.05; dur: 260; easing: easeInQuad"
  );

  window.setTimeout(() => avatar.remove(), 280);
}

function getAvatarPosition(side, index, total) {
  const config = SIDE_CONFIG[side];
  const columns = Math.max(1, Math.min(6, total <= 4 ? total : Math.ceil(Math.sqrt(total * 1.4))));
  const spacing = total > 10 ? 0.34 : total > 6 ? 0.4 : 0.48;
  const row = Math.floor(index / columns);
  const column = index % columns;
  const x = config.startX + config.direction * column * spacing;
  const z = -2.92 - row * 0.42;

  return { x, y: 0.08, z };
}

function getIdleAnimation(index, isCurrent) {
  const height = isCurrent ? 0.08 : 0.05;
  const duration = 1250 + (index % 5) * 160;

  return [
    "property: position",
    "dir: alternate",
    `dur: ${duration}`,
    "easing: easeInOutSine",
    "loop: true",
    `to: 0 ${height} 0`,
  ].join("; ");
}

function createBalanceEnds() {
  createBalanceEnd(
    leftWeight,
    BALANCE_END_CONFIG.alphaColor,
    BALANCE_END_CONFIG.alphaGlow
  );
  createBalanceEnd(
    rightWeight,
    BALANCE_END_CONFIG.omegaColor,
    BALANCE_END_CONFIG.omegaGlow
  );
}

function createBalanceEnd(root, color, glow) {
  if (!root || root.children.length) return;

  const topCone = document.createElement("a-cone");
  const bottomCone = document.createElement("a-cone");
  const shine = document.createElement("a-sphere");
  const diamondY = -BALANCE_END_CONFIG.chainLength;
  const halfDiamond = BALANCE_END_CONFIG.diamondSize / 2;

  createHanger(root);

  topCone.setAttribute("position", `0 ${diamondY + halfDiamond / 2} 0`);
  topCone.setAttribute("radius-bottom", BALANCE_END_CONFIG.diamondSize);
  topCone.setAttribute("radius-top", "0");
  topCone.setAttribute("height", BALANCE_END_CONFIG.diamondSize);
  topCone.setAttribute(
    "material",
    `color: ${color}; emissive: ${glow}; emissiveIntensity: 0.62; opacity: 0.94; transparent: true; roughness: 0.18; metalness: 0.3`
  );

  bottomCone.setAttribute("position", `0 ${diamondY - halfDiamond / 2} 0`);
  bottomCone.setAttribute("rotation", "180 0 0");
  bottomCone.setAttribute("radius-bottom", BALANCE_END_CONFIG.diamondSize);
  bottomCone.setAttribute("radius-top", "0");
  bottomCone.setAttribute("height", BALANCE_END_CONFIG.diamondSize);
  bottomCone.setAttribute(
    "material",
    `color: ${color}; emissive: ${glow}; emissiveIntensity: 0.62; opacity: 0.94; transparent: true; roughness: 0.18; metalness: 0.3`
  );

  shine.setAttribute("position", `0 ${diamondY} 0`);
  shine.setAttribute("radius", BALANCE_END_CONFIG.diamondSize * 0.78);
  shine.setAttribute(
    "material",
    `color: ${glow}; emissive: ${glow}; emissiveIntensity: 0.28; opacity: 0.14; transparent: true`
  );
  shine.setAttribute(
    "animation__crystalpulse",
    "property: scale; dir: alternate; dur: 1200; easing: easeInOutSine; loop: true; to: 1.18 1.18 1.18"
  );

  root.append(topCone, bottomCone, shine);
}

function createHanger(root) {
  const connector = document.createElement("a-torus");

  connector.setAttribute("position", "0 0 0");
  connector.setAttribute("rotation", "90 0 0");
  connector.setAttribute("radius", "0.09");
  connector.setAttribute("radius-tubular", "0.01");
  connector.setAttribute(
    "material",
    "color: #fbbf24; emissive: #d97706; emissiveIntensity: 0.22; metalness: 0.62; roughness: 0.26"
  );
  root.appendChild(connector);

  [-1, 1].forEach(side => {
    const cable = document.createElement("a-cylinder");
    const x = side * BALANCE_END_CONFIG.chainSpacing;

    cable.setAttribute("position", `${x} ${-BALANCE_END_CONFIG.chainLength / 2} 0`);
    cable.setAttribute("radius", BALANCE_END_CONFIG.chainRadius);
    cable.setAttribute("height", BALANCE_END_CONFIG.chainLength);
    cable.setAttribute(
      "material",
      "color: #fbbf24; emissive: #d97706; emissiveIntensity: 0.18; metalness: 0.6; roughness: 0.28"
    );
    root.appendChild(cable);
  });

  for (let index = 1; index <= BALANCE_END_CONFIG.chainLinks; index += 1) {
    const y = -(BALANCE_END_CONFIG.chainLength / (BALANCE_END_CONFIG.chainLinks + 1)) * index;
    const link = document.createElement("a-torus");

    link.setAttribute("position", `0 ${y} 0`);
    link.setAttribute("rotation", `${index % 2 ? 90 : 0} 0 0`);
    link.setAttribute("radius", "0.065");
    link.setAttribute("radius-tubular", "0.008");
    link.setAttribute(
      "material",
      "color: #fde68a; emissive: #d97706; emissiveIntensity: 0.16; metalness: 0.58; roughness: 0.3"
    );
    root.appendChild(link);
  }
}

function applyVisualState(state) {
  const nextState = STATE_CONFIG[state] ? state : "stable";
  const config = STATE_CONFIG[nextState];

  activeVisualState = nextState;

  if (sceneWrapper) {
    sceneWrapper.classList.remove(
      "xr-state-stable",
      "xr-state-left",
      "xr-state-right",
      "xr-state-critical"
    );
    sceneWrapper.classList.add(config.wrapperClass);
  }

  sky?.setAttribute("color", config.sky);
  sceneStatus?.setAttribute("color", config.status);
  sceneScore?.setAttribute("color", "#ffffff");
  setLightIntensity(leftGlow, config.leftLight);
  setLightIntensity(rightGlow, config.rightLight);
  setLightIntensity(keyLight, nextState === "critical" ? 1.65 : 1.35);

  innerArenaRing?.setAttribute(
    "material",
    `color: #f8fafc; emissive: ${config.ring}; emissiveIntensity: ${nextState === "critical" ? 0.42 : 0.18}; roughness: 0.42; metalness: 0.22`
  );
  outerArenaRing?.setAttribute(
    "material",
    `color: #d97706; emissive: ${config.ring}; emissiveIntensity: ${nextState === "critical" ? 0.5 : 0.28}; metalness: 0.35`
  );
  arenaPlatform?.setAttribute(
    "material",
    `color: #e5e7eb; emissive: ${nextState === "critical" ? "#92400e" : "#78350f"}; emissiveIntensity: ${nextState === "critical" ? 0.18 : 0.05}; roughness: 0.48; metalness: 0.2`
  );
  arenaHudPanel?.setAttribute(
    "material",
    "color: #2a160c; opacity: 0.9; transparent: true; roughness: 0.82; metalness: 0.04"
  );
  arenaHudGlow?.setAttribute(
    "material",
    `color: ${config.hudGlow}; opacity: ${nextState === "critical" ? 0.18 : 0.08}; transparent: true; emissive: ${config.hudGlow}; emissiveIntensity: ${nextState === "critical" ? 0.32 : 0.2}`
  );
}

function updateArenaHud(state, leftCount, rightCount) {
  const score = `${formatScore(leftCount)} - ${formatScore(rightCount)}`;
  const hudValue = `${state}:${score}`;

  sceneStatus?.setAttribute("value", state);
  sceneScore?.setAttribute("value", score);

  if (!arenaHud || hudValue === lastHudValue) return;

  lastHudValue = hudValue;
  arenaHud.removeAttribute("animation__scorepop");
  arenaHud.setAttribute(
    "animation__scorepop",
    "property: scale; from: 1.08 1.08 1.08; to: 1 1 1; dur: 260; easing: easeOutQuad"
  );
}

function formatScore(value) {
  return String(value).padStart(2, "0");
}

function setLightIntensity(light, intensity) {
  if (!light) return;

  const currentLight = light.getAttribute("light") || {};
  light.setAttribute("light", {
    ...currentLight,
    intensity,
  });
}

function createMoon() {
  if (!moonRoot || moonRoot.children.length) return;

  moonLight?.setAttribute("position", MOON_CONFIG.position);
  moonLight?.setAttribute("light", {
    type: "point",
    intensity: 1.05,
    color: MOON_CONFIG.lightColor,
    distance: 9,
  });

  const moon = document.createElement("a-entity");
  const fallback = document.createElement("a-sphere");
  const halo = document.createElement("a-ring");

  moon.setAttribute("gltf-model", `url(${MOON_CONFIG.path})`);
  moon.setAttribute("position", MOON_CONFIG.position);
  moon.setAttribute("rotation", MOON_CONFIG.rotation);
  moon.setAttribute("scale", MOON_CONFIG.scale);
  moon.addEventListener("model-loaded", () => {
    fallback.setAttribute("visible", "false");
  });
  moon.addEventListener("model-error", () => {
    fallback.setAttribute("visible", "true");
  });

  fallback.setAttribute("position", MOON_CONFIG.position);
  fallback.setAttribute("scale", MOON_CONFIG.scale);
  fallback.setAttribute("radius", "0.42");
  fallback.setAttribute("visible", "true");
  fallback.setAttribute(
    "material",
    `color: #d1d5db; emissive: ${MOON_CONFIG.glowColor}; emissiveIntensity: 0.24; roughness: 0.8; metalness: 0.02`
  );

  halo.setAttribute("position", MOON_CONFIG.position);
  halo.setAttribute("rotation", "0 0 0");
  halo.setAttribute("radius-inner", "0.56");
  halo.setAttribute("radius-outer", "1.02");
  halo.setAttribute("scale", MOON_CONFIG.scale);
  halo.setAttribute(
    "material",
    `color: ${MOON_CONFIG.glowColor}; emissive: ${MOON_CONFIG.glowColor}; emissiveIntensity: 0.34; opacity: 0.16; transparent: true`
  );
  halo.setAttribute(
    "animation__moonpulse",
    "property: scale; dir: alternate; dur: 2800; easing: easeInOutSine; loop: true; to: 1.12 1.12 1.12"
  );

  moonRoot.append(moon, fallback, halo);
}

function createStars() {
  if (!starRoot || starRoot.children.length) return;

  for (let index = 0; index < 72; index += 1) {
    const star = document.createElement("a-sphere");
    const angle = (index / 72) * Math.PI * 2;
    const radius = 7.5 + (index % 9) * 0.55;
    const x = Math.cos(angle) * radius;
    const y = 3.2 + (index % 11) * 0.32;
    const z = -4 + Math.sin(angle) * radius;
    const size = 0.012 + (index % 4) * 0.006;
    const opacity = 0.45 + (index % 5) * 0.1;

    star.setAttribute("position", `${x.toFixed(2)} ${y.toFixed(2)} ${z.toFixed(2)}`);
    star.setAttribute("radius", size.toFixed(3));
    star.setAttribute(
      "material",
      `color: #ffffff; emissive: #ffffff; emissiveIntensity: ${opacity}; opacity: ${opacity}; transparent: true`
    );
    star.setAttribute(
      "animation__twinkle",
      `property: scale; dir: alternate; dur: ${1400 + (index % 8) * 180}; easing: easeInOutSine; loop: true; to: 1.45 1.45 1.45`
    );

    starRoot.appendChild(star);
  }
}

function createTowers() {
  if (!towerRoot || towerRoot.children.length) return;

  Object.values(TOWER_CONFIG).forEach(config => {
    config.positions.forEach(([x, z, yaw], index) => {
      const tower = document.createElement("a-entity");
      const model = document.createElement("a-entity");
      const fallback = createTowerFallback(config, index);

      tower.setAttribute("position", `${x} ${config.verticalOffset} ${z}`);
      tower.setAttribute("rotation", `0 ${yaw} 0`);

      model.setAttribute("gltf-model", `url(${config.path})`);
      model.setAttribute("scale", config.scale);
      model.setAttribute("rotation", config.rotation);
      model.addEventListener("model-loaded", () => {
        fallback.setAttribute("visible", "false");
      });
      model.addEventListener("model-error", () => {
        fallback.setAttribute("visible", "true");
      });

      tower.append(model, fallback);
      towerRoot.appendChild(tower);
    });
  });
}

function createTowerFallback(config, index) {
  const fallback = document.createElement("a-entity");
  const base = document.createElement("a-cylinder");
  const body = document.createElement("a-cylinder");
  const cap = document.createElement("a-cone");
  const flame = document.createElement("a-sphere");

  fallback.setAttribute("visible", "true");

  base.setAttribute("position", "0 0.12 0");
  base.setAttribute("radius", "0.34");
  base.setAttribute("height", "0.24");
  base.setAttribute("segments-radial", "24");
  base.setAttribute("material", "color: #d6d3d1; roughness: 0.45; metalness: 0.15");

  body.setAttribute("position", "0 0.82 0");
  body.setAttribute("radius", "0.22");
  body.setAttribute("height", "1.25");
  body.setAttribute("segments-radial", "24");
  body.setAttribute("material", "color: #f5f5f4; roughness: 0.42; metalness: 0.18");

  cap.setAttribute("position", "0 1.55 0");
  cap.setAttribute("radius-bottom", "0.36");
  cap.setAttribute("radius-top", "0.1");
  cap.setAttribute("height", "0.36");
  cap.setAttribute(
    "material",
    `color: ${config.color}; emissive: ${config.emissive}; emissiveIntensity: 0.14; roughness: 0.34; metalness: 0.38`
  );

  flame.setAttribute("position", "0 1.84 0");
  flame.setAttribute("radius", "0.08");
  flame.setAttribute(
    "material",
    `color: #fde68a; emissive: ${config.emissive}; emissiveIntensity: 0.5; opacity: 0.9; transparent: true`
  );
  flame.setAttribute(
    "animation__towerflame",
    `property: scale; dir: alternate; dur: ${900 + index * 90}; easing: easeInOutSine; loop: true; to: 1.25 1.25 1.25`
  );

  fallback.append(base, body, cap, flame);
  return fallback;
}

function createClouds() {
  if (!cloudRoot || cloudRoot.children.length) return;

  const cloudGroups = [
    [-5.2, 0.45, -5.8, 1.15],
    [5.1, 0.35, -5.2, 1.05],
    [-4.9, 0.25, -2.2, 0.95],
    [4.7, 0.2, -2.1, 1],
    [0.2, -0.15, -8.25, 1.25],
  ];

  cloudGroups.forEach(([x, y, z, scale], groupIndex) => {
    const cloud = document.createElement("a-entity");
    cloud.setAttribute("position", `${x} ${y} ${z}`);
    cloud.setAttribute("scale", `${scale} ${scale * 0.42} ${scale * 0.55}`);
    cloud.setAttribute(
      "animation__drift",
      `property: position; dir: alternate; dur: ${5200 + groupIndex * 650}; easing: easeInOutSine; loop: true; to: ${x + 0.28} ${y + 0.08} ${z}`
    );

    [-0.38, 0, 0.34, 0.68].forEach((offset, index) => {
      const puff = document.createElement("a-sphere");
      puff.setAttribute("position", `${offset} ${index % 2 ? 0.06 : 0} 0`);
      puff.setAttribute("radius", `${0.36 + (index % 2) * 0.08}`);
      puff.setAttribute(
        "material",
        "color: #f8fafc; opacity: 0.34; transparent: true; roughness: 0.9"
      );
      cloud.appendChild(puff);
    });

    cloudRoot.appendChild(cloud);
  });
}

function createParticles() {
  if (!particleRoot || particleRoot.children.length) return;

  const colors = ["#38bdf8", "#fb923c", "#e0f2fe"];

  for (let index = 0; index < 26; index += 1) {
    const particle = document.createElement("a-sphere");
    const side = index % 2 === 0 ? -1 : 1;
    const x = side * (2.25 + (index % 5) * 0.34);
    const y = 0.9 + (index % 7) * 0.18;
    const z = -2.45 - (index % 6) * 0.58;
    const color = colors[index % colors.length];
    const duration = 2600 + (index % 6) * 420;

    particle.setAttribute("position", `${x} ${y} ${z}`);
    particle.setAttribute("radius", `${0.018 + (index % 3) * 0.007}`);
    particle.setAttribute(
      "material",
      `color: ${color}; emissive: ${color}; emissiveIntensity: 0.32; opacity: 0.46; transparent: true`
    );
    particle.setAttribute(
      "animation__float",
      `property: position; dir: alternate; dur: ${duration}; easing: easeInOutSine; loop: true; to: ${x} ${y + 0.22} ${z}`
    );

    particleRoot.appendChild(particle);
  }
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}
