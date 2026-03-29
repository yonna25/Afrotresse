import React, { useState, useEffect } from 'react'; // <--- AJOUTER CETTE LIGNE
import { BRAIDS_DB } from '../services/faceAnalysis.js';

export default function Results() {
  const [styles, setStyles] = useState([]); // useState nécessite l'import ci-dessus

  useEffect(() => {
    const shape = localStorage.getItem('afrotresse_face_shape') || 'oval';
    const filtered = BRAIDS_DB.filter(s => s.faceShapes.includes(shape));
    setStyles(filtered);
  }, []);

  return (
    <div className="min-h-screen bg-[#2C1A0E] p-6 text-white">
      <h1 className="text-[#C9963A] font-bold text-2xl mb-6">Tes Styles Recommandés</h1>
      <div className="grid gap-4">
        {styles.map(style => (
          <div key={style.id} className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h3 className="font-bold">{style.name}</h3>
            <p className="text-sm opacity-60">{style.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
