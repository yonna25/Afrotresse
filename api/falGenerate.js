// api/hfGenerate.js
// Version HuggingFace avec support selfie + coiffure + masque

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { selfieBase64, styleImageUrl } = req.body;

    if (!selfieBase64 || !styleImageUrl) {
      return res.status(400).json({ error: "Missing data" });
    }

    const hfToken = process.env.HUGGINGFACE_API_KEY;
    if (!hfToken) {
      console.error("❌ HUGGINGFACE_API_KEY manquante");
      return res.status(500).json({ error: "API key manquante" });
    }

    // URL absolue de l'image style
    const absoluteStyleImageUrl = styleImageUrl.startsWith("http")
      ? styleImageUrl
      : `https://afrotresse-hfwf.vercel.app${styleImageUrl}`;

    console.log("✅ Selfie et style prêts");
    console.log("🔗 URL style:", absoluteStyleImageUrl);

    // ======================================
    // HuggingFace : modèle de transformation
    // ======================================
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/hogiahien/counterfeit-v30-edited", // modèle compatible image+mask
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Apply hairstyle from style image to the user's face, keep face intact, realistic",
          parameters: {
            image: selfieBase64,
            mask_image: absoluteStyleImageUrl, // ici on peut utiliser style comme masque
            guidance_scale: 7.5
          }
        }),
      }
    );

    if (hfResponse.ok) {
      const blob = await hfResponse.blob();
      const imageBuffer = Buffer.from(await blob.arrayBuffer());
      const base64Image = imageBuffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;

      console.log("✅ Image générée avec HuggingFace");
      return res.status(200).json({ imageUrl: dataUrl });
    } else {
      const errorText = await hfResponse.text();
      console.error("❌ HF erreur:", hfResponse.status, errorText);
      return res.status(500).json({ error: "Impossible de générer l'image HF" });
    }

  } catch (err) {
    console.error("❌ Erreur générale:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
