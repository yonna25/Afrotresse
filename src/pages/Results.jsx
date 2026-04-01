import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BRAIDS_DB } from "../services/faceAnalysis.js";
import { getCredits, consumeTransform, consumeCredits, hasCredits, canTransform, addSeenStyleId, PRICING } from "../services/credits.js";

const FACE_SHAPE_TEXTS = {
  oval:    "Ton visage est de forme Ovale. C'est une structure tr\u00e8s \u00e9quilibr\u00e9e qui s'adapte \u00e0 presque tous les styles.",
  round:   "Ton visage est de forme Ronde. Pour allonger et affiner visuellement tes traits, les tresses hautes sont parfaites.",
  square:  "Ton visage est de forme Carr\u00e9e. Les tresses avec du volume adoucissent ta m\u00e2choire.",
  heart:   "Ton visage est en forme de C\u0153ur. Les tresses avec du volume en bas \u00e9quilibrent ton menton.",
  long:    "Ton visage est de forme Longue. Les tresses lat\u00e9rales cr\u00e9ent l'harmonie parfaite.",
  diamond: "Ton visage est de forme Diamant. Les tresses qui encadrent le visage te subliment.",
}

const WAITING_MSGS = [
  "Pr\u00e9paration de ton nouveau look... \u2728",
  "On ajuste la tresse \u00e0 ton visage... \ud83d\udc51",
  "Presque l\u00e0... Pr\u00e9pare-toi \u00e0 briller ! \ud83d\ude0d",
]

const RESULT_MSGS = [
  "Waouh \ud83d\ude0d, tu es splendide !",
  "Regarde cette Reine ! \u2728",
  "Le style parfait pour toi. \ud83d\udc51",
]

// Composant image prot\u00e9g\u00e9 contre le clic droit et le drag
const ProtectedImg = ({ src, alt, className, style, onClick }) => (
  <div className="relative w-full h-full" onClick={onClick}>
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ ...style, userSelect: 'none', WebkitUserSelect: 'none' }}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    />
    {/* Overlay transparent bloquant clic droit et drag */}
    <div
      className="absolute inset-0"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    />
  </div>
);

export default function Results() {
  const navigate = useNavigate();
  const [faceShape, setFaceShape] = useState('oval');
  const [faceShapeName, setFaceShapeName] = useState('');
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [styles, setStyles] = useState([]);
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [resultMsg, setResultMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState("");
  const [credits, setCredits] = useState(0);
  const [waitingMsgIdx, setWaitingMsgIdx] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const [shownIds, setShownIds] = useState([]);
  const [savesCount, setSavesCount] = useState(0);
  const resultRef = useRef(null);
  const errorRef = useRef(null);
  const waitingIntervalRef = useRef(null);

  const userName = localStorage.getItem('afrotresse_user_name') || 'Reine';

  useEffect(() => {
    const raw = sessionStorage.getItem('afrotresse_results');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setFaceShape(parsed.faceShape || 'oval');
        setFaceShapeName(parsed.faceShapeName || '');
        setStyles(parsed.recommendations || []);
      } catch (e) {
        console.error('Error parsing results:', e);
      }
    }
    const photo = sessionStorage.getItem('afrotresse_photo');
    if (photo) setSelfieUrl(photo);
    setCredits(getCredits());
  }, []);

  const displayedStyles = styles.filter(s => !shownIds.includes(s.id)).slice(0, 3);
  const canGenerateMore = styles.filter(s => !shownIds.includes(s.id)).length > 3 || shownIds.length > 0;

  const handleTransform = async (style, globalIndex) => {
    if (!hasCredits() || !canTransform()) {
      navigate('/credits');
      return;
    }

    setErrorMsg("");
    setResultImage(null);
    setLoadingIdx(globalIndex);
    setWaitingMsgIdx(0);
    setResultMsg('');

    let idx = 0;
    waitingIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % WAITING_MSGS.length;
      setWaitingMsgIdx(idx);
    }, 3000);

    try {
      const selfieBase64 = selfieUrl?.split(',')[1] || null;
      const selfieType = selfieUrl?.match(/:(.*?);/)?.[1] || 'image/jpeg';
      const styleKey = style.id?.replace(/-/g, '') || style.id;
      const refImage = `${window.location.origin}/styles/${styleKey}-top.jpg`;

      const res = await fetch('/api/falGenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfieBase64, selfieType, styleImageUrl: refImage, faceShape, styleId: style.id }),
      });

      const data = await res.json();
      clearInterval(waitingIntervalRef.current);

      if (!res.ok) {
        setErrorMsg(data.error || "G\u00e9n\u00e9ration \u00e9chou\u00e9e. R\u00e9essaie.");
        setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        return;
      }

      if (!data.imageUrl) {
        setErrorMsg("La g\u00e9n\u00e9ration a \u00e9chou\u00e9. Aucun cr\u00e9dit d\u00e9bit\u00e9.");
        setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        return;
      }

      consumeTransform();
      addSeenStyleId(style.id);
      setCredits(getCredits());
      setResultImage(data.imageUrl);
      setResultMsg(RESULT_MSGS[Math.floor(Math.random() * RESULT_MSGS.length)]);

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 400);

    } catch (err) {
      clearInterval(waitingIntervalRef.current);
      setErrorMsg("Connexion impossible. R\u00e9essaie.");
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } finally {
      setLoadingIdx(null);
    }
  };

  const handleShare = async (text, url) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AfroTresse', text, url: url || window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Lien copi\u00e9 !");
      }
    } catch (e) {}
  };

  const handleSave = () => {
    const newCount = savesCount + 1;
    setSavesCount(newCount);

    if (newCount % 3 === 0) {
      const debited = consumeCredits(1);
      if (debited) {
        setCredits(getCredits());
        setErrorMsg("\u2705 3 sauvegardes = 1 cr\u00e9dit d\u00e9bit\u00e9!");
      } else {
        setErrorMsg("\u274c Pas assez de cr\u00e9dits pour sauvegarder.");
      }
    } else {
      setErrorMsg(`\ud83d\udcbe Sauvegarde ${newCount % 3}/3 avant d\u00e9duction`);
    }
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleGenerateMore = () => {
    if (!hasCredits()) {
      navigate('/credits');
      return;
    }

    const newShown = [...shownIds, ...displayedStyles.map(s => s.id)];
    setShownIds(newShown);

    consumeCredits(1);
    setCredits(getCredits());

    setErrorMsg("\u2728 Nouveaux styles charg\u00e9s!");

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faceText = FACE_SHAPE_TEXTS[faceShape] || '';

  if (!styles.length) {
    return (
      <div className="min-h-screen bg-[#2C1A0E] flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-4xl mb-4">\ud83d\udc86\ud83c\udffe\u200d\u2640\ufe0f</p>
          <p className="text-white text-xl font-bold mb-2">Quelle tresse aujourd'hui ?</p>
          <p className="text-gray-400 text-sm mb-6">Prends un selfie pour d\u00e9couvrir les styles qui te conviennent.</p>
          <button onClick={() => navigate('/')}
            className="px-6 py-3 rounded-full font-bold text-sm text-[#2C1A0E]"
            style={{ background: 'linear-gradient(135deg, #C9963A, #E8B96A)' }}>
            D\u00e9couvrir ma tresse parfaite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#2C1A0E] text-[#FAF4EC] p-4 sm:p-6 pb-40 relative">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-row gap-5 items-center bg-white/5 p-5 rounded-[2.5rem] border border-white/10"
        style={{ boxShadow: '0 0 40px rgba(201,150,58,0.2)' }}>
        <div className="relative shrink-0">
          {selfieUrl ? (
            <img src={selfieUrl} className="w-20 h-20 rounded-2xl border-2 border-[#C9963A] object-cover" alt="Moi"
              draggable={false} onContextMenu={(e) => e.preventDefault()} />
          ) : (
            <div className="w-20 h-20 rounded-2xl border-2 border-white/10 bg-white/5 flex items-center justify-center text-[10px] text-white/50">Photo</div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-[#C9963A] text-[#2C1A0E] text-[10px] font-black px-2 py-1 rounded-md uppercase">Moi</div>
        </div>
        <div className="flex flex-col flex-1">
          <h1 className="font-bold text-3xl text-[#C9963A]">
            Tes r\u00e9sultats<br/>
            <span className="text-[#FAF4EC]">{userName} \u2728</span>
          </h1>
          <p className="text-[11px] opacity-80 font-body leading-tight mt-1 max-w-xs">{faceText}</p>
        </div>
      </motion.div>

      {/* ERROR / MESSAGE */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div ref={errorRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`mb-4 border rounded-xl p-3 ${errorMsg.includes('\u2705') || errorMsg.includes('\u2728') ? 'bg-green-900/30 border-green-500/50' : 'bg-red-900/30 border-red-500/50'}`}>
            <p className={errorMsg.includes('\u2705') || errorMsg.includes('\u2728') ? 'text-green-200 text-sm' : 'text-red-200 text-sm'}>{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULT */}
      <AnimatePresence>
        {resultImage && (
          <motion.div ref={resultRef}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="mb-6 bg-[#3D2616] rounded-[2.5rem] overflow-hidden border-2 border-[#C9963A]"
            style={{ boxShadow: '0 0 40px rgba(201,150,58,0.2)' }}>
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-[#C9963A] font-bold text-xl">{resultMsg || "Magnifique !"}</h3>
              <p className="text-[11px] mt-1 opacity-70">Ce style te met vraiment en valeur. Montre-le \u00e0 ta coiffeuse !</p>
            </div>
            {/* Image r\u00e9sultat prot\u00e9g\u00e9e */}
            <div className="relative select-none" onContextMenu={(e) => e.preventDefault()}>
              <img src={resultImage} alt="R\u00e9sultat" className="w-full object-cover"
                draggable={false} onContextMenu={(e) => e.preventDefault()}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }} />
              <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
            </div>
            <div className="p-5 space-y-2">
              <button onClick={() => handleShare("Regarde le style que j'ai choisi avec AfroTresse !", resultImage)}
                className="w-full py-4 rounded-2xl font-bold text-base shadow-xl text-[#2C1A0E]"
                style={{ background: 'linear-gradient(135deg, #C9963A, #E8B96A)' }}>
                Envoyer \u00e0 ma coiffeuse
              </button>
              <button onClick={() => setResultImage(null)}
                className="w-full py-3 rounded-2xl text-sm font-semibold bg-white/10 text-white/70 border border-white/10">
                Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STYLES */}
      <div className="flex flex-col gap-8">
        {displayedStyles.map((style, index) => {

          const styleKey = style.id?.replace(/-/g, '') || style.id;
          const faceImg = style.views?.face || `/styles/${styleKey}-face.jpg`;
          const backImg = style.views?.back || `/styles/${styleKey}-back.jpg`;
          const topImg = style.views?.top || `/styles/${styleKey}-top.jpg`;
          const isLoading = loadingIdx === index;

          return (
            <motion.div key={style.id || index}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#3D2616] rounded-[2.5rem] overflow-hidden border border-[#C9963A]/20 shadow-2xl">

              <div className="grid grid-cols-3 gap-0.5 h-72 bg-black/40">
                <div className="col-span-2 h-full overflow-hidden">
                  <ProtectedImg src={faceImg} alt={style.name} className="w-full h-full object-cover object-top" onClick={() => setZoomImage(faceImg)} />
                </div>
                <div className="col-span-1 grid grid-rows-2 gap-0.5">
                  <div className="overflow-hidden">
                    <ProtectedImg src={backImg} alt="dos" className="w-full h-full object-cover" onClick={() => setZoomImage(backImg)} />
                  </div>
                  <div className="overflow-hidden">
                    <ProtectedImg src={topImg} alt="dessus" className="w-full h-full object-cover" onClick={() => setZoomImage(topImg)} />
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 flex gap-5 text-[10px] font-black uppercase tracking-widest text-[#C9963A]/80 border-b border-white/5">
                <span>\ud83d\udc41\ufe0f 2.4K vues</span>
                <span>\u2764\ufe0f 892 likes</span>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl">{style.name}</h3>
                  <span className="text-[10px] bg-[#C9963A] text-[#2C1A0E] px-2.5 py-1 rounded-md font-black uppercase">{style.duration || "3-5h"}</span>
                </div>
                <p className="text-[11px] opacity-70 mb-6 font-body leading
