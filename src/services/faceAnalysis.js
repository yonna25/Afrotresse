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
// id = clé utilisée pour /styles/{id}-face.jpg / -back.jpg / -top.jpg
const STYLES_BY_SHAPE = {
  oval: [
    {
      id: "boxbraids",
      name: "Box Braids",
      description: "Le classique indémodable. Les box braids s'adaptent parfaitement à ton visage ovale et te donnent un look à la fois élégant et polyvalent.",
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
      id: "knotlessbraids",
      name: "Knotless Braids",
      description: "Plus légères et sans tension, ces tresses sans nœuds sont idéales pour ton visage ovale. Confort maximal, style royal.",
      tags: ["Confort", "Naturel", "Léger"],
      duration: "5-7h"
    },
    {
      id: "fulanibraids",
      name: "Fulani Braids",
      description: "Un mélange de cornrows et de tresses libres avec des perles dorées. Ce style d'inspiration west-africaine sublime les visages ovales.",
      tags: ["Ethnique", "Bohème", "Perles"],
      duration: "3-5h"
    },
    {
      id: "goddessbraids",
      name: "Goddess Braids",
      description: "Grosses tresses majestueuses avec des extensions ondulées. Un look de déesse pour mettre en valeur ton visage équilibré.",
      tags: ["Glamour", "Majestueux", "Volume"],
      duration: "3-5h"
    },
    {
      id: "twists",
      name: "Twists",
      description: "Des torsades naturelles et élégantes qui encadrent parfaitement ton visage. Faciles à entretenir et très stylées.",
      tags: ["Naturel", "Simple", "Chic"],
      duration: "2-4h"
    },
  ],

  round: [
    {
      id: "boxbraids",
      name: "Box Braids hautes",
      description: "Portées en chignon haut ou en queue de cheval, les box braids allongent visuellement ton visage rond pour un effet élancé.",
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
      id: "knotlessbraids",
      name: "Knotless Braids longues",
      description: "Les tresses longues qui tombent allongent le visage. Les knotless braids sont parfaites pour cet effet naturel.",
      tags: ["Allongeant", "Naturel", "Léger"],
      duration: "5-7h"
    },
    {
      id: "fulanibraids",
      name: "Fulani Braids",
      description: "Les Fulani braids avec leur bandeau central créent une ligne qui allonge visuellement ton visage rond.",
      tags: ["Ethnique", "Allongeant", "Perles"],
      duration: "3-5h"
    },
    {
      id: "goddessbraids",
      name: "Goddess Braids",
      description: "Portées vers le haut, ces tresses majestueuses donnent de la hauteur et affinent les contours de ton visage.",
      tags: ["Glamour", "Hauteur", "Volume"],
      duration: "3-5h"
    },
    {
      id: "twists",
      name: "Twists longs",
      description: "Des torsades longues et fluides qui créent un effet allongeant parfait pour les visages ronds.",
      tags: ["Naturel", "Allongeant", "Chic"],
      duration: "2-4h"
    },
  ],

  square: [
    {
      id: "knotlessbraids",
      name: "Knotless Braids",
      description: "La légèreté des knotless braids adoucit les angles de ton visage carré tout en te donnant un look naturel et élégant.",
      tags: ["Adoucissant", "Naturel", "Léger"],
      duration: "5-7h"
    },
    {
      id: "twists",
      name: "Twists",
      description: "Les torsades naturelles adoucissent les contours anguleux de ton visage carré et apportent une touche de douceur.",
      tags: ["Doux", "Naturel", "Équilibré"],
      duration: "2-4h"
    },
    {
      id: "fulanibraids",
      name: "Fulani Braids",
      description: "Les Fulani braids encadrent joliment ton visage en adoucissant la mâchoire avec leurs ornements et tresses libres.",
      tags: ["Ethnique", "Adoucissant", "Bohème"],
      duration: "3-5h"
    },
    {
      id: "goddessbraids",
      name: "Goddess Braids",
      description: "Le volume sur les côtés des goddess braids équilibre la largeur de ton visage carré pour un rendu harmonieux.",
      tags: ["Glamour", "Équilibré", "Volume"],
      duration: "3-5h"
    },
    {
      id: "boxbraids",
      name: "Box Braids",
      description: "En version side-swept (sur le côté), les box braids adoucissent les angles forts de ton visage carré.",
      tags: ["Tendance", "Polyvalent", "Stylé"],
      duration: "4-6h"
    },
    {
      id: "cornrows",
      name: "Cornrows courbés",
      description: "Des cornrows en courbes ou en motifs arrondis adoucissent les contours anguleux de ton visage.",
      tags: ["Structuré", "Créatif", "Adoucissant"],
      duration: "2-4h"
    },
  ],

  heart: [
    {
      id: "goddessbraids",
      name: "Goddess Braids",
      description: "Le volume en bas des goddess braids équilibre parfaitement ton menton fin et met en valeur ton visage en cœur.",
      tags: ["Équilibrant", "Glamour", "Volume"],
      duration: "3-5h"
    },
    {
      id: "twists",
      name: "Twists avec volume bas",
      description: "Des torsades avec du volume à mi-longueur équilibrent ton visage en cœur en créant de l'harmonie vers le bas.",
      tags: ["Équilibrant", "Naturel", "Harmonieux"],
      duration: "2-4h"
    },
    {
      id: "knotlessbraids",
      name: "Knotless Braids",
      description: "Les knotless braids légères et naturelles s'adaptent bien aux visages en cœur sans surcharger le haut du visage.",
      tags: ["Naturel", "Léger", "Équilibré"],
      duration: "5-7h"
    },
    {
      id: "fulanibraids",
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
      description: "Des cornrows plaqués en haut avec des tresses libres en bas équilibrent parfaitement les proportions de ton visage.",
      tags: ["Structuré", "Net", "Équilibré"],
      duration: "2-4h"
    },
  ],

  long: [
    {
      id: "fulanibraids",
      name: "Fulani Braids",
      description: "Les Fulani braids avec leur bandeau central et leurs ornements créent de la largeur visuelle idéale pour ton visage allongé.",
      tags: ["Élargissant", "Ethnique", "Perles"],
      duration: "3-5h"
    },
    {
      id: "cornrows",
      name: "Cornrows latéraux",
      description: "Des cornrows qui partent sur les côtés créent l'illusion de largeur et équilibrent parfaitement ton visage allongé.",
      tags: ["Élargissant", "Structuré", "Net"],
      duration: "2-4h"
    },
    {
      id: "goddessbraids",
      name: "Goddess Braids larges",
      description: "Des goddess braids épaisses et volumineuses créent de la largeur et de la présence pour ton visage allongé.",
      tags: ["Volume", "Glamour", "Élargissant"],
      duration: "3-5h"
    },
    {
      id: "boxbraids",
      name: "Box Braids courtes",
      description: "En version courte ou mi-longue, les box braids évitent d'allonger encore plus ton visage tout en restant très stylées.",
      tags: ["Équilibrant", "Tendance", "Polyvalent"],
      duration: "3-5h"
    },
    {
      id: "twists",
      name: "Twists courts",
      description: "Des torsades courtes et volumineuses qui créent de la largeur et harmonisent les proportions de ton visage allongé.",
      tags: ["Équilibrant", "Volume", "Naturel"],
      duration: "2-3h"
    },
    {
      id: "knotlessbraids",
      name: "Knotless Braids courtes",
      description: "En version bob ou mi-longue, les knotless braids apportent du volume qui équilibre ton visage allongé.",
      tags: ["Léger", "Volume", "Naturel"],
      duration: "4-6h"
    },
  ],

  diamond: [
    {
      id: "cornrows",
      name: "Cornrows structurés",
      description: "Des cornrows précis qui encadrent ton visage diamant et mettent en valeur tes pommettes prononcées.",
      tags: ["Structuré", "Net", "Encadrant"],
      duration: "2-4h"
    },
    {
      id: "boxbraids",
      name: "Box Braids",
      description: "Les box braids encadrent et subliment les pommettes larges de ton visage diamant tout en créant un équilibre harmonieux.",
      tags: ["Encadrant", "Tendance", "Élégant"],
      duration: "4-6h"
    },
    {
      id: "fulanibraids",
      name: "Fulani Braids",
      description: "Avec leurs ornements et leur structure, les Fulani braids mettent parfaitement en valeur les pommettes d'un visage diamant.",
      tags: ["Ethnique", "Sublimant", "Perles"],
      duration: "3-5h"
    },
    {
      id: "knotlessbraids",
      name: "Knotless Braids",
      description: "La légèreté des knotless braids encadre subtilement ton visage diamant pour un résultat naturel et équilibré.",
      tags: ["Naturel", "Léger", "Équilibré"],
      duration: "5-7h"
    },
    {
      id: "goddessbraids",
      name: "Goddess Braids",
      description: "Des tresses majestueuses qui encadrent et subliment les pommettes de ton visage diamant.",
      tags: ["Glamour", "Majestueux", "Sublimant"],
      duration: "3-5h"
    },
    {
      id: "twists",
      name: "Twists",
      description: "Des torsades naturelles qui encadrent ton visage diamant en douceur et mettent en valeur tes traits.",
      tags: ["Naturel", "Doux", "Chic"],
      duration: "2-4h"
    },
  ],
};

// ── Analyse principale ────────────────────────────────────────────────────────
// Pas de try/catch global — les erreurs remontent à l'appelant
// (403 no credits, 429 rate limit, 409 double requête, etc.)
export async function analyzeFace(photoBlob) {
  const result = await analyzeFaceWithAI(photoBlob);

  const faceShape = result?.faceShape || "oval";
  const confidence = result?.confidence || 85;

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
