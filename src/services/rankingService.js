import { supabase } from "../supabaseClient";

export async function updateRanking(totalPlayers) {

  const { data } = await supabase
    .from("game_stats")
    .select("*")
    .limit(1)
    .single();

  if (!data) return;

  if (totalPlayers > data.max_players) {

    await supabase
      .from("game_stats")
      .update({
        max_players: totalPlayers,
        updated_at: new Date().toISOString()
      })
      .eq("id", data.id);

  }
}

export async function getRanking() {

  const { data } = await supabase
    .from("game_stats")
    .select("*")
    .limit(1)
    .single();

  return data;
}