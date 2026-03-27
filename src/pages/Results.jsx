import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import { getCredits, consumeCredits, consumeTransform, canTransform, addSeenStyleId, getSeenStyleIds } from "../services/credits.js";
import { BRAIDS_DB } from "../services/faceAnalysis.js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PAGE_SIZE = 3;

export default function Results() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(getCredits());
  const [loadingId, setLoadingId] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [page, setPage] = useState(0);

  // Récupération sécurisée des données utilisateur
  const userName = localStorage.getItem("afrotresse_user_name") || "Reine";
  const faceShape = localStorage.getItem("afrotresse_face_shape") || "oval";
  const selfieUrl = sessionStorage.getItem("afrotresse_photo") || localStorage.getItem("afrotresse_selfie");

  // 1. Filtrer par forme de visage
  const compatibleStyles = useMemo(() => {
    return (BRAIDS_DB || []).filter(s => s.faceShapes && s.faceShapes.includes(faceShape));
  }, [faceShape]);

  // 2. Organiser : Vus en premier, Nouveaux ensuite
  const orderedResults = useMemo(() => {
    const seenIds = getSeenStyleIds() || [];
    const seen = compatibleStyles.filter(s => seenIds.includes(s.id));
    const unseen = compatibleStyles.filter(s => !seenIds.includes(s.id));
    return [...seen, ...unseen];
  }, [compatibleStyles, credits]);

  // 3. Styles de la page actuelle (Protection contre les index hors limites)
  const currentResults = useMemo(() => {
    const start = page * PAGE_SIZE;
    return orderedResults.slice(start, start + PAGE_SIZE);
  }, [orderedResults, page]);

  // 4. Vérifier l'état de la page suivante
  const nextPack = useMemo(() => {
    const start = (page + 1) * PAGE_SIZE;
    return orderedResults.slice(start, start + PAGE_SIZE);
  }, [orderedResults, page]);

  const isNextAlreadyPaid = nextPack.length > 0 && nextPack.every(s => getSeenStyleIds().includes(s.id));

  const handleNext = () => {
    if (isNextAlreadyPaid) {
      setPage(p => p + 1);
      window.scrollTo(0, 0);
    } else {
      if (credits < 1) return navigate("/credits");
      
      // Action de paiement
      consumeCredits(1);
      setCredits(getCredits());
      nextPack.forEach(s => addSeenStyleId(s.id));
      
      setPage(p => p + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleTryStyle = async (style) => {
    if (!canTransform()) return navigate("/credits");
    setLoadingId(style.id);
    try {
      const blob = await fetch(selfieUrl).then(r => r.blob());
      const fileName = `trial-${Date.now()}.jpg`;
      await supabase.storage.from('selfies').upload(fileName, blob);
      const { data: { publicUrl } } = supabase.storage.from('selfies').getPublicUrl(fileName);
      
      const res = await fetch("/api/falGenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfieUrl: publicUrl, stylePath: "/styles/" + (style.localImage || style.image) }),
      });
      const data = await res.json();
      
      consumeTransform();
      setCredits(getCredits());
      setResultImage(data.imageUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] p-4 pb-48">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="w-12 h-12 rounded-full bg-[#C9963A] flex items-center justify-center font-black text-[#2C1A0E]">
          {userName.charAt(0)}
        </div>
        <h1 className="font-display font-bold text-lg">Styles pour ton visage {faceShape}</h1>
      </div>

      {/* Résultat IA */}
      {resultImage && (
        <div className="mb-10 rounded-3xl overflow-hidden border-2 border-[#C9963A] shadow-2xl">
          <img src={resultImage} alt="Résultat" className="w-full" />
          <button onClick={() => setResultImage(null)} className="w-full py-3 bg-[#3D2616] font-bold">Fermer</button>
        </div>
      )}

      {/* Liste des Styles */}
      <div className="space-y-8">
        {currentResults.map(style => (
          <div key={style.id} className="bg-[#3D2616] rounded-3xl overflow-hidden border border-white/5 shadow-lg">
            <img src={"/styles/" + (style.localImage || style.image)} className="w-full h-64 object-cover" />
            <div className="p-5 text-center">
              <h3 className="font-bold text-lg mb-4">{style.name}</h3>
              <button 
                onClick={() => handleTryStyle(style)}
                disabled={loadingId !== null}
                className="w-full py-4 rounded-xl bg-[#C9963A] text-[#2C1A0E] font-black uppercase text-xs"
              >
                {loadingId === style.id ? "Analyse..." : "Essayer virtuellement"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Barre de Navigation Fixe */}
      <div className="fixed bottom-6 left-4 right-4 flex flex-col items-center gap-3">
        <div className="w-full max-w-sm bg-[#3D2616]/95 backdrop-blur-md p-3 rounded-full border border-white/10 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
            disabled={page === 0}
            className="w-10 h-10 rounded-full bg-white/5 disabled:opacity-10 text-[#C9963A]"
          >
            ←
          </button>

          <span className="text-[#C9963A] font-black">Pack {page + 1}</span>

          <button 
            onClick={handleNext}
            disabled={nextPack.length === 0}
            className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase ${
              isNextAlreadyPaid ? "bg-white/10" : "bg-[#C9963A] text-[#2C1A0E]"
            }`}
          >
            {isNextAlreadyPaid ? "Suivant" : "Débloquer +3 (1 crédit)"}
          </button>
        </div>
        
        <div className="px-4 py-1 bg-[#C9963A] text-[#2C1A0E] rounded-full text-[10px] font-black">
          {credits} CRÉDITS RESTANTS
        </div>
      </div>
    </div>
  );
}
