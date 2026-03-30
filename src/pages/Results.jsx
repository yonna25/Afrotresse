import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BRAIDS_DB } from "../services/faceAnalysis.js";
import { getCredits, consumeTransform, hasCredits, addSeenStyleId, getSeenStyleIds } from "../services/credits.js";

// --- COMPOSANT SPARKLE (Animation Étincelles) ---
const SparkleEffect = ({ active }) => {
  return (
    <AnimatePresence>
      {active && [...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
          animate={{ 
            scale: [0, 1, 0], 
            opacity: 0,
            x: (Math.random() - 0.5) * 100, 
            y: (Math.random() - 0.5) * 100 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute pointer-events-none w-2 h-2 bg-[#C9963A] rounded-full z-50"
          style={{ boxShadow: '0 0 10px #E8B96A' }}
        />
      ))}
    </AnimatePresence>
  );
};

// --- LOGIQUE BOUTON FLOTTANT ---
// À insérer dans Results.jsx avant le dernier </div>

const [isSparkling, setIsSparkling] = useState(false);

const handleGetNewStyles = () => {
  if (!hasCredits()) {
    navigate('/credits');
    return;
  }

  // Animation visuelle
  setIsSparkling(true);
  setTimeout(() => setIsSparkling(false), 600);

  // Logique de rafraîchissement
  const seenIds = getSeenStyleIds();
  
  // Marquer les styles actuels comme vus
  styles.forEach(s => addSeenStyleId(s.id));

  // Filtrer les nouveaux styles (non vus et adaptés à la forme du visage)
  const available = BRAIDS_DB.filter(s => 
    !seenIds.includes(s.id) && 
    (!s.faceShapes || s.faceShapes.includes(faceShape))
  );

  // Mélange aléatoire
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  const nextStyles = shuffled.slice(0, 3);

  if (nextStyles.length > 0) {
    consumeTransform(); // Consomme 1 crédit
    setCredits(getCredits());
    setStyles(nextStyles);
    setPage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Optionnel : réinitialiser les vus si tout a été exploré
    alert("Tu as exploré tous les styles pour le moment ! ✨");
  }
};

// --- JSX DU BOUTON (Positionné sous le solde) ---

<div className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-3">
  {/* BOUTON CRÉDITS EXISTANT (Référence de position) */}
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    onClick={() => navigate('/credits')}
    className="bg-[#C9963A] text-[#2C1A0E] w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-2xl border-2 border-[#2C1A0E]/20 active:scale-95 transition-all cursor-pointer"
  >
    <div className="text-[7px] font-black uppercase opacity-60">Solde</div>
    <div className="text-2xl font-black leading-none">{credits}</div>
    <div className="text-[7px] font-bold tracking-tight">CRÉDITS</div>
  </motion.div>

  {/* NOUVEAU BOUTON REFRESH STYLES */}
  <div className="relative">
    <SparkleEffect active={isSparkling} />
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleGetNewStyles}
      className="w-14 h-14 rounded-full bg-[#3D2616] border-2 border-[#C9963A] shadow-[0_0_20px_rgba(201,150,58,0.3)] flex flex-col items-center justify-center text-[#C9963A] relative overflow-hidden"
    >
      <motion.span 
        animate={isSparkling ? { rotate: 360 } : {}}
        className="text-xl"
      >
        ✨
      </motion.span>
      <span className="text-[8px] font-black uppercase mt-0.5">Nouveaux</span>
      
      {/* Overlay brillant discret */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
    </motion.button>
  </div>
</div>
