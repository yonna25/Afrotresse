/**
 * Service d'analyse de visage
 * Appelle l'API serverless Vercel (/api/analyze) ou utilise un mock en développement
 */

// Export des constantes utilisées par Library.jsx
export const FACE_SHAPE_NAMES = {
  ovale: "Visage ovale",
  rond: "Visage rond",
  carre: "Visage carré",
  coeur: "Visage en cœur",
  allonge: "Visage allongé",
  losange: "Visage losange"
};

// Fonction principale d'analyse
export async function analyzeFace(imageFile) {
  // Mode mock pour le développement local sans backend
  const useMock = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API;

  if (useMock) {
    console.log("🔧 Mode mock : analyse simulée");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          faceShape: "ovale",
          hairType: "bouclé",
          recommendations: [
            { id: 1, name: "Tresses collées", description: "Idéal pour visage ovale" },
            { id: 2, name: "Chignon flou", description: "Volume et légèreté" },
            { id: 3, name: "Natte simple", description: "Classique intemporel" }
          ],
          confidence: 0.92
        });
      }, 1500);
    });
  }

  // Appel réel à l'API Vercel
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API d'analyse :", error);
    throw new Error("Impossible d'analyser l'image. Vérifiez votre connexion ou réessayez.");
  }
}

// Export d'une fonction utilitaire (si utilisée ailleurs)
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Fonction pour obtenir des recommandations basées sur la forme du visage (exemple)
export function getRecommendationsByFaceShape(faceShape) {
  const recommendations = {
    ovale: ["Tresses collées", "Chignon flou", "Nattes simples"],
    rond: ["Coiffure volumineuse", "Tresses hautes", "Chignon déstructuré"],
    carre: ["Vagues douces", "Tresses latérales", "Chignon bas"],
    coeur: ["Tresses cascades", "Half-up bun", "Nattes épaisses"],
    allonge: ["Boucles lâches", "Tresses collées", "Chignon texturé"],
    losange: ["Volume sur les côtés", "Tresses avec frange", "Chignon flou"]
  };
  return recommendations[faceShape] || recommendations.ovale;
}
