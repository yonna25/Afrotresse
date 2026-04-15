import { IncomingForm } from 'formidable';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
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
  oval: "Ovale", round: "Ronde", square: "Carrée",
  heart: "Cœur", long: "Allongée", diamond: "Diamant"
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const authHeader = req.headers.authorization;
  let userId = null;
  let credits = 0;

  try {
    if (authHeader && authHeader !== 'Bearer null') {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) userId = user.id;
    }

    if (userId) {
      const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single();
      credits = data?.credits || 0;
    } else {
      const { data } = await supabase.from('anonymous_usage').select('credits').eq('ip_address', ip).single();
      if (!data) {
        await supabase.from('anonymous_usage').insert([{ ip_address: ip, credits: 2 }]);
        credits = 2;
      } else {
        credits = data.credits;
      }
    }

    if (credits <= 0) return res.status(403).json({ error: "Crédits insuffisants" });

    const form = new IncomingForm();
    const { files } = await new Promise((res, rej) => form.parse(req, (e, fi, fl) => e ? rej(e) : res({fi, fl})));

    // Simulation FaceShapeDetector (Souvent "long" sur Afro)
    const faceShape = "long"; 
    
    if (userId) {
      await supabase.from('profiles').update({ credits: credits - 1 }).eq('id', userId);
    } else {
      await supabase.from('anonymous_usage').update({ credits: credits - 1 }).eq('ip_address', ip);
    }

    return res.status(200).json({
      faceShape,
      faceShapeName: FACE_SHAPE_NAMES[faceShape],
      confidence: 88,
      recommendations: BRAIDS_DB.filter(b => b.faceShapes.includes(faceShape))
    });

  } catch (error) {
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
