import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { selfieUrl, stylePath } = req.body;

    if (!selfieUrl || !stylePath) {
      return res.status(400).json({ error: "Données manquantes (URL selfie ou chemin style)" });
    }

    // Construction de l'URL absolue pour l'image de coiffure
    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const fullStyleUrl = `${protocol}://${host}${stylePath}`;

    console.log("🚀 Lancement Replicate avec le style :", fullStyleUrl);

    // Modèle de FaceSwap (plus rapide et stable pour la production)
    const output = await replicate.run(
      "lucataco/faceswap:9a42985484da3ec3912140e1e902636239126362391263623912636239126362",
      {
        input: {
          target_image: fullStyleUrl, // L'image de la coiffure (cible)
          source_image: selfieUrl     // Le visage de l'utilisatrice (source)
        }
      }
    );

    return res.status(200).json({ imageUrl: output });

  } catch (error) {
    console.error("❌ Erreur Replicate:", error.message);
    return res.status(500).json({ error: `Erreur IA: ${error.message}` });
  }
}
