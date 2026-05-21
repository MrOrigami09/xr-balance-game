export function getDom() {
  return {
    loginScreen: document.querySelector("#login-screen"),
    gameScreen: document.querySelector("#game-screen"),
    aliasInput: document.querySelector("#alias-input"),
    joinButton: document.querySelector("#join-button"),
    loginError: document.querySelector("#login-error"),
    playerName: document.querySelector("#player-name"),

    leftButton: document.querySelector("#left-button"),
    rightButton: document.querySelector("#right-button"),

    leftCount: document.querySelector("#left-count"),
    rightCount: document.querySelector("#right-count"),
    balanceState: document.querySelector("#balance-state"),
    leftPlayersList: document.querySelector("#left-players-list"),
    rightPlayersList: document.querySelector("#right-players-list"),
    rankingValue: document.querySelector("#ranking-value"),

};
}