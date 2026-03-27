// api/falGenerate.js
import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Formidable moderne
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: false });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const selfieFile = files.selfie;
    const styleImageUrl = fields.styleImageUrl;

    if (!selfieFile || !styleImageUrl) return res.status(400).json({ error: "Missing data" });

    const hfToken = process.env.HUGGINGFACE_API_KEY;
    if (!hfToken) return res.status(500).json({ error: "API key manquante" });

    console.log("✅ Selfie et style prêts");

    // Lire le selfie en Base64
    const selfieBuffer = fs.readFileSync(selfieFile.filepath);
    const selfieBase64 = `data:image/jpeg;base64,${selfieBuffer.toString("base64")}`;

    // Préparer URL absolue style
    const absoluteStyleImageUrl = styleImageUrl.startsWith("http")
      ? styleImageUrl
      : `https://afrotresse-hfwf.vercel.app${styleImageUrl}`;

    // Charger l'image style en Base64
    const styleResponse = await fetch(absoluteStyleImageUrl);
    if (!styleResponse.ok) throw new Error("Impossible de charger l'image style");
    const styleArrayBuffer = await styleResponse.arrayBuffer();
    const styleBase64 = Buffer.from(styleArrayBuffer).toString("base64");

    // Appel HuggingFace Router
    const hfResponse = await fetch(
      "https://router.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Apply hairstyle from reference image, keep face intact, realistic",
          parameters: {
            image: selfieBase64,
            reference_image: styleBase64,
            guidance_scale: 7.5
          }
        }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("❌ HF erreur:", hfResponse.status, errorText);
      return res.status(500).json({ error: "Impossible de générer l'image HF" });
    }

    const blob = await hfResponse.blob();
    const imageBuffer = Buffer.from(await blob.arrayBuffer());
    const base64Image = imageBuffer.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return res.status(200).json({ imageUrl: dataUrl });

  } catch (err) {
    console.error("❌ Erreur générale:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
