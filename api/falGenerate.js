// Version HuggingFace avec nouvel endpoint router.huggingface.co

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { selfieBase64, selfieType, styleImageUrl } = req.body;

    if (!selfieBase64 || !styleImageUrl) {
      return res.status(400).json({ error: "Missing data" });
    }

    const hfToken = process.env.HUGGINGFACE_API_KEY;
    if (!hfToken) {
      console.error("❌ HUGGINGFACE_API_KEY manquante");
      return res.status(500).json({ error: "API key manquante" });
    }

    console.log("✅ Selfie reçu");

    const absoluteStyleImageUrl = styleImageUrl.startsWith("http")
      ? styleImageUrl
      : `https://afrotresse-hfwf.vercel.app${styleImageUrl}`;

    console.log("🔗 URL style:", absoluteStyleImageUrl);

    // ======================================
    // Test 1 : Stable Diffusion XL
    // ======================================
    console.log("📤 Essai 1 : Stable Diffusion XL");

    try {
      const sdResponse = await fetch(
        "https://router.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: "Close-up portrait of African woman with beautiful braided hairstyle, natural skin, studio lighting, high quality photo",
          }),
        }
      );

      if (sdResponse.ok) {
        const blob = await sdResponse.blob();
        const imageBuffer = Buffer.from(await blob.arrayBuffer());
        const base64Image = imageBuffer.toString("base64");
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        console.log("✅ Stable Diffusion XL marche!");
        return res.status(200).json({ imageUrl: dataUrl });
      } else {
        const errorText = await sdResponse.text();
        console.warn("⚠️ SD XL erreur:", sdResponse.status, errorText);
      }
    } catch (err) {
      console.warn("⚠️ SD XL échoué:", err.message);
    }

    // ======================================
    // Test 2 : Stable Diffusion v1.5 (fallback)
    // ======================================
    console.log("📤 Essai 2 : Stable Diffusion v1.5");

    try {
      const sdResponse = await fetch(
        "https://router.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: "African woman with braids, portrait, professional photo",
          }),
        }
      );

      if (sdResponse.ok) {
        const blob = await sdResponse.blob();
        const imageBuffer = Buffer.from(await blob.arrayBuffer());
        const base64Image = imageBuffer.toString("base64");
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        console.log("✅ Stable Diffusion v1.5 marche!");
        return res.status(200).json({ imageUrl: dataUrl });
      } else {
        const errorText = await sdResponse.text();
        console.warn("⚠️ SD v1.5 erreur:", sdResponse.status, errorText);
      }
    } catch (err) {
      console.warn("⚠️ SD v1.5 échoué:", err.message);
    }

    // ======================================
    // Test 3 : Prompt simple
    // ======================================
    console.log("📤 Essai 3 : Simple prompt");

    try {
      const simpleResponse = await fetch(
        "https://router.huggingface.co/models/stabilityai/stable-diffusion-3.5-medium",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: "braids",
          }),
        }
      );

      if (simpleResponse.ok) {
        const blob = await simpleResponse.blob();
        const imageBuffer = Buffer.from(await blob.arrayBuffer());
        const base64Image = imageBuffer.toString("base64");
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        console.log("✅ Simple prompt marche!");
        return res.status(200).json({ imageUrl: dataUrl });
      } else {
        const errorText = await simpleResponse.text();
        console.error("❌ Simple prompt erreur:", simpleResponse.status, errorText);
      }
    } catch (err) {
      console.error("❌ Simple prompt échoué:", err.message);
    }

    return res.status(500).json({
      error: "Impossible de générer l'image avec HuggingFace",
    });

  } catch (err) {
    console.error("❌ Erreur générale:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
