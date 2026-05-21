import { supabase } from "../supabaseClient";

export async function getActivePlayers() {
  const fifteenSecondsAgo = new Date(Date.now() - 15000).toISOString();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .gte("last_seen", fifteenSecondsAgo);

  return {
    players: data || [],
    error,
  };
}

export function getBalanceData(players) {
  const leftPlayers = players.filter(player => player.side === "LEFT");
  const rightPlayers = players.filter(player => player.side === "RIGHT");

  const leftCount = leftPlayers.length;
  const rightCount = rightPlayers.length;

  const difference = rightCount - leftCount;

  const offset = Math.max(
    Math.min(difference * 25, 150),
    -150
  );

  const rotation = Math.max(
    Math.min(difference * -7, 32),
    -32
  );

  let state = "Centro";

  if (leftCount > rightCount) {
    state = "Inclinación hacia la izquierda";
  } else if (rightCount > leftCount) {
    state = "Inclinación hacia la derecha";
  }

  return {
    leftPlayers,
    rightPlayers,
    leftCount,
    rightCount,
    difference,
    offset,
    rotation,
    state,
  };
}