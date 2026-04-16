import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Results() {
  const [saveEmail, setSaveEmail] = useState("");
  const [saveDone, setSaveDone] = useState(false);
  const [savedUserName, setSavedUserName] = useState("");

  // sauvegarde
  const handleSaveProfile = () => {
    if (!saveEmail.trim()) return;

    const name = saveEmail.split("@")[0];

    localStorage.setItem("afrotresse_email", saveEmail);
    localStorage.setItem("afrotresse_user_name", name);

    setSavedUserName(name);
    setSaveDone(true);
  };

  return (
    <div className="min-h-screen bg-[#2C1A0E] text-white p-4">

      {/* ── ALERTE (VISIBLE UNIQUEMENT SI PAS SAUVEGARDÉ) ── */}
      {!saveDone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 rounded-2xl flex items-start gap-3"
          style={{
            background: "rgba(201,150,58,0.08)",
            border: "1px solid rgba(201,150,58,0.25)"
          }}
        >
          <span className="text-lg mt-0.5">⚠️</span>
          <p className="text-[11px] text-white/60">
            <span className="text-[#C9963A] font-bold">
              Tes résultats ne sont pas sauvegardés.
            </span>{" "}
            Ajoute tes styles en favoris ou sauvegarde ton compte.
          </p>
        </motion.div>
      )}

      {/* ── MESSAGE SUCCÈS (VISIBLE APRÈS SAUVEGARDE) ── */}
      {saveDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 px-4 py-3 rounded-2xl bg-green-900/20 border border-green-500/30"
        >
          <p className="text-[12px] text-green-200 font-semibold">
            Résultats sauvegardés pour{" "}
            <span className="text-white font-black">
              {savedUserName}
            </span>{" "}
            !
          </p>
        </motion.div>
      )}

      {/* ── FORMULAIRE SAUVEGARDE ── */}
      {!saveDone && (
        <div className="p-4 rounded-2xl bg-[#3D2616] border border-[#C9963A]">
          <input
            type="email"
            placeholder="Ton email"
            value={saveEmail}
            onChange={(e) => setSaveEmail(e.target.value)}
            className="w-full p-3 rounded-xl text-black mb-3"
          />

          <button
            onClick={handleSaveProfile}
            className="w-full py-3 rounded-xl font-black text-[#2C1A0E]"
            style={{
              background: "linear-gradient(135deg, #C9963A, #E8B96A)"
            }}
          >
            Sauvegarder mes résultats
          </button>
        </div>
      )}

    </div>
  );
}
