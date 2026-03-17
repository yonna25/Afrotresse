import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Results() {
  const navigate = useNavigate();
  const [styles, setStyles]     = useState([]);
  const [selfieUrl, setSelfieUrl] = useState(null);

  useEffect(() => {
    // Lire les résultats depuis sessionStorage
    const raw = sessionStorage.getItem('afrotresse_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      setStyles(parsed.recommendations || []);
    }
    const photo = sessionStorage.getItem('afrotresse_photo');
    if (photo) setSelfieUrl(photo);
  }, []);

  if (!styles.length) return (
    <div className="min-h-screen bg-[#2b1810] flex items-center justify-center">
      <p className="text-white text-center px-4">
        Aucun résultat.<br/>
        <button onClick={() => navigate('/camera')} className="mt-4 text-yellow-400 underline">
          Prendre un selfie
        </button>
      </p>
    </div>
  );

  return (
    <div className="px-4 py-6 space-y-6 bg-[#2b1810] min-h-screen pb-28">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full bg-[#3a2118] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 className="text-white text-xl font-semibold">Tes résultats</h2>
      </div>

      {/* Selfie miniature */}
      {selfieUrl && (
        <div className="flex items-center gap-3 bg-[#3a2118] rounded-xl p-3">
          <img src={selfieUrl} alt="Ton selfie" className="w-12 h-12 rounded-xl object-cover"/>
          <p className="text-gray-300 text-sm">Styles recommandés pour toi</p>
        </div>
      )}

      {/* Cartes */}
      {styles.map((style, index) => {
        const imgSrc = style.generatedImage || style.image || `/styles/${style.localImage}`;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#3a2118] rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="relative">
              <img
                src={imgSrc}
                alt={style.name}
                className="w-full h-80 object-cover"
                onError={(e) => { e.target.src = "/styles/napi1.jpg"; }}
              />
              <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold">
                {style.matchScore ? `${style.matchScore}% match` : '+100 vues'}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="text-white text-lg font-semibold">{style.name}</h3>
              <p className="text-sm text-gray-300">
                {style.description || "Style tendance adapté à ton visage"}
              </p>
              <div className="flex gap-2 flex-wrap">
                {(style.tags || ["Moderne", "Chic", "Populaire"]).slice(0,3).map((tag, i) => (
                  <span key={i} className="bg-[#5a3225] text-xs px-3 py-1 rounded-full text-white">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="w-full bg-[#FFC000] text-black py-3 rounded-xl font-semibold mt-2">
                Essayer ce style
              </button>
            </div>
          </motion.div>
        );
      })}

      {/* Nouveau test */}
      <button onClick={() => navigate('/camera')}
        className="w-full py-3 rounded-xl text-sm font-semibold text-[#FFC000] border border-[#FFC000]">
        Nouveau test
      </button>
    </div>
  );
}
