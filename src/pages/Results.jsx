import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getSavedStyles, saveStyle, unsaveStyle, isStyleSaved } from '../services/credits.js'

export default function Results() {
  const navigate = useNavigate()
  const [results, setResults] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const savedResults = sessionStorage.getItem('afrotresse_results')
    if (savedResults) {
      setResults(JSON.parse(savedResults))
    }
  }, [])

  if (!results) return null
  const totalPages = Array.isArray(results) ? results.length : 0

  const nextValidPage = () => setCurrentPage((prev) => (prev + 1) % totalPages)
  const prevValidPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)

  return (
    <div className="min-h-screen bg-[#1A0A00] text-[#FAF4EC] pb-24 p-6">
      <header className="flex justify-between items-center mb-8 pt-4">
        <button onClick={() => navigate('/profile')} className="text-[#C9963A] font-bold text-sm">← Profil</button>
        <h1 className="font-display font-bold text-lg tracking-tight">Tes Styles Idéaux</h1>
        <div className="w-8" />
      </header>

      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative"
          >
             <div className="p-8 text-center min-h-[300px] flex flex-col justify-center items-center">
                <span className="text-5xl mb-6">✨</span>
                <h2 className="text-2xl font-bold mb-4 text-[#E8B96A]">Option n°{currentPage + 1}</h2>
                <p className="opacity-70 text-sm leading-relaxed px-4">
                  Ce style a été sélectionné pour équilibrer parfaitement les traits de ton visage.
                </p>
             </div>
          </motion.div>
        </AnimatePresence>

        {/* --- NAVIGATION CORRIGÉE (Ligne 247) --- */}
        <div className="flex items-center justify-between mt-10 px-2">
          <button 
            onClick={prevValidPage}
            className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Précédent</span>
          </button>
          
          <span style={{ color: '#E8B96A' }} className="text-sm font-black font-mono tracking-tighter">
            {currentPage + 1} / {totalPages}
          </span>

          <button 
            onClick={nextValidPage}
            className="px-6 py-4 rounded-2xl bg-[#C9963A] text-[#1A0A00] font-black active:scale-95 transition-all shadow-lg shadow-[#C9963A]/20"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Suivant</span>
          </button>
        </div>
      </main>
    </div>
  )
}
