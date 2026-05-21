let balanceBar = null;
let sceneStatus = null;
let leftWeight = null;
let rightWeight = null;

export function initSceneElements() {
  balanceBar = document.querySelector("#balance-bar");
  sceneStatus = document.querySelector("#scene-status");
  leftWeight = document.querySelector("#left-weight");
  rightWeight = document.querySelector("#right-weight");
}

export function updateScene(balance) {
  const { leftCount, rightCount, rotation, state } = balance;

  if (balanceBar) {
    balanceBar.setAttribute("rotation", `0 0 ${rotation}`);
  }

  if (leftWeight) {
    const leftY = 1.25 + rotation / 80;
    leftWeight.setAttribute("position", `-2.4 ${leftY} -4`);
    leftWeight.setAttribute("scale", `1 ${1 + leftCount * 0.15} 1`);
  }

  if (rightWeight) {
    const rightY = 1.25 - rotation / 80;
    rightWeight.setAttribute("position", `2.4 ${rightY} -4`);
    rightWeight.setAttribute("scale", `1 ${1 + rightCount * 0.15} 1`);
  }

  if (sceneStatus) {
    sceneStatus.setAttribute(
      "value",
      `${state} | LEFT ${leftCount} - RIGHT ${rightCount}`
    );
  }
}