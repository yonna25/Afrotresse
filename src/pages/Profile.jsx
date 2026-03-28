import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BraidCard from '../components/BraidCard.jsx'
import { getTotalUsed, getSavedStyles, getMyReferralCode } from '../services/credits.js'

const LUXURY_STYLE = {
  pageBg: 'linear-gradient(160deg, #1A0A00 0%, #2C1A0E 40%, #1A0A00 100%)',
  cardBg: 'linear-gradient(145deg, rgba(60,35,15,0.9), rgba(30,15,5,0.95))',
  goldBorder: '1px solid rgba(201,150,58,0.3)',
  goldText: '#E8B96A',
  goldDark: '#C9963A',
  cream: '#FAF4EC',
}

export default function Profile() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState([])
  const [totalUsed, setTotalUsed] = useState(0)
  const [tab, setTab] = useState(0) // 0: Styles, 1: Résultats, 2: Parrainage
  const [userName] = useState(localStorage.getItem('afrotresse_user_name') || 'Reine')

  const selfieUrl = sessionStorage.getItem('afrotresse_photo') || localStorage.getItem('afrotresse_selfie')

  useEffect(() => {
    setSaved(getSavedStyles())
    setTotalUsed(getTotalUsed())
  }, [])

  return (
    <div className="min-h-screen pb-32 text-[#FAF4EC]" style={{ background: LUXURY_STYLE.pageBg }}>
      
      {/* --- HEADER UX --- */}
      <div className="pt-12 px-6 pb-6 text-center">
        <div className="relative inline-block mb-4">
          {selfieUrl ? (
            <img src={selfieUrl} className="w-24 h-24 rounded-full object-cover border-2 border-[#C9963A] shadow-2xl" alt="Profil" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#3D2616] flex items-center justify-center text-4xl border-2 border-[#C9963A]">👸🏾</div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-[#C9963A] text-[#1A0A00] text-[10px] font-black px-2 py-1 rounded-lg">PRO</div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{userName} 💎</h1>
        <p className="text-[#C9963A] text-xs uppercase tracking-[0.2em] mt-1 font-bold">Maîtresse des Tresses</p>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-2 gap-3 px-6 mb-8">
        <div className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center">
          <p className="text-2xl font-black text-[#E8B96A]">{totalUsed}</p>
          <p className="text-[10px] uppercase opacity-60">Analyses</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center">
          <p className="text-2xl font-black text-[#E8B96A]">{saved.length}</p>
          <p className="text-[10px] uppercase opacity-60">Favoris</p>
        </div>
      </div>

      {/* --- NOUVELLE NAVIGATION (3 BOUTONS) --- */}
      <div className="flex gap-1 px-4 mb-6 bg-[#1A0A00]/50 p-1 rounded-2xl mx-6 border border-white/5">
        {['Styles', 'Résultats', 'Cadeaux'].map((label, i) => (
          <button 
            key={label} 
            onClick={() => setTab(i)}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${tab === i ? 'bg-[#C9963A] text-[#1A0A00]' : 'text-[#E8B96A]/60'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* --- CONTENU DYNAMIQUE --- */}
      <div className="px-6 min-h-[300px]">
        <AnimatePresence mode="wait">
          {tab === 0 && (
            <motion.div key="tab0" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              {saved.length === 0 ? (
                <p className="text-center opacity-40 mt-10">Aucun style enregistré...</p>
              ) : (
                saved.map((b, i) => <BraidCard key={i} braid={b} compact />)
              )}
            </motion.div>
          )}

          {tab === 1 && (
            <motion.div key="tab1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="bg-white/5 p-8 rounded-3xl border border-dashed border-white/20">
                <p className="text-sm opacity-70 mb-4">Voir ma dernière analyse complète</p>
                <button 
                  onClick={() => navigate('/results')}
                  className="bg-white text-[#1A0A00] px-6 py-3 rounded-2xl font-bold text-sm"
                >
                  Ouvrir le miroir 🪞
                </button>
              </div>
            </motion.div>
          )}

          {tab === 2 && (
            <motion.div key="tab2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-gradient-to-br from-[#C9963A] to-[#E8B96A] p-6 rounded-3xl text-[#1A0A00]">
                <h3 className="font-black uppercase text-xs mb-1">Parrainage</h3>
                <p className="text-2xl font-black tracking-tighter mb-4">{getMyReferralCode()}</p>
                <p className="text-[10px] leading-tight font-bold opacity-80">Partage ce code : 2 crédits offerts pour chaque amie inscrite ! 🎁</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MENTIONS LÉGALES (RÉAPPARUES) --- */}
      <div className="mt-12 px-6 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-30 text-[10px] uppercase font-bold text-center">
        <Link to="/privacy-policy">Confidentialité</Link>
        <Link to="/terms-of-service">Conditions</Link>
        <Link to="/cookie-policy">Cookies</Link>
      </div>

    </div>
  )
}
