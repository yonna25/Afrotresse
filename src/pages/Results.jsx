import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getCredits, consumeTransform, hasCredits, canTransform, addSeenStyleId } from "../services/credits.js";
import OptimizedImage from "../components/OptimizedImage.jsx";

/* ───────────────────────────── DATA ───────────────────────────── */

const FACE_SHAPE_TEXTS = {
  oval: "Ton visage est de forme Ovale. C'est une structure très équilibrée qui s'adapte à presque tous les styles.",
  round: "Ton visage est de forme Ronde. Pour allonger et affiner visuellement tes traits, les tresses hautes sont parfaites.",
  square: "Ton visage est de forme Carrée. Les tresses avec du volume adoucissent ta mâchoire.",
  heart: "Ton visage est en forme de Cœur. Les tresses avec du volume en bas équilibrent ton menton.",
  long: "Ton visage est de forme Longue. Les tresses latérales créent l'harmonie parfaite.",
  diamond: "Ton visage est de forme Diamant. Les tresses qui encadrent le visage te subliment.",
};

const WAITING_MSGS = [
  "Préparation de ton nouveau look... ✨",
  "On ajuste la tresse à ton visage... 👑",
  "Presque là... Prépare-toi à briller ! 😍",
];

const RESULT_MSGS = [
  "Waouh 😍, tu es splendide !",
  "Regarde cette Reine ! ✨",
  "Le style parfait pour toi. 👑",
];

const STYLES_PER_PAGE = 3;

/* ───────────────────────────── COMPONENT ───────────────────────────── */

export default function Results() {
  const navigate = useNavigate();

  /* ── STATES EXISTANTS ── */
  const [faceShape, setFaceShape] = useState("oval");
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [styles, setStyles] = useState([]);

  const [loadingIdx, setLoadingIdx] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [resultMsg, setResultMsg] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [credits, setCredits] = useState(0);

  const [waitingMsgIdx, setWaitingMsgIdx] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);

  const [savesCount, setSavesCount] = useState(0);

  const resultRef = useRef(null);
  const errorRef = useRef(null);
  const waitingIntervalRef = useRef(null);
  const topRef = useRef(null);

  const userName = localStorage.getItem("afrotresse_user_name") || "Reine";

  /* ── ACCORDÉON SAVE (CORRECTION DEMANDÉE) ── */
  const [saveEmail, setSaveEmail] = useState(
    () => localStorage.getItem("afrotresse_email") || ""
  );

  const [saveDone, setSaveDone] = useState(
    () => !!localStorage.getItem("afrotresse_email")
  );

  const [saveOpen, setSaveOpen] = useState(false); // 🔥 fermé par défaut

  /* ───────────────────────────── INIT ───────────────────────────── */

  useEffect(() => {
    const raw = sessionStorage.getItem("afrotresse_results");

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setFaceShape(parsed.faceShape || "oval");
        setStyles(parsed.recommendations || []);
      } catch (e) {
        console.error(e);
      }
    }

    const photo = sessionStorage.getItem("afrotresse_photo");
    if (photo) setSelfieUrl(photo);

    setCredits(getCredits());
  }, []);

  /* ───────────────────────────── SAVE PROFILE ───────────────────────────── */

  const handleSaveProfile = () => {
    if (!saveEmail.trim()) return;

    localStorage.setItem("afrotresse_email", saveEmail.trim());
    setSaveDone(true);
    setSaveOpen(false);
  };

  /* ───────────────────────────── UI ───────────────────────────── */

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-[#FAF4EC] p-6">

      {/* MESSAGE WARNING */}
      <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-white/70 uppercase tracking-widest mb-1">
          ⚠️
        </p>
        <p className="text-sm text-white/70">
          Tes résultats ne sont pas sauvegardés. Ajoute tes styles en favoris pour les conserver, ou sauvegarde ton compte ci-dessous.
        </p>
      </div>

      {/* ACCORDÉON */}
      <div className="rounded-2xl border border-[#C9963A]/30 overflow-hidden">

        {/* HEADER (toujours visible) */}
        <button
          onClick={() => setSaveOpen(prev => !prev)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#2C1A0E] to-[#3D2616]"
        >
          <div className="text-left">
            <p className="font-black text-sm text-[#C9963A]">
              Sauvegarder mes résultats ✨
            </p>
            <p className="text-xs text-white/50">
              Retrouve tes favoris sur n'importe quel appareil.
            </p>
          </div>

          <span className="text-white/60 text-xl">
            {saveOpen ? "▴" : "▾"}
          </span>
        </button>

        {/* CONTENT (FERMÉ PAR DÉFAUT) */}
        <AnimatePresence>
          {saveOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-[#1A0800]"
            >

              <input
                type="email"
                placeholder="Ton email..."
                value={saveEmail}
                onChange={(e) => setSaveEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm mb-3 outline-none"
                style={{
                  background: "rgba(92,51,23,0.55)",
                  border: "1px solid rgba(201,150,58,0.3)",
                  color: "#FAF4EC",
                }}
              />

              <button
                onClick={handleSaveProfile}
                className="w-full py-3 rounded-xl font-black text-sm text-[#2C1A0E]"
                style={{
                  background: "linear-gradient(135deg, #C9963A, #E8B96A)",
                }}
              >
                Sauvegarder mes résultats ✨
              </button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
