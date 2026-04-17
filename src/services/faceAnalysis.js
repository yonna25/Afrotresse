/**
 * Service d'analyse de visage
 * Appelle l'API serverless Vercel (/api/analyze) ou utilise un mock en développement
 */

// Fonction principale à exporter
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
    // En cas d'échec, on peut retourner un mock de secours
    // ou relancer l'erreur pour que l'UI la gère
    throw new Error("Impossible d'analyser l'image. Vérifiez votre connexion ou réessayez.");
  }
}

// Optionnel : fonction utilitaire pour convertir un fichier en base64 (si besoin)
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
