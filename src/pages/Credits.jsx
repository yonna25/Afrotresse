import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCredits, addCredits, PRICING } from '../services/credits.js'

export default function Credits() {
  const navigate = useNavigate()
  const [credits, setCredits] = useState(getCredits())
  const [selected, setSelected] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleBuy = (pack) => {
    // Simulation achat — à remplacer par ton vrai système de paiement
    addCredits(pack.credits)
    setCredits(getCredits())
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      navigate('/results')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#1A0A00] text-[#FAF4EC] pb-32">

      {/* Header */}
      <div className="pt-14 pb-6 px-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 className="font-bold text-3xl text-[#C9963A]">Recharger</h1>
        <p className="text-sm opacity-60 mt-1">Choisis ton pack d'essais virtuels</p>
      </div>

      {/* Solde actuel */}
      <div className="mx-6 mb-8 p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-widest">Solde actuel</p>
          <p className="text-4xl font-black text-[#C9963A] mt-1">{credits}</p>
          <p className="text-xs opacity-50">crédits disponibles</p>
        </div>
        <div className="text-5xl">💎</div>
      </div>

      {/* Packs */}
      <div className="px-6 space-y-4">
        {PRICING.packs.map((pack) => (
          <motion.div
            key={pack.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(pack.id)}
            className={`relative p-5 rounded-3xl border-2 cursor-pointer transition-all ${
              selected === pack.id
                ? 'border-[#C9963A] bg-[#C9963A]/10'
                : 'border-white/10 bg-white/5'
            }`}>

            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9963A] text-[#1A0A00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                ⭐ Populaire
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-lg">{pack.label}</p>
                <p className="text-[#C9963A] text-sm font-bold mt-1">
                  {pack.credits} crédits
                  {pack.monthly && <span className="ml-2 opacity-60 text-xs">/ mois</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl">{pack.price}</p>
                <p className="text-xs opacity-50">{PRICING.currency}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bouton acheter */}
      <div className="px-6 mt-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            const pack = PRICING.packs.find(p => p.id === selected)
            if (pack) handleBuy(pack)
          }}
          disabled={!selected}
          className="w-full py-5 rounded-2xl font-black text-lg disabled:opacity-30 transition-all text-[#1A0A00]"
          style={{ background: 'linear-gradient(135deg, #C9963A, #E8B96A)' }}>
          {success ? '✅ Crédits ajoutés !' : 'Acheter maintenant'}
        </motion.button>
      </div>

      {/* Info crédits gratuits */}
      <div className="mx-6 mt-6 p-4 rounded-2xl bg-white/5 border border-white/5">
        <p className="text-xs opacity-50 text-center leading-relaxed">
          🎁 {PRICING.freeCredits} crédits offerts à l'inscription · 
          Parrainage : +{PRICING.referral.receiver} crédits · 
          Avis : +{PRICING.reviewBonus} crédits
        </p>
      </div>

    </div>
  )
}
