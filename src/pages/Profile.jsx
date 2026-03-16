import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BraidCard from '../components/BraidCard.jsx'
import { useProfile } from '../hooks/useProfile.js'

const AVATARS = ['👩🏾','👩🏿','👩🏽','👸🏾','👸🏿','💁🏾‍♀️','💆🏾‍♀️','🧕🏾']

export default function Profile() {
  const navigate = useNavigate()
  const { name, displayName, setName, avatar, setAvatar } = useProfile()
  const [saved,       setSaved]       = useState([])
  const [tab,         setTab]         = useState(0)
  const [copied,      setCopied]      = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput,   setNameInput]   = useState('')
  const [showAvatars, setShowAvatars] = useState(false)

  const REFERRAL_CODE = useState(
    () => localStorage.getItem('afrotresse_ref') || (() => {
      const c = 'AFRO-' + Math.random().toString(36).substring(2,7).toUpperCase()
      localStorage.setItem('afrotresse_ref', c)
      return c
    })()
  )[0]

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('afrotresse_saved') || '[]')
    setSaved(s)
    setNameInput(name)
  }, [name])

  const handleSaveName = () => {
    if (nameInput.trim()) setName(nameInput.trim())
    setEditingName(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERRAL_CODE).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="min-h-screen bg-brown pb-28">

      {/* ── Header hero ─────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-12 pb-6 px-5"
        style={{ background: 'linear-gradient(160deg, #5C3317 0%, #2C1A0E 60%)' }}>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full"><pattern id="pp" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill="#C9963A"/>
          </pattern><rect width="100%" height="100%" fill="url(#pp)"/></svg>
        </div>

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <button onClick={() => setShowAvatars(!showAvatars)} className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg,#C9963A,#5C3317)', border: '2px solid rgba(201,150,58,0.5)', boxShadow: '0 0 20px rgba(201,150,58,0.25)' }}>
              {avatar}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center text-[10px] text-brown font-bold">✏️</div>
          </button>

          {/* Nom */}
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  placeholder="Ton prénom..."
                  className="flex-1 bg-mid/60 border border-gold/40 rounded-xl px-3 py-1.5 text-cream font-body text-sm outline-none focus:border-gold"
                  maxLength={20}
                />
                <button onClick={handleSaveName}
                  className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center text-brown text-xs font-bold">✓</button>
              </div>
            ) : (
              <button onClick={() => { setEditingName(true); setNameInput(name) }}
                className="text-left group">
                <p className="font-display text-xl text-cream group-hover:text-gold transition-colors">
                  {displayName}
                  <span className="text-warm text-sm ml-2 font-body">✏️</span>
                </p>
                <p className="font-body text-warm text-xs mt-0.5">Membre AfroTresse ✦</p>
              </button>
            )}
          </div>
        </div>

        {/* Avatar picker */}
        <AnimatePresence>
          {showAvatars && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative mt-4 overflow-hidden"
            >
              <div className="flex gap-3 flex-wrap">
                {AVATARS.map(a => (
                  <button key={a} onClick={() => { setAvatar(a); setShowAvatars(false) }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all"
                    style={{ background: avatar === a ? '#C9963A' : 'rgba(92,51,23,0.5)', border: avatar === a ? '2px solid #E8B96A' : '2px solid transparent' }}>
                    {a}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="relative flex gap-3 mt-5">
          {[
            [saved.length, 'Styles sauvés'],
            [sessionStorage.getItem('afrotresse_results') ? '1' : '0', 'Analyses'],
            ['0', 'Filleules'],
          ].map(([val, label]) => (
            <div key={label} className="flex-1 rounded-2xl py-3 text-center"
              style={{ background: 'rgba(44,26,14,0.5)', border: '1px solid rgba(201,150,58,0.1)' }}>
              <p className="font-display text-xl text-gold">{val}</p>
              <p className="font-body text-warm text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 mt-4">
        {['Mes styles', 'Parrainage'].map((label, i) => (
          <button key={label} onClick={() => setTab(i)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-body font-semibold transition-all"
            style={{ background: tab === i ? '#C9963A' : 'rgba(92,51,23,0.4)', color: tab === i ? '#2C1A0E' : '#8B5E3C', border: '1px solid rgba(201,150,58,0.15)' }}>
            {label}
            {i === 1 && <span className="ml-1 text-xs opacity-70">🎁</span>}
          </button>
        ))}
      </div>

      {/* ── Contenu ─────────────────────────────────────────── */}
      {tab === 0 ? (
        <div className="px-4 mt-4 space-y-3">
          {saved.length === 0 ? (
            <EmptyState onNavigate={() => navigate('/camera')} name={displayName} />
          ) : (
            saved.map((b, i) => <BraidCard key={b.id} braid={b} index={i} compact />)
          )}

          {sessionStorage.getItem('afrotresse_results') && (() => {
            const r = JSON.parse(sessionStorage.getItem('afrotresse_results'))
            return (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}
                className="rounded-3xl p-4 mt-2"
                style={{ background: 'rgba(92,51,23,0.4)', border: '1px solid rgba(201,150,58,0.15)' }}>
                <p className="font-display text-cream text-sm mb-3">Dernière analyse</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: 'rgba(201,150,58,0.15)' }}>🔍</div>
                  <div className="flex-1">
                    <p className="text-cream text-sm font-body">
                      Visage <span className="text-gold font-semibold">{r.faceShapeName}</span>
                      {r.confidence && <span className="text-warm text-xs ml-2">{r.confidence}% IA</span>}
                    </p>
                    {r.aiReason && <p className="text-warm text-xs mt-0.5 italic">"{r.aiReason}"</p>}
                  </div>
                  <button onClick={() => navigate('/results')}
                    className="text-gold text-xs font-body px-3 py-1.5 rounded-xl"
                    style={{ border: '1px solid rgba(201,150,58,0.3)' }}>
                    Voir →
                  </button>
                </div>
              </motion.div>
            )
          })()}
        </div>
      ) : (
        <ReferralTab code={REFERRAL_CODE} copied={copied} onCopy={handleCopy} />
      )}
    </div>
  )
}

function EmptyState({ onNavigate, name }) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      className="text-center py-16 flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
        style={{ background: 'rgba(92,51,23,0.4)', border: '1px solid rgba(201,150,58,0.2)' }}>💆🏾‍♀️</div>
      <p className="font-display text-cream">Aucun style sauvegardé</p>
      <p className="font-body text-warm text-sm max-w-xs text-center">
        Lance ton premier selfie pour recevoir des recommandations personnalisées
      </p>
      <button onClick={onNavigate} className="btn-gold mt-2">📸 Commencer l'analyse</button>
    </motion.div>
  )
}

function ReferralTab({ code, copied, onCopy }) {
  return (
    <div className="px-4 mt-4 space-y-4 pb-4">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
        className="rounded-3xl p-6 text-center"
        style={{ background: 'rgba(92,51,23,0.4)', border: '1px solid rgba(201,150,58,0.15)', boxShadow: '0 4px 24px rgba(201,150,58,0.08)' }}>
        <div className="text-4xl mb-3">🌟</div>
        <h2 className="font-display text-xl text-cream">Partage AfroTresse</h2>
        <div className="w-12 h-px mx-auto my-3" style={{ background: 'linear-gradient(to right, transparent, #C9963A, transparent)' }} />
        <p className="font-body text-warm text-sm leading-relaxed">
          Invite tes amies et gagnez toutes les deux un accès premium gratuit pendant 1 mois !
        </p>
      </motion.div>

      <div className="rounded-3xl p-5" style={{ background: 'rgba(92,51,23,0.4)', border: '1px solid rgba(201,150,58,0.15)' }}>
        <p className="font-body text-warm text-xs mb-3 text-center">Ton code de parrainage</p>
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: '#2C1A0E', border: '1px solid rgba(201,150,58,0.2)' }}>
          <span className="flex-1 font-display text-lg text-gold text-center tracking-widest">{code}</span>
          <button onClick={onCopy}
            className="text-xs font-body px-3 py-1.5 rounded-xl transition-all"
            style={{ background: copied ? '#C9963A' : 'transparent', color: copied ? '#2C1A0E' : '#C9963A', border: copied ? 'none' : '1px solid rgba(201,150,58,0.4)' }}>
            {copied ? '✓ Copié !' : 'Copier'}
          </button>
        </div>
      </div>

      <button className="btn-gold w-full" onClick={() => {
        if (navigator.share) navigator.share({ title: 'AfroTresse', text: `Rejoins AfroTresse avec mon code ${code} !`, url: window.location.origin })
      }}>
        Partager →
      </button>
    </div>
  )
}
