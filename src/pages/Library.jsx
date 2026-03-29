import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Vérifiez que cette ligne est exactement comme ça :
import { BRAIDS_DB, FACE_SHAPE_NAMES } from '../services/faceAnalysis.js';

export default function Library() {
  const [savedStyles, setSavedStyles] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('afrotresse_saved') || '[]');
    setStyles(saved);
  }, []);

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#C9963A]">Ma Bibliothèque</h1>
        <p className="text-sm opacity-60">Tes styles favoris et tes analyses passées.</p>
      </header>

      {savedStyles.length === 0 ? (
        <div className="text-center py-20 opacity-40">
          <p>Aucun style enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedStyles.map((item) => (
            <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <h3 className="font-bold">{item.name}</h3>
              {/* Utilisation de FACE_SHAPE_NAMES ici */}
              <p className="text-xs text-[#C9963A]">
                Idéal pour visage : {item.faceShapes.map(shape => FACE_SHAPE_NAMES[shape]).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
