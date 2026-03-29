import React, { useState, useEffect } from 'react'; // Toujours importer les hooks si utilisés
import { motion } from 'framer-motion';
import { BRAIDS_DB } from '../services/faceAnalysis.js'; // Importation de la base de données corrigée

export default function Results() {
  const [faceShape, setFaceShape] = useState(localStorage.getItem('afrotresse_face_shape') || 'oval');

  // Filtrage des styles basé sur la base de données faceAnalysis.js
  const recommendations = BRAIDS_DB.filter(style => style.faceShapes.includes(faceShape));

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] p-6">
      <h1 className="text-[#C9963A] text-2xl font-bold mb-6">Tes Tresses Idéales</h1>
      <div className="grid gap-6">
        {recommendations.map(style => (
          <div key={style.id} className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h3 className="font-bold text-lg">{style.name}</h3>
            <p className="text-sm opacity-70">{style.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
