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
import { initAudio, updateAudio } from "./game/audio";
import { updateRanking, getRanking } from "./services/rankingService";

const app = document.querySelector("#app");

app.innerHTML = renderTemplate();

const dom = getDom();

let currentPlayer = null;

dom.joinButton.addEventListener("click", joinGame);
dom.leftButton.addEventListener("click", () => changeSide("LEFT"));
dom.rightButton.addEventListener("click", () => changeSide("RIGHT"));

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
    dom.loginError.textContent = "Ingresa un alias válido";
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

  dom.leftPlayersList.innerHTML =
    balance.leftPlayers
      .map(
        player =>
          `<li>${player.alias}</li>`
      )
      .join("");

  dom.rightPlayersList.innerHTML =
    balance.rightPlayers
      .map(
        player =>
          `<li>${player.alias}</li>`
      )
      .join("");

  updateScene(balance);

  updateAudio(balance);

  // ← AQUÍ VA EL RANKING

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

function showGameScreen() {
  dom.loginScreen.classList.add("hidden");
  dom.gameScreen.classList.remove("hidden");
  dom.playerName.textContent = currentPlayer.alias;
  initAudio();

  setTimeout(() => {
    initSceneElements();

    const scene = document.querySelector("a-scene");
    if (scene && scene.resize) scene.resize();
  }, 300);
}