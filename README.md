# AfroTresse 🌿

> PWA mobile-first qui aide les femmes à trouver la tresse parfaite grâce à un selfie.

## Stack technique

| Technologie     | Rôle                          |
|-----------------|-------------------------------|
| React 18        | UI                            |
| Vite 5          | Build tool                    |
| Tailwind CSS 3  | Styling                       |
| Framer Motion   | Animations                    |
| vite-plugin-pwa | Service Worker + Manifest     |
| React Router 6  | Navigation SPA                |
| Vercel          | Hébergement + API Serverless  |

## Palette de couleurs

```css
--brown:     #2C1A0E  /* fond principal */
--mid:       #5C3317  /* cartes, glass   */
--warm:      #8B5E3C  /* textes secondaires */
--gold:      #C9963A  /* accent principal */
--goldLight: #E8B96A  /* hover, shimmer   */
--cream:     #FAF4EC  /* textes clairs    */
```

## Structure du projet

```
afrotresse/
├── api/
│   └── analyze.js          ← Vercel Serverless Function
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       └── favicon.svg
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx   ← Navigation persistante
│   │   ├── BraidCard.jsx   ← Carte style (grid + compact)
│   │   ├── CameraCapture.jsx ← Accès caméra native
│   │   └── Loader.jsx      ← Animation de chargement
│   ├── pages/
│   │   ├── Home.jsx        ← Accueil + hero
│   │   ├── Camera.jsx      ← Selfie ou import photo
│   │   ├── Analyze.jsx     ← Chargement animé
│   │   ├── Results.jsx     ← Recommandations
│   │   ├── Library.jsx     ← Catalogue filtrable
│   │   └── Profile.jsx     ← Historique + parrainage
│   ├── services/
│   │   └── faceAnalysis.js ← Appel API + fallback mock
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

## Installation locale

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement
npm run dev

# 3. Build de production
npm run build

# 4. Prévisualiser le build
npm run preview
```

## Déploiement sur Vercel

### Option A — Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B — Via GitHub (recommandé)

1. Push le projet sur GitHub
2. Aller sur [vercel.com](https://vercel.com) → **New Project**
3. Importer le dépôt GitHub
4. Framework Preset : **Vite**
5. Cliquer **Deploy** ✅

Vercel détecte automatiquement `vercel.json` et déploie :
- Le frontend Vite dans `/dist`
- La fonction serverless dans `/api/analyze.js`

## API `/api/analyze`

```
POST /api/analyze
Content-Type: multipart/form-data

Body:
  photo: <image file>

Response:
{
  "faceShape": "oval" | "round" | "square" | "heart" | "long" | "diamond",
  "confidence": "0.87",
  "analysisId": "lx2k9p"
}
```

### Intégrer un vrai modèle d'analyse

Éditer `api/analyze.js`. Options recommandées :

**1. Google Cloud Vision (facile)**
```bash
npm install @google-cloud/vision
```
```js
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient()
const [result] = await client.faceDetection(imageBuffer)
// → mapper les landmarks vers une forme de visage
```

**2. face-api.js (open source)**
```bash
npm install face-api.js @tensorflow/tfjs-node
```

**3. AWS Rekognition**
```bash
npm install @aws-sdk/client-rekognition
```

## PWA — Installation sur mobile

1. Ouvrir l'URL dans Chrome (Android) ou Safari (iOS)
2. Une bannière "Ajouter à l'écran d'accueil" apparaît automatiquement
3. L'app s'installe comme une app native 📱

## Fonctionnalités

- [x] Page d'accueil avec hero animé style africain
- [x] Capture selfie via caméra native (front/rear)
- [x] Import photo depuis la galerie
- [x] Countdown 3-2-1 avant capture
- [x] Animation d'analyse avec étapes progressives
- [x] 8 styles avec métadonnées (durée, difficulté, tags)
- [x] Score de compatibilité par forme de visage
- [x] Sauvegarde locale des styles favoris
- [x] Bibliothèque filtrable (par type + forme de visage)
- [x] Vue grille / liste
- [x] Profil avec historique et parrainage
- [x] PWA installable (manifest + service worker)
- [x] Palette africaine premium cohérente

## Variables d'environnement (optionnel)

```env
# .env.local
VITE_API_URL=/api
GOOGLE_CLOUD_KEY=xxx     # pour la vision API
AWS_ACCESS_KEY_ID=xxx    # pour Rekognition
```
