import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getCredits, consumeCredits, PRICING, addSeenStyleId, getSeenStyleIds } from "../services/credits.js";
import { BRAIDS_DB } from "../services/faceAnalysis.js";

const FACE_SHAPE_TEXTS = {
  oval:    "Ton visage est de forme Ovale. C'est une structure tr\u00e8s \u00e9quilibr\u00e9e qui s'adapte \u00e0 presque tous les styles.",
  round:   "Ton visage est de forme Ronde. Pour allonger et affiner visuellement tes traits, les tresses hautes sont parfaites.",
  square:  "Ton visage est de forme Carr\u00e9e. Les tresses avec du volume sur les c\u00f4t\u00e9s adoucissent ta m\u00e2choire.",
  heart:   "Ton visage est en forme de Coeur. Les tresses avec du volume en bas \u00e9quilibrent ton menton.",
  long:    "Ton visage est de forme Longue. Les tresses lat\u00e9rales cr\u00e9ent l'harmonie parfaite pour toi.",
  diamond: "Ton visage est de forme Diamant. Les tresses qui encadrent le visage te subliment naturellement.",
}

export default function Results() {
  const navigate = useNavigate();
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [zoomImage, setZoomImage] = useState(null);
  const [credits, setCredits] = useState(getCredits());
  
  // Logique de sauvegarde (Priorit\u00e9 : 1 credit = 3 saves)
  const [downloadCount, setDownloadCount] = useState(0);

  const faceShape = localStorage.getItem("afrotresse_face_shape") || "oval";
  const selfieUrl = localStorage.getItem("afrotresse_selfie");

  const handleDownload = (imageUrl) => {
    if (credits < 1 && downloadCount === 0) {
      navigate("/credits");
      return;
    }
    
    // Simulation de telechargement
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `afrotresse-style-${Date.now()}.jpg`;
    link.click();

    const nextCount = downloadCount + 1;
    if (nextCount >= 3) {
      consumeCredits(1);
      setCredits(getCredits());
      setDownloadCount(0);
    } else {
      setDownloadCount(nextCount);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] flex flex-col md:flex-row overflow-x-hidden">
      
      {/* --- SECTION CONTENU --- */}
      <div className="flex-1 p-5 pb-24">
        
        {/* NOUVEAU : Header avec miniature Selfie de l'utilisatrice */}
        <div className="mb-10 flex items-center gap-5 bg-white/5 p-5 rounded-[2.5rem] border border-white/10 shadow-xl">
          <div className="relative">
            {selfieUrl ? (
              <img src={selfieUrl} className="w-20 h-20 rounded-2xl border-2 border-[#C9963A] object-cover shadow-lg" alt="Selfie" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-[10px]">No Pic</div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-[#C9963A] text-[#2C1A0E] text-[8px] font-black px-2 py-1 rounded-md shadow-md uppercase">Moi</div>
          </div>
          
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-3xl text-[#C9963A] leading-none mb-2">R\u00e9sultats</h1>
            <p className="text-[11px] opacity-80 font-body leading-tight max-w-xs italic">
              {FACE_SHAPE_TEXTS[faceShape]}
            </p>
          </div>
        </div>

        {/* LISTE DES CARTES (Grille 3 photos intouch\u00e9e) */}
        <div className="space-y-12">
          {BRAIDS_DB.filter(s => s.faceShapes.includes(faceShape)).map((style, idx) => (
            <div key={style.id} className="bg-[#3D2616] rounded-[2.5rem] overflow-hidden border border-[#C9963A]/20 shadow-2xl">
              
              {/* LA GRILLE (Structure conserv\u00e9e) */}
              <div className="grid grid-cols-3 gap-0.5 h-72 bg-black/40 relative">
                <div className="col-span-2 h-full overflow-hidden">
                  <img src={style.views.face} className="w-full h-full object-cover object-top" onClick={() => setZoomImage(style.views.face)} />
                </div>
                <div className="col-span-1 grid grid-rows-2 gap-0.5">
                  <img src={style.views.back} className="w-full h-full object-cover" onClick={() => setZoomImage(style.views.back)} />
                  <img src={style.views.top} className="w-full h-full object-cover" onClick={() => setZoomImage(style.views.top)} />
                </div>

                {/* Bouton de sauvegarde rapide sur l'image */}
                <button 
                  onClick={() => handleDownload(style.views.face)}
                  className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-lg rounded-full border border-white/20 active:scale-90 transition-transform"
                >
                  \ud83d\udce5
                </button>
              </div>

              {/* NOUVEAU : Barre de Stats (Likes/Vues) */}
              <div className="px-6 py-3 flex gap-5 text-[10px] font-black uppercase tracking-widest text-[#C9963A]/80 border-b border-white/5">
                <span className="flex items-center gap-1.5">\ud83d\udc41 2.4K vues</span>
                <span className="flex items-center gap-1.5">\u2764 892 likes</span>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-display font-bold text-xl">{style.name}</h3>
                  <span className="text-[10px] bg-[#C9963A] text-[#2C1A0E] px-3 py-1 rounded-full font-black uppercase">
                    {style.duration}
                  </span>
                </div>
                <p className="text-[11px] opacity-70 mb-6 font-body leading-relaxed">{style.description}</p>
                
                <button
                  onClick={() => {/* Logique Generation Fal.ai */}}
                  className="w-full py-4 rounded-2xl font-display font-bold text-base shadow-xl active:scale-[0.98] transition-all"
                  style={{ background: 'linear-gradient(135deg,#C9963A,#E8B96A)', color: '#2C1A0E' }}
                >
                  Me transformer \u2728
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- BANDE DE CREDIT (Position conserv\u00e9e) --- */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:w-24 z-50 bg-[#C9963A] md:h-screen shadow-2xl">
        <div className="flex md:flex-col items-center justify-between md:justify-center p-4 md:h-full gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase font-black text-[#2C1A0E]/50">Solde</span>
            <div className="text-2xl font-display font-black text-[#2C1A0E] leading-none">{credits}</div>
            <span className="text-[7px] font-bold text-[#2C1A0E]">Credits</span>
          </div>
          
          {downloadCount > 0 && (
            <div className="bg-[#2C1A0E]/10 px-2 py-1 rounded-lg">
              <span className="text-[9px] font-black text-[#2C1A0E]">Save: {downloadCount}/3</span>
            </div>
          )}
          
          <button onClick={() => navigate("/credits")} className="bg-[#2C1A0E] text-[#C9963A] text-[9px] px-4 py-2 rounded-xl font-black uppercase shadow-lg">
            Recharger
          </button>
        </div>
      </div>

      {/* LIGHTBOX ZOOM */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl"
            onClick={() => setZoomImage(null)}
          >
            <img src={zoomImage} className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl border border-white/10" />
            <div className="mt-8 flex gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); handleDownload(zoomImage); }} 
                className="px-8 py-3 bg-[#C9963A] text-[#2C1A0E] rounded-full font-black text-sm"
              >
                Sauvegarder (1/3 cr\u00e9dit)
              </button>
              <button className="px-8 py-3 bg-white/10 text-white rounded-full font-bold backdrop-blur-md">Fermer</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
