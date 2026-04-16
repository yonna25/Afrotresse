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
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { faceShape } = body;

    if (!faceShape) {
      return res.status(400).json({ error: "faceShape requis" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("ENV MISSING");
      return res.status(500).json({ error: "Config serveur manquante" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      'unknown';

    let { data } = await supabase
      .from('anonymous_usage')
      .select('*')
      .eq('ip_address', ip)
      .maybeSingle();

    if (!data) {
      const { error } = await supabase
        .from('anonymous_usage')
        .insert([{ ip_address: ip, credits: 2 }]);

      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Insert failed" });
      }

      data = { credits: 2 };
    }

    if ((data.credits ?? 0) <= 0) {
      return res.status(403).json({ error: "No credits" });
    }

    const { error: updateError } = await supabase
      .from('anonymous_usage')
      .update({
        credits: data.credits - 1,
        updated_at: new Date().toISOString()
      })
      .eq('ip_address', ip);

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: "Update failed" });
    }

    return res.status(200).json({
      faceShape,
      faceShapeName: faceShape,
      confidence: 95,
      recommendations: []
    });

  } catch (err) {
    console.error("FATAL ERROR:", err);
    return res.status(500).json({
      error: "Server crashed",
      details: err.message
    });
  }
}
