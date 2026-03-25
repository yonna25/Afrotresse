import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getCredits, hasCredits, useOneTest, PRICING } from "../services/credits.js";

const FACE_SHAPE_TEXTS = {
  oval:    "Ton visage est de forme Ovale. Structure equilibree qui s'adapte a presque tous les styles.",
  round:   "Ton visage est de forme Ronde. Les tresses hautes allongent et affinent tes traits.",
  square:  "Ton visage est de forme Carree. Les tresses avec du volume adoucissent ta machoire.",
  heart:   "Ton visage est en forme de Coeur. Les tresses avec du volume en bas equilibrent ton menton.",
  long:    "Ton visage est de forme Longue. Les tresses laterales creent l'harmonie parfaite.",
  diamond: "Ton visage est de forme Diamant. Les tresses qui encadrent le visage te subliment.",
}

const WAITING_MSGS = [
  "Preparation de ton nouveau look... \u2728",
  "On ajuste la tresse a ton visage... \ud83d\udc51",
  "Presque la... Prepare-toi a briller ! \ud83d\ude0d",
]

const RESULT_MSGS = [
  "Waouh \ud83d\ude0d, tu es splendide !",
  "Regarde cette Reine ! \u2728",
  "Le style parfait pour toi. \ud83d\udc51",
]

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Results() {
  const navigate = useNavigate();
  const [styles, setStyles]               = useState([]);
  const [shuffledStyles, setShuffledStyles] = useState([]);
  const [page, setPage]                   = useState(0);
  const [faceShape, setFaceShape]         = useState('oval');
  const [faceShapeName, setFaceShapeName] = useState('');
  const [selfieUrl, setSelfieUrl]         = useState(null);
  const [loadingIdx, setLoadingIdx]       = useState(null);
  const [resultImage, setResultImage]     = useState(null);
  const [errorMsg, setErrorMsg]           = useState("");
  const [credits, setCredits]             = useState(0);
  const [waitingMsgIdx, setWaitingMsgIdx] = useState(0);
  const [resultMsg, setResultMsg]         = useState('');
  const [zoomImage, setZoomImage]         = useState(null);
  const resultRef                         = useRef(null);
  const waitingIntervalRef                = useRef(null);

  const userName = localStorage.getItem('afrotresse_user_name') || 'Reine';

  useEffect(() => {
    const raw = sessionStorage.getItem('afrotresse_results');
    if (raw) {
      const parsed = JSON.parse(raw);
      const recs = parsed.recommendations || [];
      setStyles(recs);
      setShuffledStyles(shuffleArray(recs));
      setFaceShape(parsed.faceShape || 'oval');
      setFaceShapeName(parsed.faceShapeName || '');
    }
    const photo = sessionStorage.getItem('afrotresse_photo');
    if (photo) setSelfieUrl(photo);
    setCredits(getCredits());
  }, []);

  const hasPaidCredits = () => getCredits() > (PRICING.freeTests || 2)

  const handleTransform = async (style, index) => {
    if (!hasCredits()) { navigate('/credits'); return; }
    if (!hasPaidCredits()) { navigate('/credits'); return; }

    setErrorMsg("");
    setResultImage(null);
    setLoadingIdx(index);
    setWaitingMsgIdx(0);
    setResultMsg('');

    let idx = 0;
    waitingIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % 3;
      setWaitingMsgIdx(idx);
    }, 3000);

    try {
      const selfieBase64 = selfieUrl?.split(',')[1] || null;
      const selfieType   = selfieUrl?.match(/:(.*?);/)?.[1] || 'image/jpeg';

      // Image de reference = vue de dos du style (sans visage)
      const styleKey = style.id?.replace(/-/g, '') || style.id
      const refImage = `${window.location.origin}/styles/${styleKey}-back.jpg`

      const res = await fetch('/api/falGenerate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfieBase64,
          selfieType,
          styleImageUrl: refImage,
          faceShape,
          styleId: style.id,
          paid: true,
        }),
      });

      const data = await res.json();
      clearInterval(waitingIntervalRef.current);

      if (res.status === 429) { setErrorMsg(data.error); return; }
      if (!res.ok) { setErrorMsg(data.error || "Generation echouee. Reessaie."); return; }

      // Deduire credit APRES reception
      useOneTest();
      setCredits(getCredits());
      setResultImage(data.imageUrl);
      setResultMsg(RESULT_MSGS[Math.floor(Math.random() * RESULT_MSGS.length)]);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      clearInterval(waitingIntervalRef.current);
      console.error(err);
      setErrorMsg("Connexion impossible. Reessaie.");
    } finally {
      setLoadingIdx(null);
    }
  };

  const handleShare = async (text, url) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AfroTresse', text, url: url || window.location.href })
      } else {
        await navigator.clipboard.writeText(text)
      }
    } catch (e) {}
  }

  const faceText = FACE_SHAPE_TEXTS[faceShape] || ''

  if (!shuffledStyles.length) return (
    <div className="min-h-screen bg-[#2b1810] flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-4xl mb-4">💆🏾‍♀️</p>
        <p className="text-white text-xl font-display font-semibold mb-2">Quelle tresse aujourd'hui ?</p>
        <p className="text-gray-400 text-sm mb-6">Prends un selfie pour decouvrir les styles qui sublimeront ton visage.</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full font-semibold text-sm"
          style={{ background: '#FFC000', color: '#000' }}>
          Decouvrir ma tresse parfaite
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#2b1810] pb-28 text-[#FAF4EC]">

      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-[#3a2118] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h2 className="text-white text-xl font-semibold">Ta selection sur-mesure</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(232,185,106,0.7)" }}>Les styles qui sublimeront tes traits.</p>
          </div>
        </div>
        <button onClick={() => navigate('/credits')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background:'rgba(255,192,0,0.15)', border:'1px solid rgba(255,192,0,0.3)' }}>
          <span className="text-yellow-400 font-bold text-sm">{credits}</span>
          <span className="text-gray-400 text-xs">credit{credits > 1 ? 's' : ''}</span>
        </button>
      </div>

      {/* Selfie + analyse */}
      {selfieUrl && (
        <div className="mx-4 bg-[#3a2118] rounded-2xl p-4 mb-4"
          style={{ border: '1px solid rgba(201,150,58,0.2)' }}>
          <div className="flex items-center gap-3 mb-3">
            <img src={selfieUrl} alt="Selfie" className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              style={{ border: '2px solid rgba(201,150,58,0.4)' }}/>
            <div>
              <p className="text-white font-semibold text-base">
                {"Pr\u00eate pour ton look,"}  {userName} ✨
              </p>
              {faceShapeName && (
                <p className="text-xs mt-0.5" style={{ color: '#C9963A' }}>
                  Visage {faceShapeName}
                </p>
              )}
            </div>
          </div>
          {faceText && (
            <div className="rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(201,150,58,0.08)', border: '1px solid rgba(201,150,58,0.2)' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#FAF4EC' }}>{faceText}</p>
            </div>
          )}
        </div>
      )}

      {/* Erreur */}
      {errorMsg && (
        <div className="mx-4 mb-4 bg-red-900 border border-red-500 text-red-200 text-sm px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Banniere freemium */}
      {!hasPaidCredits() && hasCredits() && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-2xl p-4 text-center"
          style={{ background: 'linear-gradient(135deg, #3a2118, #5a3225)', border: '1px solid rgba(255,192,0,0.3)' }}>
          <p className="text-yellow-400 font-bold text-base">Ne prends plus de risques avant d'aller au salon</p>
          <p className="text-gray-300 text-sm mt-1">Achete un pack pour voir ce style sur TON visage.</p>
          <button onClick={() => navigate('/credits')}
            className="mt-3 px-5 py-2 rounded-full text-sm font-semibold text-black"
            style={{ background: '#FFC000' }}>
            Obtenir des credits
          </button>
        </motion.div>
      )}

      {/* Resultat Fal.ai */}
      <AnimatePresence>
        {resultImage && (
          <motion.div ref={resultRef}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="mx-4 mb-4 bg-[#3a2118] rounded-2xl overflow-hidden border-2 border-yellow-400">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-yellow-400 font-bold text-xl">{resultMsg || 'Magnifique !'}</h3>
              <p className="text-sm mt-1" style={{ color: '#FAF4EC' }}>
                Ce style te met vraiment en valeur. Montre-le a ta coiffeuse !
              </p>
            </div>
            <img src={resultImage} alt="Resultat" className="w-full object-cover"/>
            <div className="p-4 space-y-2">
              <button
                onClick={() => handleShare("Regarde le style que j'ai choisi !", resultImage)}
                className="w-full py-3 rounded-xl text-sm font-bold"
                style={{ background: '#FFC000', color: '#000' }}>
                Envoyer a ma coiffeuse
              </button>
              <button onClick={() => setResultImage(null)}
                className="w-full py-2 rounded-xl text-sm text-gray-400 border border-gray-600">
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Labels */}
      {page === 0 && (
        <div className="flex gap-2 px-4 mb-3">
          {['Le Choix Ideal', 'Le Style Structurant', 'La Tendance'].map((label, i) => (
            <div key={i} className="flex-1 text-center py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(201,150,58,0.1)', color: '#C9963A', border: '1px solid rgba(201,150,58,0.2)' }}>
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Cartes styles */}
      <div className="px-4 space-y-5">
        {shuffledStyles.slice(page * 3, page * 3 + 3).map((style, index) => {
          const styleKey = style.id?.replace(/-/g, '') || style.id
          const faceImg  = style.views?.face  || style.image || `/styles/${styleKey}-face.jpg`
          const backImg  = style.views?.back  || `/styles/${styleKey}-back.jpg`
          const topImg   = style.views?.top   || `/styles/${styleKey}-top.jpg`
          const isLoading = loadingIdx === index;

          return (
            <motion.div key={style.id || index}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#3a2118] rounded-2xl shadow-lg overflow-hidden">

              {/* Grid 3 photos */}
              <div className="grid grid-cols-3 gap-0.5 h-64 bg-black/40">
                <div className="col-span-2 overflow-hidden cursor-pointer"
                  onClick={() => setZoomImage(faceImg)}>
                  <img src={faceImg} alt={style.name} className="w-full h-full object-cover object-top"
                    onError={e => { e.target.src = '/styles/napi1.jpg' }}/>
                </div>
                <div className="col-span-1 grid grid-rows-2 gap-0.5">
                  <div className="overflow-hidden cursor-pointer" onClick={() => setZoomImage(backImg)}>
                    <img src={backImg} alt="dos" className="w-full h-full object-cover"
                      onError={e => { e.target.style.background = '#2C1A0E' }}/>
                  </div>
                  <div className="overflow-hidden cursor-pointer" onClick={() => setZoomImage(topImg)}>
                    <img src={topImg} alt="dessus" className="w-full h-full object-cover"
                      onError={e => { e.target.style.background = '#2C1A0E' }}/>
                  </div>
                </div>

                {/* Badge match */}
                <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold">
                  {style.matchScore ? `${style.matchScore}% match` : '+100 vues'}
                </div>

                {/* Cadenas si credits gratuits */}
                {!hasPaidCredits() && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}>
                    <div className="text-center">
                      <p className="text-3xl">🔒</p>
                      <p className="text-white text-xs font-semibold mt-1">Essai virtuel</p>
                      <p className="text-yellow-400 text-xs">2 credits</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-white text-lg font-semibold">{style.name}</h3>
                <p className="text-sm text-gray-300">{style.description || "Style tendance adapte a ton visage"}</p>
                <div className="flex gap-2 flex-wrap">
                  {(style.tags || ["Moderne", "Chic", "Populaire"]).slice(0,3).map((tag, i) => (
                    <span key={i} className="bg-[#5a3225] text-xs px-3 py-1 rounded-full text-white">{tag}</span>
                  ))}
                </div>

                {/* Message incitatif */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background:'rgba(201,150,58,0.15)', border:'2px solid rgba(201,150,58,0.4)' }}>
                  <span className="text-xl">🪞</span>
                  <p className="font-semibold text-sm" style={{ color:'#FAF4EC' }}>
                    {hasPaidCredits()
                      ? "Imagine-toi avec cette tresse... Visualise le rendu avant d'aller au salon !"
                      : "Tes credits gratuits sont pour decouvrir. Achete un pack pour te voir transformee !"}
                  </p>
                </div>

                {/* Bouton Me transformer → FAL AI */}
                <button
                  onClick={() => handleTransform(style, index)}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{ background: '#FFC000', color: '#000', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {WAITING_MSGS[waitingMsgIdx]}
                    </span>
                  ) : !hasCredits()
                    ? "Plus de credits"
                    : hasPaidCredits()
                    ? "Me transformer \u2728"
                    : "\ud83d\udd12 Essayer sur moi"
                  }
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-4 mt-6">
        <button onClick={() => navigate('/camera')}
          className="flex-1 py-3 rounded-xl text-sm font-semibold"
          style={{ border:'1px solid rgba(255,192,0,0.3)', color:'#FFC000', background:'rgba(255,192,0,0.05)' }}>
          Nouveau selfie
        </button>
        {shuffledStyles.length > (page + 1) * 3 && (
          <button
            onClick={() => { setPage(p => p + 1); setResultImage(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: '#FFC000', color: '#000' }}>
            3 styles suivants
          </button>
        )}
        {page > 0 && shuffledStyles.length <= (page + 1) * 3 && (
          <button
            onClick={() => { setPage(0); setResultImage(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ border:'1px solid rgba(255,192,0,0.3)', color:'#FFC000' }}>
            Revoir les premiers
          </button>
        )}
      </div>

      {/* Lightbox zoom */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl"
            onClick={() => setZoomImage(null)}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              src={zoomImage}
              className="max-w-full max-h-[70vh] rounded-3xl shadow-2xl object-contain"
              onClick={e => e.stopPropagation()}/>
            <button onClick={() => setZoomImage(null)}
              className="mt-6 px-8 py-4 bg-white/10 text-white rounded-2xl font-bold">
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
