import { OpenAI } from 'openai';
import { generateImageWithImagen } from './imagenGeneration';

// Initialize OpenAI client with explicit configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
});

/**
 * Generate partner face image using Google Vertex AI Imagen 3
 */
export async function generatePartnerFace(imagePrompt: string): Promise<string> {
  try {
    console.log('Generating image with Imagen 3...');
    const imagenUrl = await generateImageWithImagen(imagePrompt);
    console.log('Image generated successfully with Imagen 3');
    return imagenUrl;
  } catch (error) {
    console.error('Error generating partner face with Imagen 3:', error);
    throw new Error('Failed to generate partner face image with Imagen 3');
  }
}

/**
 * Generate partner face image using DALL-E 3
 */
async function generateWithDALLE(imagePrompt: string): Promise<string> {
  try {
    console.log('Generating image with DALL-E 3...');
    console.log('API Key configured:', !!process.env.OPENAI_API_KEY);
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'natural',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    console.log('Image generated successfully with DALL-E 3');
    return imageUrl;
  } catch (error) {
    console.error('Error generating image with DALL-E 3:', error);
    throw error;
  }
}

/**
 * Download image from URL and convert to base64
 */
export async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Failed to download generated image');
  }
}
