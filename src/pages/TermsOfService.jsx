import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function TermsOfService() {
  const navigate = useNavigate()
  return <LegalPage title="Conditions d'utilisation" onBack={() => navigate(-1)} sections={SECTIONS} />
}

function LegalPage({ title, onBack, sections }) {
  return (
    <div className="min-h-screen pb-16" style={{ background: '#1A0A00' }}>
      <div className="sticky top-0 z-30 px-5 pt-12 pb-4"
        style={{ background: 'rgba(26,10,0,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,150,58,0.15)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.3)' }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#C9963A" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 className="font-display text-lg" style={{ color: '#FAF4EC' }}>{title}</h1>
            <p className="font-body text-xs" style={{ color: 'rgba(201,150,58,0.7)' }}>AfroTresse — Dernière mise à jour : Mars 2026</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">
        {sections.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <h2 className="font-display text-base mb-2" style={{ color: '#C9963A' }}>{s.title}</h2>
            <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(250,244,236,0.75)' }}>{s.content}</p>
          </motion.div>
        ))}
        <div className="pt-4 pb-8 text-center">
          <p className="font-body text-xs" style={{ color: 'rgba(201,150,58,0.5)' }}>© 2026 AfroTresse — Tous droits réservés</p>
        </div>
      </div>
    </div>
  )
}

const SECTIONS = [
  {
    title: '1. Acceptation des conditions',
    content: 'En utilisant l\'application AfroTresse, vous acceptez les présentes conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser l\'application.',
  },
  {
    title: '2. Description du service',
    content: 'AfroTresse est une application qui analyse la morphologie du visage via une photo selfie pour recommander des styles de tresses adaptés. Le service comprend une offre gratuite (recommandations locales) et une offre payante (essayage virtuel via intelligence artificielle).',
  },
  {
    title: '3. Utilisation du service',
    content: 'L\'application est destinée aux femmes souhaitant découvrir des styles de tresses adaptés à leur morphologie. Vous vous engagez à utiliser l\'application de manière personnelle et non commerciale, à ne pas partager votre compte ou vos crédits, et à fournir des photos vous représentant uniquement.',
  },
  {
    title: '4. Crédits et paiements',
    content: 'Les crédits achetés sont non remboursables et non transférables. Chaque crédit permet un essai virtuel via l\'intelligence artificielle. AfroTresse se réserve le droit de modifier les tarifs avec un préavis de 15 jours. Les crédits gratuits (parrainage, avis) n\'ont pas de valeur monétaire.',
  },
  {
    title: '5. Propriété intellectuelle',
    content: 'Tout le contenu de l\'application (design, textes, algorithmes, base de données de styles) est la propriété exclusive d\'AfroTresse. Toute reproduction ou utilisation commerciale sans autorisation est interdite.',
  },
  {
    title: '6. Limitation de responsabilité',
    content: 'Les recommandations de l\'application sont fournies à titre indicatif. AfroTresse ne garantit pas que les styles proposés correspondront exactement au résultat final chez un coiffeur. Les résultats de l\'essayage virtuel sont des simulations et peuvent différer de la réalité.',
  },
  {
    title: '7. Modification des conditions',
    content: 'AfroTresse se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés de toute modification importante via l\'application.',
  },
]
