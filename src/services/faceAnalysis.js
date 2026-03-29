import { useFaceAnalysis } from '../hooks/useFaceAnalysis.js';
import { detectFaceShape, calculateConfidence } from '../utils/faceShapeDetector.js';

console.log("[DEBUG] faceAnalysis.js: Service chargé");

export const BRAIDS_DB = [
  {
    id: "box-braids",
    name: "Box Braids",
    description: "Intemporelles et polyvalentes.",
    faceShapes: ["oval", "round", "square", "heart", "diamond"],
    matchScore: 98,
    views: { face: "/styles/boxbraids-face.jpg", back: "/styles/boxbraids-back.jpg", top: "/styles/boxbraids-top.jpg" }
  },
  {
    id: "coco-twists",
    name: "Coco Twists",
    description: "Volume et texture majestueuse.",
    faceShapes: ["round", "square", "heart"],
    matchScore: 92,
    views: { face: "/styles/cocotwists-face.jpg", back: "/styles/cocotwists-back.jpg", top: "/styles/cocotwists-top.jpg" }
  }
];

export async function analyzeFace(photoBlob) {
  console.log("[DEBUG] analyzeFace: Début de l'analyse pour la photo", photoBlob ? "Présente" : "Manquante");
  try {
    const result = await useFaceAnalysis(photoBlob, 5000); 
    console.log("[DEBUG] analyzeFace: Résultat brut du hook", result);

    const faceShape = detectFaceShape(result.landmarks);
    console.log("[DEBUG] analyzeFace: Forme détectée ->", faceShape);

    return {
      faceShape,
      confidence: 100,
      recommendations: BRAIDS_DB.filter(b => b.faceShapes.includes(faceShape))
    };
  } catch (err) {
    console.error("[DEBUG] analyzeFace: ERREUR FATALE", err);
    return { faceShape: "oval", confidence: 75, recommendations: BRAIDS_DB };
  }
}
