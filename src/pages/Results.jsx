import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BRAIDS_DB } from "../services/faceAnalysis.js";

export default function Results() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  
  // Récupération des données locales
  const faceShape = localStorage.getItem("afrotresse_face_shape") || "oval";
  
  // Filtrage des styles selon la forme du visage
  const results = useMemo(() => {
    return BRAIDS_DB.filter(s => s.faceShapes.includes(faceShape)).slice(0, 3);
  }, [faceShape]);

  const totalPages = results.length;

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  // Sécurité si aucun résultat
  if (totalPages === 0) {
    return (
      <div className="min-h-screen bg-[#2C1A0E] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-[#C9963A] mb-4">Aucun style trouvé.</p>
        <button onClick={() => navigate('/')} className="text-white underline">Retour</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2C1A0E] p-6 text-[#FAF4EC]">
      <header className="flex justify-between items-center mb-10 pt-4">
        <button 
          onClick={() => navigate('/profile')} 
          className="text-[#C9963A] font-bold text-sm uppercase tracking-widest"
        >
          ← Profil
        </button>
        <h1 className="text-xl font-bold text-[#C9963A] italic">Mes Styles</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#3D2616] rounded-[2.5rem] p-8 border border-[#C9963A]/20 shadow-2xl text-center min-h-[300px] flex flex-col justify-center"
          >
            <div className="text-4xl mb-4">👑</div>
            <h2 className="text-2xl font-bold text-[#E8B96A] mb-4">
              {results[currentPage]?.name || "Style Royal"}
            </h2>
            <p className="text-[#FAF4EC]/80 text-sm leading-relaxed italic px-2">
              "{results[currentPage]?.description || "Un style unique pour sublimer ton visage."}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* --- NAVIGATION (Vérifiée sans erreur de guillemet) --- */}
        <div className="flex items-center justify-between mt-12 px-2">
          <button 
            onClick={prevPage}
            className="px-6 py-4 rounded-2xl bg-[#3D2616] border border-[#C9963A]/20 text-[#C9963A] font-black text-[10px] uppercase tracking-widest active:scale-95"
          >
            Précédent
          </button>
          
          <span className="font-black font-mono text-sm text-[#C9963A]">
            {currentPage + 1} / {totalPages}
          </span>

          <button 
            onClick={nextPage}
            className="px-6 py-4 rounded-2xl bg-[#C9963A] text-[#2C1A0E] font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg shadow-[#C9963A]/20"
          >
            Suivant
          </button>
        </div>
      </main>
    </div>
  );
}
