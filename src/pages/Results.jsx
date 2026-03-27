import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import { getCredits, consumeCredits, consumeTransform, canTransform, addSeenStyleId, getSeenStyleIds } from "../services/credits.js";
import { BRAIDS_DB } from "../services/faceAnalysis.js";
import { addShare } from "../services/stats.js";

// Initialisation de Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const FACE_SHAPE_TEXTS = {
  oval:    "Ton visage est de forme Ovale. C'est une structure très équilibrée qui s'adapte à presque tous les styles.",
  round:   "Ton visage est de forme Ronde. Pour allonger et affiner visuellement tes traits, les tresses hautes sont parfaites.",
  square:  "Ton visage est de forme Carrée. Les tresses avec du volume adoucissent ta mâchoire.",
  heart:   "Ton visage est en forme de Cœur. Les tresses avec du volume en bas équilibrent ton menton.",
  long:    "Ton visage est de forme Longue. Les tresses latérales créent l'harmonie parfaite.",
  diamond: "Ton visage est de forme Diamant. Les tresses qui encadrent le visage te subliment.",
}

const RESULT_MSGS = [
  "Waouh 😍, tu es splendide !",
  "Regarde cette Reine ! ✨",
  "Le style parfait pour toi. 👑",
]

// Nombre de styles affichés par "génération"
const PAGE_SIZE = 3;

export default function Results() {
  const navigate = useNavigate();
  const [zoomImage, setZoomImage]     = useState(null);
  const [credits, setCredits]         = useState(getCredits());
  const [saveCount, setSaveCount]     = useState(0);
  const [loadingId, setLoadingId]     = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [resultStyleId, setResultStyleId] = useState(null);
  const [resultMsg, setResultMsg]     = useState("");
  // const [isFallback, setIsFallback]   = useState(false); // Non utilisé dans le JSX fourni
  const [errorMsg, setErrorMsg]       = useState("");
  const resultRef                     = useRef(null);
  const errorRef                      = useRef(null);
  const [page, setPage]               = useState(0); // 0 = page 1, 1 = page 2...
  
  // État local pour forcer le rafraîchissement du useMemo
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const userName  = localStorage.getItem("afrotresse_user_name") || "Reine";
  const faceShape = localStorage.getItem("afrotresse_face_shape") || "oval";
  const selfieUrl = sessionStorage.getItem("afrotresse_photo") || localStorage.getItem("afrotresse_selfie");

  // --- LOGIQUE MODIFIÉE POUR GARANTIR L'UNICITÉ STRICTE ---
  const allResults = useMemo(() => {
    const seenIds = getSeenStyleIds();
    
    // FILTRE STRICT : Forme du visage correspondante ET PAS ENCORE VU
    const available = BRAIDS_DB.filter(s => 
      s.faceShapes.includes(faceShape) && !seenIds.includes(s.id)
    );
    
    // Mélange aléatoire des styles restants
    return [...available].sort(() => 0.5 - Math.random());
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceShape, refreshTrigger]); // Se recalcule si la forme change ou si on force le refresh

  const totalPages  = Math.ceil(allResults.length / PAGE_SIZE);
  // On prend toujours les PAGE_SIZE premiers car allResults exclut déjà les vus
  const currentResults = allResults.slice(0, PAGE_SIZE);

  // --- NOUVELLE FONCTION : GÉNÉRER 3 NOUVEAUX STYLES (1 CRÉDIT) ---
  const handleGetNewStyles = useCallback(() => {
    // 1. Vérification des crédits
    if (credits < 1) {
      navigate("/credits");
      return;
    }

    // 2. Vérifier s'il reste assez de styles dans la DB
    if (allResults.length <= PAGE_SIZE) {
        setErrorMsg("Félicitations ! Tu as exploré tous les styles disponibles pour ton visage. Essaie une autre catégorie de tresse.");
        setTimeout(() => {
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
    }

    // 3. Consommer le crédit (Comme pour un nouveau selfie)
    consumeCredits(1);
    setCredits(getCredits()); // Mise à jour de l'affichage du solde
    setErrorMsg(""); // Effacer les erreurs précédentes

    // 4. Marquer les styles ACTUELLEMENT AFFICHÉS comme "vus"
    currentResults.forEach(style => addSeenStyleId(style.id));

    // 5. Forcer le useMemo à se recalculer (refreshTrigger change)
    // Cela va exclure les styles vus et en piocher 3 nouveaux.
    setRefreshTrigger(prev => prev + 1);
    
    // Petit feedback visuel : remonter en haut de la liste
    window.scrollTo({ top: 300, behavior: "smooth" });

  }, [credits, navigate, allResults.length, currentResults]);

  // --- FONCTIONS EXISTANTES (CONSERVÉES) ---
  const handleSave = (imageUrl) => {
    if (credits < 1 && saveCount === 0) { 
      navigate("/credits");
      return; 
    }
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "afrotresse-" + Date.now() + ".jpg";
    link.click();

    const next = saveCount + 1;
    if (next >= 3) { 
      consumeCredits(1); 
      setCredits(getCredits()); 
      setSaveCount(0); 
    }
    else setSaveCount(next);
  };

  const handleTryStyle = async (style) => {
    if (!canTransform()) { 
      navigate("/credits"); 
      return; 
    }

    setErrorMsg("");
    setResultImage(null);
    setLoadingId(style.id);

    try {
      const blob = await fetch(selfieUrl).then(r => r.blob());
      const fileName = `selfie-${Date.now()}.jpg`;

      const { data: upData, error: upError } = await supabase.storage
        .from('selfies')
        .upload(fileName, blob);

      if (upError) throw new Error("Échec de l'upload du selfie vers le serveur.");

      const { data: { publicUrl: selfiePublicUrl } } = supabase.storage
        .from('selfies')
        .getPublicUrl(fileName);

      const res = await fetch("/api/falGenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfieUrl: selfiePublicUrl,
          stylePath: "/styles/" + (style.localImage || style.image)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "La génération a échoué.";
        setErrorMsg(msg);
        setTimeout(() => {
          errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
      }

      consumeTransform();
      addSeenStyleId(style.id);
      setCredits(getCredits());
      setResultImage(data.imageUrl);
      setResultStyleId(style.id);
      setResultMsg(RESULT_MSGS[Math.floor(Math.random() * RESULT_MSGS.length)]);
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 400);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Connexion impossible. Réessaie.");
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } finally {
      setLoadingId(null);
    }
  };

  const handleShare = async (text, url) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "AfroTresse", text, url: url || window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Lien copié !");
      }
    } catch {}
  };

  // --- JSX (AVEC INTEGRATION DU NOUVEAU BOUTON) ---
  return (
    <div className="min-h-[100dvh] bg-[#2C1A0E] text-[#FAF4EC] p-4 sm:p-6 pb-40 overflow-x-hidden relative">
      
      {/* HEADER */}
      <div className="mb-10 flex flex-row gap-5 items-center bg-white/5 p-5 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
        <div className="relative shrink-0">
          {selfieUrl ? (
            <img src={selfieUrl} className="w-20 h-20 rounded-2xl border-2 border-[#C9963A] object-cover" alt="Moi" />
          ) : (
            <div className="w-20 h-20 rounded-2xl border-2 border-white/10 bg-white/5 flex items-center justify-center text-[10px]">Photo</div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-[#C9963A] text-[#2C1A0E] text-[10px] font-black px-2 py-1 rounded-md shadow-lg uppercase">Moi</div>
        </div>
        <div className="flex flex-col flex-1">
          <h1 className="font-display font-bold text-3xl text-[#C9963A]">
            Tes résultats<br/>
            <span className="text-[#FAF4EC] font-black">{userName} ✨</span>
          </h1>
          <p className="text-[11px] opacity-80 font-body leading-tight mt-1 max-w-xs italic">
            {FACE_SHAPE_TEXTS[faceShape]}
          </p>
        </div>
      </div>

      {/* ERREUR */}
      {errorMsg && (
        <motion.div ref={errorRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-red-900/30 border border-red-500/50 rounded-xl p-3">
          <p className="text-red-200 text-sm">{errorMsg}</p>
        </motion.div>
      )}

      {/* RÉSULTAT IA */}
      <AnimatePresence>
        {resultImage && (
          <motion.div ref={resultRef}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="mb-6 bg-[#3D2616] rounded-[2.5rem] overflow-hidden border-2 border-[#C9963A] shadow-2xl">
            <div className="p-5">
              <h3 className="text-[#C9963A] font-bold text-xl">{resultMsg || "Magnifique !"}</h3>
              <p className="text-[11px] mt-1 opacity-70">Ce style te met vraiment en valeur. Montre-le à ta coiffeuse !</p>
            </div>
            <img src={resultImage} alt="Résultat" className="w-full object-cover"/>
            <div className="p-5 space-y-2">
              <button
                onClick={() => handleShare("Regarde le style que j'ai choisi avec AfroTresse !", resultImage)}
                className="w-full py-4 rounded-2xl font-bold text-base shadow-xl"
                style={{ background: "linear-gradient(135deg,#C9963A,#E8B96A)", color: "#2C1A0E" }}>
                Envoyer à ma coiffeuse
              </button>
              <button onClick={() => setResultImage(null)}
                className="w-full py-3 rounded-2xl text-sm font-semibold bg-white/10 text-white/70 border border-white/10">
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- INTEGRATION DU BOUTON DE RAFRAÎCHISSEMENT (1 CRÉDIT) --- */}
      <div className="mb-10 px-2">
        <button 
          onClick={handleGetNewStyles}
          className="w-full py-5 rounded-3xl font-black text-sm uppercase tracking-tighter flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-2xl border-2 border-[#C9963A]"
          style={{ background: "linear-gradient(180deg, rgba(201,150,58,0.2) 0%, rgba(201,150,58,0.05) 100%)", color: "#C9963A" }}
        >
          <span className="text-xs opacity-80 font-body">Garder ma photo actuelle et</span>
          <span className="text-lg font-display">Générer 3 NOUVEAUX styles ✨</span>
          <span className="text-[9px] bg-[#C9963A] text-[#2C1A0E] px-2.5 py-1 rounded-full mt-1 font-black">
            COÛT : 1 CRÉDIT
          </span>
        </button>
      </div>

      {/* LISTE DES STYLES */}
      <div className="space-y-12">
        {currentResults.map((style) => (
          <div key={style.id} className="bg-[#3D2616] rounded-[2.5rem] overflow-hidden border border-[#C9963A]/20 shadow-2xl relative">
            <div className="grid grid-cols-3 gap-0.5 h-72 bg-black/40 relative">
              <div className="col-span-2 h-full overflow-hidden">
                <img
                  src={style.views?.face || "/styles/" + (style.localImage || style.image)}
                  className="w-full h-full object-cover object-top cursor-pointer"
                  onClick={() => setZoomImage(style.views?.face || "/styles/" + (style.localImage || style.image))}
                  alt={style.name}
                />
              </div>
              <div className="col-span-1 grid grid-rows-2 gap-0.5">
                <img
                  src={style.views?.back || "/styles/" + (style.localImage || style.image)}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setZoomImage(style.views?.back || "/styles/" + (style.localImage || style.image))}
                  alt={style.name}
                />
                <img
                  src={style.views?.top || "/styles/" + (style.localImage || style.image)}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setZoomImage(style.views?.top || "/styles/" + (style.localImage || style.image))}
                  alt={style.name}
                />
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-display font-bold text-xl leading-none">{style.name}</h3>
                <span className="text-[10px] bg-[#C9963A] text-[#2C1A0E] px-2.5 py-1 rounded-md font-black uppercase">{style.duration}</span>
              </div>
              <p className="text-[11px] opacity-70 mb-6 font-body leading-relaxed">{style.description}</p>
              <button
                onClick={() => handleTryStyle(style)}
                disabled={loadingId === style.id}
                className="w-full py-4 rounded-2xl font-display font-bold text-base shadow-xl active:scale-[0.98] transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#C9963A,#E8B96A)", color: "#2C1A0E" }}>
                {loadingId === style.id ? "Génération en cours... ⏳" : "Essayer virtuellement ce style ✨"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION (CONSERVÉE mais cachée si allResults est vide) */}
      {totalPages > 1 && currentResults.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-8 mb-4">
          <button
            onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page === 0}
            className="px-5 py-3 rounded-2xl font-bold text-sm bg-white/10 text-white/70 border border-white/10 disabled:opacity-30 active:scale-95 transition-all">
            ← Précédent
          </button>
          <span className="text-[#C9963A] font-black text-sm">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page >= totalPages - 1}
            className="px-5 py-3 rounded-2xl font-bold text-sm bg-white/10 text-white/70 border border-white/10 disabled:opacity-30 active:scale-95 transition-all">
            Suivant →
          </button>
        </div>
      )}

      {/* BOUTON CRÉDITS FLOTTANT */}
      <motion.div
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onClick={() => navigate("/credits")}
        className="fixed bottom-28 right-5 z-40 bg-[#C9963A] text-[#2C1A0E] w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-2xl border-2 border-[#2C1A0E]/20 active:scale-95 transition-all">
        <div className="text-[7px] font-black uppercase opacity-60">Solde</div>
        <div className="text-3xl font-display font-black leading-none">{credits}</div>
        <div className="text-[7px] font-bold tracking-tight">CRÉDITS</div>
        {saveCount > 0 && (
          <div className="absolute -top-2 -left-2 bg-[#2C1A0E] text-[#C9963A] text-[8px] font-black px-1.5 py-0.5 rounded-md border border-[#C9963A]/20">
            {saveCount}/3
          </div>
        )}
      </motion.div>

      {/* LIGHTBOX ZOOM */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-6 backdrop-blur-xl"
            onClick={() => setZoomImage(null)}>
            <motion.img
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              src={zoomImage}
              className="max-w-full max-h-[70vh] rounded-3xl shadow-2xl border border-white/10 object-contain"
              onClick={(e) => e.stopPropagation()}
              alt="Zoom"
            />
            <div className="mt-10 flex gap-4 w-full max-w-xs">
              <button
                onClick={(e) => { e.stopPropagation(); handleSave(zoomImage); }}
                className="flex-1 py-4 bg-[#C9963A] text-[#2C1A0E] rounded-2xl font-black shadow-xl flex items-center justify-center gap-2">
                📥 Sauvegarder
              </button>
              <button onClick={() => setZoomImage(null)}
                className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold backdrop-blur-md border border-white/10">
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
