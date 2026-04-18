// ─────────────────────────────────────────────────────────────────────────────
// useFavorites.js — AfroTresse
// Source unique de vérité pour les favoris (invitée + enregistrée)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

// ── Constantes ────────────────────────────────────────────────────────────────
const GUEST_KEY    = "afrotresse_favorites_guest";
const EVENT_NAME   = "afrotresse:favorites-updated";
const FREE_LIMIT   = 3; // Favoris max pour une invitée

// ── Clé localStorage selon le type d'utilisatrice ─────────────────────────
function getStorageKey() {
  const email = localStorage.getItem("afrotresse_email");
  if (!email) return GUEST_KEY;
  // Hash simple de l'email pour la clé utilisatrice
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = Math.imul(31, h) + email.charCodeAt(i) | 0;
  }
  return `afrotresse_favorites_user_${Math.abs(h).toString(36)}`;
}

// ── Lecture depuis localStorage ───────────────────────────────────────────────
function readFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey()) || "[]");
  } catch { return []; }
}

// ── Écriture + broadcast de l'événement de sync ───────────────────────────────
function writeToStorage(favs) {
  localStorage.setItem(getStorageKey(), JSON.stringify(favs));
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { favorites: favs, count: favs.length } })
  );
}

// ── Fusion invitée → enregistrée (sans doublons) ─────────────────────────────
function mergeGuestIntoUser() {
  try {
    const guest = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    if (guest.length === 0) return;
    const userKey  = getStorageKey();
    const existing = JSON.parse(localStorage.getItem(userKey) || "[]");
    const merged   = [...new Set([...existing, ...guest])];
    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem(GUEST_KEY); // Nettoie les favoris invitée
    writeToStorage(merged);
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export function useFavorites() {
  const [isRegistered, setIsRegistered] = useState(
    () => !!localStorage.getItem("afrotresse_email")
  );

  // Réagit si l'utilisatrice s'enregistre en cours de session
  useEffect(() => {
    const onStorage = () =>
      setIsRegistered(!!localStorage.getItem("afrotresse_email"));
    window.addEventListener("storage", onStorage);
    window.addEventListener("afrotresse:user-registered", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("afrotresse:user-registered", onStorage);
    };
  }, []);

  const [favorites, setFavorites] = useState(() => readFromStorage());

  // ── Écoute les mises à jour cross-composants ─────────────────────────────
  useEffect(() => {
    const handler = (e) => setFavorites(e.detail.favorites);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  // ── Fusion automatique à la connexion ────────────────────────────────────
  useEffect(() => {
    if (isRegistered) mergeGuestIntoUser();
  }, [isRegistered]);

  // ── Vérifie si un style est en favori ────────────────────────────────────
  const isFav = useCallback(
    (styleId) => favorites.includes(styleId),
    [favorites]
  );

  // ── Peut encore ajouter un favori (invitée limitée à FREE_LIMIT) ─────────
  const canAddMore = isRegistered || favorites.length < FREE_LIMIT;

  // ── Ajouter / retirer un favori ──────────────────────────────────────────
  const toggleFav = useCallback(
    (style) => {
      const id = typeof style === "string" ? style : style.id;

      if (favorites.includes(id)) {
        // Retrait
        const updated = favorites.filter((f) => f !== id);
        setFavorites(updated);
        writeToStorage(updated);

        // Retire aussi du cache styles complet si présent
        try {
          const saved = JSON.parse(localStorage.getItem("afrotresse_saved_styles") || "[]");
          localStorage.setItem(
            "afrotresse_saved_styles",
            JSON.stringify(saved.filter((s) => s.id !== id))
          );
        } catch {}
        return { success: true, action: "removed" };
      }

      // Ajout — vérification limite invitée
      if (!isRegistered && favorites.length >= FREE_LIMIT) {
        return { success: false, reason: "limit_reached" };
      }

      const updated = [...favorites, id];
      setFavorites(updated);
      writeToStorage(updated);

      // Persiste l'objet style complet si disponible
      if (typeof style === "object" && style.id) {
        try {
          const saved = JSON.parse(localStorage.getItem("afrotresse_saved_styles") || "[]");
          if (!saved.find((s) => s.id === id)) {
            saved.push({ ...style, savedAt: new Date().toISOString() });
            localStorage.setItem("afrotresse_saved_styles", JSON.stringify(saved));
          }
        } catch {}
      }

      return { success: true, action: "added" };
    },
    [favorites, isRegistered]
  );

  return {
    favorites,                        // string[]  — liste des IDs
    count: favorites.length,          // number    — pour le badge
    isFav,                            // (id) => boolean
    toggleFav,                        // (style | id) => { success, action?, reason? }
    canAddMore,                       // boolean   — faux si invitée à la limite
    isRegistered,                     // boolean
    FREE_LIMIT,                       // number    — pour afficher la limite dans l'UI
    mergeGuestIntoUser,               // () => void — à appeler après login
  };
}
