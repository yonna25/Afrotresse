import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import { getCredits, consumeTransform, canTransform } from "../services/credits.js";
import { BRAIDS_DB } from "../services/faceAnalysis.js";

// Initialisation sécurisée de Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

export default function Results() {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const resultRef = useRef(null);

  const userName = localStorage.getItem("afrotresse_user_name") || "Reine";
  const faceShape = localStorage.getItem("afrotresse_face_shape") || "oval";
  const selfieUrl = sessionStorage.getItem("afrotresse_photo") || localStorage.getItem("afrotresse_selfie");

  // On limite à 3 résultats pour éviter de surcharger la page
  const currentResults = useMemo(() => {
    return BRAIDS_DB.filter(s => s.faceShapes.includes(faceShape)).slice(0, 3);
  }, [faceShape]);

  // FONCTION CRITIQUE : Répare le chemin des images pour Vercel
  const fixPath = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith('http')) return path;
    const fileName = path.split('/').pop(); 
    return `/styles/${fileName}`;
  };

  const handleTryStyle = async (style) => {
    if (!canTransform()) return navigate("/credits");
    if (!selfieUrl) return setErrorMsg("Photo introuvable.");

    setLoadingId(style.id);
    setErrorMsg("");

    try {
      // 1. Upload Selfie vers Supabase
      const blob = await fetch(selfieUrl).then(r => r.blob());
      const fileName = `selfie-${Date.now()}.jpg`;
      const { error: upError } = await supabase.storage.from('selfies').upload(fileName, blob);
      if (upError) throw new Error("Erreur stockage photo.");

      const { data: { publicUrl } } = supabase.storage.from('selfies').getPublicUrl(fileName);

      // 2. Appel API Replicate
      const res = await fetch("/api/falGenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          selfieUrl: publicUrl, 
          stylePath: fixPath(style.localImage || style.image) 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur IA");

      setResultImage(data.imageUrl);
      consumeTransform();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (err) {
      setErrorMsg("La génération a échoué. Vérifie tes crédits ou réessaie.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] p-4 pb-32">
      {/* Header simple */}
      <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-[2rem] border border-white/10">
        <img src={selfieUrl} className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C9963A]" alt="Selfie" />
        <div>
          <h1 className="text-xl font-bold text-[#C9963A]">{userName} ✨</h1>
          <p className="text-[10px] opacity-60">Analyse terminée</p>
        </div>
      </div>

      {errorMsg && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-xs text-center">{errorMsg}</div>}

      {/* Résultat IA */}
      <AnimatePresence>
        {resultImage && (
          <motion.div ref={resultRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 bg-[#3D2616] rounded-[2.5rem] overflow-hidden border-2 border-[#C9963A] shadow-2xl">
            <img src={resultImage} className="w-full h-auto" alt="Résultat" />
            <div className="p-4">
              <button onClick={() => setResultImage(null)} className="w-full py-3 bg-white/10 rounded-xl text-sm">Choisir un autre style</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des Styles */}
      <div className="space-y-8">
        {currentResults.map((style) => (
          <div key={style.id} className="bg-[#3D2616] rounded-[2rem] overflow-hidden border border-white/5">
            <img 
              src={fixPath(style.localImage || style.image)} 
              className="w-full h-64 object-cover object-top" 
              alt={style.name}
              onError={(e) => { e.target.src = "https://placehold.co/400x600/3d2616/c9963a?text=Chargement..."; }}
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{style.name}</h3>
              <button 
                onClick={() => handleTryStyle(style)}
                disabled={loadingId === style.id}
                className="w-full py-4 bg-[#C9963A] text-[#2C1A0E] rounded-2xl font-black shadow-lg disabled:opacity-50"
              >
                {loadingId === style.id ? "Création en cours... ⏳" : "Essayer virtuellement ✨"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Badge Crédits */}
      <div onClick={() => navigate("/credits")} className="fixed bottom-10 right-5 bg-[#C9963A] text-[#2C1A0E] px-4 py-2 rounded-full font-bold shadow-2xl border-2 border-[#2C1A0E]">
        Crédits : {getCredits()}
      </div>
    </div>
  );
}
