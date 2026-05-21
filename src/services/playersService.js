import { supabase } from "../supabaseClient";

export async function createPlayer(alias) {
  const { data, error } = await supabase
    .from("players")
    .insert({
      alias,
      side: null,
      is_active: true,
      last_seen: new Date().toISOString(),
    })
    .select()
    .single();

  return {
    player: data,
    error,
  };
}

export async function updatePlayerSide(playerId, side) {
  const { data, error } = await supabase
    .from("players")
    .update({
      side,
      is_active: true,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", playerId)
    .select()
    .single();

  return {
    player: data,
    error,
  };
}

export async function restoreSavedPlayer() {
  const savedPlayerId = localStorage.getItem("current_player_id");

  if (!savedPlayerId) {
    return { player: null, error: null };
  }

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", savedPlayerId)
    .single();

  if (error || !data) {
    localStorage.removeItem("current_player_id");
    return { player: null, error };
  }

  await supabase
    .from("players")
    .update({
      is_active: true,
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  return {
    player: data,
    error: null,
  };
}

export function startHeartbeat(getCurrentPlayer) {
  setInterval(async () => {
    const player = getCurrentPlayer();

    if (!player) return;

    await supabase
      .from("players")
      .update({
        is_active: true,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", player.id);
  }, 5000);
}

export async function markPlayerInactive(playerId) {
  await supabase
    .from("players")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", playerId);
}