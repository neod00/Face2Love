import { VertexAI } from '@google-cloud/vertexai';
import * as fs from 'fs';
import * as path from 'path';

let vertexAI: VertexAI | null = null;

/**
 * Initialize Vertex AI client with service account credentials
 */
function initializeVertexAI(): VertexAI {
  if (vertexAI) {
    return vertexAI;
  }

  try {
    // Try to load credentials from environment variable first
    let credentials = null;
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (fs.existsSync(credPath)) {
        const credContent = fs.readFileSync(credPath, 'utf-8');
        credentials = JSON.parse(credContent);
      }
    }

    // If not found, try to load from default location
    if (!credentials) {
      const defaultPath = path.join(process.cwd(), 'google-credentials.json');
      if (fs.existsSync(defaultPath)) {
        const credContent = fs.readFileSync(defaultPath, 'utf-8');
        credentials = JSON.parse(credContent);
      }
    }

    if (!credentials) {
      throw new Error('Google Cloud credentials not found');
    }

    const projectId = credentials.project_id;
    console.log('Initializing Vertex AI with project:', projectId);

    // Set environment variable for authentication
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(process.cwd(), 'google-credentials.json');

    vertexAI = new VertexAI({
      project: projectId,
      location: 'us-central1',
    });

    return vertexAI;
  } catch (error) {
    console.error('Failed to initialize Vertex AI:', error);
    throw error;
  }
}

/**
 * Generate image using Google Vertex AI Imagen 3
 */
export async function generateImageWithImagen(prompt: string): Promise<string> {
  try {
    console.log('Generating image with Imagen 3...');
    
    const client = initializeVertexAI();
    const imageGenerativeModel = client.getGenerativeModel({
      model: 'imagen-3.0-generate-001',
    });

    const request = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await imageGenerativeModel.generateContent(request);

    if (!response.response.candidates || response.response.candidates.length === 0) {
      throw new Error('No image generated');
    }

    const candidate = response.response.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('No image content in response');
    }

    const imagePart = candidate.content.parts[0];
    
    // Check if it's an image part with inline data
    if ('inline_data' in imagePart && imagePart.inline_data) {
      const inlineData = imagePart.inline_data as any;
      const base64Data = inlineData.data;
      const mimeType = inlineData.mime_type || 'image/png';
      
      // Return base64 data URL
      const imageUrl = `data:${mimeType};base64,${base64Data}`;
      console.log('Image generated successfully with Imagen 3');
      return imageUrl;
    }

    throw new Error('Invalid image response format');
  } catch (error) {
    console.error('Error generating image with Imagen 3:', error);
    throw error;
  }
}
