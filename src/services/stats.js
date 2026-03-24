// ─── Clés localStorage pour les stats ───────────────────────────
const KEY_STYLE_STATS = 'afrotresse_style_stats' // {styleId: {views, shares, downloads}}

// ─── Récupérer les stats d'un style ────────────────────────────
export function getStyleStats(styleId) {
  const raw = localStorage.getItem(KEY_STYLE_STATS)
  const allStats = raw ? JSON.parse(raw) : {}
  
  return allStats[styleId] || {
    views: 0,
    shares: 0,
    downloads: 0,
  }
}

// ─── Mettre à jour les stats ───────────────────────────────────
function setStyleStats(styleId, stats) {
  const raw = localStorage.getItem(KEY_STYLE_STATS)
  const allStats = raw ? JSON.parse(raw) : {}
  
  allStats[styleId] = stats
  localStorage.setItem(KEY_STYLE_STATS, JSON.stringify(allStats))
}

// ─── Compter une vue ───────────────────────────────────────────
export function addView(styleId) {
  const stats = getStyleStats(styleId)
  stats.views += 1
  setStyleStats(styleId, stats)
}

// ─── Compter un partage ────────────────────────────────────────
export function addShare(styleId) {
  const stats = getStyleStats(styleId)
  stats.shares += 1
  setStyleStats(styleId, stats)
}

// ─── Compter un téléchargement ────────────────────────────────
export function addDownload(styleId) {
  const stats = getStyleStats(styleId)
  stats.downloads += 1
  setStyleStats(styleId, stats)
}

// ─── Télécharger une image ────────────────────────────────────
export function downloadStyleImage(styleId, styleName, imageUrl) {
  try {
    // Créer un lien temporaire
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${styleName.replace(/\s+/g, '-')}-${styleId}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Compter le téléchargement
    addDownload(styleId)
    
    return true
  } catch (err) {
    console.error('Erreur téléchargement:', err)
    return false
  }
}

// ─── Récupérer toutes les stats ────────────────────────────────
export function getAllStats() {
  const raw = localStorage.getItem(KEY_STYLE_STATS)
  return raw ? JSON.parse(raw) : {}
}

// ─── Réinitialiser les stats (optionnel) ───────────────────────
export function resetStats() {
  localStorage.removeItem(KEY_STYLE_STATS)
}

// ─── Formater les nombres pour affichage ──────────────────────
export function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return String(num)
}
