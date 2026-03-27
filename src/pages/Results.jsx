import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import { getCredits, consumeCredits, consumeTransform, canTransform, addSeenStyleId, getSeenStyleIds } from "../services/credits.js";
import { BRAIDS_DB } from "../services/faceAnalysis.js";
import { addShare } from "../services/stats.js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const FACE_SHAPE_TEXTS = {
  oval: "Ovale : Équilibré et polyvalent.",
  round: "Rond : Les tresses hautes affinent tes traits.",
  square: "Carré : Le volume adoucit la mâchoire.",
  heart: "Cœur : Le volume en bas équilibre le menton.",
  long: "Long : Les tresses latérales créent l'harmonie.",
  diamond: "Diamant : Les tresses encadrant le visage te subliment.",
}

const PAGE_SIZE = 3;

export default function Results() {
  const navigate = useNavigate();
  const [zoomImage, setZoomImage]     = useState(null);
  const [credits, setCredits]         = useState(getCredits());
  const [saveCount, setSaveCount]     = useState(0);
  const [loadingId, setLoadingId]     = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [errorMsg, setErrorMsg]       = useState("");
  const [page, setPage]               = useState(0); 
  
  const resultRef = useRef(null);
  const errorRef  = useRef(null);

  const userName  = localStorage.getItem("afrotresse_user_name") || "Reine";
  const faceShape = localStorage.getItem("afrotresse_face_shape") || "oval";
  const selfieUrl = sessionStorage.getItem("afrotresse_photo") || localStorage.getItem("afrotresse_selfie");

  // --- LOGIQUE DE NAVIGATION & HISTORIQUE ---
  
  // 1. On récupère TOUS les styles compatibles avec la forme du visage
  const compatibleStyles = useMemo(() => {
    return BRAIDS_DB.filter(s => s.faceShapes.includes(faceShape));
  }, [faceShape]);

  // 2. On détermine quels styles l'utilisatrice a déjà "débloqués" (vus)
  const seenIds = getSeenStyleIds();
  
  // 3. On crée la liste d'affichage : 
  // D'abord les styles déjà vus (dans l'ordre), puis le reste de la DB
  const orderedResults = useMemo(() => {
    const seenStyles = compatibleStyles.filter(s => seenIds.includes(s.id));
    const notSeenStyles = compatibleStyles.filter(s => !seenIds.includes(s.id));
    return [...seenStyles, ...notSeenStyles];
  }, [compatibleStyles, seenIds]);

  const currentResults = orderedResults.slice(page * PAGE_SIZE, (page * PAGE_SIZE) + PAGE_SIZE);
  const isPageAlreadySeen = currentResults.every(s => seenIds.includes(s.id));
  const totalPossiblePages = Math.ceil(compatibleStyles.length / PAGE_SIZE);

  // --- ACTIONS ---

  const handleNextPage = useCallback(() => {
    const nextStartIndex = (page + 1) * PAGE_SIZE;
    const nextStyles = orderedResults.slice(nextStartIndex, nextStartIndex + PAGE_SIZE);
    const hasAlreadySeenNext = nextStyles.every(s => seenIds.includes(s.id)) && nextStyles.length > 0;

    if (hasAlreadySeenNext) {
      // Navigation gratuite dans l'historique
      setPage(p => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // C'est une nouvelle génération : PAYANT (1 crédit)
      if (credits < 1) {
        navigate("/credits");
        return;
      }
      consumeCredits(1);
      setCredits(getCredits());
      // On marque ces nouveaux styles comme vus
      nextStyles.forEach(s => addSeenStyleId(s.id));
      setPage(p => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page, orderedResults, seenIds, credits, navigate]);

  const handlePrevPage = () => {
    setPage(p => p - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ... (handleSave et handleTryStyle conservés à l'identique)
  const handleSave = (imageUrl) => {
    if (credits < 1 && saveCount === 0) { navigate("/credits"); return; }
    const link = document.createElement("a"); link.href = imageUrl; link.download = "afrotresse-" + Date.now() + ".jpg"; link.click();
    const next = saveCount + 1;
    if (next >= 3) { consumeCredits(1); setCredits(getCredits()); setSaveCount(0); } else setSaveCount(next);
  };

  const handleTryStyle = async (style) => {
    if (!canTransform()) { navigate("/credits"); return; }
    setLoadingId(style.id);
    try {
      const blob = await fetch(selfieUrl).then(r => r.blob());
      const fileName = `selfie-${Date.now()}.jpg`;
      await supabase.storage.from('selfies').upload(fileName, blob);
      const { data: { publicUrl } } = supabase.storage.from('selfies').getPublicUrl(fileName);
      const res = await fetch("/api/falGenerate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfieUrl: publicUrl, stylePath: "/styles/" + (style.localImage || style.image) }),
      });
      const data = await res.json();
      consumeTransform(); setCredits(getCredits()); setResultImage(data.imageUrl);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 400);
    } catch (err) { setErrorMsg("Erreur IA."); } finally { setLoadingId(null); }
  };

  return (
    <div className="min-h-[100dvh] bg-[#2C1A0E] text-[#FAF4EC] p-4 pb-40 relative">
      
      {/* HEADER */}
      <div className="mb-8 flex gap-4 items-center bg-white/5 p-4 rounded-[2rem] border border-white/10">
        <img src={selfieUrl} className="w-16 h-16 rounded-xl border-2 border-[#C9963A] object-cover" alt="Moi" />
        <div>
          <h1 className="font-display font-bold text-xl text-[#C9963A]">Bonjour {userName} ✨</h1>
          <p className="text-[10px] opacity-60 italic">{FACE_SHAPE_TEXTS[faceShape]}</p>
        </div>
      </div>

      {/* RÉSULTAT IA (SI GÉNÉRÉ) */}
      <AnimatePresence>
        {resultImage && (
          <motion.div ref={resultRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 bg-[#3D2616] rounded-[2rem] overflow-hidden border-2 border-[#C9963A] shadow-2xl">
            <img src={resultImage} alt="Résultat" className="w-full"/>
            <div className="p-4 flex gap-2">
              <button onClick={() => addShare("Mon style", resultImage)} className="flex-1 py-3 bg-[#C9963A] text-[#2C1A0E] rounded-xl font-bold text-sm">Partager</button>
              <button onClick={() => setResultImage(null)} className="px-4 py-3 bg-white/10 rounded-xl text-sm">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LISTE DES 3 STYLES DE LA PAGE */}
      <div className="space-y-10">
        {currentResults.map((style) => (
          <div key={style.id} className="bg-[#3D2616] rounded-[2.5rem] overflow-hidden border border-[#C9963A]/20 shadow-xl">
             <div className="h-64 bg-black/20">
                <img src={"/styles/" + (style.localImage || style.image)} className="w-full h-full object-cover object-top" alt={style.name} />
             </div>
             <div className="p-6">
                <h3 className="font-display font-bold text-lg mb-4">{style.name}</h3>
                <button onClick={() => handleTryStyle(style)} disabled={loadingId === style.id} className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-[#C9963A] to-[#E8B96A] text-[#2C1A0E] shadow-lg active:scale-95 transition-all">
                  {loadingId === style.id ? "Analyse... ⏳" : "Essayer virtuellement ✨"}
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* PAGINATION EN BAS (HISTORIQUE VS NOUVEAU) */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            disabled={page === 0}
            onClick={handlePrevPage}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-10"
          >
            ←
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Collection</span>
            <span className="font-display font-black text-[#C9963A] text-xl">{page + 1}</span>
          </div>

          <button 
            onClick={handleNextPage}
            disabled={page >= totalPossiblePages - 1}
            className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
              orderedResults.slice((page + 1) * PAGE_SIZE, (page + 1) * PAGE_SIZE + PAGE_SIZE).every(s => seenIds.includes(s.id)) && orderedResults.slice((page + 1) * PAGE_SIZE).length > 0
              ? "bg-white/10 text-white" // Déjà payé : Bouton gris/blanc
              : "bg-[#C9963A] text-[#2C1A0E] shadow-lg shadow-[#C9963A]/20" // Nouveau : Bouton doré
            }`}
          >
            {orderedResults.slice((page + 1) * PAGE_SIZE, (page + 1) * PAGE_SIZE + PAGE_SIZE).every(s => seenIds.includes(s.id)) && orderedResults.slice((page + 1) * PAGE_SIZE).length > 0
              ? "Suivant →" 
              : "Générer 3 nouveaux (1 crédit) ✨"}
          </button>
        </div>
      </div>

      {/* BOUTON CRÉDITS FLOTTANT */}
      <div onClick={() => navigate("/credits")} className="fixed bottom-10 right-5 z-50 bg-[#C9963A] text-[#2C1A0E] px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl border-2 border-[#2C1A0E]/20">
        <span className="text-[10px] font-black uppercase">Crédits</span>
        <span className="text-2xl font-display font-black leading-none">{credits}</span>
      </div>

    </div>
  );
}
