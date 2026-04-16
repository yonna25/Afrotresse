/**
 * Hook AfroTresse v2 - MediaPipe local + validation serveur
 * 1. Analyse faciale côté frontend (MediaPipe)
 * 2. Envoie faceShape au serveur (validation crédits)
 * 3. Retourne recommendations
 */

let isAnalyzing = false;
const STORAGE_KEY = "afrotresse_last_analysis_done";

export async function analyzeFaceWithAI(photoData, timeoutMs = 10000) {
  return new Promise(async (resolve, reject) => {
    try {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔒 ANTI DOUBLE ANALYSE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (isAnalyzing) {
        return reject(new Error("Analyse déjà en cours"));
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔒 ANTI REFRESH / BACK NAVIGATION
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const alreadyDone = sessionStorage.getItem(STORAGE_KEY);
      if (alreadyDone) {
        return reject(new Error("Analyse déjà effectuée dans cette session"));
      }

      isAnalyzing = true;

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
        isAnalyzing = false;
        return reject(new Error("Format image non supporté"));
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 1️⃣ ANALYSE LOCALE (MediaPipe)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const faceShape = await detectFaceShapeLocal(file);

      if (!faceShape) {
        isAnalyzing = false;
        return reject(new Error("Impossible de détecter le visage"));
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 2️⃣ VALIDATION BACKEND (CRÉDITS)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const timer = setTimeout(() => {
        isAnalyzing = false;
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
        isAnalyzing = false;
        return reject(err);
      }

      const data = await response.json();

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔒 VERROU SESSION (ANTI RE-RUN REFRESH)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      sessionStorage.setItem(STORAGE_KEY, "true");
      isAnalyzing = false;

      resolve({
        landmarks: [],
        faceShape: data.faceShape,
        faceShapeName: data.faceShapeName,
        confidence: data.confidence,
        recommendations: data.recommendations,
      });

    } catch (err) {
      isAnalyzing = false;
      reject(err);
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESET MANUEL (bouton "Refaire analyse")
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function resetFaceAnalysisLock() {
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * DÉTECTION FACIALE LOCAL (MediaPipe Face Mesh)
 */
async function detectFaceShapeLocal(photoBlob) {
  try {
    const module = await import("@mediapipe/face_mesh");
    const FaceMesh = module.default || module.FaceMesh;

    if (!FaceMesh) {
      throw new Error("MediaPipe Face Mesh non disponible");
    }

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    const img = new Image();
    img.src = URL.createObjectURL(photoBlob);

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const results = await faceMesh.send({ image: img });

          if (
            !results.multiFaceLandmarks ||
            results.multiFaceLandmarks.length === 0
          ) {
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

/**
 * CALCUL FORME VISAGE
 */
function calculateFaceShape(landmarks) {
  if (!landmarks || landmarks.length < 10) return null;

  const forehead = landmarks[10];
  const chin = landmarks[152];
  const left = landmarks[234];
  const right = landmarks[454];
  const jawLeft = landmarks[205];
  const jawRight = landmarks[425];

  const faceHeight = Math.abs(chin.y - forehead.y);
  const faceWidth = Math.abs(right.x - left.x);
  const jawWidth = Math.abs(jawRight.x - jawLeft.x);
  const ratio = faceHeight / faceWidth;

  if (ratio > 1.4) return "long";
  if (ratio < 0.85) return "round";
  if (Math.abs(jawWidth - faceWidth) < 0.1) return "square";
  if (forehead.y > chin.y * 0.8) return "heart";
  if (ratio > 1.1) return "diamond";

  return "oval";
}
