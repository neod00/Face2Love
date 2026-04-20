import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face detection models
 */
export async function loadFaceDetectionModels() {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Error loading face detection models:', error);
    throw new Error('Failed to load face detection models');
  }
}

/**
 * Detect faces in an image
 * Returns true if exactly one face is detected clearly
 */
export async function detectFaceInImage(imageFile: File): Promise<{
  hasFace: boolean;
  faceCount: number;
  confidence: number;
  error?: string;
}> {
  try {
    // Ensure models are loaded
    await loadFaceDetectionModels();

    // Create image element
    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);
    
    return new Promise((resolve) => {
      img.onload = async () => {
        try {
          // Detect faces with more sensitive options
          const detections = await faceapi
            .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.3  // Lower threshold for better detection
            }))
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

          URL.revokeObjectURL(objectUrl);

          console.log(`Detected ${detections.length} face(s)`);

          if (detections.length === 0) {
            resolve({
              hasFace: false,
              faceCount: 0,
              confidence: 0,
              error: 'No face detected in the image. Please upload a clear photo of your face.',
            });
          } else if (detections.length > 1) {
            resolve({
              hasFace: false,
              faceCount: detections.length,
              confidence: 0,
              error: `Multiple faces detected (${detections.length}). Please upload a photo with only your face.`,
            });
          } else {
            // Single face detected
            const detection = detections[0];
            const confidence = detection.detection.score;

            // Check if confidence is high enough (>0.3)
            if (confidence < 0.3) {
              resolve({
                hasFace: false,
                faceCount: 1,
                confidence: confidence,
                error: 'Face detection confidence too low. Please upload a clearer photo.',
              });
            } else {
              resolve({
                hasFace: true,
                faceCount: 1,
                confidence: confidence,
              });
            }
          }
        } catch (error) {
          console.error('Error detecting face:', error);
          URL.revokeObjectURL(objectUrl);
          resolve({
            hasFace: false,
            faceCount: 0,
            confidence: 0,
            error: 'Error analyzing image. Please try again.',
          });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          hasFace: false,
          faceCount: 0,
          confidence: 0,
          error: 'Failed to load image. Please try again.',
        });
      };

      img.src = objectUrl;
    });
  } catch (error) {
    console.error('Error in detectFaceInImage:', error);
    return {
      hasFace: false,
      faceCount: 0,
      confidence: 0,
      error: 'Error analyzing image. Please try again.',
    };
  }
}
