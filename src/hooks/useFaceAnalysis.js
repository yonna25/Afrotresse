/**
 * Hook corrigé : envoi réel vers /api/analyze
 */

export async function analyzeFaceWithAI(photoData, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (!(photoData instanceof Blob)) {
      return reject(new Error("Image invalide (Blob requis)"));
    }

    const timer = setTimeout(() => {
      reject(new Error("Timeout API analyse"));
    }, timeoutMs);

    try {
      const formData = new FormData();
      formData.append("image", photoData);

      fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })
        .then(async (res) => {
          clearTimeout(timer);

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return reject(err);
          }

          const data = await res.json();

          resolve({
            landmarks: [],
            faceShape: data.faceShape,
            faceShapeName: data.faceShapeName,
            confidence: data.confidence,
            recommendations: data.recommendations,
          });
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}
