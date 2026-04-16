import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    console.log("API HIT OK");

    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // SAFE BODY PARSE
    let body = {};
    try {
      body = typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { faceShape } = body;

    if (!faceShape) {
      return res.status(400).json({ error: "faceShape requis" });
    }

    // ENV CHECK
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Config serveur manquante" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    // IP FIX (plus robuste Vercel/Proxy)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "unknown";

    if (ip === "unknown") {
      return res.status(400).json({ error: "IP non identifiable" });
    }

    // SELECT
    const { data: existingData, error: selectError } = await supabase
      .from('anonymous_usage')
      .select('*')
      .eq('ip_address', ip)
      .maybeSingle();

    if (selectError) {
      return res.status(500).json({ error: "SELECT failed" });
    }

    let currentCredits;

    // INSERT si nouveau user
    if (!existingData) {
      const { error: insertError } = await supabase
        .from('anonymous_usage')
        .insert([{ ip_address: ip, credits: 2 }]);

      if (insertError) {
        return res.status(500).json({ error: "INSERT failed" });
      }

      currentCredits = 2;
    } else {
      currentCredits = existingData.credits;
    }

    // BLOQUAGE
    if (currentCredits <= 0) {
      return res.status(403).json({ error: "No credits" });
    }

    // UPDATE
    const { data: updateData, error: updateError } = await supabase
      .from('anonymous_usage')
      .update({
        credits: currentCredits - 1,
        updated_at: new Date().toISOString()
      })
      .eq('ip_address', ip)
      .select();

    if (updateError || !updateData?.length) {
      return res.status(500).json({ error: "UPDATE failed" });
    }

    return res.status(200).json({
      faceShape,
      faceShapeName: faceShape,
      confidence: 95,
      recommendations: getRecommendations(faceShape),
      creditsRemaining: currentCredits - 1
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
      details: err.message
    });
  }
}

// RECOMMANDATIONS
function getRecommendations(faceShape) {
  const map = {
    oval: ["Tresses classiques", "Box braids", "Twists"],
    round: ["Tresses hautes", "Cornrows longs", "Twists"],
    square: ["Tresses douces", "Halo braids", "Locs"],
    heart: ["Side braids", "Fulani braids", "Volume bas"],
    long: ["Volume sides", "Bantu knots", "Flat twists"],
    diamond: ["Bob braids", "Crown braids", "Center braids"],
  };

  return map[faceShape?.toLowerCase()] ?? ["Box braids", "Cornrows"];
      }
