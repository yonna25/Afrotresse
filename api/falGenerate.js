import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { selfieBase64, selfieType, styleImageUrl } = req.body;

    if (!selfieBase64 || !styleImageUrl) {
      return res.status(400).json({ error: "Missing data" });
    }

    const buffer = Buffer.from(selfieBase64, "base64");
    const file = new File([buffer], "selfie.jpg", { type: selfieType || "image/jpeg" });
    const selfieUrl = await fal.storage.upload(file);
    console.log("✅ Selfie uploadé:", selfieUrl);

    console.log("📤 Test 3 : Stable Diffusion v3.5 (texte + image)");

    // TEST 3 : Stable Diffusion - génère depuis une description texte
    // Plus de contrôle, mais moins de fidélité à la référence
    const result = await fal.subscribe("fal-ai/stable-diffusion-v3.5", {
      input: {
        prompt: "African woman with detailed braided hairstyle, professional studio lighting, high quality portrait",
        image_url: styleImageUrl,  // Utilise l'image de style comme inspiration
        strength: 0.7,  // Force du contrôle (0-1)
        num_inference_steps: 50,
        guidance_scale: 7.5,
      },
    });

    console.log("📥 Réponse Fal reçue");

    const imageUrl = result?.data?.image?.url 
      || result?.data?.images?.[0]?.url
      || result?.data?.output?.url
      || result?.data?.result?.url
      || result?.data?.url
      || result?.image?.url
      || result?.output?.url;

    if (!imageUrl) {
      console.error("❌ Pas d'image. Réponse:", JSON.stringify(result));
      return res.status(500).json({ error: "Fal n'a pas retourné d'image" });
    }

    console.log("✨ Image générée:", imageUrl);
    return res.status(200).json({ imageUrl });

  } catch (err) {
    console.error("❌ Erreur:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
