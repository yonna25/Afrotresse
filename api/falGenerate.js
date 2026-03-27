import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { selfieUrl, stylePath } = req.body; 

    // Sécurité : Si stylePath est manquant, on arrête tout proprement
    if (!stylePath || stylePath === "undefined") {
        return res.status(400).json({ error: "Le chemin de la coiffure est invalide (undefined)." });
    }

    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const fullStyleUrl = `${protocol}://${host}${stylePath}`;

    console.log("🛠️ Tentative avec le style :", fullStyleUrl);

    // Utilisation d'une version plus stable et universelle de SDXL Inpainting
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e24ee33373c959687291043d96a7862df88010300ded",
      {
        input: {
          image: selfieUrl,
          mask: "https://replicate.delivery/pbxt/Jy6G0kU8P8XzZ5X6vX7Q9W0/mask.png", // Temporaire pour test
          prompt: "Professional beauty photography, woman with intricate African braids, Ghana weaving style, 8k",
          style_image: fullStyleUrl
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    return res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("❌ Erreur Production:", error.message);
    return res.status(500).json({ error: `Erreur IA: ${error.message}` });
  }
}
