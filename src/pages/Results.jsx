import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getCredits, consumeCredits, addSeenStyleId, getSeenStyleIds } from "../services/credits.js";
import { BRAIDS_DB, FACE_SHAPE_NAMES } from "../services/faceAnalysis.js";

const PAGE_SIZE = 3;

export default function Results() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomStyle, setZoomStyle] = useState(null);
  const [credits, setCredits] = useState(getCredits());
  const [saveCount, setSaveCount] = useState(0);
  const [notification, setNotification] = useState("");
  const notifRef = useRef(null);

  const userName = localStorage.getItem("afrotresse_user_name") || "Reine";
  const faceShape = localStorage.getItem("afrotresse_face_shape") || "oval";
  const selfieUrl = sessionStorage.getItem("afrotresse_photo") || localStorage.getItem("afrotresse_selfie");

  // --- LOGIQUE DE FILTRAGE ET PAGINATION ---
  const filteredStyles = useMemo(() => {
    return BRAIDS_DB.filter(s => s.faceShapes.includes(faceShape));
  }, [faceShape]);

  const totalPages = Math.ceil(filteredStyles.length / PAGE_SIZE);
  const currentStyles = filteredStyles.slice(currentPage * PAGE_SIZE, (currentPage * PAGE_SIZE) + PAGE_SIZE);

  // --- NOTIFICATIONS AVEC SCROLL ---
  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      notifRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    setTimeout(() => setNotification(""), 3000);
  };

  // --- GESTION DES CRÉDITS (AFFICHAGE) ---
  useEffect(() => {
    if (currentPage > 0) {
      if (credits < 1) {
        navigate("/credits");
      } else {
        consumeCredits(1);
        setCredits(getCredits());
        showNotif("1 crédit utilisé pour de nouveaux styles");
      }
    }
  }, [currentPage]);

  // --- SAUVEGARDE / TÉLÉCHARGEMENT ---
  const handleSave = (style) => {
    if (credits < 1 && saveCount === 0) {
      navigate("/credits");
      return;
    }
    
    const link = document.createElement("a");
    link.href = `/styles/${style.views?.face || style.image}`;
    link.download = `afrotresse-${style.id}.jpg`;
    link.click();

    const nextCount = saveCount + 1;
    if (nextCount >= 3) {
      consumeCredits(1);
      setCredits(getCredits());
      setSaveCount(0);
      showNotif("3 images sauvegardées : 1 crédit utilisé");
    } else {
      setSaveCount(nextCount);
      showNotif(`Image sauvegardée (${nextCount}/3)`);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] p-4 pb-32">
      
      {/* 1. RÉSULTAT DE L'ANALYSE */}
      <header className="mb-8 p-6 bg-white/5 rounded-[2rem] border border-white/10 shadow-xl">
        <h1 className="text-[#C9963A] font-bold text-xl mb-1">Analyse terminée</h1>
        <p className="text-sm opacity-80">
          Forme de visage détectée : <span className="font-bold text-[#E8B96A]">{FACE_SHAPE_NAMES[faceShape]}</span>
        </p>
      </header>

      {/* NOTIFICATION INTELLIGENTE */}
      <div ref={notifRef}>
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-[#C9963A] text-[#2C1A0E] rounded-xl text-center font-bold text-sm shadow-lg">
              {notification}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. GRILLE DE RECOMMANDATIONS */}
      <div className="grid gap-8">
        {currentStyles.map((style) => (
          <motion.div key={style.id} layout
            className="bg-[#3D2616] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
            <div className="grid grid-cols-3 gap-1 h-64 bg-black/20 cursor-pointer" onClick={() => setZoomStyle(style)}>
              <img src={`/styles/${style.views?.face}`} className="col-span-2 w-full h-full object-cover" alt={style.name} />
              <div className="grid grid-rows-2 gap-1">
                <img src={`/styles/${style.views?.back}`} className="w-full h-full object-cover" />
                <img src={`/styles/${style.views?.top}`} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#E8B96A] mb-2">{style.name}</h3>
              <p className="text-xs opacity-70 line-clamp-2 mb-4">{style.description}</p>
              <button onClick={() => setZoomStyle(style)} className="w-full py-4 bg-white/5 border border-[#C9963A]/30 rounded-2xl font-bold text-sm">
                Voir les détails
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. PAGINATION */}
      <div className="flex justify-between items-center mt-10 px-2">
        <button disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}
          className="px-6 py-3 bg-white/5 rounded-xl disabled:opacity-30 font-bold"> Précédent </button>
        <span className="text-xs font-bold opacity-50">Page {currentPage + 1} / {totalPages}</span>
        <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}
          className="px-6 py-3 bg-[#C9963A] text-[#2C1A0E] rounded-xl disabled:opacity-30 font-bold"> Suivant </button>
      </div>

      {/* 4. BOUTON FLOTTANT CRÉDITS */}
      <div onClick={() => navigate("/credits")} 
        className="fixed bottom-24 right-5 bg-[#C9963A] text-[#2C1A0E] p-4 rounded-2xl shadow-2xl border-2 border-[#2C1A0E] flex flex-col items-center">
        <span className="text-[10px] font-black leading-none">CRÉDITS</span>
        <span className="text-2xl font-black">{credits}</span>
      </div>

      {/* 5. VUE ZOOM ET ESSAI VIRTUEL */}
      <AnimatePresence>
        {zoomStyle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#2C1A0E] flex flex-col p-6 overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#C9963A]">{zoomStyle.name}</h2>
              <button onClick={() => setZoomStyle(null)} className="p-3 bg-white/10 rounded-full text-xl">✕</button>
            </div>

            {/* Aperçu Essai Virtuel Rapide */}
            <div className="relative aspect-[3/4] w-full rounded-[3rem] overflow-hidden border-2 border-[#C9963A] mb-6 shadow-2xl">
              <img src={selfieUrl} className="absolute inset-0 w-full h-full object-cover grayscale-[30%]" />
              <img src={`/styles/${zoomStyle.views?.face}`} className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-80 scale-110 translate-y-[-5%]" />
              <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] bg-black/40 backdrop-blur-md py-2 uppercase tracking-widest font-bold">
                Simulation visuelle
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={() => navigate(`/try-on?id=${zoomStyle.id}`)}
                className="w-full py-5 bg-gradient-to-r from-[#C9963A] to-[#E8B96A] text-[#2C1A0E] rounded-2xl font-black shadow-xl">
                Essayer virtuellement ✨
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleSave(zoomStyle)} className="py-4 bg-white/10 rounded-2xl text-sm font-bold border border-white/10">Sauvegarder 📥</button>
                <button className="py-4 bg-white/10 rounded-2xl text-sm font-bold border border-white/10">Partager 🤳</button>
              </div>
              
              <button onClick={() => setZoomStyle(null)} className="w-full py-4 text-sm opacity-50">Fermer</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
