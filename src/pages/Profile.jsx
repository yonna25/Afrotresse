import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getCredits, addCredits, PRICING } from "../services/credits.js";

const getAiTrials = () => parseInt(localStorage.getItem("afrotresse_ai_trials") || "0", 10);
const getReferralCode = () => {
  let code = localStorage.getItem("afrotresse_referral_code");
  if (!code) {
    code = "AFR-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    localStorage.setItem("afrotresse_referral_code", code);
  }
  return code;
};
const getReferralCount = () => parseInt(localStorage.getItem("afrotresse_referral_count") || "0", 10);
const getReviewDone = () => localStorage.getItem("afrotresse_review_done") === "true";

export default function Profile() {
  const navigate = useNavigate();

  const [credits, setCredits] = useState(0);
  const [userName, setUserName] = useState("Ma Reine");
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [aiTrials, setAiTrials] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [reviewDone, setReviewDone] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showReferralInfo, setShowReferralInfo] = useState(false);

  useEffect(() => {
    setCredits(getCredits());
    setAiTrials(getAiTrials());
    setReferralCode(getReferralCode());
    setReferralCount(getReferralCount());
    setReviewDone(getReviewDone());

    const savedName = localStorage.getItem("afrotresse_user_name");
    if (savedName) setUserName(savedName);

    const photo = sessionStorage.getItem("afrotresse_photo");
    if (photo) setSelfieUrl(photo);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleShare = async () => {
    const referralLink = window.location.origin + "?ref=" + referralCode;
    const text = "Decouvre AfroTresse — l'IA qui trouve tes tresses parfaites en 10 secondes ! Utilise mon code " + referralCode + " et recois " + (PRICING.referral?.receiver || 2) + " credits offerts\n" + referralLink;
    try {
      if (navigator.share) {
        await navigator.share({ title: "AfroTresse", text, url: referralLink });
      } else {
        await navigator.clipboard.writeText(text);
        showToast("Lien copi\u00e9 !");
      }
    } catch (e) {}
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      showToast("Code copi\u00e9 !");
    } catch (e) {
      showToast("Code : " + referralCode);
    }
  };

  const handleReview = () => {
    if (reviewDone) {
      showToast("Avis d\u00e9j\u00e0 donn\u00e9 — merci !");
      return;
    }
    window.open("https://afrotresse.com", "_blank");
    setTimeout(() => {
      addCredits(PRICING.reviewBonus || 1);
      setCredits(getCredits());
      localStorage.setItem("afrotresse_review_done", "true");
      setReviewDone(true);
      showToast("Merci ! +" + (PRICING.reviewBonus || 1) + " cr\u00e9dit offert");
    }, 2000);
  };

  const creditsGagnes = referralCount * (PRICING.referral?.sender || 2);

  return (
    <div className="min-h-screen bg-[#1a0f0a] text-white flex flex-col items-center pb-32 relative">

      {/* TOAST */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[300] bg-[#C9963A] text-[#1a0f0a] px-5 py-3 rounded-2xl font-black text-sm shadow-2xl"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <div className="w-full relative">
        <div className="h-48 w-full" style={{ background: "linear-gradient(160deg, #3D2616 0%, #1a0f0a 100%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-[#C9963A] overflow-hidden bg-[#2a1a14] shadow-2xl">
              {selfieUrl ? (
                <img src={selfieUrl} className="w-full h-full object-cover" alt="Profil"
                  draggable={false} onContextMenu={e => e.preventDefault()} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">{"👑"}</div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#C9963A] w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#1a0f0a] shadow-lg">
              <span className="text-sm">{"👑"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRENOM */}
      <div className="mt-16 flex flex-col items-center px-5 w-full">
        <h1 className="text-2xl font-black uppercase tracking-tight">{userName}</h1>
        <p className="text-[11px] text-[#C9963A] font-medium tracking-[0.2em] uppercase opacity-80 mt-0.5">
          Votre Majest\u00e9
        </p>
      </div>

      {/* STATS — 3 blocs séparés, même largeur que les boutons */}
      <div className="w-full max-w-sm mt-6 px-5 flex flex-col gap-2">

        {/* Crédits */}
        <motion.div
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/credits")}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer"
          style={{ background: "linear-gradient(135deg, #C9963A22, #C9963A11)", border: "1px solid rgba(201,150,58,0.35)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9963A]/20 flex items-center justify-center">
              <span className="text-base">{"💳"}</span>
            </div>
            <p className="font-black text-sm text-white">Cr\u00e9dits</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#C9963A]">{credits}</span>
            <p className="text-[9px] text-white/30 uppercase tracking-wider">solde</p>
          </div>
        </motion.div>

        {/* Styles */}
        <div
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-base">{"✨"}</span>
            </div>
            <p className="font-black text-sm text-white">Styles</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#C9963A]">{aiTrials}</span>
            <p className="text-[9px] text-white/30 uppercase tracking-wider">essais</p>
          </div>
        </div>

        {/* Gagnes */}
        <div
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-base">{"🎁"}</span>
            </div>
            <p className="font-black text-sm text-white">Gagn\u00e9s</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#C9963A]">{creditsGagnes}</span>
            <p className="text-[9px] text-white/30 uppercase tracking-wider">cr\u00e9dits</p>
          </div>
        </div>

      </div>

      {/* ACTIONS */}
      <div className="w-full max-w-sm px-5 mt-4 flex flex-col gap-3">

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/credits")}
          className="w-full py-4 rounded-2xl font-black text-base text-[#1a0f0a] flex items-center justify-between px-5 shadow-xl"
          style={{ background: "linear-gradient(135deg, #C9963A, #E8B96A)" }}
        >
          <span>{"💳 Recharger mes cr\u00e9dits"}</span>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/camera")}
          className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-between px-5 bg-white/5 border border-white/10"
        >
          <span>{"📸 Nouveau selfie"}</span>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/results")}
          className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-between px-5 bg-white/5 border border-white/10"
        >
          <span>{"✨ Voir mes r\u00e9sultats"}</span>
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.button>

      </div>

      {/* PARRAINAGE */}
      <div className="w-full max-w-sm px-5 mt-4">
        <motion.div
          className="rounded-3xl overflow-hidden border border-[#C9963A]/30"
          style={{ background: "linear-gradient(160deg, #2a1a10, #1a0f0a)" }}
        >
          <button
            onClick={() => setShowReferralInfo(!showReferralInfo)}
            className="w-full p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C9963A]/20 flex items-center justify-center text-xl">{"🎁"}</div>
              <div className="text-left">
                <p className="font-black text-sm">Parrainage</p>
                <p className="text-[10px] text-[#C9963A] font-bold">
                  {referralCount} filleule{referralCount > 1 ? "s" : ""} &middot; +{referralCount * (PRICING.referral?.sender || 2)} cr\u00e9dits gagn\u00e9s
                </p>
              </div>
            </div>
            <motion.div animate={{ rotate: showReferralInfo ? 90 : 0 }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.div>
          </button>

          <AnimatePresence>
            {showReferralInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 flex flex-col gap-3">
                  <div className="bg-white/5 rounded-2xl p-3 text-[11px] text-white/60 leading-relaxed">
                    Partage ton code \u00e0 une amie. Elle re\u00e7oit{" "}
                    <span className="text-[#C9963A] font-bold">+{PRICING.referral?.receiver || 2} cr\u00e9dits</span>, et toi{" "}
                    <span className="text-[#C9963A] font-bold">+{PRICING.referral?.sender || 2} cr\u00e9dits</span> d\u00e8s qu'elle s'inscrit.
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/10 border border-[#C9963A]/40 rounded-xl px-4 py-3 font-black text-[#C9963A] tracking-widest text-center text-sm">
                      {referralCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="w-12 h-12 rounded-xl bg-[#C9963A]/20 border border-[#C9963A]/40 flex items-center justify-center text-lg active:scale-95 transition-all"
                    >
                      {"📋"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
                    <div>
                      <p className="text-xs font-black text-white">Filleules</p>
                      <p className="text-[10px] text-white/40">Amies parrrain\u00e9es</p>
                    </div>
                    <p className="text-2xl font-black text-[#C9963A]">{referralCount}</p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleShare}
                    className="w-full py-3.5 rounded-2xl font-black text-sm text-[#1a0f0a]"
                    style={{ background: "linear-gradient(135deg, #C9963A, #E8B96A)" }}
                  >
                    Inviter une amie
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* AVIS */}
      <div className="w-full max-w-sm px-5 mt-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleReview}
          className={"w-full rounded-3xl p-5 flex items-center justify-between border transition-all " + (
            reviewDone ? "bg-white/5 border-white/10 opacity-50" : "border-[#C9963A]/30 bg-[#2a1a10]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C9963A]/20 flex items-center justify-center text-xl">
              {reviewDone ? "✅" : "⭐"}
            </div>
            <div className="text-left">
              <p className="font-black text-sm">
                {reviewDone ? "Avis donn\u00e9 — merci !" : "Laisser un avis"}
              </p>
              <p className="text-[10px] text-[#C9963A] font-bold">
                {reviewDone ? "Cr\u00e9dit offert" : "+" + (PRICING.reviewBonus || 1) + " cr\u00e9dit offert"}
              </p>
            </div>
          </div>
          {!reviewDone && (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* LEGALES */}
      <div className="mt-10 pb-4 flex flex-col items-center gap-2 opacity-30">
        <div className="flex gap-4 text-[9px] font-medium uppercase tracking-tighter">
          <button onClick={() => navigate("/privacy-policy")}>Mentions L\u00e9gales</button>
          <span>•</span>
          <button onClick={() => navigate("/terms-of-service")}>CGU</button>
          <span>•</span>
          <button onClick={() => navigate("/cookie-policy")}>Confidentialit\u00e9</button>
        </div>
        <p className="text-[8px]">© 2026 AfroTresse — Tous droits r\u00e9serv\u00e9s</p>
      </div>

    </div>
  );
}
