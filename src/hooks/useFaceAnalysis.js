// Charge le script MediaPipe depuis le CDN si pas déjà présent
function loadMediaPipeScript() {
  return new Promise((resolve, reject) => {
    if (window.FaceMesh) {
      resolve(window.FaceMesh);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      if (window.FaceMesh) {
        resolve(window.FaceMesh);
      } else {
        reject(new Error('FaceMesh non disponible après chargement du script'));
      }
    };

    script.onerror = () => reject(new Error('Impossible de charger le script MediaPipe'));
    document.head.appendChild(script);
  });
}

// ✅ FONCTION NORMALE (plus un faux hook)
export async function analyzeFaceWithAI(photoBlob, timeoutMs = 15000) {
  return new Promise(async (resolve, reject) => {
    let timeoutId;

    try {
      const FaceMesh = await loadMediaPipeScript();

      const startTime = Date.now();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 480;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const ratio = img.width / img.height;
        let w = 640, h = 480, x = 0, y = 0;

        if (ratio > 640 / 480) {
          h = 640 / ratio;
          y = (480 - h) / 2;
        } else {
          w = 480 * ratio;
          x = (640 - w) / 2;
        }

        ctx.drawImage(img, x, y, w, h);

        try {
          const faceMesh = new FaceMesh({
            locateFile: (file) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
          });

          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.65,
            minTrackingConfidence: 0.65,
          });

          let detected = false;

          faceMesh.onResults((results) => {
            if (
              !detected &&
              results.multiFaceLandmarks &&
              results.multiFaceLandmarks.length > 0
            ) {
              detected = true;
              if (timeoutId) clearTimeout(timeoutId);

              const landmarks = results.multiFaceLandmarks[0];
              faceMesh.close();

              resolve({
                landmarks,
                width: 640,
                height: 480,
                confidence: 0.85,
                processingTime: Date.now() - startTime,
              });
            }
          });

          faceMesh.send({ image: canvas });

          timeoutId = setTimeout(() => {
            faceMesh.close();
            reject(
              new Error(
                `Timeout: MediaPipe n'a pas détecté de visage après ${timeoutMs}ms`
              )
            );
          }, timeoutMs);
        } catch (initErr) {
          reject(new Error(`Erreur FaceMesh: ${initErr.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error("Impossible de charger l'image"));
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => {
        reject(new Error('Erreur lecture du fichier'));
      };

      reader.readAsDataURL(photoBlob);
    } catch (err) {
      reject(new Error(`Erreur: ${err.message}`));
    }
  });
}
