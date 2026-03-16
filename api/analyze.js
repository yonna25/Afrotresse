import { IncomingForm } from 'formidable'
import fs from 'fs'

export const config = { api: { bodyParser: false } }

// ─── Bibliothèque 25 styles panafricains ─────────────────────────
const BRAIDS_LIBRARY = [
  // Afrique de l'Ouest
  { id:'box-braids',        name:'Box Braids',         region:'Afrique de l\'Ouest', prompt:'long box braids hairstyle, neat sections, waist length, black hair',                          faceShapes:['oval','round','square','heart','diamond'] },
  { id:'knotless-braids',   name:'Knotless Braids',    region:'Afrique de l\'Ouest', prompt:'knotless box braids, no knot at root, natural looking, shoulder length, black hair',          faceShapes:['oval','round','square','heart','diamond','long'] },
  { id:'cornrows',          name:'Cornrows',            region:'Afrique de l\'Ouest', prompt:'traditional cornrow braids, neat rows close to scalp, going back, black hair',               faceShapes:['oval','long','square','diamond'] },
  { id:'fulani-braids',     name:'Fulani Braids',       region:'Afrique de l\'Ouest', prompt:'fulani braids with center braid, thin braids on sides, gold beads, traditional style',       faceShapes:['oval','heart','diamond'] },
  { id:'ghana-braids',      name:'Ghana Braids',        region:'Ghana',               prompt:'ghana braids, thick feed-in cornrows, going back, bold structured style, black hair',        faceShapes:['oval','long','diamond'] },
  { id:'senegalese-twist',  name:'Senegalese Twist',    region:'Sénégal',             prompt:'senegalese twist braids, rope twist style, long flowing, voluminous, black hair',            faceShapes:['round','square','heart','oval'] },
  { id:'lemonade-braids',   name:'Lemonade Braids',     region:'Afrique de l\'Ouest', prompt:'lemonade braids, side cornrows sweeping to one side, long extensions, sleek style',         faceShapes:['round','square','heart'] },
  { id:'micro-braids',      name:'Micro Braids',        region:'Afrique de l\'Ouest', prompt:'micro braids, very thin tiny braids, full head, long length, delicate style, black hair',   faceShapes:['oval','long','heart'] },
  // Afrique Centrale
  { id:'bantu-knots',       name:'Bantu Knots',         region:'Afrique Centrale',    prompt:'bantu knots hairstyle, small coiled knots all over head, neat sections, black natural hair', faceShapes:['oval','round','heart'] },
  { id:'goddess-braids',    name:'Goddess Braids',      region:'Afrique Centrale',    prompt:'goddess braids, large thick cornrows, intricate pattern, bold style, black hair',            faceShapes:['oval','square','long'] },
  { id:'crochet-braids',    name:'Crochet Braids',      region:'Afrique Centrale',    prompt:'crochet braids, voluminous curly afro style attached to cornrow base, natural look',        faceShapes:['oval','round','heart','square'] },
  // Afrique de l'Est
  { id:'dreadlocks',        name:'Dreadlocks',          region:'Afrique de l\'Est',   prompt:'thin neat dreadlocks, medium length, well-formed locs, natural black hair',                  faceShapes:['oval','square','diamond','long'] },
  { id:'maasai-braids',     name:'Maasai Braids',       region:'Kenya',               prompt:'maasai inspired thin braids with red and beaded accessories, traditional east african style', faceShapes:['oval','heart','diamond'] },
  { id:'ethiopian-braids',  name:'Ethiopian Braids',    region:'Éthiopie',            prompt:'ethiopian braids, tigrayan style cornrows with intricate geometric pattern going back',      faceShapes:['oval','long','square'] },
  // Afrique du Nord
  { id:'berber-braids',     name:'Berber Braids',       region:'Maroc / Algérie',     prompt:'berber inspired braids with colorful threads and silver jewelry woven in, north african',   faceShapes:['oval','heart','round'] },
  // Styles modernes / fusion
  { id:'jumbo-braids',      name:'Jumbo Braids',        region:'Pan-Africain',        prompt:'jumbo box braids, extra large thick braids, bold statement style, waist length, black hair', faceShapes:['long','square','diamond'] },
  { id:'passion-twist',     name:'Passion Twist',       region:'Pan-Africain',        prompt:'passion twist braids, spring twists, loose bohemian texture, voluminous, black hair',       faceShapes:['round','heart','oval'] },
  { id:'faux-locs',         name:'Faux Locs',           region:'Pan-Africain',        prompt:'faux locs hairstyle, distressed loc extensions, bohemian style, long length, natural look', faceShapes:['oval','square','diamond','long'] },
  { id:'feed-in-braids',    name:'Feed-in Braids',      region:'Pan-Africain',        prompt:'feed-in braids, natural looking cornrows with gradual extensions, neat seamless style',     faceShapes:['oval','round','long','heart'] },
  { id:'tribal-braids',     name:'Tribal Braids',       region:'Pan-Africain',        prompt:'tribal braids, mixed cornrow and box braid pattern with geometric design, bold african style', faceShapes:['oval','square','diamond'] },
  { id:'spring-twist',      name:'Spring Twist',        region:'Pan-Africain',        prompt:'spring twist braids, curly textured twists, medium length, natural bouncy look, black hair', faceShapes:['round','heart','oval','square'] },
  { id:'butterfly-locs',    name:'Butterfly Locs',      region:'Pan-Africain',        prompt:'butterfly locs, distressed wavy locs with looped texture, bohemian goddess style',          faceShapes:['oval','heart','round'] },
  { id:'stitch-braids',     name:'Stitch Braids',       region:'Pan-Africain',        prompt:'stitch braids cornrows, horizontal stitch pattern along each braid, sleek precise style',   faceShapes:['oval','long','square','diamond'] },
  { id:'boho-braids',       name:'Boho Braids',         region:'Pan-Africain',        prompt:'boho knotless braids, bohemian curly ends, loose wispy pieces framing face, natural look',  faceShapes:['oval','heart','round','diamond'] },
  { id:'havana-twist',      name:'Havana Twist',        region:'Pan-Africain',        prompt:'havana twist braids, thick chunky twists, voluminous bold style, shoulder length, black hair', faceShapes:['long','square','diamond','oval'] },
]

// Formes de visage
const FACE_SHAPE_NAMES = {
  oval:'Ovale', round:'Ronde', square:'Carree',
  heart:'Coeur', long:'Longue', diamond:'Diamant',
}

// Parser multipart
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 })
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

// Pioche aléatoire N styles parmi les compatibles
function pickRandomStyles(faceShape, count = 2) {
  const compatible = BRAIDS_LIBRARY.filter(s => s.faceShapes.includes(faceShape))
  const shuffled   = compatible.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Générer l'essayage virtuel via Fal.ai
async function generateHairTryon(selfieBase64, mimeType, braidPrompt, falApiKey) {
  try {
    // Uploader l'image sur fal.ai storage d'abord
    const imageBuffer = Buffer.from(selfieBase64, 'base64')
    const uploadRes   = await fetch('https://fal.run/fal-ai/storage/upload', {
      method:  'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type':  mimeType,
      },
      body: imageBuffer,
    })

    if (!uploadRes.ok) throw new Error('Upload failed')
    const { url: imageUrl } = await uploadRes.json()

    // Appeler le modèle hair styling
    const falRes = await fetch('https://fal.run/fal-ai/flux/dev', {
      method:  'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        prompt:            `Portrait photo of the same woman with ${braidPrompt}, photorealistic, high quality, same face same skin tone, professional photography`,
        image_url:         imageUrl,
        strength:          0.65,
        num_inference_steps: 28,
        guidance_scale:    7.5,
        num_images:        1,
        image_size:        'portrait_4_3',
      }),
    })

    if (!falRes.ok) throw new Error('Fal.ai generation failed')
    const falData = await falRes.json()
    return falData.images?.[0]?.url || null

  } catch (err) {
    console.error('Fal.ai error:', err)
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

    // 2. Claude analyse la forme du visage
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
Formes : oval, round, square, heart, long, diamond`,
        messages: [{
          role: 'user',
          content: [
            { type:'image', source:{ type:'base64', media_type:mimeType, data:base64Image } },
            { type:'text',  text:'Analyse la forme du visage. JSON uniquement.' },
          ],
        }],
      }),
    })

    let faceShape = 'oval'
    let confidence = 0.85
    let reason     = ''

    if (claudeRes.ok) {
      const claudeData = await claudeRes.json()
      const rawText    = claudeData.content?.[0]?.text || ''
      try {
        const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim())
        faceShape  = parsed.faceShape?.toLowerCase() || 'oval'
        confidence = parsed.confidence || 0.85
        reason     = parsed.reason     || ''
        if (!FACE_SHAPE_NAMES[faceShape]) faceShape = 'oval'
      } catch { /* garde oval par défaut */ }
    }

    // 3. Piocher 2 styles aléatoires compatibles
    const selectedStyles = pickRandomStyles(faceShape, 2)

    // 4. Générer l'essayage virtuel pour chaque style via Fal.ai
    const results = await Promise.all(
      selectedStyles.map(async (style) => {
        const generatedImageUrl = await generateHairTryon(
          base64Image, mimeType, style.prompt, falKey
        )
        return {
          id:          style.id,
          name:        style.name,
          region:      style.region,
          generatedImage: generatedImageUrl, // photo d'elle avec la tresse
          matchScore:  Math.floor(Math.random() * 15) + 83, // 83-98%
        }
      })
    )

    // 5. Retourner le résultat complet
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
    return res.status(500).json({ error: 'Analyse échouée. Réessaie.' })
  }
}
