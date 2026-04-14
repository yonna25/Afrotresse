import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FACE_SHAPE_NAMES } from '../services/faceAnalysis.js';
import { getSavedStyles, unsaveStyle } from '../services/credits.js';

export default function Library() {
  const [savedStyles, setSavedStyles] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [zoomImg, setZoomImg]         = useState(null); // URL de l'image en lightbox

  useEffect(() => {
    const saved = getSavedStyles();
    setSavedStyles(saved);
    setLoading(false);
  }, []);

  const handleRemove = (styleId) => {
    unsaveStyle(styleId);
    setSavedStyles(prev => prev.filter(s => s.id !== styleId));
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#1A0A00' }}>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-14 pb-4 px-5"
      >
        <h1 className="text-3xl font-bold" style={{ color: '#C9963A' }}>❤️ Mes Favoris</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(250,244,236,0.5)' }}>
          {savedStyles.length} style{savedStyles.length !== 1 ? 's' : ''} sauvegardé{savedStyles.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-20" style={{ color: 'rgba(250,244,236,0.4)' }}>
          Chargement...
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && savedStyles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 px-8 text-center"
        >
          <div className="text-6xl mb-4">🤍</div>
          <p className="text-base font-bold mb-2" style={{ color: '#FAF4EC' }}>
            Aucun favori pour l'instant
          </p>
          <p className="text-sm" style={{ color: 'rgba(250,244,236,0.4)' }}>
            Appuie sur ❤️ sur un style dans tes résultats pour le retrouver ici.
          </p>
        </motion.div>
      )}

      {/* LISTE DES FAVORIS */}
      {!loading && savedStyles.length > 0 && (
        <div className="px-4 flex flex-col gap-5">
          {savedStyles.map((style, index) => {
            const styleKey = style.id?.replace(/-/g, '') || style.id;
            const faceImg  = style.views?.face || `/styles/${styleKey}-face.jpg`;
            const backImg  = style.views?.back || `/styles/${styleKey}-back.jpg`;
            const topImg   = style.views?.top  || `/styles/${styleKey}-top.jpg`;

            return (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[2rem] overflow-hidden"
                style={{
                  background: '#3D2616',
                  border: '1px solid rgba(201,150,58,0.2)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                {/* GRILLE 3 IMAGES CLIQUABLES */}
                <div className="grid grid-cols-3 gap-0.5" style={{ background: '#000' }}>

                  {/* Image principale — 2/3 largeur, hauteur auto */}
                  <div
                    className="col-span-2 cursor-pointer active:opacity-80 transition-opacity"
                    style={{ aspectRatio: '3/4', overflow: 'hidden' }}
                    onClick={() => setZoomImg(faceImg)}
                  >
                    <img
                      src={faceImg}
                      alt={style.name}
                      className="w-full h-full object-cover object-top"
                      draggable={false}
                      onContextMenu={e => e.preventDefault()}
                      onError={e => { e.target.src = '/styles/boxbraids-face.jpg'; }}
                    />
                  </div>

                  {/* Deux vignettes empilées */}
                  <div className="col-span-1 flex flex-col gap-0.5">
                    <div
                      className="flex-1 cursor-pointer active:opacity-80 transition-opacity"
                      style={{ overflow: 'hidden' }}
                      onClick={() => setZoomImg(backImg)}
                    >
                      <img
                        src={backImg}
                        alt="dos"
                        className="w-full h-full object-cover"
                        draggable={false}
                        onContextMenu={e => e.preventDefault()}
                        onError={e => { e.target.src = faceImg; }}
                      />
                    </div>
                    <div
                      className="flex-1 cursor-pointer active:opacity-80 transition-opacity"
                      style={{ overflow: 'hidden' }}
                      onClick={() => setZoomImg(topImg)}
                    >
                      <img
                        src={topImg}
                        alt="dessus"
                        className="w-full h-full object-cover"
                        draggable={false}
                        onContextMenu={e => e.preventDefault()}
                        onError={e => { e.target.src = faceImg; }}
                      />
                    </div>
                  </div>
                </div>

                {/* INFO */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg" style={{ color: '#FAF4EC' }}>{style.name}</h3>
                    {style.duration && (
                      <span
                        className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ml-2 flex-shrink-0"
                        style={{ background: '#C9963A', color: '#2C1A0E' }}
                      >
                        {style.duration}
                      </span>
                    )}
                  </div>

                  {style.faceShapes && (
                    <p className="text-xs mb-2" style={{ color: 'rgba(201,150,58,0.8)' }}>
                      👤 {style.faceShapes.map(s => FACE_SHAPE_NAMES?.[s] || s).join(', ')}
                    </p>
                  )}

                  {style.description && (
                    <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(250,244,236,0.55)' }}>
                      {style.description}
                    </p>
                  )}

                  {style.tags && style.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {style.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-3 py-1 rounded-full"
                          style={{ background: 'rgba(201,150,58,0.15)', color: '#C9963A' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Hint zoom */}
                  <p className="text-[10px] mb-3 text-center" style={{ color: 'rgba(250,244,236,0.25)' }}>
                    Appuie sur une photo pour zoomer 🔍
                  </p>

                  <button
                    onClick={() => handleRemove(style.id)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      background: 'rgba(180,40,40,0.15)',
                      border: '1px solid rgba(180,40,40,0.3)',
                      color: '#F87171',
                    }}
                  >
                    Retirer des favoris
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX */}
      <AnimatePresence>
        {zoomImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(16px)' }}
            onClick={() => setZoomImg(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={zoomImg}
              alt="Zoom"
              className="max-w-full rounded-3xl shadow-2xl"
              style={{
                maxHeight: '80vh',
                objectFit: 'contain',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                border: '1px solid rgba(201,150,58,0.2)',
              }}
              draggable={false}
              onContextMenu={e => e.preventDefault()}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setZoomImg(null)}
              className="mt-6 px-8 py-3 rounded-2xl font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#FAF4EC', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Fermer ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
