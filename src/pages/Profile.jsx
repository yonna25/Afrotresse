import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getCredits } from "../services/credits.js";

export default function Profile() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [userName, setUserName] = useState("Ma Reine");
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("styles");

  useEffect(() => {
    setCredits(getCredits());
    // Récupération du nom défini dans le WelcomePopup de App.jsx
    const savedName = localStorage.getItem('afrotresse_user_name');
    if (savedName) setUserName(savedName);
    
    const photo = sessionStorage.getItem('afrotresse_photo');
    if (photo) setSelfieUrl(photo);
  }, []);

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] flex flex-col items-center px-4 py-6 pb-32">
      
      {/* HEADER AVEC PHOTO & BADGE */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-[#C9963A] overflow-hidden bg-[#3D2616] flex items-center justify-center shadow-2xl">
            {selfieUrl ? (
              <img src={selfieUrl} className="w-full h-full object-cover" alt="Profil" />
            ) : (
              <span className="text-4xl">👑</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#C9963A] w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#2C1A0E]">
            <span className="text-sm">👑</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-2 uppercase tracking-tight text-[#C9963A]">{userName}</h1>
        <p className="text-[11px] text-[#C9963A] font-medium tracking-[0.2em] uppercase opacity-80">Votre Majesté</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 w-full max-w-sm mt-8 bg-white/5 border border-white/10 rounded-[2rem] p-5 text-center">
        <div>
          <p className="text-xl font-black text-[#C9963A]">0</p>
          <p className="text-[9px] uppercase font-bold opacity-40">Analyses</p>
        </div>
        <div className="border-x border-white/10">
          <p className="text-xl font-black text-[#C9963A]">0</p>
          <p className="text-[9px] uppercase font-bold opacity-40">Favoris</p>
        </div>
        <div>
          <p className="text-xl font-black text-[#C9963A]">{credits}</p>
          <p className="text-[9px] uppercase font-bold opacity-40">Crédits</p>
        </div>
      </div>

      {/* NAVIGATION PAR ONGLETS (MAINTENANT AVEC RÉSULTATS) */}
      <div className="flex bg-[#3D2616] rounded-2xl mt-10 p-1 w-full max-w-sm border border-white/5 shadow-inner">
        <button 
          onClick={() => setActiveTab("styles")}
          className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'styles' ? 'bg-[#C9963A] text-[#2C1A0E]' : 'text-gray-500'}`}
        >
          Styles
        </button>
        <button 
          onClick={() => setActiveTab("essais")}
          className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all ${activeTab === 'essais' ? 'bg-[#C9963A] text-[#2C1A0E]' : 'text-gray-500'}`}
        >
          Essais
        </button>
        <button 
          onClick={() => navigate('/results')}
          className="flex-1 py-3 rounded-xl text-[10px] font-bold uppercase text-gray-500 hover:text-[#FAF4EC] transition-all"
        >
          Résultats
        </button>
      </div>

      {/* CONTENU SELON L'ONGLET */}
      <div className="w-full mt-12 flex flex-col items-center">
        <div className="w-12 h-12 border-2 border-dashed border-[#C9963A]/30 rounded-full flex items-center justify-center mb-3">
          <span className="text-xl">{activeTab === "styles" ? "🔖" : "📸"}</span>
        </div>
        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">
          {activeTab === "styles" ? "Aucun style favori" : "Aucun essai virtuel"}
        </p>
      </div>

      {/* FOOTER LÉGAL - CORRIGÉ AVEC LES ROUTES DE APP.JSX */}
      <div className="mt-auto pt-16 flex flex-col items-center gap-2 opacity-30">
        <div className="flex flex-wrap justify-center gap-4 text-[9px] font-bold uppercase tracking-widest text-center px-4">
          <button onClick={() => navigate('/cookie-policy')}>Cookies</button>
          <span>•</span>
          <button onClick={() => navigate('/terms-of-service')}>Conditions</button>
          <span>•</span>
          <button onClick={() => navigate('/privacy-policy')}>Confidentialité</button>
        </div>
        <p className="text-[8px] mt-2">© 2026 AfroTresse - Tous droits réservés</p>
      </div>

    </div>
  );
}
