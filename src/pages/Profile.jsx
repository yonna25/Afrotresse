import { useState, useEffect } from 'react'
import { getTotalUsed, getSavedStyles } from '../services/credits.js'

export default function Profile() {
  const [saved, setSaved] = useState([])
  const [totalUsed, setTotalUsed] = useState(0)

  const selfieUrl = sessionStorage.getItem('afrotresse_photo') || localStorage.getItem('afrotresse_selfie')

  useEffect(() => {
    // On rafraîchit les données au chargement de la page
    setSaved(getSavedStyles())
    setTotalUsed(getTotalUsed())
  }, [])

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] p-6 pb-24">
      <div className="flex items-center gap-4 mt-8">
        <div className="relative">
          {selfieUrl ? (
            <img src={selfieUrl} className="w-20 h-20 rounded-full object-cover border-2 border-[#C9963A]" alt="Selfie" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#3D2616] flex items-center justify-center text-3xl border-2 border-[#C9963A]">👸🏾</div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">Maîtresse des Tresses 💎</h1>
          <p className="text-[10px] text-[#C9963A] uppercase font-black tracking-widest">Membre Premium</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-10">
        <div className="bg-[#3D2616] p-4 rounded-2xl text-center border border-white/5 shadow-xl">
          <p className="text-xl mb-1">💾</p>
          <p className="text-xl font-black text-[#E8B96A]">{saved.length}</p>
          <p className="text-[9px] uppercase font-bold opacity-60">Styles</p>
        </div>
        <div className="bg-[#3D2616] p-4 rounded-2xl text-center border border-white/5 shadow-xl">
          <p className="text-xl mb-1">🔍</p>
          <p className="text-xl font-black text-[#E8B96A]">{totalUsed}</p>
          <p className="text-[9px] uppercase font-bold opacity-60">Analyses</p>
        </div>
        <div className="bg-[#3D2616] p-4 rounded-2xl text-center border border-white/5 shadow-xl">
          <p className="text-xl mb-1">👯‍♀️</p>
          <p className="text-xl font-black text-[#E8B96A]">0</p>
          <p className="text-[9px] uppercase font-bold opacity-60">Filleules</p>
        </div>
      </div>
    </div>
  )
}
