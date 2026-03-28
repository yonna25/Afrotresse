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
    } else {
      // Simulation ou redirection si pas de résultats
      // navigate('/camera') 
    }
  }, [navigate])

  if (!results) return null

  const totalPages = results.length || 0

  const nextValidPage = () => setCurrentPage((prev) => (prev + 1) % totalPages)
  const prevValidPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)

  return (
    <div className="min-h-screen bg-[#1A0A00] text-[#FAF4EC] pb-24 p-6">
      <header className="flex justify-between items-center mb-8 pt-4">
        <button onClick={() => navigate('/')} className="text-[#C9963A] font-bold text-sm">← Retour</button>
        <h1 className="font-display font-bold text-lg">Tes Recommandations</h1>
        <div className="w-8" />
      </header>

      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
          >
            {/* Contenu du style recommandé ici */}
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-bold mb-4 text-[#E8B96A]">Style n°{currentPage + 1}</h2>
              <p className="opacity-70 text-sm leading-relaxed mb-8">
                Ce style a été sélectionné pour sublimer la forme de ton visage et mettre en valeur tes traits.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* --- BLOC DE NAVIGATION CORRIGÉ --- */}
        <div className="flex items-center justify-between mt-8 px-4">
          <button 
            onClick={prevValidPage}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-transform"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Précédent</span>
          </button>
          
          <span style={{ color: '#E8B96A' }} className="text-sm font-black font-mono">
            {currentPage + 1} / {totalPages}
          </span>

          <button 
            onClick={nextValidPage}
            className="p-4 rounded-2xl bg-[#C9963A] text-[#1A0A00] font-bold active:scale-95 transition-transform shadow-lg shadow-[#C9963A]/20"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Suivant</span>
          </button>
        </div>
      </main>
    </div>
  )
}
