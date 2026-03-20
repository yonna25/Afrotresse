export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

// ─── Bouclier 1 : Anti-spam ───
let lastCallTime = 0

// ─── Bouclier 4 : Mapping précis visage + style → 2 images ───
const STYLE_MAP = {
  // OVALE
  'oval': {
    'box-braids':       ['/styles/napi1.jpg', '/styles/napi2.jpg'],
    'knotless-braids':  ['/styles/napi2.jpg', '/styles/napi3.jpg'],
    'cornrows':         ['/styles/napi3.jpg', '/styles/napi5.jpg'],
    'fulani-braids':    ['/styles/napi4.jpg', '/styles/napi6.jpg'],
    'ghana-braids':     ['/styles/napi5.jpg', '/styles/napi1.jpg'],
    'senegalese-twist': ['/styles/napi6.jpg', '/styles/napi2.jpg'],
    'lemonade-braids':  ['/styles/napi7.jpg', '/styles/napi4.jpg'],
    'micro-braids':     ['/styles/akoto.jpg', '/styles/napi3.jpg'],
    'default':          ['/styles/napi1.jpg', '/styles/napi2.jpg'],
  },
  // RONDE
  'round': {
    'box-braids':       ['/styles/napi1.jpg', '/styles/napi6.jpg'],
    'knotless-braids':  ['/styles/napi2.jpg', '/styles/napi7.jpg'],
    'cornrows':         ['/styles/napi3.jpg', '/styles/napi1.jpg'],
    'fulani-braids':    ['/styles/napi4.jpg', '/styles/napi2.jpg'],
    'ghana-braids':     ['/styles/napi5.jpg', '/styles/napi3.jpg'],
    'senegalese-twist': ['/styles/napi6.jpg', '/styles/napi4.jpg'],
    'lemonade-braids':  ['/styles/napi7.jpg', '/styles/napi5.jpg'],
    'micro-braids':     ['/styles/akoto.jpg', '/styles/napi6.jpg'],
    'default':          ['/styles/napi6.jpg', '/styles/napi7.jpg'],
  },
  // LONGUE
  'long': {
    'box-braids':       ['/styles/napi1.jpg', '/styles/napi5.jpg'],
    'knotless-braids':  ['/styles/napi2.jpg', '/styles/napi4.jpg'],
    'cornrows':         ['/styles/napi3.jpg', '/styles/napi7.jpg'],
    'fulani-braids':    ['/styles/napi4.jpg', '/styles/napi1.jpg'],
    'ghana-braids':     ['/styles/napi5.jpg', '/styles/napi2.jpg'],
    'senegalese-twist': ['/styles/napi6.jpg', '/styles/napi3.jpg'],
    'lemonade-braids':  ['/styles/napi7.jpg', '/styles/napi6.jpg'],
    'micro-braids':     ['/styles/akoto.jpg', '/styles/napi5.jpg'],
    'default':          ['/styles/napi3.jpg', '/styles/napi5.jpg'],
  },
  // CARREE
  'square': {
    'box-braids':       ['/styles/napi1.jpg', '/styles/napi7.jpg'],
    'knotless-braids':  ['/styles/napi2.jpg', '/styles/napi6.jpg'],
    'cornrows':         ['/styles/napi3.jpg', '/styles/napi4.jpg'],
    'fulani-braids':    ['/styles/napi4.jpg', '/styles/napi7.jpg'],
    'ghana-braids':     ['/styles/napi5.jpg', '/styles/napi6.jpg'],
    'senegalese-twist': ['/styles/napi6.jpg', '/styles/napi1.jpg'],
    'lemonade-braids':  ['/styles/napi7.jpg', '/styles/napi3.jpg'],
    'micro-braids':     ['/styles/akoto.jpg', '/styles/napi2.jpg'],
    'default':          ['/styles/napi4.jpg', '/styles/napi6.jpg'],
  },
  // FALLBACK GLOBAL
  'default': {
    'default': ['/styles/napi1.jpg', '/styles/napi2.jpg'],
  }
}

function getPresetImages(faceShape, styleId) {
  const shapeMap = STYLE_MAP[faceShape] || STYLE_MAP['default']
  return shapeMap[styleId] || shapeMap['default'] || ['/styles/napi1.jpg', '/styles/napi2.jpg']
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const falKey = process.env.FAL_API_KEY

  // ─── Bouclier 1 : Anti-spam 5 secondes ───
  const now = Date.now()
  if (now - lastCallTime < 5000) {
    return res.status(429).json({ error: 'Attends quelques secondes avant de relancer.' })
  }
  lastCallTime = now

  try {
    const { selfieBase64, selfieType, styleImageUrl, faceShape, styleId } = req.body

    if (!selfieBase64 || !styleImageUrl) {
      return res.status(400).json({ error: 'selfieBase64 et styleImageUrl requis' })
    }

    // ─── Bouclier 4 : Pas de clé → preset direct, 0 coût ───
    if (!falKey) {
      const images = getPresetImages(faceShape, styleId)
      return res.status(200).json({ fallback: true, imageUrl: images[0], presetImages: images })
    }

    // ─── Appel Fal.ai ───
    const buffer = Buffer.from(selfieBase64, 'base64')
    const mime   = selfieType || 'image/jpeg'
    const ext    = mime.split('/')[1] || 'jpg'

    const uploadRes = await fetch('https://storage.fal.ai', {
      method:  'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type':  mime,
        'X-Filename':    `selfie.${ext}`,
      },
      body: buffer,
    })

    if (!uploadRes.ok) throw new Error('Upload selfie echoue')

    const { url: selfieUrl } = await uploadRes.json()

    // ─── Bouclier 3 : 1 image seulement ───
    const generateRes = await fetch('https://fal.ai/api/fal-ai/image-apps-v2/hair-change', {
      method:  'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        image_url:           selfieUrl,
        reference_image_url: styleImageUrl,
        num_images:          1,
      }),
    })

    if (!generateRes.ok) throw new Error('Generation Fal.ai echouee')

    const data     = await generateRes.json()
    const imageUrl = data?.image?.url || data?.images?.[0]?.url
    if (!imageUrl) throw new Error('Aucune image generee')

    return res.status(200).json({ imageUrl, fallback: false })

  } catch (error) {
    console.error('Fal.ai error:', error)

    // ─── Bouclier 2 : Fallback si Fal.ai plante ───
    const { faceShape, styleId } = req.body || {}
    const images = getPresetImages(faceShape, styleId)
    return res.status(200).json({ fallback: true, imageUrl: images[0], presetImages: images })
  }
}
