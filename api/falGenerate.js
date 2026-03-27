import Replicate from "replicate";

// Initialisation de Replicate avec ton Token API
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  // Sécurité : On n'accepte que les requêtes POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { selfieUrl, stylePath } = req.body;

    if (!selfieUrl || !stylePath) {
      return res.status(400).json({ error: "Données manquantes (photo ou style)." });
    }

    // On construit l'URL complète de l'image de coiffure hébergée sur ton site
    const host = req.headers.host;
    const protocol = host.includes("localhost") ? "http" : "https";
    const fullStyleUrl = `${protocol}://${host}${stylePath}`;

    console.log("🚀 Lancement de la génération Replicate...");

    // Appel au modèle FaceSwap de Replicate
    const output = await replicate.run(
      "lucataco/faceswap:9a42985484da3ec3912140e1e902636239126362391263623912636239126362",
      {
        input: {
          target_image: fullStyleUrl, // L'image de la tresse (Destination)
          source_image: selfieUrl,    // Ta photo (Source)
        },
      }
    );

    // Succès : On renvoie l'URL de l'image générée par l'IA
    return res.status(200).json({ imageUrl: output });

  } catch (error) {
    console.error("❌ Erreur Replicate détaillée :", error);
    return res.status(500).json({ 
      error: "L'IA n'a pas pu générer l'image.", 
      details: error.message 
    });
  }
}
