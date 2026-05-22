import "aframe";

import "./style.css";

import { renderTemplate } from "./ui/template";
import { getDom } from "./ui/dom";

import {
  createPlayer,
  updatePlayerSide,
  restoreSavedPlayer,
  startHeartbeat,
  markPlayerInactive,
} from "./services/playersService";

import { subscribeToPlayers } from "./services/realtimeService";
import { getActivePlayers, getBalanceData } from "./game/physics";
import { initSceneElements, updateScene } from "./game/scene";
import { isAudioEnabled, toggleAudio, updateAudio } from "./game/audio";
import { updateRanking, getRanking } from "./services/rankingService";

const app = document.querySelector("#app");

app.innerHTML = renderTemplate();

const dom = getDom();

let currentPlayer = null;
let sceneInitialized = false;

const CONNECTION_STATES = {
  connected: {
    label: "🟢 Conectado",
    className: "connection-pill--connected",
  },
  reconnecting: {
    label: "🟡 Reconectando",
    className: "connection-pill--reconnecting",
  },
  offline: {
    label: "🔴 Sin conexión",
    className: "connection-pill--offline",
  },
};

dom.joinButton.addEventListener("click", joinGame);
dom.leftButton.addEventListener("click", () => changeSide("LEFT"));
dom.rightButton.addEventListener("click", () => changeSide("RIGHT"));
dom.musicButton.addEventListener("click", onToggleAudio);
dom.exitButton.addEventListener("click", exitGame);
dom.helpButton.addEventListener("click", openHelpModal);
dom.helpCloseButton.addEventListener("click", closeHelpModal);
dom.helpModal.addEventListener("click", event => {
  if (event.target === dom.helpModal) {
    closeHelpModal();
  }
});
window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeHelpModal();
  }
});
window.addEventListener("online", onOnline);
window.addEventListener("offline", () => setConnectionStatus("offline"));

updateMusicButton();
setConnectionStatus(navigator.onLine ? "connected" : "offline");

subscribeToPlayers(loadPlayers);
restorePlayerOnLoad();
startHeartbeat(() => currentPlayer);

window.addEventListener("beforeunload", markCurrentPlayerInactive);
window.addEventListener("pagehide", markCurrentPlayerInactive);

function markCurrentPlayerInactive() {
  if (currentPlayer) {
    markPlayerInactive(currentPlayer.id);
  }
}

async function joinGame() {
  const alias = dom.aliasInput.value.trim();

  if (!alias) {
    dom.loginError.textContent = "Ingresa un alias valido";
    return;
  }

  showLoadingScreen();
  dom.joinButton.disabled = true;

  const { player, error } = await createPlayer(alias);

  if (error) {
    console.error("ERROR INSERT PLAYER:", error);
    dom.loginError.textContent = error.message;
    dom.joinButton.disabled = false;
    hideLoadingScreen();
    return;
  }

  currentPlayer = player;
  localStorage.setItem("current_player_id", currentPlayer.id);

  try {
    await enterGame();
  } catch (error) {
    console.error("ERROR ENTER GAME:", error);
    dom.loginError.textContent = "No se pudo preparar la arena.";
    showLoginScreen();
  } finally {
    dom.joinButton.disabled = false;
  }
}

async function restorePlayerOnLoad() {
  const { player } = await restoreSavedPlayer();

  if (!player) return;

  showLoadingScreen();
  currentPlayer = player;

  try {
    await enterGame();
  } catch (error) {
    console.error("ERROR RESTORE PLAYER:", error);
    currentPlayer = null;
    showLoginScreen();
    hideLoadingScreen();
  }
}

async function changeSide(side) {
  if (!currentPlayer) return;

  const { player, error } = await updatePlayerSide(currentPlayer.id, side);

  if (error) {
    console.error("ERROR UPDATE SIDE:", error);
    return;
  }
  currentPlayer = player;
  await loadPlayers();
}

async function loadPlayers() {

  const { players, error } =
    await getActivePlayers();

  if (error) {
    console.error(
      "ERROR LOAD PLAYERS:",
      error
    );
    setConnectionStatus(navigator.onLine ? "reconnecting" : "offline");
    return false;
  }

  setConnectionStatus("connected");

  const balance =
    getBalanceData(players);

  dom.leftCount.textContent =
    balance.leftCount;

  dom.rightCount.textContent =
    balance.rightCount;

  dom.balanceState.textContent =
    balance.state;

  renderPlayerList(dom.leftPlayersList, balance.leftPlayers);
  renderPlayerList(dom.rightPlayersList, balance.rightPlayers);

  updateScene(balance, currentPlayer?.id);

  updateAudio(balance);

  const totalPlayers =
    balance.leftCount +
    balance.rightCount;

  await updateRanking(
    totalPlayers
  );

  const ranking =
    await getRanking();

  if (ranking) {

    dom.rankingValue.textContent =
      `${ranking.max_players} jugadores`;

  }

  return true;
}

async function exitGame() {
  if (!currentPlayer) return;

  const playerId = currentPlayer.id;

  if (isAudioEnabled()) {
    toggleAudio();
    updateMusicButton();
  }

  await markPlayerInactive(playerId);
  localStorage.removeItem("current_player_id");
  currentPlayer = null;
  closeHelpModal();
  showLoginScreen();
  await loadPlayers();
}

async function enterGame() {
  showGameScreen();

  try {
    await waitForFrame();
    initGameScene();
    await waitForPlayersLoaded();
    await waitForSceneReady();
    await waitForModelsReady();
  } finally {
    hideLoadingScreen();
  }
}

function showGameScreen() {
  dom.loginScreen.classList.add("hidden");
  dom.gameScreen.classList.remove("hidden");
  dom.playerName.textContent = currentPlayer.alias;
  updateMusicButton();
}

function initGameScene() {
  if (!sceneInitialized) {
    initSceneElements();
    sceneInitialized = true;
  }

  const scene = document.querySelector("a-scene");
  if (scene && scene.resize) scene.resize();
}

async function onToggleAudio() {
  toggleAudio();
  updateMusicButton();
  await loadPlayers();
}

function updateMusicButton() {
  const enabled = isAudioEnabled();
  const label = enabled ? "Desactivar musica" : "Activar musica";

  dom.musicIcon.textContent = enabled ? "🔊" : "🔇";
  dom.musicButton.classList.toggle("music-button--active", enabled);
  dom.musicButton.setAttribute("title", label);
  dom.musicButton.setAttribute("aria-label", label);
  dom.musicButton.setAttribute("aria-pressed", String(enabled));
}

function showLoadingScreen() {
  dom.loadingScreen.classList.remove("hidden");
}

function hideLoadingScreen() {
  dom.loadingScreen.classList.add("hidden");
}

function openHelpModal() {
  dom.helpModal.classList.remove("hidden");
  dom.helpCloseButton.focus();
}

function closeHelpModal() {
  dom.helpModal.classList.add("hidden");
}

async function onOnline() {
  setConnectionStatus("reconnecting");
  await loadPlayers();
}

function setConnectionStatus(status) {
  const state = CONNECTION_STATES[status] || CONNECTION_STATES.connected;

  dom.connectionLabel.textContent = state.label;
  dom.connectionPill.classList.remove(
    "connection-pill--connected",
    "connection-pill--reconnecting",
    "connection-pill--offline"
  );
  dom.connectionPill.classList.add(state.className);
}

function waitForFrame() {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

async function waitForPlayersLoaded(timeout = 6000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    const loaded = await loadPlayers();

    if (loaded) {
      return true;
    }

    await wait(800);
  }

  return false;
}

function wait(duration) {
  return new Promise(resolve => window.setTimeout(resolve, duration));
}

function waitForSceneReady() {
  const scene = document.querySelector("a-scene");

  if (!scene || scene.hasLoaded) {
    return Promise.resolve();
  }

  return waitForEventOrTimeout(scene, "loaded", 4000);
}

function waitForModelsReady() {
  const models = Array.from(document.querySelectorAll("[gltf-model]"));

  if (!models.length) {
    return Promise.resolve();
  }

  return Promise.all(
    models.map(model => {
      if (model.components?.["gltf-model"]?.model) {
        return Promise.resolve();
      }

      return Promise.race([
        waitForEventOrTimeout(model, "model-loaded", 4500),
        waitForEventOrTimeout(model, "model-error", 4500),
      ]);
    })
  );
}

function waitForEventOrTimeout(element, eventName, timeout) {
  return new Promise(resolve => {
    const timer = window.setTimeout(done, timeout);

    function done() {
      window.clearTimeout(timer);
      element.removeEventListener(eventName, done);
      resolve();
    }

    element.addEventListener(eventName, done, { once: true });
  });
}

function showLoginScreen() {
  dom.gameScreen.classList.add("hidden");
  dom.loginScreen.classList.remove("hidden");
  dom.playerName.textContent = "";
  dom.aliasInput.value = "";
  dom.loginError.textContent = "";
}

function renderPlayerList(list, players) {
  list.replaceChildren(
    ...players.map(player => {
      const item = document.createElement("li");
      item.textContent = player.alias;
      return item;
    })
  );
}
