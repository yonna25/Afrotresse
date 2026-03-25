import { fal } from "@fal-ai/client";

/**
 * G\u00e9n\u00e9ration de coiffure via Fal.ai
 * Utilise le selfie de l'utilisateur et l'image de r\u00e9f\u00e9rence du style
 */
export async function generateHairstyle(selfieFile, styleImage) {
  // 1. Upload selfie vers le storage Fal
  const selfieUrl = await fal.storage.upload(selfieFile);

  // 2. G\u00e9n\u00e9ration avec le mod\u00e8le hair-change
  // styleImage doit \u00eatre l'URL de la vue "top" (ex: style.views.top)
  const result = await fal.subscribe("fal-ai/image-apps-v2/hair-change", {
    input: {
      image_url: selfieUrl,
      reference_image_url: styleImage,
    },
  });

  return result.data.image.url;
}
