import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BraidCard from '../components/BraidCard.jsx'
import { useProfile } from '../hooks/useProfile.js'
import { getTotalUsed, getSavedStyles } from '../services/credits.js'

const AVATARS = ['👩🏾','👩🏿','👩🏽','👸🏾','👸🏿','💁🏾‍♀️','💆🏾‍♀️','🧕🏾']

const LUXURY_STYLE = {
  pageBg: 'linear-gradient(160deg, #1A0A00 0%, #2C1A0E 40%, #1A0A00 100%)',
  cardBg: 'linear-gradient(145deg, rgba(60,35,15,0.9), rgba(30,15,5,0.95))',
  goldBorder: '1px solid rgba(201,150,58,0.5)',
  goldGlow: '0 0 20px rgba(201,150,58,0.3), 0 4px 24px rgba(0,0,0,0.5)',
  goldText: '#E8B96A',
  goldDark: '#C9963A',
  cream: '#FAF4EC',
  warm: 'rgba(250,244,236,0.65)',
}

export default function Profile() {
  const navigate = useNavigate()
  const { name, displayName, setName, avatar, setAvatar } = useProfile()
  const [saved, setSaved] = useState([])
  const [totalUsed, setTotalUsed] = useState(0)
  const [tab, setTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [showAvatars, setShowAvatars] = useState(false)

  // Récupération de la photo de l'utilisatrice (selfie)
  const selfieUrl = sessionStorage.getItem('afrotresse_photo') || localStorage.getItem('afrotresse_selfie')

  const REFERRAL_CODE = useState(
    () => localStorage.getItem('afrotresse_ref') || (() => {
      const c = 'AFRO-' + Math.random().toString(36).substring(2,7).toUpperCase()
      localStorage.setItem('afrotresse_ref', c)
      return c
    })()
  )[0]

  useEffect(() => {
    // Mise à jour automatique des compteurs au chargement
    const s = getSavedStyles()
    setSaved(s)
    setTotalUsed(getTotalUsed()) // Compteur d'analyses lancées
    setNameInput(name)
  }, [name])

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERRAL_CODE).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="min-h-screen pb-28 relative" style={{ background: LUXURY_STYLE.pageBg }}>
      {/* Header avec Image Utilisatrice */}
      <div className="relative pt-12 pb-6 px-5">
        <div className="relative flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {selfieUrl ? (
              <img src={selfieUrl} alt="Profil" className="w-20 h-20 rounded-full object-cover" 
                style={{ border: `3px solid ${LUXURY_STYLE.goldDark}`, boxShadow: LUXURY_STYLE.goldGlow }} />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-[#3C2310]"
                style={{ border: `3px solid ${LUXURY_STYLE.goldDark}` }}>{avatar}</div>
            )}
            <button onClick={() => setShowAvatars(!showAvatars)} 
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-[#C9963A] text-[#1A0A00] text-xs shadow-lg">✏️</button>
          </div>

          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-[#FAF4EC]">{displayName} 💎</h1>
            <p className="text-xs uppercase tracking-widest text-[#E8B96A]">Membre AfroTresse ✦</p>
          </div>
        </div>

        {/* Compteurs Mis à Jour */}
        <div className="flex gap-3 mt-8">
          {[
            [saved.length, 'Styles sauvés', '💾'],
            [totalUsed, 'Analyses', '🔍'],
            ['0', 'Filleules', '👯‍♀️'],
          ].map(([val, label, icon], i) => (
            <div key={label} className="flex-1 rounded-2xl py-4 text-center bg-[#3D2616] border border-[#C9963A]/30 shadow-lg">
              <p className="text-xl mb-1">{icon}</p>
              <p className="font-display text-2xl font-bold text-[#E8B96A]">{val}</p>
              <p className="text-[10px] uppercase tracking-tighter text-[#FAF4EC]/60">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-3 px-4 mt-2">
        {['Mes styles', 'Parrainage 🎁'].map((label, i) => (
          <button key={label} onClick={() => setTab(i)}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${tab === i ? 'bg-[#C9963A] text-[#1A0A00]' : 'bg-[#C9963A]/10 text-[#C9963A] border border-[#C9963A]/30'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Contenu Dynamique */}
      <div className="px-4 mt-6">
        {tab === 0 ? (
          saved.length === 0 ? (
            <div className="text-center py-10 opacity-60">
              <p className="text-4xl mb-4">💆🏾‍♀️</p>
              <p className="text-[#FAF4EC]">Aucun style sauvegardé</p>
              <button onClick={() => navigate('/camera')} className="mt-4 text-[#E8B96A] text-sm font-bold underline">Commencer l'analyse 📸</button>
            </div>
          ) : (
            <div className="space-y-4">
              {saved.map((b, i) => <BraidCard key={b.id} braid={b} index={i} compact />)}
            </div>
          )
        ) : (
          /* Onglet Parrainage */
          <div className="bg-[#3D2616] p-6 rounded-3xl border border-[#C9963A]/40 text-center">
            <p className="text-xs uppercase text-[#E8B96A] mb-2 font-bold">Ton code parrain</p>
            <div className="text-2xl font-display font-bold text-[#FAF4EC] tracking-widest mb-4 bg-black/20 py-3 rounded-xl border border-white/5">{REFERRAL_CODE}</div>
            <button onClick={handleCopy} className="w-full py-3 rounded-xl bg-[#C9963A] text-[#1A0A00] font-bold">
              {copied ? '✓ Copié !' : 'Copier mon code'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
