import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BraidCard from '../components/BraidCard.jsx'
import { getTotalUsed, getSavedStyles, getMyReferralCode } from '../services/credits.js'

export default function Profile() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState([])
  const [totalUsed, setTotalUsed] = useState(0)
  const [tab, setTab] = useState(0) // 0: Styles, 1: Résultats, 2: Cadeaux
  const userName = localStorage.getItem('afrotresse_user_name') || 'Reine'
  const selfieUrl = sessionStorage.getItem('afrotresse_photo') || localStorage.getItem('afrotresse_selfie')

  useEffect(() => {
    setSaved(getSavedStyles())
    setTotalUsed(getTotalUsed())
  }, [])

  return (
    <div className="min-h-screen pb-32 text-[#FAF4EC]" style={{ background: 'linear-gradient(160deg, #1A0A00 0%, #2C1A0E 40%, #1A0A00 100%)' }}>
      
      {/* --- HEADER LUXE --- */}
      <div className="pt-12 px-6 pb-6 text-center">
        <div className="relative inline-block mb-4">
          {selfieUrl ? (
            <img src={selfieUrl} className="w-24 h-24 rounded-full object-cover border-2 border-[#C9963A] shadow-2xl" alt="Profil" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#3D2616] flex items-center justify-center text-4xl border-2 border-[#C9963A]">👸🏾</div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-[#C9963A] text-[#1A0A00] text-[9px] font-black px-2 py-0.5 rounded-md">PREMIUM</div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{userName} 💎</h1>
        <p className="text-[#C9963A] text-[10px] uppercase tracking-[0.2em] mt-1 font-black">Maîtresse des Tresses</p>
      </div>

      {/* --- COMPTEUR (PAGINATION) --- */}
      <div className="flex gap-3 px-8 mb-8">
        <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-3xl text-center backdrop-blur-sm">
          <p className="text-2xl font-black text-[#E8B96A]">{totalUsed}</p>
          <p className="text-[9px] uppercase font-bold opacity-50 tracking-widest">Analyses</p>
        </div>
        <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-3xl text-center backdrop-blur-sm">
          <p className="text-2xl font-black text-[#E8B96A]">{saved.length}</p>
          <p className="text-[9px] uppercase font-bold opacity-50 tracking-widest">Favoris</p>
        </div>
      </div>

      {/* --- NAVIGATION 3 BOUTONS --- */}
      <div className="flex gap-1 px-1 py-1 rounded-2xl mx-6 mb-8 border border-white/10 bg-black/20">
        {['Mes Styles', 'Résultats', 'Cadeaux'].map((label, i) => (
          <button 
            key={label} 
            onClick={() => setTab(i)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${tab === i ? 'bg-[#C9963A] text-[#1A0A00]' : 'text-[#E8B96A]/50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* --- CONTENU --- */}
      <div className="px-6 min-h-[250px]">
        <AnimatePresence mode="wait">
          {tab === 0 && (
            <motion.div key="t0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {saved.length === 0 ? (
                <div className="text-center py-10 opacity-30 text-xs italic">Aucun style enregistré pour le moment</div>
              ) : (
                saved.map((b, index) => <BraidCard key={index} braid={b} compact />)
              )}
            </motion.div>
          )}

          {tab === 1 && (
            <motion.div key="t1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="bg-white/5 p-8 rounded-3xl border border-dashed border-[#C9963A]/30">
                <p className="text-sm mb-6 opacity-80 leading-relaxed">Retrouvez les derniers styles conseillés par notre IA pour votre visage.</p>
                <button 
                  onClick={() => navigate('/results')}
                  className="w-full py-4 rounded-2xl font-bold bg-[#FAF4EC] text-[#1A0A00] shadow-xl"
                >
                  Voir mes derniers résultats 🪞
                </button>
              </div>
            </motion.div>
          )}

          {tab === 2 && (
            <motion.div key="t2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-gradient-to-br from-[#C9963A] to-[#E8B96A] p-6 rounded-3xl text-[#1A0A00] shadow-2xl">
                <p className="text-[10px] uppercase font-black mb-1 opacity-70">Votre Code Cadeau</p>
                <p className="text-3xl font-black tracking-tighter mb-4">{getMyReferralCode()}</p>
                <div className="h-[1px] bg-black/10 mb-4" />
                <p className="text-[11px] font-bold leading-tight">Partagez ce code : 2 crédits offerts pour chaque amie qui commence son aventure ! 🎁</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MENTIONS LÉGALES --- */}
      <div className="mt-16 pb-10 px-6 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-30 text-[9px] uppercase font-black text-center tracking-widest">
        <Link to="/privacy-policy">Confidentialité</Link>
        <Link to="/terms-of-service">Conditions</Link>
        <Link to="/cookie-policy">Cookies</Link>
      </div>

    </div>
  )
}
