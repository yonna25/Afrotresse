// api/testHF.js — Tester la connexion HuggingFace

export default async function handler(req, res) {
  const token = process.env.HUGGINGFACE_API_KEY;

  if (!token) {
    return res.status(500).json({ error: "HUGGINGFACE_API_KEY manquante" });
  }

  try {
    console.log("🧪 Test de connexion HuggingFace...");

    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "test",
        }),
      }
    );

    console.log(`Status: ${response.status}`);

    if (response.status === 401) {
      return res.status(401).json({
        error: "Clé API invalide ou expiée",
        hint: "Vérife HUGGINGFACE_API_KEY dans Vercel",
      });
    }

    if (response.status === 403) {
      return res.status(403).json({
        error: "Accès refusé (problème de permission)",
        hint: "Peut-être que la clé n'a pas les bonnes permissions",
      });
    }

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: "✅ Clé HuggingFace valide!",
        endpoint: "https://api-inference.huggingface.co",
      });
    }

    const error = await response.text();
    return res.status(response.status).json({
      error: `Status ${response.status}`,
      details: error,
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erreur connexion",
      message: err.message,
    });
  }
}

