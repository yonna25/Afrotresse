// api/analyze.js — Vercel Serverless Function
// Utilise Claude claude-sonnet-4-20250514 Vision pour analyser la forme du visage
// POST /api/analyze  (multipart/form-data, champ "photo")

import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

const SHAPE_BRAIDS = {
  oval:    ['knotless-braids', 'box-braids', 'fulani-braids', 'cornrows', 'senegalese-twist'],
  round:   ['lemonade-braids', 'senegalese-twist', 'box-braids', 'knotless-braids', 'cornrows'],
  square:  ['senegalese-twist', 'knotless-braids', 'box-braids', 'lemonade-braids', 'micro-braids'],
  heart:   ['fulani-braids', 'knotless-braids', 'senegalese-twist', 'box-braids', 'micro-braids'],
  long:    ['cornrows', 'ghana-braids', 'box-braids', 'knotless-braids', 'lemonade-braids'],
  diamond: ['ghana-braids', 'fulani-braids', 'box-braids', 'knotless-braids', 'cornrows'],
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Clé API Anthropic manquante. Ajoute ANTHROPIC_API_KEY dans les variables Vercel.',
    });
  }

  try {
    const { files } = await parseForm(req);
    const photoFile = files.photo?.[0] || files.photo;
    if (!photoFile) return res.status(400).json({ error: 'Aucune photo reçue.' });

    const imageBuffer = fs.readFileSync(photoFile.filepath || photoFile.path);
    const base64Image = imageBuffer.toString('base64');
    const mimeType    = photoFile.mimetype || photoFile.type || 'image/jpeg';

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 256,
        system: `Tu es un expert en morphologie du visage et en coiffure africaine.
Analyse la photo et détermine la forme du visage parmi : oval, round, square, heart, long, diamond.
Réponds UNIQUEMENT avec un JSON valide, sans texte ni markdown :
{"faceShape":"oval","confidence":0.92,"reason":"front large, mâchoire douce et arrondie"}`,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Image } },
            { type: 'text',  text:  'Analyse la forme de ce visage. Réponds en JSON uniquement.' },
          ],
        }],
      }),
    });

    if (!claudeRes.ok) return res.status(200).json(fallback());

    const data    = await claudeRes.json();
    const rawText = data.content?.[0]?.text || '';

    let parsed;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      return res.status(200).json(fallback());
    }

    const faceShape = parsed.faceShape?.toLowerCase();
    if (!SHAPE_BRAIDS[faceShape]) return res.status(200).json(fallback());

    return res.status(200).json({
      faceShape,
      confidence:     parsed.confidence || 0.85,
      reason:         parsed.reason     || '',
      analysisId:     Date.now().toString(36),
      recommendedIds: SHAPE_BRAIDS[faceShape],
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(200).json(fallback());
  }
}

function fallback() {
  const shapes = Object.keys(SHAPE_BRAIDS);
  const shape  = shapes[Math.floor(Math.random() * shapes.length)];
  return { faceShape: shape, confidence: 0.75, reason: 'Analyse automatique',
           analysisId: Date.now().toString(36), recommendedIds: SHAPE_BRAIDS[shape], fallback: true };
}
