import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate image using Google Generative AI (Gemini / Imagen 3)
 */
export async function generateImageWithImagen(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY not found in environment');
    }

    console.log('Attempting to generate image with Google AI SDK (Imagen 3)...');
    
    // Initialize the SDK with the API Key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Note: As of current SDK, Imagen 3 might be accessed via a specific model name
    // If using Vertex AI via API Key is restricted, we'll need to ensure the model name is correct
    // For many users, Imagen 3 is "imagen-3.0-generate-001" or the new "gemini-2.0-flash" multimodal capabilities
    const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });

    // The syntax for image generation in Google AI SDK can vary depending on the specific model support
    // Here we use the standard generateContent which Imagen 3 supports in some regions/versions
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // If it returns a blob/base64
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const part = candidates[0].content.parts[0];
      if ('inlineData' in part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error('No image data found in Google AI response');
  } catch (error) {
    console.error('Error generating image with Google AI:', error);
    throw error;
  }
}
