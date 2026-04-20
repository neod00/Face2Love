import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  extractFacialTraits,
  inferPersonality,
  generatePartnerPersonality,
  calculateCompatibility,
} from '../utils/faceAnalysis.js';
import {
  generateCompatibilityExplanation,
  generateFaceReasoning,
  generateImagePrompt,
  generatePartnerSummary,
} from '../utils/aiGeneration.js';
import { generatePartnerFace } from '../utils/imageGeneration.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

interface AnalyzeRequest extends Request {
  file?: any;
  query: {
    lang?: string;
  };
}

interface AnalyzeResponse {
  partnerImage: string;
  summary: string;
  compatibility: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  reasoning: string;
}

router.post('/analyze', upload.single('image'), async (req: AnalyzeRequest, res: Response<AnalyzeResponse>) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' } as any);
    }

    const language = req.query.lang || 'en';

    // Step 1: Extract facial traits
    const facialTraits = await extractFacialTraits(req.file.buffer);

    // Step 2: Infer user personality
    const userPersonality = inferPersonality(facialTraits);

    // Step 3: Generate partner personality
    const partnerPersonality = generatePartnerPersonality(userPersonality);

    // Step 4: Generate AI text content (Parallel)
    const [summary, compatibility, reasoning] = await Promise.all([
      generatePartnerSummary(userPersonality, partnerPersonality, language as string),
      generateCompatibilityExplanation(userPersonality, partnerPersonality, language as string),
      generateFaceReasoning(userPersonality, partnerPersonality, language as string),
    ]);

    // Step 5: Generate image prompt (with detected gender and ethnicity)
    console.log('User detected - Gender:', facialTraits.gender, ', Ethnicity:', facialTraits.ethnicity);
    const imagePrompt = generateImagePrompt(partnerPersonality, facialTraits.gender, facialTraits.ethnicity);

    // Step 6: Generate partner face image
    const partnerImageUrl = await generatePartnerFace(imagePrompt);

    // Step 7: Return result
    const response: AnalyzeResponse = {
      partnerImage: partnerImageUrl,
      summary,
      compatibility,
      personality: partnerPersonality,
      reasoning,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: 'Failed to analyze image' } as any);
  }
});

export default router as any;
