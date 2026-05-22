import { supabase } from "../supabaseClient";

export async function getActivePlayers() {
  const fifteenSecondsAgo = new Date(Date.now() - 15000).toISOString();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("is_active", true)
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
  const absDifference = Math.abs(difference);

  const offset = Math.max(
    Math.min(difference * 25, 150),
    -150
  );

  const rotation = Math.max(
    Math.min(difference * -7, 32),
    -32
  );

  let state = "BALANCE ESTABLE";
  let visualState = "stable";

  if (absDifference >= 4) {
    state = "DESBALANCE CRITICO";
    visualState = "critical";
  } else if (leftCount > rightCount) {
    state = "VENTAJA ALPHA";
    visualState = "left";
  } else if (rightCount > leftCount) {
    state = "VENTAJA OMEGA";
    visualState = "right";
  }

  return {
    leftPlayers,
    rightPlayers,
    leftCount,
    rightCount,
    difference,
    absDifference,
    offset,
    rotation,
    state,
    visualState,
  };
}
