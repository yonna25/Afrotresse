/**
 * API AfroTresse - version corrigée stable
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BRAIDS_DB = [
  { id: "pompom", faceShapes: ["round", "square", "oval", "heart", "diamond"] },
  { id: "tresseplaquees", faceShapes: ["oval", "long", "diamond", "square", "heart"] },
  { id: "ghanabraids", faceShapes: ["square", "heart", "oval", "diamond", "round", "long"] },
  { id: "tressecollees", faceShapes: ["oval", "long", "diamond", "heart", "round", "square"] },
  { id: "box-braids", faceShapes: ["oval", "round", "square", "heart", "long", "diamond"] },
  { id: "stitch-braids", faceShapes: ["oval", "long", "square", "diamond", "round"] }
];

const FACE_SHAPE_NAMES = {
  oval: "Ovale",
  round: "Ronde",
  square: "Carrée",
  heart: "Cœur",
  long: "Allongée",
  diamond: "Diamant"
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log("🔥 API HIT");

  try {
    // 🔥 PARSE BODY ROBUSTE
    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { faceShape } = body || {};

    console.log("👉 faceShape reçu :", faceShape);

    if (!faceShape) {
      return res.status(400).json({ error: "faceShape requis" });
    }

    const allowedShapes = ["oval","round","square","heart","long","diamond"];
    if (!allowedShapes.includes(faceShape)) {
      return res.status(400).json({ error: "faceShape invalide" });
    }

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      'unknown';

    console.log("👉 IP :", ip);

    // 🔥 CHECK EXISTENCE
    const { data, error } = await supabase
      .from('anonymous_usage')
      .select('*')
      .eq('ip_address', ip)
      .maybeSingle();

    if (error) throw error;

    let credits;

    // 🔥 INSERT SI NOUVEAU
    if (!data) {
      console.log("🆕 Nouvel utilisateur");

      const { error: insertError } = await supabase
        .from('anonymous_usage')
        .insert([{
          ip_address: ip,
          credits: 2
        }]);

      if (insertError) throw insertError;

      credits = 2;

    } else {
      credits = data.credits ?? 0;
      console.log("💰 Credits existants :", credits);
    }

    // 🔴 BLOQUAGE
    if (credits <= 0) {
      return res.status(403).json({ error: "Crédits insuffisants" });
    }

    // 🔥 UPDATE
    const { error: updateError } = await supabase
      .from('anonymous_usage')
      .update({
        credits: credits - 1,
        updated_at: new Date().toISOString()
      })
      .eq('ip_address', ip);

    if (updateError) throw updateError;

    console.log("✅ Crédit décrémenté");

    const recommendations = BRAIDS_DB.filter(b =>
      b.faceShapes.includes(faceShape)
    );

    return res.status(200).json({
      faceShape,
      faceShapeName: FACE_SHAPE_NAMES[faceShape],
      confidence: 95,
      recommendations
    });

  } catch (error) {
    console.error("❌ ERREUR API :", error);

    return res.status(500).json({
      error: "Erreur serveur",
      details: error.message
    });
  }
}
