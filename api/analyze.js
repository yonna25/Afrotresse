import { createClient } from '@supabase/supabase-js';

// ── Rate limit en mémoire (reset à chaque cold start Vercel)
// Pour prod → remplacer par Upstash Redis
const rateLimitMap = new Map();
const RATE_LIMIT_MS = 15_000; // 15s entre deux appels par IP

// ── Whitelist formes valides
const VALID_SHAPES = ["oval", "round", "square", "heart", "long", "diamond", "oblong"];

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

    const { faceShape, requestId } = body;

    // ── Validation faceShape : non-null + whitelist
    if (!faceShape) {
      return res.status(400).json({ error: "faceShape requis" });
    }
    if (!VALID_SHAPES.includes(faceShape.toLowerCase())) {
      return res.status(400).json({
        error: `faceShape invalide. Valeurs acceptées : ${VALID_SHAPES.join(", ")}`
      });
    }

    // ── Validation requestId
    if (!requestId || typeof requestId !== "string" || requestId.length < 10) {
      return res.status(400).json({ error: "requestId manquant ou invalide" });
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

    // ── Rate limit IP
    const now = Date.now();
    const lastCall = rateLimitMap.get(ip);
    if (lastCall && now - lastCall < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - (now - lastCall)) / 1000);
      return res.status(429).json({
        error: `Trop de requêtes. Attendez ${remaining} seconde(s).`
      });
    }
    rateLimitMap.set(ip, now);

    // ── Idempotence : vérifier que le requestId n'a pas déjà été traité
    const { data: existingReq, error: reqCheckError } = await supabase
      .from('used_request_ids')
      .select('id')
      .eq('id', requestId)
      .maybeSingle();

    if (reqCheckError) {
      return res.status(500).json({ error: "Erreur vérification requestId" });
    }
    if (existingReq) {
      return res.status(409).json({ error: "Requête déjà traitée" });
    }

    // ── Enregistrer le requestId AVANT de décrémenter (anti race condition)
    const { error: insertReqError } = await supabase
      .from('used_request_ids')
      .insert([{ id: requestId, ip, created_at: new Date().toISOString() }]);

    if (insertReqError) {
      return res.status(500).json({ error: "Erreur enregistrement requestId" });
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
