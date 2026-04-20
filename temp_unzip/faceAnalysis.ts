import sharp from 'sharp';

/**
 * Face Analysis Utility
 * Extracts basic facial traits from an image using rule-based analysis
 * This is a simplified version - in production, you'd use a proper face detection library
 */

export interface FacialTraits {
  eyeShape: string;
  faceShape: string;
  jawline: string;
  impression: string;
  symmetry: number;
  brightness: number;
  gender: 'male' | 'female' | 'unknown';
  ethnicity: 'east_asian' | 'south_asian' | 'southeast_asian' | 'middle_eastern' | 'african' | 'european' | 'latin_american' | 'unknown';
}

export async function extractFacialTraits(imageBuffer: Buffer): Promise<FacialTraits> {
  try {
    // Get image metadata for basic analysis
    const metadata = await sharp(imageBuffer).metadata();
    
    // Analyze image properties
    const stats = await sharp(imageBuffer)
      .stats()
      .then(result => result);

    // Calculate brightness (average of RGB channels)
    const brightness = stats.channels.reduce((sum, channel) => sum + channel.mean, 0) / stats.channels.length / 255;

    // Simple gender detection based on facial features
    // This is a simplified heuristic - in production, use proper ML models like face-api.js
    const jawlineSharpness = brightness > 0.5 ? 1 : 0;
    const faceWidthRatio = metadata.width! / (metadata.height! || 1);
    // Heuristic: narrower face (< 0.95 ratio) suggests male, wider suggests female
    // Also consider brightness: higher brightness often indicates male (due to skin texture)
    const estimatedGender = (faceWidthRatio < 0.95 || brightness > 0.55) ? 'male' : 'female';

    // Simple ethnicity detection based on skin tone and facial features
    // This is a simplified heuristic - in production, use proper ML models
    // Brightness correlates with skin tone: higher brightness = lighter skin
    let estimatedEthnicity: 'east_asian' | 'south_asian' | 'southeast_asian' | 'middle_eastern' | 'african' | 'european' | 'latin_american' | 'unknown' = 'unknown';
    
    if (brightness > 0.65) {
      // Lighter skin tones: European or East Asian
      estimatedEthnicity = 'european';
    } else if (brightness > 0.55) {
      // Medium-light skin tones: East Asian, Southeast Asian, or Latin American
      estimatedEthnicity = 'east_asian';
    } else if (brightness > 0.45) {
      // Medium skin tones: South Asian, Southeast Asian, Middle Eastern, or Latin American
      estimatedEthnicity = 'southeast_asian';
    } else if (brightness > 0.35) {
      // Medium-dark skin tones: Middle Eastern, South Asian, or African
      estimatedEthnicity = 'middle_eastern';
    } else {
      // Dark skin tones: African
      estimatedEthnicity = 'african';
    }

    // Rule-based trait extraction (simplified)
    const traits: FacialTraits = {
      eyeShape: brightness > 0.6 ? 'almond' : 'round',
      faceShape: metadata.width! > metadata.height! ? 'oval' : 'round',
      jawline: brightness > 0.5 ? 'sharp' : 'soft',
      impression: brightness > 0.65 ? 'bright' : 'warm',
      symmetry: 0.75 + Math.random() * 0.2,
      brightness: brightness,
      gender: estimatedGender,
      ethnicity: estimatedEthnicity,
    };

    console.log('Detected gender:', estimatedGender, ', ethnicity:', estimatedEthnicity, '(width ratio:', faceWidthRatio.toFixed(2) + ', brightness:', brightness.toFixed(2) + ')');
    return traits;
  } catch (error) {
    console.error('Error extracting facial traits:', error);
    throw new Error('Failed to analyze facial traits');
  }
}

/**
 * Generate personality traits based on facial analysis
 * Uses Big Five personality model
 */
export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export function inferPersonality(facialTraits: FacialTraits): PersonalityTraits {
  // Seed-based personality inference (deterministic but varied)
  const seed = Object.values(facialTraits).reduce((acc, val) => {
    if (typeof val === 'number') return acc + val;
    return acc + val.length;
  }, 0);

  const seededRandom = (min: number, max: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    const rand = x - Math.floor(x);
    return min + rand * (max - min);
  };

  return {
    openness: Math.round(seededRandom(40, 85)),
    conscientiousness: Math.round(seededRandom(50, 90)),
    extraversion: Math.round(facialTraits.brightness > 0.6 ? seededRandom(60, 90) : seededRandom(30, 70)),
    agreeableness: Math.round(seededRandom(50, 85)),
    neuroticism: Math.round(seededRandom(20, 60)),
  };
}

/**
 * Calculate compatibility between two personalities
 * Returns a score 0-100 and explanation
 */
export function calculateCompatibility(
  userPersonality: PersonalityTraits,
  partnerPersonality: PersonalityTraits
): { score: number; explanation: string } {
  // Calculate differences
  const differences = {
    openness: Math.abs(userPersonality.openness - partnerPersonality.openness),
    conscientiousness: Math.abs(userPersonality.conscientiousness - partnerPersonality.conscientiousness),
    extraversion: Math.abs(userPersonality.extraversion - partnerPersonality.extraversion),
    agreeableness: Math.abs(userPersonality.agreeableness - partnerPersonality.agreeableness),
    neuroticism: Math.abs(userPersonality.neuroticism - partnerPersonality.neuroticism),
  };

  // Calculate compatibility score (lower differences = higher compatibility)
  const avgDifference = Object.values(differences).reduce((a, b) => a + b, 0) / 5;
  const score = Math.max(0, Math.round(100 - avgDifference * 1.5));

  // Generate explanation based on traits
  let explanation = '';
  if (score > 75) {
    explanation = 'You two are highly compatible! Your personalities complement each other perfectly.';
  } else if (score > 50) {
    explanation = 'You have good compatibility with some interesting differences that can strengthen your bond.';
  } else {
    explanation = 'You have contrasting personalities that could create an exciting and dynamic relationship.';
  }

  return { score, explanation };
}

/**
 * Generate partner personality based on user personality
 * Uses similarity + complementarity logic
 */
export function generatePartnerPersonality(userPersonality: PersonalityTraits): PersonalityTraits {
  const generateTrait = (userValue: number, complementary: boolean = false) => {
    if (complementary) {
      // Opposite trait for balance
      return Math.round(100 - userValue + (Math.random() - 0.5) * 20);
    } else {
      // Similar trait with slight variation
      return Math.round(userValue + (Math.random() - 0.5) * 15);
    }
  };

  return {
    openness: generateTrait(userPersonality.openness, false),
    conscientiousness: generateTrait(userPersonality.conscientiousness, false),
    extraversion: generateTrait(userPersonality.extraversion, true), // Complementary
    agreeableness: generateTrait(userPersonality.agreeableness, false),
    neuroticism: generateTrait(userPersonality.neuroticism, true), // Complementary
  };
}
