// ❌ SUPPRIMER ce bloc (popup effect)
useEffect(() => {
  if (!storedName) {
    const t = setTimeout(() => setShowPopup(true), 5000);
    return () => clearTimeout(t);
  }
}, []);

useEffect(() => {
  if (showPopup && inputRef.current) {
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 300);
    return () => clearTimeout(t);
  }
}, [showPopup]);

// ❌ SUPPRIMER ce bloc JSX (popup)
<AnimatePresence>
  {showPopup && (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="w-full rounded-[1.75rem] p-5"
      >
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

// ✅ MODIFIER TEXTE
<p className="mt-3 text-sm font-body leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>
  Un selfie, et découvre ta meilleure coiffure.
</p>

// ✅ MODIFIER BOUTON
<button onClick={handleStart}
  className="px-10 py-4 rounded-full font-display font-bold text-lg shadow-2xl active:scale-95 transition-transform"
  style={{ background: 'linear-gradient(135deg,#C9963A,#E8B96A)', color: '#2C1A0E' }}>
  Découvrir mon style ✨
</button>
