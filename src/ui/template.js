export function renderTemplate() {
  return `
    <main class="app-shell">
      <section id="login-screen" class="login-card">
        <div class="brand-mark">XR</div>
        <h1>XR Balance Game</h1>
        <p>Ingresa tu alias para entrar a la arena colaborativa.</p>

        <input
          id="alias-input"
          type="text"
          placeholder="Tu alias"
          maxlength="30"
        />

        <button id="join-button">Entrar al juego</button>

        <p id="login-error" class="error"></p>
      </section>

      <section id="game-screen" class="game-dashboard hidden">
        <header class="game-header">
          <div class="game-logo">
            <span class="brand-mark brand-mark--small">XR</span>
            <div>
              <p class="eyebrow">Realtime arena</p>
              <h1>XR Balance Game</h1>
            </div>
          </div>

          <div class="player-status">
            <div>
              <span>Jugador</span>
              <strong id="player-name"></strong>
            </div>
            <div class="player-actions">
              <button
                id="music-button"
                class="music-button"
                type="button"
                title="Activar música"
                aria-label="Activar música"
                aria-pressed="false">
                <span id="music-icon">🔇</span>
              </button>
              <div class="connection-pill">
                <span class="status-dot"></span>
                Conectado
              </div>
              <button id="exit-button" class="exit-button">Salir</button>
            </div>
          </div>
        </header>

        <div class="dashboard-grid">
          <aside class="side-panel">
            <section class="scoreboard glass-panel">
              <p class="panel-label">Marcador</p>
              <div class="score-row score-row--left">
                <span>ALPHA</span>
                <strong id="left-count">0</strong>
              </div>
              <div class="score-row score-row--right">
                <span>OMEGA</span>
                <strong id="right-count">0</strong>
              </div>
              <div class="balance-state">
                <span>Estado</span>
                <strong id="balance-state">BALANCE ESTABLE</strong>
              </div>
            </section>

            <section class="ranking-card glass-panel">
              <p class="panel-label">Ranking</p>
              <h2>Record del juego</h2>
              <div id="ranking-value">0</div>
            </section>

            <section class="players-board">
              <div class="team-card team-card--left">
                <h3>ALPHA</h3>
                <ul id="left-players-list"></ul>
              </div>

              <div class="team-card team-card--right">
                <h3>OMEGA</h3>
                <ul id="right-players-list"></ul>
              </div>
            </section>
          </aside>

          <section class="arena-panel">
            <div class="scene-wrapper">
              <a-scene embedded background="color: #020617">
                <a-assets>
                  <a-mixin
                    id="neon-panel"
                    material="shader: standard; roughness: 0.35; metalness: 0.25">
                  </a-mixin>
                </a-assets>

                <a-entity id="ambient-light" light="type: ambient; intensity: 0.38; color: #9ccfff"></a-entity>
                <a-entity id="hemi-light" light="type: hemisphere; intensity: 0.72; color: #b9e6ff; groundColor: #312e81"></a-entity>
                <a-entity id="key-light" light="type: directional; intensity: 1.35; color: #ffe7b0" position="2 5 3"></a-entity>
                <a-entity id="moon-light" light="type: point; intensity: 1.05; color: #dbeafe; distance: 9" position="-3.1 5.35 -6.15"></a-entity>
                <a-entity id="left-glow" light="type: point; intensity: 1.1; color: #38bdf8; distance: 7" position="-3 2.4 -3.2"></a-entity>
                <a-entity id="right-glow" light="type: point; intensity: 1; color: #fb923c; distance: 7" position="3 2.4 -3.2"></a-entity>

                <a-sky id="xr-sky" color="#030712"></a-sky>

                <a-plane
                  position="0 0 -4"
                  rotation="-90 0 0"
                  width="18"
                  height="18"
                  material="color: #09111f; roughness: 0.88; metalness: 0.08">
                </a-plane>

                <a-ring
                  id="inner-arena-ring"
                  position="0 0.025 -4"
                  rotation="-90 0 0"
                  radius-inner="2.6"
                  radius-outer="3.1"
                  material="color: #f8fafc; emissive: #facc15; emissiveIntensity: 0.12; roughness: 0.42; metalness: 0.22">
                </a-ring>

                <a-ring
                  id="outer-arena-ring"
                  position="0 0.035 -4"
                  rotation="-90 0 0"
                  radius-inner="3.85"
                  radius-outer="3.95"
                  material="color: #d97706; emissive: #facc15; emissiveIntensity: 0.24; metalness: 0.35">
                </a-ring>

                <a-cylinder
                  id="arena-platform"
                  position="0 -0.08 -4"
                  radius="3.35"
                  height="0.18"
                  segments-radial="96"
                  material="color: #e5e7eb; emissive: #78350f; emissiveIntensity: 0.04; roughness: 0.48; metalness: 0.2">
                </a-cylinder>

                <a-entity id="star-root"></a-entity>
                <a-entity id="olympus-root"></a-entity>
                <a-entity id="tower-root"></a-entity>
                <a-entity id="moon-root"></a-entity>
                <a-entity id="cloud-root"></a-entity>

                <a-entity id="particle-root"></a-entity>
                <a-entity id="avatar-root"></a-entity>

                <a-entity id="balance-root" position="0 0 -4">
                  <a-cylinder
                    position="0 0.18 0"
                    radius="0.38"
                    height="0.16"
                    material="color: #d97706; emissive: #92400e; emissiveIntensity: 0.1; roughness: 0.32; metalness: 0.45">
                  </a-cylinder>

                  <a-cylinder
                    position="0 0.62 0"
                    radius="0.2"
                    height="1.24"
                    material="color: #facc15; emissive: #a16207; emissiveIntensity: 0.08; roughness: 0.35; metalness: 0.45">
                  </a-cylinder>

                  <a-cone
                    position="0 1.1 0"
                    radius-bottom="0.52"
                    radius-top="0.16"
                    height="0.5"
                    material="color: #f59e0b; emissive: #92400e; emissiveIntensity: 0.08; roughness: 0.34; metalness: 0.4">
                  </a-cone>

                  <a-sphere
                    id="balance-center"
                    position="0 1.3 0"
                    radius="0.36"
                    material="color: #fde68a; emissive: #facc15; emissiveIntensity: 0.38; roughness: 0.22; metalness: 0.32">
                  </a-sphere>

                  <a-ring
                    position="0 1.3 0"
                    rotation="90 0 0"
                    radius-inner="0.42"
                    radius-outer="0.47"
                    material="color: #ffffff; emissive: #f8fafc; emissiveIntensity: 0.22">
                  </a-ring>

                  <a-entity id="balance-pivot" position="0 1.52 0" rotation="0 0 0">
                    <a-box
                    id="balance-bar"
                    position="0 0 0"
                    rotation="0 0 0"
                      width="5.55"
                      height="0.18"
                      depth="0.24"
                      material="color: #d6d3d1; emissive: #78350f; emissiveIntensity: 0.06; roughness: 0.3; metalness: 0.55">
                    </a-box>

                    <a-box
                      position="0 0.03 0"
                      width="5.9"
                      height="0.055"
                      depth="0.31"
                      material="color: #facc15; emissive: #f59e0b; emissiveIntensity: 0.18; roughness: 0.26; metalness: 0.65">
                    </a-box>

                    <a-entity id="left-weight"></a-entity>
                    <a-entity id="right-weight"></a-entity>
                  </a-entity>
                </a-entity>

                <a-text
                  value="ALPHA"
                  position="-3.75 0.18 -3.95"
                  color="#38bdf8"
                  align="center"
                  width="4">
                </a-text>

                <a-text
                  value="OMEGA"
                  position="2.35 0.18 -3.95"
                  color="#fb923c"
                  align="center"
                  width="4">
                </a-text>

                <a-entity id="arena-hud" position="0 3.08 -4.85" rotation="-8 0 0">
                  <a-box
                    id="arena-hud-frame"
                    width="4.35"
                    height="1.3"
                    depth="0.12"
                    material="color: #3f2414; emissive: #1c0f08; emissiveIntensity: 0.08; roughness: 0.7; metalness: 0.08">
                  </a-box>
                  <a-plane
                    id="arena-hud-panel"
                    position="0 0 0.075"
                    width="3.92"
                    height="0.98"
                    material="color: #2a160c; opacity: 0.9; transparent: true; roughness: 0.82; metalness: 0.04">
                  </a-plane>
                  <a-box position="0 0.52 0.105" width="4.18" height="0.055" depth="0.035" material="color: #b7791f; emissive: #854d0e; emissiveIntensity: 0.08; roughness: 0.42; metalness: 0.42"></a-box>
                  <a-box position="0 -0.52 0.105" width="4.18" height="0.055" depth="0.035" material="color: #b7791f; emissive: #854d0e; emissiveIntensity: 0.08; roughness: 0.42; metalness: 0.42"></a-box>
                  <a-box position="-2.02 0 0.105" width="0.055" height="1.08" depth="0.035" material="color: #b7791f; emissive: #854d0e; emissiveIntensity: 0.08; roughness: 0.42; metalness: 0.42"></a-box>
                  <a-box position="2.02 0 0.105" width="0.055" height="1.08" depth="0.035" material="color: #b7791f; emissive: #854d0e; emissiveIntensity: 0.08; roughness: 0.42; metalness: 0.42"></a-box>
                  <a-box position="0 0.07 0.11" width="3.55" height="0.018" depth="0.018" material="color: #5b3218; opacity: 0.85; transparent: true; roughness: 0.9"></a-box>
                  <a-box position="0 -0.32 0.11" width="3.35" height="0.014" depth="0.018" material="color: #6b3f1f; opacity: 0.75; transparent: true; roughness: 0.9"></a-box>
                  <a-sphere position="-1.86 0.44 0.13" radius="0.045" material="color: #facc15; emissive: #92400e; emissiveIntensity: 0.12; roughness: 0.34; metalness: 0.65"></a-sphere>
                  <a-sphere position="1.86 0.44 0.13" radius="0.045" material="color: #facc15; emissive: #92400e; emissiveIntensity: 0.12; roughness: 0.34; metalness: 0.65"></a-sphere>
                  <a-sphere position="-1.86 -0.44 0.13" radius="0.045" material="color: #facc15; emissive: #92400e; emissiveIntensity: 0.12; roughness: 0.34; metalness: 0.65"></a-sphere>
                  <a-sphere position="1.86 -0.44 0.13" radius="0.045" material="color: #facc15; emissive: #92400e; emissiveIntensity: 0.12; roughness: 0.34; metalness: 0.65"></a-sphere>
                  <a-plane
                    id="arena-hud-glow"
                    position="0 0 0.06"
                    width="4.18"
                    height="1.18"
                    material="color: #bfdbfe; opacity: 0.08; transparent: true; emissive: #bfdbfe; emissiveIntensity: 0.2">
                  </a-plane>
                  <a-text
                    value="ALPHA"
                    position="-1.34 -0.38 0.19"
                    color="#7dd3fc"
                    align="center"
                    width="2.8">
                  </a-text>
                  <a-text
                    value="OMEGA"
                    position="1.34 -0.38 0.19"
                    color="#fdba74"
                    align="center"
                    width="2.8">
                  </a-text>
                  <a-text
                    id="scene-status"
                    value="BALANCE ESTABLE"
                    position="0 0.26 0.19"
                    color="#ffffff"
                    align="center"
                    width="4.45">
                  </a-text>
                  <a-text
                    id="scene-score"
                    value="00 - 00"
                    position="0 -0.12 0.19"
                    color="#ffffff"
                    align="center"
                    width="5.85">
                  </a-text>
                </a-entity>

                <a-camera position="0 2.15 2.25"></a-camera>
              </a-scene>
            </div>
          </section>
        </div>

        <footer class="action-footer">
          <button id="left-button">ALPHA</button>
          <button id="right-button">OMEGA</button>
        </footer>
      </section>
    </main>
  `;
}
