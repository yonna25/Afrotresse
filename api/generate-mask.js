import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
  
  const { image_url } = req.body;

  try {
    // Utilise le modèle spécialisé dans la détection de segments de cheveux
    const output = await replicate.run(
      "lucataco/remove-bg:95f1610e1323751010375990529d2f3066699c6e3b07357c320875b8a5d3f2d2",
      { input: { image: image_url, target: "hair" } } 
    );
    res.status(200).json({ mask_url: output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
