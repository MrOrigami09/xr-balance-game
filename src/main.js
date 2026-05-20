import "aframe";
import "./style.css";
import { supabase } from "./supabaseClient";

const app = document.querySelector("#app");

let currentPlayer = null;

app.innerHTML = `
  <main class="container">
    <section id="login-screen" class="card">
      <h1>XR Balance Game</h1>
      <p>Ingresa tu alias para participar</p>

      <input
        id="alias-input"
        type="text"
        placeholder="Tu alias"
        maxlength="30"
      />

      <button id="join-button">Entrar al juego</button>

      <p id="login-error" class="error"></p>
    </section>

    <section id="game-screen" class="card hidden">
      <h2>Bienvenido, <span id="player-name"></span></h2>

      <p>Selecciona tu lado:</p>

      <div class="buttons">
        <button id="left-button">LEFT</button>
        <button id="right-button">RIGHT</button>
      </div>

      <div class="scoreboard">
        <p>Izquierda: <strong id="left-count">0</strong></p>
        <p>Derecha: <strong id="right-count">0</strong></p>
        <p>Estado: <strong id="balance-state">Centro</strong></p>
      </div>

      <div class="scene-wrapper">
        <a-scene embedded>
          <a-sky color="#0f172a"></a-sky>

          <a-plane
            position="0 0 -4"
            rotation="-90 0 0"
            width="8"
            height="8"
            color="#334155">
          </a-plane>

          <a-cylinder
            position="0 0.4 -4"
            radius="0.15"
            height="1"
            color="#eab308">
          </a-cylinder>

          <a-box
            id="balance-bar"
            position="0 1 -4"
            rotation="0 0 0"
            width="4"
            height="0.12"
            depth="0.12"
            color="#f8fafc">
          </a-box>

          <a-sphere
            id="left-indicator"
            position="-2 1.3 -4"
            radius="0.2"
            color="#38bdf8">
          </a-sphere>

          <a-sphere
            id="right-indicator"
            position="2 1.3 -4"
            radius="0.2"
            color="#f97316">
          </a-sphere>

          <a-text
            id="scene-status"
            value="Centro"
            position="-1.4 2 -4"
            color="#ffffff"
            width="4">
          </a-text>

          <a-camera position="0 1.6 0"></a-camera>
        </a-scene>
      </div>
    </section>
  </main>
`;

const loginScreen = document.querySelector("#login-screen");
const gameScreen = document.querySelector("#game-screen");
const aliasInput = document.querySelector("#alias-input");
const joinButton = document.querySelector("#join-button");
const loginError = document.querySelector("#login-error");
const playerName = document.querySelector("#player-name");

const leftButton = document.querySelector("#left-button");
const rightButton = document.querySelector("#right-button");

const leftCount = document.querySelector("#left-count");
const rightCount = document.querySelector("#right-count");
const balanceState = document.querySelector("#balance-state");
let balanceBar = null;
let sceneStatus = null;

joinButton.addEventListener("click", joinGame);
leftButton.addEventListener("click", () => updateSide("LEFT"));
rightButton.addEventListener("click", () => updateSide("RIGHT"));
subscribeToPlayers();

async function joinGame() {
  const alias = aliasInput.value.trim();

  if (!alias) {
    loginError.textContent = "Ingresa un alias válido";
    return;
  }

  const { data, error } = await supabase
    .from("players")
    .insert({
      alias,
      side: null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("ERROR INSERT PLAYER:", error);
    loginError.textContent = error.message;
    return;
  }

  currentPlayer = data;

  loginScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  playerName.textContent = currentPlayer.alias;

  setTimeout(() => {
    balanceBar = document.querySelector("#balance-bar");
    sceneStatus = document.querySelector("#scene-status");
  }, 100);

  await loadPlayers();
}

async function updateSide(side) {
  if (!currentPlayer) return;

  const { data, error } = await supabase
    .from("players")
    .update({
      side,
      updated_at: new Date().toISOString(),
    })
    .eq("id", currentPlayer.id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  currentPlayer = data;
  await loadPlayers();
}

async function loadPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error(error);
    return;
  }

  const leftPlayers = data.filter((player) => player.side === "LEFT");
  const rightPlayers = data.filter((player) => player.side === "RIGHT");

  leftCount.textContent = leftPlayers.length;
  rightCount.textContent = rightPlayers.length;

  updateBalanceState(leftPlayers.length, rightPlayers.length);
}

function updateBalanceState(left, right) {
  const difference = right - left;
  const rotation = Math.max(Math.min(difference * -8, 30), -30);

  let state = "Centro";

  if (left > right) {
    state = "Inclinación hacia la izquierda";
  } else if (right > left) {
    state = "Inclinación hacia la derecha";
  }

  balanceState.textContent = state;

  if (balanceBar) {
    balanceBar.setAttribute("rotation", `0 0 ${rotation}`);
  }

  if (sceneStatus) {
    sceneStatus.setAttribute("value", state);
  }
}

function subscribeToPlayers() {
  supabase
    .channel("players-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "players",
      },
      async () => {
        await loadPlayers();
      },
    )
    .subscribe();
}

window.addEventListener("beforeunload", async () => {
  if (!currentPlayer) return;

  await supabase
    .from("players")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", currentPlayer.id);
});
