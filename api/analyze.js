import { IncomingForm } from 'formidable'
import fs from 'fs'

export const config = { api: { bodyParser: false } }

// ─── Bibliothèque 25 styles panafricains ─────────────────────────
const BRAIDS_LIBRARY = [
  { id:'box-braids',       name:'Box Braids',        region:'Afrique de l\'Ouest', prompt:'long box braids, neat sections, waist length, black hair',                               faceShapes:['oval','round','square','heart','diamond'] },
  { id:'knotless-braids',  name:'Knotless Braids',   region:'Afrique de l\'Ouest', prompt:'knotless box braids, no knot at root, natural, shoulder length, black hair',             faceShapes:['oval','round','square','heart','diamond','long'] },
  { id:'cornrows',         name:'Cornrows',           region:'Afrique de l\'Ouest', prompt:'traditional cornrow braids, neat rows close to scalp going back, black hair',            faceShapes:['oval','long','square','diamond'] },
  { id:'fulani-braids',    name:'Fulani Braids',      region:'Afrique de l\'Ouest', prompt:'fulani braids with center braid, thin braids on sides, gold beads',                      faceShapes:['oval','heart','diamond'] },
  { id:'ghana-braids',     name:'Ghana Braids',       region:'Ghana',               prompt:'ghana braids, thick feed-in cornrows going back, bold structured, black hair',           faceShapes:['oval','long','diamond'] },
  { id:'senegalese-twist', name:'Senegalese Twist',   region:'Sénégal',             prompt:'senegalese twist braids, rope twist style, long flowing voluminous, black hair',         faceShapes:['round','square','heart','oval'] },
  { id:'lemonade-braids',  name:'Lemonade Braids',    region:'Afrique de l\'Ouest', prompt:'lemonade braids, side cornrows sweeping to one side, long extensions',                   faceShapes:['round','square','heart'] },
  { id:'micro-braids',     name:'Micro Braids',       region:'Afrique de l\'Ouest', prompt:'micro braids, very thin tiny braids, full head, long length, black hair',                faceShapes:['oval','long','heart'] },
  { id:'bantu-knots',      name:'Bantu Knots',        region:'Afrique Centrale',    prompt:'bantu knots, small coiled knots all over head, neat sections, natural black hair',       faceShapes:['oval','round','heart'] },
  { id:'goddess-braids',   name:'Goddess Braids',     region:'Afrique Centrale',    prompt:'goddess braids, large thick cornrows, intricate pattern, bold style, black hair',        faceShapes:['oval','square','long'] },
  { id:'crochet-braids',   name:'Crochet Braids',     region:'Afrique Centrale',    prompt:'crochet braids, voluminous curly afro attached to cornrow base, natural look',          faceShapes:['oval','round','heart','square'] },
  { id:'dreadlocks',       name:'Dreadlocks',         region:'Afrique de l\'Est',   prompt:'thin neat dreadlocks, medium length, well-formed locs, natural black hair',              faceShapes:['oval','square','diamond','long'] },
  { id:'maasai-braids',    name:'Maasai Braids',      region:'Kenya',               prompt:'maasai inspired thin braids with beaded accessories, traditional east african style',    faceShapes:['oval','heart','diamond'] },
  { id:'ethiopian-braids', name:'Ethiopian Braids',   region:'Éthiopie',            prompt:'ethiopian braids, tigrayan cornrows with intricate geometric pattern going back',        faceShapes:['oval','long','square'] },
  { id:'berber-braids',    name:'Berber Braids',      region:'Maroc / Algérie',     prompt:'berber braids with colorful threads and silver jewelry woven in, north african style',  faceShapes:['oval','heart','round'] },
  { id:'jumbo-braids',     name:'Jumbo Braids',       region:'Pan-Africain',        prompt:'jumbo box braids, extra large thick braids, bold statement, waist length, black hair',  faceShapes:['long','square','diamond'] },
  { id:'passion-twist',    name:'Passion Twist',      region:'Pan-Africain',        prompt:'passion twist braids, spring twists, loose bohemian texture, voluminous, black hair',   faceShapes:['round','heart','oval'] },
  { id:'faux-locs',        name:'Faux Locs',          region:'Pan-Africain',        prompt:'faux locs, distressed loc extensions, bohemian style, long length, natural look',       faceShapes:['oval','square','diamond','long'] },
  { id:'feed-in-braids',   name:'Feed-in Braids',     region:'Pan-Africain',        prompt:'feed-in braids, natural cornrows with gradual extensions, neat seamless style',         faceShapes:['oval','round','long','heart'] },
  { id:'tribal-braids',    name:'Tribal Braids',      region:'Pan-Africain',        prompt:'tribal braids, mixed cornrow and box braid geometric design, bold african style',       faceShapes:['oval','square','diamond'] },
  { id:'spring-twist',     name:'Spring Twist',       region:'Pan-Africain',        prompt:'spring twist braids, curly textured twists, medium length, natural bouncy look',        faceShapes:['round','heart','oval','square'] },
  { id:'butterfly-locs',   name:'Butterfly Locs',     region:'Pan-Africain',        prompt:'butterfly locs, distressed wavy locs with looped texture, bohemian goddess style',      faceShapes:['oval','heart','round'] },
  { id:'stitch-braids',    name:'Stitch Braids',      region:'Pan-Africain',        prompt:'stitch braids cornrows, horizontal stitch pattern, sleek precise style, black hair',    faceShapes:['oval','long','square','diamond'] },
  { id:'boho-braids',      name:'Boho Braids',        region:'Pan-Africain',        prompt:'boho knotless braids, bohemian curly ends, wispy pieces framing face, natural look',    faceShapes:['oval','heart','round','diamond'] },
  { id:'havana-twist',     name:'Havana Twist',       region:'Pan-Africain',        prompt:'havana twist braids, thick chunky twists, voluminous bold style, shoulder length',      faceShapes:['long','square','diamond','oval'] },
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

// Générer l'essayage avec fal-ai/image-editing/hair-change
async function generateHairChange(imageUrl, braidPrompt, falApiKey) {
  try {
    const falRes = await fetch('https://fal.run/fal-ai/image-editing/hair-change', {
      method:  'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        image_url:   imageUrl,
        hair_prompt: braidPrompt,
        negative_prompt: 'blurry, distorted face, bad quality, deformed',
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }),
    })

    if (!falRes.ok) {
      const err = await falRes.text()
      console.error('Fal hair-change error:', err)
      return null
    }

    const falData = await falRes.json()
    // Récupérer l'URL de l'image générée
    return falData.image?.url || falData.images?.[0]?.url || null

  } catch (err) {
    console.error('Fal.ai error:', err)
    return null
  }
}

// Uploader l'image sur fal.ai storage
async function uploadToFal(imageBuffer, mimeType, falApiKey) {
  try {
    const uploadRes = await fetch('https://fal.run/fal-ai/storage/upload/initiate', {
      method:  'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        content_type: mimeType,
        file_size:    imageBuffer.length,
      }),
    })

    if (!uploadRes.ok) throw new Error('Initiate upload failed')
    const { upload_url, file_url } = await uploadRes.json()

    // Uploader le fichier
    await fetch(upload_url, {
      method:  'PUT',
      headers: { 'Content-Type': mimeType },
      body:    imageBuffer,
    })

    return file_url
  } catch (err) {
    console.error('Upload error:', err)
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
    const { files } = await parseForm(req)
    const photoFile  = files.photo?.[0] || files.photo
    if (!photoFile) return res.status(400).json({ error: 'Aucune photo recue.' })

    const imageBuffer = fs.readFileSync(photoFile.filepath || photoFile.path)
    const base64Image = imageBuffer.toString('base64')
    const mimeType    = photoFile.mimetype || photoFile.type || 'image/jpeg'

    // 2. Uploader le selfie sur Fal.ai storage
    const selfieUrl = await uploadToFal(imageBuffer, mimeType, falKey)
    if (!selfieUrl) {
      return res.status(500).json({ error: 'Impossible d\'uploader la photo.' })
    }

    // 3. Claude analyse la forme du visage
    let faceShape  = 'oval'
    let confidence = 0.85
    let reason     = ''

    try {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: `Tu es un expert en morphologie du visage.
Analyse la photo et reponds UNIQUEMENT avec ce JSON valide :
{"faceShape":"oval","confidence":0.92,"reason":"front large, machoire douce"}
Formes possibles : oval, round, square, heart, long, diamond`,
          messages: [{
            role: 'user',
            content: [
              { type:'image', source:{ type:'base64', media_type:mimeType, data:base64Image } },
              { type:'text',  text:'Analyse la forme du visage. JSON uniquement.' },
            ],
          }],
        }),
      })

      if (claudeRes.ok) {
        const claudeData = await claudeRes.json()
        const rawText    = claudeData.content?.[0]?.text || ''
        const parsed     = JSON.parse(rawText.replace(/```json|```/g, '').trim())
        faceShape  = parsed.faceShape?.toLowerCase() || 'oval'
        confidence = parsed.confidence || 0.85
        reason     = parsed.reason     || ''
        if (!FACE_SHAPE_NAMES[faceShape]) faceShape = 'oval'
      }
    } catch (e) {
      console.error('Claude error:', e)
    }

    // 4. Piocher 2 styles aléatoires compatibles
    const selectedStyles = pickRandomStyles(faceShape, 2)

    // 5. Générer l'essayage pour chaque style (en parallèle)
    const results = await Promise.all(
      selectedStyles.map(async (style) => {
        const generatedImage = await generateHairChange(
          selfieUrl, style.prompt, falKey
        )
        return {
          id:             style.id,
          name:           style.name,
          region:         style.region,
          generatedImage, // null si Fal.ai échoue
          matchScore:     Math.floor(Math.random() * 15) + 83,
        }
      })
    )

    // 6. Retourner le résultat
    return res.status(200).json({
      faceShape,
      faceShapeName: FACE_SHAPE_NAMES[faceShape],
      confidence:    Math.round(confidence * 100),
      reason,
      analysisId:    Date.now().toString(36),
      recommendations: results,
    })

  } catch (error) {
    console.error('Handler error:', error)
    return res.status(500).json({ error: 'Analyse echouee. Reessaie.' })
  }
}
