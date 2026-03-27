import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { selfieUrl, styleImageUrl } = req.body;

    if (!selfieUrl || !styleImageUrl) {
      return res.status(400).json({ error: "Missing selfieUrl or styleImageUrl" });
    }

    console.log("📸 Traitement du selfie via Replicate...");

    // Utilisation du modèle InstantID (le plus performant pour garder le visage intact)
    const output = await replicate.run(
      "lucataco/instantid:90264627d26ca0244795b5a2ca23d2da085a6a3dc8f615e449a56285a854a938",
      {
        input: {
          image: selfieUrl,
          pose_image: styleImageUrl, // On utilise la coiffure comme guide de pose/structure
          prompt: "Professional beauty shot, intricate African braids, Ghana weaving style, highly detailed hair texture, 8k",
          negative_prompt: "low quality, blurry, distorted face, messy hair",
          identity_net_strength: 0.8,
          adapter_strength: 0.8
        }
      }
    );

    // Replicate retourne généralement un tableau d'URLs
    const finalImageUrl = Array.isArray(output) ? output[0] : output;

    return res.status(200).json({ imageUrl: finalImageUrl });

  } catch (error) {
    console.error("❌ Erreur Replicate:", error);
    return res.status(500).json({ error: "Échec de la transformation capillaire." });
  }
}
