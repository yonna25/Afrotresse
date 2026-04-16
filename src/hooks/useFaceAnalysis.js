/**
 * Hook AfroTresse v2 - MediaPipe local + validation serveur
 * 1. Analyse faciale côté frontend (MediaPipe)
 * 2. Envoie faceShape au serveur (validation crédits)
 * 3. Retourne recommendations
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

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 1️⃣ ANALYSE FACIALE CÔTÉ CLIENT (MediaPipe)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const faceShape = await detectFaceShapeLocal(file);

      if (!faceShape) {
        return reject(new Error("Impossible de détecter le visage"));
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 2️⃣ VALIDATION + DÉCRÉMENT CÔTÉ SERVEUR
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const timer = setTimeout(() => {
        reject(new Error("Timeout API analyse"));
      }, timeoutMs);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceShape }),
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DÉTECTION FACIALE LOCAL (MediaPipe Face Mesh)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function detectFaceShapeLocal(photoBlob) {
  try {
    // Charger MediaPipe
    const module = await import("@mediapipe/face_mesh");
    const FaceMesh = module.default || module.FaceMesh;

    if (!FaceMesh) {
      throw new Error("MediaPipe Face Mesh non disponible");
    }

    // Créer instance
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    // Convertir Blob en Image
    const img = new Image();
    img.src = URL.createObjectURL(photoBlob);

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // Exécuter détection
          const results = await faceMesh.send({ image: img });

          if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            return resolve(null);
          }

          const landmarks = results.multiFaceLandmarks[0];
          const shape = calculateFaceShape(landmarks);

          resolve(shape);
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };

      img.onerror = () => {
        reject(new Error("Erreur chargement image"));
      };
    });

  } catch (err) {
    console.error("MediaPipe error:", err);
    throw err;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CALCUL FORME VISAGE (basé landmarks)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function calculateFaceShape(landmarks) {
  if (!landmarks || landmarks.length < 10) return null;

  // Points clés
  const forehead = landmarks[10]; // top forehead
  const chin = landmarks[152];    // chin
  const left = landmarks[234];    // left cheek
  const right = landmarks[454];   // right cheek
  const jawLeft = landmarks[205]; // left jaw
  const jawRight = landmarks[425]; // right jaw

  // Calculs distances
  const faceHeight = Math.abs(chin.y - forehead.y);
  const faceWidth = Math.abs(right.x - left.x);
  const jawWidth = Math.abs(jawRight.x - jawLeft.x);
  const ratio = faceHeight / faceWidth;

  // Logique classification
  if (ratio > 1.4) {
    return "long"; // Allongée
  } else if (ratio < 0.85) {
    return "round"; // Ronde
  } else if (Math.abs(jawWidth - faceWidth) < 0.1) {
    return "square"; // Carrée
  } else if (forehead.y > chin.y * 0.8) {
    return "heart"; // Cœur
  } else if (ratio > 1.1) {
    return "diamond"; // Diamant
  }

  return "oval"; // Défaut
}
