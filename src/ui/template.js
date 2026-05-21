export function renderTemplate() {
  return `
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
        <div class="players-board">
            <div>
                <h3>LEFT</h3>
                <ul id="left-players-list"></ul>
            </div>

            <div>
                <h3>RIGHT</h3>
                <ul id="right-players-list"></ul>
            </div>
        </div>

        <div class="ranking-card">

            <h2>🏆 Récord del Juego</h2>

            <div id="ranking-value">
                0
            </div>

        </div>

        <div class="scene-wrapper">
          <a-scene embedded background="color: #020617">
            <a-entity light="type: ambient; intensity: 0.6"></a-entity>
            <a-entity light="type: directional; intensity: 1.2" position="2 4 3"></a-entity>

            <a-sky color="#020617"></a-sky>

            <a-plane
              position="0 0 -4"
              rotation="-90 0 0"
              width="10"
              height="10"
              color="#1e293b">
            </a-plane>

            <a-ring
              position="0 0.02 -4"
              rotation="-90 0 0"
              radius-inner="1.2"
              radius-outer="2.8"
              color="#334155">
            </a-ring>

            <a-cylinder
              position="0 0.65 -4"
              radius="0.18"
              height="1.3"
              color="#facc15">
            </a-cylinder>

            <a-sphere
              position="0 1.35 -4"
              radius="0.28"
              color="#fde047">
            </a-sphere>

            <a-box
              id="balance-bar"
              position="0 1.55 -4"
              rotation="0 0 0"
              width="5"
              height="0.16"
              depth="0.18"
              color="#e5e7eb">
            </a-box>

            <a-cylinder
              id="left-weight"
              position="-2.4 1.25 -4"
              radius="0.25"
              height="0.35"
              color="#38bdf8">
            </a-cylinder>

            <a-cylinder
              id="right-weight"
              position="2.4 1.25 -4"
              radius="0.25"
              height="0.35"
              color="#fb923c">
            </a-cylinder>

            <a-text
              value="LEFT"
              position="-3.1 0.15 -4"
              color="#38bdf8"
              width="4">
            </a-text>

            <a-text
              value="RIGHT"
              position="2.1 0.15 -4"
              color="#fb923c"
              width="4">
            </a-text>

            <a-text
              id="scene-status"
              value="Centro"
              position="-1.8 2.45 -4"
              color="#ffffff"
              width="5">
            </a-text>

            <a-camera position="0 1.8 1.8"></a-camera>
          </a-scene>
        </div>
      </section>
    </main>
  `;
}
