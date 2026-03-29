// src/services/faceAnalysis.js
// AUCUNE BALISE HTML ICI - UNIQUEMENT DU JS

export const BRAIDS_DB = [
  {
    id: "box-braids",
    name: "Box Braids Classic",
    description: "Un style protecteur iconique qui s'adapte à toutes les morphologies.",
    faceShapes: ["oval", "round", "square", "heart", "diamond"],
    matchScore: 98,
    views: { face: "/styles/boxbraids-face.jpg" }
  },
  {
    id: "ghana-weaving",
    name: "Ghana Weaving",
    description: "Des nattes collées élégantes avec des courbes complexes.",
    faceShapes: ["oval", "long", "heart"],
    matchScore: 95,
    views: { face: "/styles/ghana-face.jpg" }
  }
];

export async function analyzeFace(photoBlob) {
  // Simule une analyse ou appelle votre hook de détection
  console.log("Analyse de la photo lancée...");
  
  // On récupère une forme par défaut ou détectée
  const detectedShape = "oval"; 
  
  return {
    faceShape: detectedShape,
    confidence: 92,
    recommendations: BRAIDS_DB.filter(style => style.faceShapes.includes(detectedShape))
  };
}
