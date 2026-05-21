import { supabase } from "../supabaseClient";

export function subscribeToPlayers(onChange) {
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
        await onChange();
      }
    )
    .subscribe();
}