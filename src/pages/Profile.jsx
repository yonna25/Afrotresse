import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BraidCard from '../components/BraidCard.jsx'
import { useProfile } from '../hooks/useProfile.js'
[span_13](start_span)import { getTotalUsed, getSavedStyles } from '../services/credits.js'[span_13](end_span)

const LUXURY_STYLE = {
  pageBg: 'linear-gradient(160deg, #1A0A00 0%, #2C1A0E 40%, #1A0A00 100%)',
  cardBg: 'linear-gradient(145deg, rgba(60,35,15,0.9), rgba(30,15,5,0.95))',
  goldBorder: '1px solid rgba(201,150,58,0.5)',
  goldText: '#E8B96A',
  goldDark: '#C9963A',
  cream: '#FAF4EC',
}

export default function Profile() {
  [span_14](start_span)const navigate = useNavigate()[span_14](end_span)
  [span_15](start_span)const { name, displayName, setName, avatar, setAvatar } = useProfile()[span_15](end_span)
  [span_16](start_span)const [saved, setSaved] = useState([])[span_16](end_span)
  [span_17](start_span)const [totalUsed, setTotalUsed] = useState(0)[span_17](end_span)
  [span_18](start_span)const [tab, setTab] = useState(0)[span_18](end_span)

  // RÉCUPÉRATION DE LA PHOTO (Selfie)
  const selfieUrl = sessionStorage.getItem('afrotresse_photo') || localStorage.getItem('afrotresse_selfie')

  useEffect(() => {
    [span_19](start_span)setSaved(getSavedStyles())[span_19](end_span)
    [span_20](start_span)setTotalUsed(getTotalUsed())[span_20](end_span)
  }, [name])

  return (
    <div className="min-h-screen pb-28 relative" style={{ background: LUXURY_STYLE.pageBg }}>
      
      {/* Header avec Photo */}
      <div className="relative pt-12 pb-6 px-5">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {selfieUrl ? (
              <img 
                src={selfieUrl} 
                className="w-20 h-20 rounded-full object-cover" 
                style={{ border: `3px solid ${LUXURY_STYLE.goldDark}`, boxShadow: '0 0 15px rgba(201,150,58,0.4)' }} 
                alt="Selfie"
              />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-[#3C2310]"
                style={{ border: `3px solid ${LUXURY_STYLE.goldDark}` }}>
                {avatar}
              </div>
            )}
          </div>

          <div className="flex-1">
            [span_21](start_span)<h1 className="font-display text-2xl font-bold text-[#FAF4EC]">{displayName} 💎[span_21](end_span)</h1>
            [span_22](start_span)<p className="text-[10px] uppercase tracking-widest text-[#E8B96A]">Membre AfroTresse ✦[span_22](end_span)</p>
          </div>
        </div>

        {/* Compteurs Réels */}
        <div className="flex gap-3 mt-8">
          {[
            [span_23](start_span)[saved.length, 'Styles sauvés', '💾'],[span_23](end_span)
            [span_24](start_span)[totalUsed, 'Analyses', '🔍'],[span_24](end_span)
            [span_25](start_span)['0', 'Filleules', '👯‍♀️'],[span_25](end_span)
          ].map(([val, label, icon]) => (
            <div key={label} className="flex-1 rounded-2xl py-4 text-center" 
              style={{ background: LUXURY_STYLE.cardBg, border: LUXURY_STYLE.goldBorder }}>
              [span_26](start_span)<p className="text-base mb-1">{icon}</p>[span_26](end_span)
              [span_27](start_span)<p className="text-xl font-bold" style={{ color: LUXURY_STYLE.goldText }}>{val}</p>[span_27](end_span)
              [span_28](start_span)<p className="text-[9px] uppercase font-bold opacity-60 text-white">{label}</p>[span_28](end_span)
            </div>
          ))}
        </div>
      </div>

      {/* Onglets Styles / Parrainage */}
      <div className="flex gap-3 px-4 mt-2">
        {['Mes styles', 'Parrainage 🎁'].map((label, i) => (
          <button key={label} onClick={() => setTab(i)}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold ${tab === i ? 'bg-[#C9963A] text-[#1A0A00]' : 'bg-white/5 text-[#E8B96A] border border-[#C9963A]/30'}`}>
            {label}
          [span_29](start_span)</button>[span_29](end_span)
        ))}
      </div>

      {/* Contenu */}
      <div className="px-4 mt-6">
        {tab === 0 ? (
          saved.length === 0 ? (
            <div className="text-center py-12 opacity-60 text-white">
              <p className="text-4xl mb-2">💆🏾‍♀️</p>
              [span_30](start_span)<p>Aucun style sauvegardé</p>[span_30](end_span)
            </div>
          ) : (
            [span_31](start_span)saved.map((b, i) => <BraidCard key={b.id} braid={b} index={i} compact />)[span_31](end_span)
          )
        ) : (
          <div className="bg-[#3D2616] p-6 rounded-3xl border border-[#C9963A]/30 text-center">
            [span_32](start_span)<p className="text-xs text-[#E8B96A] mb-2 uppercase font-bold">Ton code de parrainage</p>[span_32](end_span)
            <div className="text-2xl font-bold text-white tracking-widest mb-4">
              {localStorage.getItem('afrotresse_ref') || [span_33](start_span)'AFRO-QUEEN'}[span_33](end_span)
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
