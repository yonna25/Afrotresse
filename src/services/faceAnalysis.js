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
  
  const selfieUrl = sessionStorage.getItem("afrotresse_photo") || localStorage.getItem("afrotresse_selfie");

  useEffect(() => {
    if (!selfieUrl) {
      navigate("/");
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 1));
    }, 40);

    const stepInterval = setInterval(() => {
      setStepIdx(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);

    const performAnalysis = async () => {
      try {
        // 1. Appel du service (qui renvoie un objet complexe)
        const result = await analyzeFace(selfieUrl);
        
        // 2. EXTRACTION CRUCIALE : On prend result.faceShape
        localStorage.setItem("afrotresse_face_shape", result.faceShape);
        
        // 3. Finalisation
        consumeAnalysis();
        
        // On attend que la barre atteigne 100% avant de partir
        setTimeout(() => navigate("/results"), 500);
      } catch (err) {
        console.error("Analyse échouée:", err);
        navigate("/");
      }
    };

    performAnalysis();

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [navigate, selfieUrl]);

  return (
    <div className="min-h-screen bg-[#2C1A0E] flex flex-col items-center justify-center p-8 text-[#FAF4EC]">
      <div className="relative w-64 h-64 mb-12">
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-[#C9963A] rounded-full blur-3xl"
        />
        <div className="relative w-full h-full rounded-full border-4 border-[#C9963A] overflow-hidden z-10 shadow-2xl">
          <img src={selfieUrl} className="w-full h-full object-cover" alt="Scan" />
          <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-[#E8B96A] shadow-[0_0_15px_#C9963A] z-20"
          />
        </div>
      </div>

      <div className="w-full max-w-xs text-center">
        <h2 className="text-[#C9963A] font-bold text-3xl mb-2 font-mono">{progress}%</h2>
        <p className="text-sm font-light tracking-wide opacity-80 h-6 mb-8 uppercase">
          {STEPS[stepIdx]}
        </p>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#C9963A] to-[#E8B96A]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
