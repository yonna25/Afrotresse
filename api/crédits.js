// ============================================================
// /api/credits.js — AfroTresse
// Retourne le solde réel depuis Supabase (source de vérité)
// ============================================================

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const sessionId = req.query.sessionId;
  if (!sessionId || typeof sessionId !== "string" || sessionId.length < 10) {
    return res.status(400).json({ error: "sessionId manquant" });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase
    .from("anonymous_usage")
    .select("credits")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: "Erreur lecture crédits" });
  }

  // Pas encore en base = crédits gratuits initiaux (2)
  const credits = data?.credits ?? 2;
  return res.status(200).json({ credits });
}
