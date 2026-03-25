import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Note: Assurez-vous que BRAIDS_DB est bien importe ou defini
import { BRAIDS_DB } from '../services/faceAnalysis';

const Results = () => {
  const navigate = useNavigate();
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [resultImage, setResultImage] = useState(null);
  const [resultStyleId, setResultStyleId] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  
  // Recuperation des donnees du localStorage (simplifie pour l'exemple)
  const selfieUrl = localStorage.getItem('afrotresse_selfie');
  const faceShape = localStorage.getItem('afrotresse_face_shape') || 'oval';
  const waitingIntervalRef = useRef(null);

  // Fonctions de gestion des credits (a adapter selon votre logique)
  const canAnalyze = () => true; 
  const canTransform = () => true;
  const consumeAnalysis = () => {};
  const consumeTransform = () => {};
  const addSeenStyleId = (id) => {
    const seen = JSON.parse(localStorage.getItem('afrotresse_seen_styles') || '[]');
    localStorage.setItem('afrotresse_seen_styles', JSON.stringify([...new Set([...seen, id])]));
  };
  const getCredits = () => 3;
  const setCredits = (c) => {};

  const handleTryStyle = async (style, index, type = "transform") => {
    if (type === "analyze"   && !canAnalyze())  { navigate("/credits"); return; }
    if (type === "transform" && !canTransform()) { navigate("/credits"); return; }

    setErrorMsg(""); 
    setResultImage(null);
    setResultStyleId(null);
    setIsFallback(false); 
    setLoadingIdx(index); 
    setResultMsg("");

    let idx = 0;
    waitingIntervalRef.current = setInterval(() => { idx = (idx + 1) % 3; }, 3000);

    try {
      const selfieBase64  = selfieUrl?.split(",")[1] || null;
      const selfieType    = selfieUrl?.match(/:(.*?);/)?.[1] || "image/jpeg";
      
      // ========== CONSTRUCTION STYLEIMAGEURL (VUE TOP) ==========
      let styleImageUrl = "";

      // Utilisation de la nouvelle structure d'objets definie dans faceAnalysis.js
      if (style.views && style.views.top) {
        styleImageUrl = style.views.top.startsWith('http') 
          ? style.views.top 
          : `${window.location.origin}${style.views.top}`;
      } else if (style.image) {
        // Fallback pour compatibilite avec l'ancienne structure
        styleImageUrl = style.image.startsWith('http') 
          ? style.image 
          : `${window.location.origin}${style.image}`;
      } else {
        console.error('\u274c ERREUR: Reference image introuvable');
        setErrorMsg('Erreur: Image de r\u00e9f\u00e9rence introuvable.');
        clearInterval(waitingIntervalRef.current);
        setLoadingIdx(null);
        return;
      }
      
      // ========== APPEL API FAL.AI ==========
      const res = await fetch("/api/falGenerate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ 
          selfieBase64, 
          selfieType, 
          styleImageUrl, // Envoie la vue TOP
          faceShape, 
          styleId: style.id, 
          type 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la g\u00e9n\u00e9ration');
      }

      clearInterval(waitingIntervalRef.current);
      
      if (type === "analyze")   consumeAnalysis();
      if (type === "transform") consumeTransform();
      
      addSeenStyleId(style.id);
      
      if (data.imageUrl) {
        setResultImage(data.imageUrl);
        setResultStyleId(style.id);
      }

      setLoadingIdx(null);

    } catch (error) {
      console.error('\u274c Erreur dans handleTryStyle:', error);
      clearInterval(waitingIntervalRef.current);
      setLoadingIdx(null);
      setErrorMsg('Une erreur est survenue lors de la g\u00e9n\u00e9ration.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Tes Recommandations</h1>
      
      {errorMsg && (
        <div className="bg-red-900/50 border border-red-500 p-3 rounded-xl mb-4 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {BRAIDS_DB.map((style, index) => (
          <div key={style.id} className="bg-[#3D2616] rounded-2xl overflow-hidden border border-[#C9963A]/20">
            {/* Grille de 3 photos (Face, Back, Top) */}
            <div className="grid grid-cols-3 gap-1 h-40 bg-black/20">
              <img src={style.views?.face || style.image} alt="Front" className="w-full h-full object-cover" />
              <img src={style.views?.back || style.image} alt="Back" className="w-full h-full object-cover" />
              <img src={style.views?.top || style.image} alt="Top" className="w-full h-full object-cover" />
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg">{style.name}</h3>
              <p className="text-xs opacity-70 mb-4">{style.description}</p>
              
              <button
                onClick={() => handleTryStyle(style, index)}
                disabled={loadingIdx !== null}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#C9963A] to-[#E8B96A] text-[#2C1A0E]"
              >
                {loadingIdx === index ? "G\u00e9n\u00e9ration..." : "Essayer ce style"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox pour le resultat */}
      <AnimatePresence>
        {resultImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6"
          >
             <img src={resultImage} alt="Resultat" className="max-w-full rounded-2xl shadow-2xl mb-6" />
             <button 
              onClick={() => setResultImage(null)}
              className="px-8 py-3 bg-[#FAF4EC] text-[#2C1A0E] rounded-full font-bold"
             >
               Fermer
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// CRUCIAL: L'export par defaut resout l'erreur "Results is not defined"
export default Results;
