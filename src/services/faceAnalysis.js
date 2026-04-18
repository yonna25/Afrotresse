import { analyzeFaceWithAI } from '../hooks/useFaceAnalysis.js'

// CONSTANTES
export const FACE_SHAPE_NAMES = {
  oval:    "Ovale",
  round:   "Ronde",
  square:  "Carrée",
  heart:   "Cœur",
  long:    "Allongée",
  diamond: "Diamant"
};

export const FACE_SHAPE_DESCRIPTIONS = {
  oval:    "Visage équilibré — la plupart des styles te conviennent à merveille.",
  round:   "Visage doux et rond — les styles avec du volume en haut allongeront tes traits.",
  square:  "Visage anguleux — les styles souples adoucissent ta mâchoire.",
  heart:   "Visage en cœur — les styles qui encadrent le visage équilibrent ton menton.",
  long:    "Visage allongé — les styles sans trop de hauteur créent l'harmonie parfaite.",
  diamond: "Pommettes larges — les styles structurés te subliment."
};

// ── Catalogue de styles par forme de visage ──────────────────────────────────
// ids correspondent exactement aux fichiers dans public/styles/
const STYLES_BY_SHAPE = {
  oval: [
    {
      id: "boxbraids",
      name: "Box Braids",
      description: "Le classique indémodable. Les box braids s'adaptent parfaitement à ton visage ovale et te donnent un look élégant et polyvalent.",
      tags: ["Tendance", "Polyvalent", "Protecteur"],
      duration: "4-6h"
    },
    {
      id: "cornrows",
      name: "Cornrows",
      description: "Des tresses plaquées propres et précises qui mettent en valeur tes traits équilibrés. Parfait pour un look net et affirmé.",
      tags: ["Élégant", "Net", "Durable"],
      duration: "2-4h"
    },
    {
      id: "fulani",
      name: "Fulani Braids",
      description: "Un mélange de cornrows et de tresses libres avec des perles dorées. Ce style d'inspiration west-africaine sublime les visages ovales.",
      tags: ["Ethnique", "Bohème", "Perles"],
      duration: "3-5h"
    },
    {
      id: "ghanabraids",
      name: "Ghana Braids",
      description: "Des tresses sculpturales qui mettent en valeur ton visage ovale avec élégance et caractère.",
      tags: ["Sculptural", "Élégant", "Durable"],
      duration: "3-5h"
    },
    {
      id: "tresseplaquees",
      name: "Tresses Plaquées",
      description: "Un look net qui met en valeur la structure osseuse sans surcharge. Idéal pour les visages ovales.",
      tags: ["Minimaliste", "Sport", "Nette"],
      duration: "2-4h"
    },
    {
      id: "stitchbraids",
      name: "Stitch Braids",
      description: "Une technique ultra-précise avec des lignes graphiques qui subliment ton visage ovale.",
      tags: ["Graphique", "Précision", "Moderne"],
      duration: "3-5h"
    },
  ],

  round: [
    {
      id: "boxbraids",
      name: "Box Braids hautes",
      description: "Portées en chignon haut ou en queue de cheval, les box braids allongent visuellement ton visage rond.",
      tags: ["Allongeant", "Élégant", "Tendance"],
      duration: "4-6h"
    },
    {
      id: "cornrows",
      name: "Cornrows en éventail",
      description: "Des cornrows qui partent vers le haut créent de la hauteur et équilibrent la rondeur de ton visage.",
      tags: ["Structuré", "Net", "Hauteur"],
      duration: "2-4h"
    },
    {
      id: "tresseplaquees",
      name: "Tresses Plaquées",
      description: "Les tresses plaquées vers le haut créent un effet allongeant parfait pour les visages ronds.",
      tags: ["Allongeant", "Structuré", "Net"],
      duration: "2-4h"
    },
    {
      id: "fulani",
      name: "Fulani Braids",
      description: "Les Fulani braids avec leur bandeau central créent une ligne qui allonge visuellement ton visage rond.",
      tags: ["Ethnique", "Allongeant", "Perles"],
      duration: "3-5h"
    },
    {
      id: "ghanabraids",
      name: "Ghana Braids",
      description: "Portées vers le haut, ces tresses sculpturales donnent de la hauteur et affinent les contours de ton visage.",
      tags: ["Hauteur", "Élégant", "Durable"],
      duration: "3-5h"
    },
    {
      id: "stitchbraids",
      name: "Stitch Braids",
      description: "Les lignes graphiques des stitch braids créent un effet visuel allongeant parfait pour ton visage rond.",
      tags: ["Graphique", "Allongeant", "Moderne"],
      duration: "3-5h"
    },
  ],

  square: [
    {
      id: "cocotwists",
      name: "Coco Twists",
      description: "Des vanilles volumineuses qui adoucissent les angles de ton visage carré pour un look naturel et doux.",
      tags: ["Doux", "Volume", "Naturel"],
      duration: "5-7h"
    },
    {
      id: "fulani",
      name: "Fulani Braids",
      description: "Les Fulani braids encadrent joliment ton visage en adoucissant la mâchoire avec leurs ornements.",
      tags: ["Ethnique", "Adoucissant", "Bohème"],
      duration: "3-5h"
    },
    {
      id: "tressecollees",
      name: "Tresses Collées",
      description: "Style versatile qui suit les courbes naturelles et adoucit les angles de ton visage carré.",
      tags: ["Protectrice", "Chic", "Classique"],
      duration: "2-4h"
    },
    {
      id: "ghanabraids",
      name: "Ghana Braids",
      description: "Le volume des ghana braids équilibre la largeur de ton visage carré pour un rendu harmonieux.",
      tags: ["Glamour", "Équilibré", "Volume"],
      duration: "3-5h"
    },
    {
      id: "boxbraids",
      name: "Box Braids",
      description: "En version side-swept, les box braids adoucissent les angles forts de ton visage carré.",
      tags: ["Tendance", "Polyvalent", "Stylé"],
      duration: "4-6h"
    },
    {
      id: "cornrows",
      name: "Cornrows courbés",
      description: "Des cornrows en courbes adoucissent les contours anguleux de ton visage.",
      tags: ["Structuré", "Créatif", "Adoucissant"],
      duration: "2-4h"
    },
  ],

  heart: [
    {
      id: "ghanabraids",
      name: "Ghana Braids",
      description: "Le volume en bas des ghana braids équilibre parfaitement ton menton fin et met en valeur ton visage en cœur.",
      tags: ["Équilibrant", "Glamour", "Volume"],
      duration: "3-5h"
    },
    {
      id: "cocotwists",
      name: "Coco Twists",
      description: "Des torsades volumineuses qui équilibrent ton visage en cœur en créant de l'harmonie vers le bas.",
      tags: ["Équilibrant", "Naturel", "Harmonieux"],
      duration: "5-7h"
    },
    {
      id: "tressecollees",
      name: "Tresses Collées",
      description: "Les tresses collées légères s'adaptent bien aux visages en cœur sans surcharger le haut.",
      tags: ["Naturel", "Léger", "Équilibré"],
      duration: "2-4h"
    },
    {
      id: "fulani",
      name: "Fulani Braids",
      description: "Avec leurs tresses libres sur les côtés, les Fulani braids encadrent et équilibrent ton visage en cœur.",
      tags: ["Ethnique", "Encadrant", "Perles"],
      duration: "3-5h"
    },
    {
      id: "boxbraids",
      name: "Box Braids mi-longues",
      description: "À mi-longueur, les box braids créent du volume là où il faut pour équilibrer ton menton.",
      tags: ["Équilibrant", "Tendance", "Polyvalent"],
      duration: "4-6h"
    },
    {
      id: "cornrows",
      name: "Cornrows",
      description: "Des cornrows plaqués en haut avec des tresses libres en bas équilibrent les proportions de ton visage.",
      tags: ["Structuré", "Net", "Équilibré"],
      duration: "2-4h"
    },
  ],

  long: [
    {
      id: "fulani",
      name: "Fulani Braids",
      description: "Les Fulani braids avec leur bandeau central créent de la largeur visuelle idéale pour ton visage allongé.",
      tags: ["Élargissant", "Ethnique", "Perles"],
      duration: "3-5h"
    },
    {
      id: "cornrows",
      name: "Cornrows latéraux",
      description: "Des cornrows sur les côtés créent l'illusion de largeur et équilibrent ton visage allongé.",
      tags: ["Élargissant", "Structuré", "Net"],
      duration: "2-4h"
    },
    {
      id: "ghanabraids",
      name: "Ghana Braids larges",
      description: "Des ghana braids épaisses créent de la largeur et de la présence pour ton visage allongé.",
      tags: ["Volume", "Glamour", "Élargissant"],
      duration: "3-5h"
    },
    {
      id: "boxbraids",
      name: "Box Braids courtes",
      description: "En version courte, les box braids évitent d'allonger encore plus ton visage tout en restant stylées.",
      tags: ["Équilibrant", "Tendance", "Polyvalent"],
      duration: "3-5h"
    },
    {
      id: "tressecollees",
      name: "Tresses Collées",
      description: "Des tresses collées volumineuses qui créent de la largeur pour les visages allongés.",
      tags: ["Équilibrant", "Volume", "Naturel"],
      duration: "2-4h"
    },
    {
      id: "tresseplaquees",
      name: "Tresses Plaquées",
      description: "En version latérale, les tresses plaquées apportent du volume qui équilibre ton visage allongé.",
      tags: ["Léger", "Volume", "Naturel"],
      duration: "2-4h"
    },
  ],

  diamond: [
    {
      id: "cornrows",
      name: "Cornrows structurés",
      description: "Des cornrows précis qui encadrent ton visage diamant et mettent en valeur tes pommettes.",
      tags: ["Structuré", "Net", "Encadrant"],
      duration: "2-4h"
    },
    {
      id: "boxbraids",
      name: "Box Braids",
      description: "Les box braids encadrent et subliment les pommettes larges de ton visage diamant.",
      tags: ["Encadrant", "Tendance", "Élégant"],
      duration: "4-6h"
    },
    {
      id: "fulani",
      name: "Fulani Braids",
      description: "Avec leurs ornements, les Fulani braids mettent parfaitement en valeur les pommettes d'un visage diamant.",
      tags: ["Ethnique", "Sublimant", "Perles"],
      duration: "3-5h"
    },
    {
      id: "tressecollees",
      name: "Tresses Collées",
      description: "Les tresses collées encadrent subtilement ton visage diamant pour un résultat naturel et équilibré.",
      tags: ["Naturel", "Léger", "Équilibré"],
      duration: "2-4h"
    },
    {
      id: "ghanabraids",
      name: "Ghana Braids",
      description: "Des tresses majestueuses qui encadrent et subliment les pommettes de ton visage diamant.",
      tags: ["Glamour", "Majestueux", "Sublimant"],
      duration: "3-5h"
    },
    {
      id: "stitchbraids",
      name: "Stitch Braids",
      description: "Des torsades naturelles qui encadrent ton visage diamant en douceur et mettent en valeur tes traits.",
      tags: ["Naturel", "Doux", "Chic"],
      duration: "2-4h"
    },
  ],
};

// ── Analyse principale ────────────────────────────────────────────────────────
export async function analyzeFace(photoBlob) {
  let faceShape = "oval";
  let confidence = 75;

  try {
    const result = await analyzeFaceWithAI(photoBlob);
    faceShape  = result?.faceShape  || "oval";
    confidence = result?.confidence || 75;
  } catch (err) {
    const msg = err?.message || "";
    if (
      msg.includes("crédit") || msg.includes("credit") ||
      msg.includes("429") || msg.includes("409") ||
      msg.includes("déjà traitée") || msg.includes("déjà effectuée")
    ) {
      throw err;
    }
    console.warn("Fallback oval:", msg);
  }

  return buildRecommendations(faceShape, "", confidence);
}

function buildRecommendations(faceShape, reason = "", confidence = 0.85) {
  const shape = FACE_SHAPE_NAMES[faceShape] ? faceShape : "oval";
  const recommendations = STYLES_BY_SHAPE[shape] || STYLES_BY_SHAPE["oval"];

  return {
    faceShape: shape,
    faceShapeName: FACE_SHAPE_NAMES[shape],
    faceShapeDescription: FACE_SHAPE_DESCRIPTIONS[shape],
    aiReason: reason,
    confidence: Math.round((confidence || 0.85) * 100),
    recommendations,
  };
    }
