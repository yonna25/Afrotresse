/**
 * Hook corrigé AfroTresse - version stable
 * Accepte Blob / File / string (auto conversion)
 */

export async function analyzeFaceWithAI(photoData, timeoutMs = 10000) {
  return new Promise(async (resolve, reject) => {
    try {
      let file;

      // Cas 1 : Blob/File
      if (photoData instanceof Blob) {
        file = photoData;
      }

      // Cas 2 : string (base64 ou URL)
      else if (typeof photoData === "string") {
        const res = await fetch(photoData);
        file = await res.blob();
      }

      // Cas invalide
      else {
        return reject(new Error("Format image non supporté"));
      }

      const timer = setTimeout(() => {
        reject(new Error("Timeout API analyse"));
      }, timeoutMs);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return reject(err);
      }

      const data = await response.json();

      resolve({
        landmarks: [],
        faceShape: data.faceShape,
        faceShapeName: data.faceShapeName,
        confidence: data.confidence,
        recommendations: data.recommendations,
      });

    } catch (err) {
      reject(err);
    }
  });
}
