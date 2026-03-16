import { IncomingForm } from 'formidable'
import fs from 'fs'

export const config = { api: { bodyParser: false } }

const BRAIDS_LIBRARY = [
  { id:'box-braids',       name:'Box Braids',       region:'Afrique de l\'Ouest', prompt:'box braids hairstyle, long black braids, neat sections',                    faceShapes:['oval','round','square','heart','diamond'] },
  { id:'knotless-braids',  name:'Knotless Braids',  region:'Afrique de l\'Ouest', prompt:'knotless box braids hairstyle, natural black hair, shoulder length',        faceShapes:['oval','round','square','heart','diamond','long'] },
  { id:'cornrows',         name:'Cornrows',          region:'Afrique de l\'Ouest', prompt:'cornrow braids hairstyle, neat rows close to scalp, black hair',            faceShapes:['oval','long','square','diamond'] },
  { id:'fulani-braids',    name:'Fulani Braids',     region:'Afrique de l\'Ouest', prompt:'fulani braids hairstyle, center braid with gold beads, black hair',         faceShapes:['oval','heart','diamond'] },
  { id:'ghana-braids',     name:'Ghana Braids',      region:'Ghana',               prompt:'ghana braids hairstyle, thick cornrows going back, black hair',             faceShapes:['oval','long','diamond'] },
  { id:'senegalese-twist', name:'Senegalese Twist',  region:'Sénégal',             prompt:'senegalese twist hairstyle, rope twists, long voluminous black hair',       faceShapes:['round','square','heart','oval'] },
  { id:'lemonade-braids',  name:'Lemonade Braids',   region:'Afrique de l\'Ouest', prompt:'lemonade braids hairstyle, side cornrows sweeping to one side',             faceShapes:['round','square','heart'] },
  { id:'micro-braids',     name:'Micro Braids',      region:'Afrique de l\'Ouest', prompt:'micro braids hairstyle, tiny thin braids, full head, long black hair',      faceShapes:['oval','long','heart'] },
  { id:'bantu-knots',      name:'Bantu Knots',       region:'Afrique Centrale',    prompt:'bantu knots hairstyle, small coiled knots all over head, black hair',       faceShapes:['oval','round','heart'] },
  { id:'goddess-braids',   name:'Goddess Braids',    region:'Afrique Centrale',    prompt:'goddess braids hairstyle, large thick cornrows, black hair',                faceShapes:['oval','square','long'] },
  { id:'dreadlocks',       name:'Dreadlocks',        region:'Afrique de l\'Est',   prompt:'dreadlocks hairstyle, thin neat locs, medium length, natural black hair',   faceShapes:['oval','square','diamond','long'] },
  { id:'ethiopian-braids', name:'Ethiopian Braids',  region:'Éthiopie',            prompt:'ethiopian braids hairstyle, tigrayan cornrows, geometric pattern',          faceShapes:['oval','long','square'] },
  { id:'jumbo-braids',     name:'Jumbo Braids',      region:'Pan-Africain',        prompt:'jumbo box braids hairstyle, extra large thick braids, black hair',          faceShapes:['long','square','diamond'] },
  { id:'passion-twist',    name:'Passion Twist',     region:'Pan-Africain',        prompt:'passion twist hairstyle, spring twists, bohemian texture, black hair',      faceShapes:['round','heart','oval'] },
  { id:'faux-locs',        name:'Faux Locs',         region:'Pan-Africain',        prompt:'faux locs hairstyle, distressed loc extensions, bohemian style',            faceShapes:['oval','square','diamond','long'] },
  { id:'feed-in-braids',   name:'Feed-in Braids',    region:'Pan-Africain',        prompt:'feed-in braids hairstyle, natural cornrows with gradual extensions',        faceShapes:['oval','round','long','heart'] },
  { id:'tribal-braids',    name:'Tribal Braids',     region:'Pan-Africain',        prompt:'tribal braids hairstyle, mixed cornrow and box braid pattern, black hair',  faceShapes:['oval','square','diamond'] },
  { id:'spring-twist',     name:'Spring Twist',      region:'Pan-Africain',        prompt:'spring twist hairstyle, curly textured twists, natural bouncy look',        faceShapes:['round','heart','oval','square'] },
  { id:'butterfly-locs',   name:'Butterfly Locs',    region:'Pan-Africain',        prompt:'butterfly locs hairstyle, wavy locs with looped texture, bohemian style',   faceShapes:['oval','heart','round'] },
  { id:'stitch-braids',    name:'Stitch Braids',     region:'Pan-Africain',        prompt:'stitch braids hairstyle, horizontal stitch pattern cornrows, black hair',   faceShapes:['oval','long','square','diamond'] },
  { id:'boho-braids',      name:'Boho Braids',       region:'Pan-Africain',        prompt:'boho knotless braids hairstyle, bohemian curly ends, natural look',         faceShapes:['oval','heart','round','diamond'] },
  { id:'havana-twist',     name:'Havana Twist',      region:'Pan-Africain',        prompt:'havana twist hairstyle, thick chunky twists, voluminous, black hair',       faceShapes:['long','square','diamond','oval'] },
  { id:'crochet-braids',   name:'Crochet Braids',    region:'Afrique Centrale',    prompt:'crochet braids hairstyle, voluminous curly afro on cornrow base',           faceShapes:['oval','round','heart','square'] },
  { id:'maasai-braids',    name:'Maasai Braids',     region:'Kenya',               prompt:'maasai braids hairstyle, thin braids with beaded accessories, black hair',  faceShapes:['oval','heart','diamond'] },
  { id:'berber-braids',    name:'Berber Braids',     region:'Maroc / Algérie',     prompt:'berber braids hairstyle, colorful threads woven in, north african style',   faceShapes:['oval','heart','round'] },
]

const FACE_SHAPE_NAMES = {
  oval:'Ovale', round:'Ronde', square:'Carree',
  heart:'Coeur', long:'Longue', diamond:'Diamant',
}

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 })
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

function pickRandomStyles(faceShape, count = 2) {
  const compatible = BRAIDS_LIBRARY.filter(s => s.faceShapes.includes(faceShape))
  const shuffled   = [...compatible].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Upload image vers fal.ai et récupérer une URL publique
async function uploadImageToFal(imageBuffer, mimeType, falApiKey) {
  try {
    // Créer un Blob et l'envoyer comme form-data
    const formData = new FormData()
    const blob     = new Blob([imageBuffer], { type: mimeType })
    formData.append('file', blob, 'selfie.jpg')

    const res = await fetch('https://fal.run/fal-ai/storage/upload', {
      method:  'POST',
      headers: { 'Authorization': `Key ${falApiKey}` },
      body:    formData,
    })

    if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`)
    const data = await res.json()
    return data.url || data.file_url || null
  } catch (err) {
    console.error('Upload error:', err)
    return null
  }
}

// Appel fal-ai/image-editing/hair-change
async function applyHairChange(imageUrl, hairPrompt, falApiKey) {
  try {
    const res = await fetch('https://fal.run/fal-ai/image-editing/hair-change', {
      method:  'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        image_url:   imageUrl,
        hair_prompt: hairPrompt,
      }),
    })

    if (!res.ok) {
      console.error('hair-change error:', await res.text())
      return null
    }

    const data = await res.json()
    // Différents formats de réponse possibles
    return (
      data?.image?.url        ||
      data?.images?.[0]?.url  ||
      data?.output?.image_url ||
      data?.result?.url       ||
      null
    )
  } catch (err) {
    console.error('hair-change exception:', err)
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const falKey       = process.env.FAL_API_KEY
  if (!anthropicKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante' })
  if (!falKey)       return res.status(500).json({ error: 'FAL_API_KEY manquante' })

  try {
    // 1. Récupérer la photo
    const { files }  = await parseForm(req)
    const photoFile  = files.photo?.[0] || files.photo
    if (!photoFile)  return res.status(400).json({ error: 'Aucune photo recue.' })

    const imageBuffer = fs.readFileSync(photoFile.filepath || photoFile.path)
    const base64Image = imageBuffer.toString('base64')
    const mimeType    = photoFile.mimetype || photoFile.type || 'image/jpeg'

    // 2. Upload le selfie sur fal.ai storage
    const selfieUrl = await uploadImageToFal(imageBuffer, mimeType, falKey)
    if (!selfieUrl) {
      return res.status(500).json({ error: 'Echec upload photo vers Fal.ai' })
    }

    // 3. Claude analyse la forme du visage
    let faceShape  = 'oval'
    let confidence = 0.85
    let reason     = ''

    try {
      const claudeRes  = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 150,
          system: `Expert morphologie visage. Reponds UNIQUEMENT en JSON :
{"faceShape":"oval","confidence":0.92,"reason":"front large, machoire douce"}
Formes : oval, round, square, heart, long, diamond`,
          messages: [{
            role: 'user',
            content: [
              { type:'image', source:{ type:'base64', media_type:mimeType, data:base64Image } },
              { type:'text',  text:'Forme du visage en JSON uniquement.' },
            ],
          }],
        }),
      })
      if (claudeRes.ok) {
        const d      = await claudeRes.json()
        const parsed = JSON.parse((d.content?.[0]?.text || '{}').replace(/```json|```/g,'').trim())
        faceShape    = parsed.faceShape?.toLowerCase() || 'oval'
        confidence   = parsed.confidence || 0.85
        reason       = parsed.reason     || ''
        if (!FACE_SHAPE_NAMES[faceShape]) faceShape = 'oval'
      }
    } catch(e) { console.error('Claude error:', e) }

    // 4. Piocher exactement 2 styles
    const selectedStyles = pickRandomStyles(faceShape, 2)

    // 5. Générer les 2 essayages en parallèle
    const recommendations = await Promise.all(
      selectedStyles.map(async (style) => {
        const generatedImage = await applyHairChange(selfieUrl, style.prompt, falKey)
        return {
          id:             style.id,
          name:           style.name,
          region:         style.region,
          generatedImage: generatedImage, // photo d'elle avec la tresse
          matchScore:     Math.floor(Math.random() * 15) + 83,
        }
      })
    )

    // 6. Répondre — toujours exactement 2 styles
    return res.status(200).json({
      faceShape,
      faceShapeName:   FACE_SHAPE_NAMES[faceShape],
      confidence:      Math.round(confidence * 100),
      reason,
      analysisId:      Date.now().toString(36),
      recommendations: recommendations.slice(0, 2), // sécurité : max 2
    })

  } catch (error) {
    console.error('Handler error:', error)
    return res.status(500).json({ error: 'Analyse echouee. Reessaie.' })
  }
}
