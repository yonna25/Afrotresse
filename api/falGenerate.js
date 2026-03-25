import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      selfieBase64,
      selfieType,
      styleImageUrl
    } = req.body;

    if (!selfieBase64 || !styleImageUrl) {
      return res.status(400).json({ error: "Missing data" });
    }

    // ======================================
    // ÉTAPE 1 : Upload du selfie à Fal
    // ======================================
    const buffer = Buffer.from(selfieBase64, "base64");
    const file = new File([buffer], "selfie.jpg", { type: selfieType || "image/jpeg" });
    const selfieUrl = await fal.storage.upload(file);
    console.log("✅ Selfie uploadé à Fal:", selfieUrl);

    // ======================================
    // ÉTAPE 2 : Fetch + upload de la référence
    // ======================================
    const absoluteStyleImageUrl = styleImageUrl.startsWith("http")
      ? styleImageUrl
      : `https://afrotresse-hfwf.vercel.app${styleImageUrl}`;

    console.log("🔗 URL de référence originale:", absoluteStyleImageUrl);

    let referenceUrl = absoluteStyleImageUrl;

    try {
      // Télécharger l'image de référence
      const refResponse = await fetch(absoluteStyleImageUrl, {
        timeout: 10000 // 10s timeout
      });

      if (!refResponse.ok) {
        throw new Error(`HTTP ${refResponse.status} - URL inaccessible`);
      }

      const refBuffer = await refResponse.arrayBuffer();
      const refFile = new File([refBuffer], "reference.jpg", { type: "image/jpeg" });
      
      // Upload vers Fal storage
      referenceUrl = await fal.storage.upload(refFile);
      console.log("✅ Référence uploadée à Fal:", referenceUrl);

    } catch (fetchErr) {
      console.warn("⚠️  Impossible d'uploader la référence, fallback URL directe:", fetchErr.message);
      // On envoie l'URL directe comme fallback
    }

    // ======================================
    // ÉTAPE 3 : Appel Fal.ai
    // ======================================
    const payload = {
      image_url: selfieUrl,
      reference_image_url: referenceUrl,
    };

    console.log("📤 Payload envoyé à Fal:", JSON.stringify(payload));

    const result = await fal.subscribe("fal-ai/image-apps-v2/hair-change", {
      input: payload,
    });

    console.log("📥 Réponse Fal complète:", JSON.stringify(result));

    // ======================================
    // ÉTAPE 4 : Extraction de l'URL résultat
    // ======================================
    const imageUrl = result?.data?.image?.url 
      || result?.data?.images?.[0]?.url
      || result?.data?.output?.url;

    if (!imageUrl) {
      console.error("❌ Réponse Fal inattendue - pas d'URL image:", JSON.stringify(result));
      return res.status(500).json({ 
        error: "Fal.ai n'a pas retourné d'image",
        details: "Vérifier les logs Vercel"
      });
    }

    console.log("✨ Image générée:", imageUrl);

    return res.status(200).json({ imageUrl });

  } catch (err) {
    console.error("❌ Erreur complète:", {
      message: err?.message,
      code: err?.code,
      status: err?.status,
      stack: err?.stack?.split('\n')[0]
    });

    return res.status(500).json({
      error: "Erreur génération Fal.ai",
      message: err?.message || "Erreur inconnue",
    });
  }
}
