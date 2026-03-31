import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getNextBatch, FACE_SHAPE_NAMES } from "../services/faceAnalysis.js";
import { getCredits, consumeTransform, hasCredits, canTransform } from "../services/credits.js";

const FACE_SHAPE_TEXTS = {
  oval:    "Ton visage est de forme Ovale. C'est une structure équilibrée qui s'adapte à tout.",
  round:   "Ton visage est de forme Ronde. Les styles en hauteur allongeront tes traits.",
  square:  "Ton visage est de forme Carrée. Les volumes adoucissent ta mâchoire.",
  heart:   "Ton visage est en forme de Cœur. Le volume en bas équilibre ton menton.",
  long:    "Ton visage est de forme Allongée. Les tresses latérales créent l'harmonie.",
  diamond: "Ton visage est de forme Diamant. Les styles encadrant le visage te subliment.",
[span_2](start_span)}

export default function Results() {
  const navigate = useNavigate();[span_2](end_span)
  [span_3](start_span)const [faceShape, setFaceShape] = useState('oval');[span_3](end_span)
  [span_4](start_span)const [selfieUrl, setSelfieUrl] = useState(null);[span_4](end_span)
  
  [span_5](start_span)const [unlockedStyles, setUnlockedStyles] = useState([]);[span_5](end_span)
  [span_6](start_span)const [hasMoreInDb, setHasMoreInDb] = useState(true);[span_6](end_span)
  [span_7](start_span)const [page, setPage] = useState(0);[span_7](end_span)
  [span_8](start_span)const PAGE_SIZE = 3;[span_8](end_span)

  [span_9](start_span)const [credits, setCredits] = useState(getCredits());[span_9](end_span)
  const userName = localStorage.getItem('afrotresse_user_name') || [span_10](start_span)'Reine';[span_10](end_span)

  useEffect(() => {
    [span_11](start_span)const raw = sessionStorage.getItem('afrotresse_results');[span_11](end_span)
    if (raw) {
      try {
        [span_12](start_span)const parsed = JSON.parse(raw);[span_12](end_span)
        [span_13](start_span)setFaceShape(parsed.faceShape || 'oval');[span_13](end_span)
        [span_14](start_span)const firstBatch = parsed.recommendations.slice(0, 3);[span_14](end_span)
        [span_15](start_span)setUnlockedStyles(firstBatch);[span_15](end_span)
        [span_16](start_span)setHasMoreInDb(parsed.recommendations.length > 3);[span_16](end_span)
      } catch (e) { console.error(e); }
    }
    [span_17](start_span)const photo = sessionStorage.getItem('afrotresse_photo');[span_17](end_span)
    [span_18](start_span)if (photo) setSelfieUrl(photo);[span_18](end_span)
  }, []);

  const handleUnlockMore = () => {
    [span_19](start_span)if (!hasCredits()) {[span_19](end_span)
      [span_20](start_span)navigate('/credits');[span_20](end_span)
      [span_21](start_span)return;[span_21](end_span)
    }
    [span_22](start_span)consumeTransform();[span_22](end_span)
    [span_23](start_span)setCredits(getCredits());[span_23](end_span)

    [span_24](start_span)const seenIds = unlockedStyles.map(s => s.id);[span_24](end_span)
    [span_25](start_span)const { batch, hasMore } = getNextBatch(faceShape, seenIds);[span_25](end_span)

    [span_26](start_span)if (batch.length > 0) {[span_26](end_span)
      [span_27](start_span)const updatedList = [...unlockedStyles, ...batch];[span_27](end_span)
      [span_28](start_span)setUnlockedStyles(updatedList);[span_28](end_span)
      [span_29](start_span)setHasMoreInDb(hasMore);[span_29](end_span)
      [span_30](start_span)setPage(Math.floor((updatedList.length - 1) / PAGE_SIZE));[span_30](end_span)
      [span_31](start_span)window.scrollTo({ top: 0, behavior: 'smooth' });[span_31](end_span)
    }
  };

  const handleTransform = async (style) => {
    if (!hasCredits()) { navigate('/credits'); return; [span_32](start_span)}
    // Logique de transformation ici
  };

  const totalPages = Math.ceil(unlockedStyles.length / PAGE_SIZE);[span_32](end_span)
  [span_33](start_span)const currentBatch = unlockedStyles.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);[span_33](end_span)

  [span_34](start_span)if (!unlockedStyles.length) return null;[span_34](end_span)

  return (
    <div className="min-h-[100dvh] bg-[#2C1A0E] text-[#FAF4EC] p-4 pb-40">
      
      {/* HEADER */}
      <div className="mb-10 flex gap-5 items-center bg-white/5 p-5 rounded-[2.5rem] border border-white/10">
        [span_35](start_span)<img src={selfieUrl} className="w-20 h-20 rounded-2xl border-2 border-[#C9963A] object-cover" />[span_35](end_span)
        <div>
          [span_36](start_span)<h1 className="font-bold text-2xl text-[#C9963A]">{userName} ✨</h1>[span_36](end_span)
          [span_37](start_span)<p className="text-[11px] opacity-80">{FACE_SHAPE_TEXTS[faceShape]}</p>[span_37](end_span)
        </div>
      </div>

      {/* AFFICHAGE DES TRESSES */}
      <div className="flex flex-col gap-8">
        {currentBatch.map((style) => (
          <div key={style.id} className="bg-[#3D2616] rounded-[2.5rem] overflow-hidden border border-[#C9963A]/20">
             <div className="p-6">
                [span_38](start_span)<h3 className="font-bold text-2xl mb-4 text-[#C9963A]">{style.name}</h3>[span_38](end_span)
                
                {/* TA GRILLE D'IMAGES RÉACTIVÉE */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="col-span-2">
                    [span_39](start_span)<img src={style.views.face} className="w-full h-64 object-cover rounded-[2rem]" />[span_39](end_span)
                  </div>
                  [span_40](start_span)<img src={style.views.back} className="w-full h-40 object-cover rounded-[1.5rem]" />[span_40](end_span)
                  [span_41](start_span)<img src={style.views.top} className="w-full h-40 object-cover rounded-[1.5rem]" />[span_41](end_span)
                </div>

                <button 
                  onClick={() => handleTransform(style)}
                  className="w-full py-5 rounded-2xl font-black bg-gradient-to-r from-[#C9963A] to-[#E8B96A] text-[#2C1A0E] uppercase tracking-wider shadow-xl">
                  [span_42](start_span)Essayer ce style ✨[span_42](end_span)
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* PAGINATION CENTRALE */}
      <div className="mt-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-6">
          <button 
            disabled={page === 0} 
            onClick={() => setPage(p => p - 1)}
            [span_43](start_span)className="p-4 bg-white/5 rounded-2xl disabled:opacity-20 text-[#C9963A]">←</button>[span_43](end_span)
          
          [span_44](start_span)<span className="font-bold text-[#C9963A]">Lot {page + 1} / {totalPages}</span>[span_44](end_span)

          <button 
            disabled={page >= totalPages - 1} 
            onClick={() => setPage(p => p + 1)}
            [span_45](start_span)className="p-4 bg-white/5 rounded-2xl disabled:opacity-20 text-[#C9963A]">→</button>[span_45](end_span)
        </div>

        <button onClick={() => navigate('/')} className="text-xs opacity-40 underline">
          [span_46](start_span)Refaire un scan complet[span_46](end_span)
        </button>
      </div>

      {/* ACTIONS FLOTTANTES À DROITE */}
      <div className="fixed bottom-10 right-5 flex flex-col items-center gap-3 z-50">
        
        {/* BOUTON SOLDE */}
        <div 
          onClick={() => navigate('/credits')} 
          className="w-14 h-14 bg-[#C9963A] text-[#2C1A0E] rounded-2xl flex flex-col items-center justify-center font-black shadow-2xl cursor-pointer"
        >
          [span_47](start_span)<span className="text-[10px] opacity-60">SOLDE</span>[span_47](end_span)
          [span_48](start_span){credits}[span_48](end_span)
        </div>

        {/* BOUTON GÉNÉRER (SOUS LE SOLDE) */}
        {hasMoreInDb && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleUnlockMore}
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-2xl relative border border-white/10"
            style={{ background: 'linear-gradient(135deg, #C9963A, #E8B96A)' }}
          >
            <span className="text-[8px] font-black text-[#2C1A0E] mb-1 leading-none text-center uppercase">Générer</span>
            <span className="text-lg">✨</span>
            <div className="absolute -top-1 -right-1 bg-[#2C1A0E] text-[#C9963A] text-[9px] px-1.5 py-0.5 rounded-full font-bold border border-[#C9963A]">
              -1
            </div>
          </motion.button>
        )}
      </div>

    </div>
  );
[span_49](start_span)}[span_49](end_span)
