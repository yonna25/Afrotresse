import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';

// Import sécurisé des services
import * as CreditService from "../services/credits.js";
import { BRAIDS_DB } from "../services/faceAnalysis.js";

// Initialisation de Supabase avec vérification des clés
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const FACE_SHAPE_TEXTS = {
  oval: "Ton visage est de forme Ovale. C'est une structure très équilibrée.",
  round: "Ton visage est de forme Ronde. Les tresses hautes sont parfaites.",
  square: "Ton visage est de forme Carrée. Le volume adoucit ta mâchoire.",
  heart: "Ton visage est en forme de Cœur. Le volume en bas équilibre ton menton.",
  long: "Ton visage est de forme Longue. Les tresses latérales sont idéales.",
  diamond: "Ton visage est de forme Diamant. Les tresses encadrant le visage te subliment.",
};

export default function Results() {
  const navigate = useNavigate();
  const [zoomImage, setZoomImage] = useState(null);
  
  // Utilisation sécurisée des fonctions de crédits
  const [credits, setCredits] = useState(() => CreditService.getCredits ? CreditService.getCredits() : 0);
  
  const [loadingId, setLoadingId] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const resultRef = useRef(null);

  const userName = localStorage.getItem("afrotresse_user_name") || "Reine";
  const faceShape = localStorage.getItem("afrotresse_face_shape") || "oval";
  const selfieUrl = sessionStorage.getItem("afrotresse_photo") || localStorage.getItem("afrotresse_selfie");

  const currentResults = useMemo(() => {
    try {
      const seenIds = CreditService.getSeenStyleIds ? CreditService.getSeenStyleIds() : [];
      const available = BRAIDS_DB ? BRAIDS_DB.filter(s => s.faceShapes.includes(faceShape)) : [];
      return [...available].sort((a, b) => (seenIds.includes(a.id) ? 1 : -1)).slice(0, 3);
    } catch (e) {
      console.error("Erreur memo:", e);
      return [];
    }
  }, [faceShape]);

  const getImgPath = (img) => {
    if (!img) return "";
    if (img.startsWith('http') || img.startsWith('/styles/')) return img;
    return `/styles/${img}`;
  };

  const handleTryStyle = async (style) => {
    if (CreditService.canTransform && !CreditService.canTransform()) return navigate("/credits");
    if (!supabase) return setErrorMsg("Configuration serveur manquante (Supabase).");
    if (!selfieUrl) return setErrorMsg("Photo manquante.");

    setErrorMsg("");
    setLoadingId(style.id);

    try {
      const blob = await fetch(selfieUrl).then(r => r.blob());
      const fileName = `selfie-${Date.now()}.jpg`;
      
      const { error: upError } = await supabase.storage.from('selfies').upload(fileName, blob);
      if (upError) throw new Error("Erreur d'envoi de la photo.");

      const { data: { publicUrl } } = supabase.storage.from('selfies').getPublicUrl(fileName);

      const res = await fetch("/api/falGenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfieUrl: publicUrl,
          stylePath: getImgPath(style.localImage || style.image)
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur technique.");

      if (CreditService.consumeTransform) CreditService.consumeTransform();
      if (CreditService.getCredits) setCredits(CreditService.getCredits());
      
      setResultImage(data.imageUrl);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    } catch (err) {
      setErrorMsg(err.message || "Connexion impossible.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] p-4 pb-32">
      <div className="mb-8 flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
        {selfieUrl && <img src={selfieUrl} className="w-16 h-16 rounded-2xl border-2 border-[#C9963A] object-cover" alt="Moi" />}
        <div>
          <h1 className="text-xl font-bold text-[#C9963A]">{userName} ✨</h1>
          <p className="text-[10px] opacity-70">{FACE_SHAPE_TEXTS[faceShape] || "Analyse terminée"}</p>
        </div>
      </div>

      {errorMsg && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-xs">{errorMsg}</div>}

      <AnimatePresence>
        {resultImage && (
          <motion.div ref={resultRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 bg-[#3D2616] rounded-3xl overflow-hidden border-2 border-[#C9963A]">
            <img src={resultImage} className="w-full" alt="Résultat" />
            <div className="p-4">
              <button onClick={() => setResultImage(null)} className="w-full py-3 bg-white/10 rounded-xl text-xs">Fermer</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-10">
        {currentResults.map((style) => (
          <div key={style.id} className="bg-[#3D2616] rounded-3xl overflow-hidden border border-white/5 shadow-xl">
            <div className="h-64 overflow-hidden">
              <img 
                src={getImgPath(style.localImage || style.image)} 
                className="w-full h-full object-cover object-top" 
                alt={style.name} 
                onError={(e) => { e.target.src = "https://placehold.co/400x600?text=Image+Indrouvable"; }}
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{style.name}</h3>
              <button onClick={() => handleTryStyle(style)} disabled={loadingId === style.id}
                className="w-full py-4 bg-[#C9963A] text-[#2C1A0E] rounded-2xl font-black shadow-lg disabled:opacity-50">
                {loadingId === style.id ? "Génération... ⏳" : "Essayer virtuellement ✨"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div onClick={() => navigate("/credits")} className="fixed bottom-10 right-5 bg-[#C9963A] text-[#2C1A0E] w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-2xl border-2 border-white/20">
        <span className="text-[10px] font-bold">{credits}</span>
        <span className="text-[7px]">PTS</span>
      </div>
    </div>
  );
}
