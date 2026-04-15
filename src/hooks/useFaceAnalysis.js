/**
 * Hook de gestion de l'analyse faciale
 * Correction : Vérification du type Blob pour éviter l'erreur FileReader
 */

export async function analyzeFaceWithAI(photoData, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    // 1. Sécurité : Si ce n'est pas un Blob, on essaie de le convertir ou on rejette
    if (!(photoData instanceof Blob)) {
      console.error("Format reçu invalide :", typeof photoData);
      return reject(new Error("L'image fournie n'est pas au format valide (Blob/File)"));
    }

    const timer = setTimeout(() => {
      reject(new Error(`Timeout: MediaPipe n'a pas répondu après ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      const reader = new FileReader();
      
      reader.onerror = () => {
        clearTimeout(timer);
        reject(new Error("Erreur lors de la lecture du fichier image"));
      };

      reader.onload = () => {
        const image = new Image();
        image.src = reader.result;
        
        image.onload = () => {
          clearTimeout(timer);
          // On renvoie un objet compatible avec le reste de ta logique AfroTresse
          resolve({ 
            landmarks: [], 
            imageElement: image 
          }); 
        };
      };

      reader.readAsDataURL(photoData);

    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}
