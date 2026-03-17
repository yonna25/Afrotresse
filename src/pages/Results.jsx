import { useState } from "react";
import { motion } from "framer-motion";
import { fal } from "@fal-ai/client";
import stylesData from "./stylesData.json";

async function generateHairstyle(selfieFile, styleImageUrl) {
  const selfieUrl = await fal.storage.upload(selfieFile);
  const result = await fal.subscribe("fal-ai/image-apps-v2/hair-change", {
    input: {
      image_url: selfieUrl,
      reference_image_url: styleImageUrl,
    },
  });
  return result.data.image.url;
}

export default function Results({ styles = [], selfieFile = null }) {
  const finalStyles = styles.length ? styles : stylesData;
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [resultImage, setResultImage]   = useState(null);
  const [errorMsg, setErrorMsg]         = useState("");

  const handleTryStyle = async (style, index) => {
    if (!selfieFile) {
      setErrorMsg("Prends d'abord un selfie pour essayer ce style.");
      return;
    }
    setErrorMsg("");
    setResultImage(null);
    setLoadingIndex(index);

    try {
      const styleImageUrl = `${window.location.origin}/styles/${style.localImage}`;
      const generated = await generateHairstyle(selfieFile, styleImageUrl);
      setResultImage(generated);
    } catch (err) {
      console.error("Fal.ai error:", err);
      setErrorMsg("La generation a echoue. Reessaie.");
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6 bg-[#2b1810] min-h-screen">
      <h2 className="text-white text-xl font-semibold">Tes resultats</h2>

      {/* Alerte si pas de selfie */}
      {errorMsg && (
        <div className="bg-red-900 border border-red-500 text-red-200 text-sm px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Cartes de styles */}
      {finalStyles.map((style, index) => {
        const imgSrc = style.generatedImage
          ? style.generatedImage
          : `/styles/${style.localImage}`;

        const isLoading = loadingIndex === index;

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
                +100 vues
              </div>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="text-white text-lg font-semibold">{style.name}</h3>

              <p className="text-sm text-gray-300">
                {style.description || "Style tendance adapte a ton visage"}
              </p>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {(style.tags || ["Moderne", "Chic", "Populaire"]).map((tag, i) => (
                  <span key={i} className="bg-[#5a3225] text-xs px-3 py-1 rounded-full text-white">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bouton Fal.ai */}
              <button
                onClick={() => handleTryStyle(style, index)}
                disabled={isLoading || loadingIndex !== null}
                className="w-full py-3 rounded-xl font-semibold text-black mt-2 transition-opacity"
                style={{
                  background: isLoading ? "#a08000" : "#FFC000",
                  opacity: (loadingIndex !== null && !isLoading) ? 0.5 : 1,
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Transformation...
                  </span>
                ) : "Essayer ce style"}
              </button>
            </div>
          </motion.div>
        );
      })}

      {/* Resultat Fal.ai */}
      {resultImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#3a2118] rounded-2xl overflow-hidden shadow-xl border border-yellow-500"
        >
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-yellow-400 font-semibold text-lg">Ton essai virtuel</h3>
            <p className="text-gray-400 text-sm">Voici a quoi tu ressemblerais avec ce style</p>
          </div>
          <img
            src={resultImage}
            alt="Essai virtuel"
            className="w-full object-cover"
          />
          <div className="p-4">
            <button
              onClick={() => setResultImage(null)}
              className="w-full py-2 rounded-xl text-sm text-gray-400 border border-gray-600"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
