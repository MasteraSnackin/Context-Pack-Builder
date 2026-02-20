import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";
import type { ContextPack } from "./types.js";

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

// ============================================================
// Context Pack Functions (Bug #5 fix: ContextPack type imported from types.ts)
// Bug #8 fix: Removed dead tasks CRUD code from starter template
// ============================================================

/**
 * Save a context pack to the database
 */
export async function saveContextPack(
  userId: string,
  pack: ContextPack
): Promise<void> {
  const { error } = await supabase.from("context_packs").insert({
    id: pack.id,
    user_id: userId,
    title: pack.title,
    summary: pack.summary,
    resources: pack.resources,
    open_questions: pack.openQuestions,
    next_actions: pack.nextActions,
  });

  if (error) {
    console.error("Error saving context pack:", error);
    throw new Error(`Failed to save context pack: ${error.message}`);
  }
}

/**
 * Fetch all context packs for a user
 */
export async function fetchContextPacks(userId: string) {
  const { data: packs, error } = await supabase
    .from("context_packs")
    .select("id, title, summary, resources, open_questions, next_actions, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching context packs:", error);
    return { packs: [], error };
  }

  // Convert snake_case to camelCase
  const formattedPacks = (packs || []).map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    resources: p.resources || [],
    openQuestions: p.open_questions || [],
    nextActions: p.next_actions || [],
    createdAt: p.created_at,
  }));

  return { packs: formattedPacks, error: null };
}
