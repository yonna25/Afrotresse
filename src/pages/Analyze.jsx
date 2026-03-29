import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { consumeAnalysis } from "../services/credits.js";
import { analyzeFace } from "../services/faceAnalysis.js";

const STEPS = [
  "Analyse des traits uniques...",
  "Étude de la structure osseuse...",
  "Calcul des proportions idéales...",
  "Sélection des tresses royales..."
];

export default function Analyze() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  
  // Récupération sécurisée du selfie
  const selfieUrl = sessionStorage.getItem("afrotresse_photo") || localStorage.getItem("afrotresse_selfie");

  useEffect(() => {
    // REDIRECTION SI PAS DE PHOTO (Évite la page blanche)
    if (!selfieUrl) {
      navigate("/");
      return;
    }

    // Simulation de la progression
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    // Changement des messages
    const stepInterval = setInterval(() => {
      setStepIdx(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1000);

    // Logique de fin d'analyse
    const timer = setTimeout(async () => {
      try {
        const result = await analyzeFace(selfieUrl);
        localStorage.setItem("afrotresse_face_shape", result.shape);
        consumeAnalysis(); // Incrémente le compteur
        navigate("/results");
      } catch (err) {
        console.error("Erreur d'analyse:", err);
        navigate("/");
      }
    }, 4500);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
      clearTimeout(timer);
    };
  }, [navigate, selfieUrl]);

  return (
    <div className="min-h-screen bg-[#2C1A0E] flex flex-col items-center justify-center p-8 text-[#FAF4EC]">
      
      {/* SECTION SELFIE + SCANNER */}
      <div className="relative w-64 h-64 mb-12">
        {/* Aura pulsante derrière */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-[#C9963A] rounded-full blur-3xl"
        />
        
        {/* Le Selfie */}
        <div className="relative w-full h-full rounded-full border-4 border-[#C9963A] overflow-hidden z-10 shadow-2xl">
          <img src={selfieUrl} className="w-full h-full object-cover" alt="Analyse" />
          
          {/* EFFET SCANNER LASER (Le 10/10) */}
          <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E8B96A] to-transparent shadow-[0_0_15px_#C9963A] z-20"
          />
        </div>
      </div>

      {/* TEXTES DE PROGRESSION */}
      <div className="w-full max-w-xs text-center">
        <h2 className="text-[#C9963A] font-bold text-2xl mb-2">{progress}%</h2>
        <p className="text-sm italic opacity-80 min-h-[1.5rem] mb-8">
          {STEPS[stepIdx]}
        </p>
        
        {/* Barre de progression épurée */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#C9963A]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

    </div>
  );
}
