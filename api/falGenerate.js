import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// ── RATE LIMIT ──
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const rateMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const data = rateMap.get(ip) || { count: 0, start: now };

  if (now - data.start > WINDOW_MS) {
    rateMap.set(ip, { count: 1, start: now });
    return true;
  }

  if (data.count >= RATE_LIMIT) return false;

  data.count++;
  rateMap.set(ip, data);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Trop de requêtes. Réessaie plus tard." });
  }

  try {
    const { selfieUrl, stylePath } = req.body;

    if (!selfieUrl || !stylePath) {
      return res.status(400).json({ error: "Données manquantes (photo ou style)." });
    }

    const host = req.headers.host;
    const protocol = host.includes("localhost") ? "http" : "https";
    const fullStyleUrl = `${protocol}://${host}${stylePath}`;

    const output = await replicate.run(
      "lucataco/faceswap:9a42985484da3ec3912140e1e902636239126362391263623912636239126362",
      {
        input: {
          target_image: fullStyleUrl,
          source_image: selfieUrl,
        },
      }
    );

    return res.status(200).json({ imageUrl: output });

  } catch (error) {
    return res.status(500).json({
      error: "L'IA n'a pas pu générer l'image.",
      details: error.message
    });
  }
}
