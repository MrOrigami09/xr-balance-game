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

dom.joinButton.addEventListener("click", joinGame);
dom.leftButton.addEventListener("click", () => changeSide("LEFT"));
dom.rightButton.addEventListener("click", () => changeSide("RIGHT"));
dom.musicButton.addEventListener("click", onToggleAudio);
dom.exitButton.addEventListener("click", exitGame);
updateMusicButton();

subscribeToPlayers(loadPlayers);
restorePlayerOnLoad();
startHeartbeat(() => currentPlayer);

window.addEventListener("beforeunload", () => {
  if (currentPlayer) {
    markPlayerInactive(currentPlayer.id);
  }
});

async function joinGame() {
  const alias = dom.aliasInput.value.trim();

  if (!alias) {
    dom.loginError.textContent = "Ingresa un alias valido";
    return;
  }

  const { player, error } = await createPlayer(alias);

  if (error) {
    console.error("ERROR INSERT PLAYER:", error);
    dom.loginError.textContent = error.message;
    return;
  }

  currentPlayer = player;
  localStorage.setItem("current_player_id", currentPlayer.id);
  showGameScreen();
  await loadPlayers();
}

async function restorePlayerOnLoad() {
  const { player } = await restoreSavedPlayer();

  if (!player) return;

  currentPlayer = player;
  showGameScreen();
  await loadPlayers();
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
    return;
  }

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

}

async function exitGame() {
  if (!currentPlayer) return;

  const shouldExit = window.confirm("Salir del juego?");
  if (!shouldExit) return;

  await markPlayerInactive(currentPlayer.id);
  localStorage.removeItem("current_player_id");
  currentPlayer = null;
  showLoginScreen();
  await loadPlayers();
}

function showGameScreen() {
  dom.loginScreen.classList.add("hidden");
  dom.gameScreen.classList.remove("hidden");
  dom.playerName.textContent = currentPlayer.alias;
  updateMusicButton();

  setTimeout(() => {
    initSceneElements();

    const scene = document.querySelector("a-scene");
    if (scene && scene.resize) scene.resize();
  }, 300);
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
