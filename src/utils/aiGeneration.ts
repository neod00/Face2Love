import { OpenAI } from 'openai';
import { PersonalityTraits } from './faceAnalysis.js';

// Lazy initialization - created on first use after dotenv has loaded
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.openai.com/v1',
    });
  }
  return _openai;
}

/**
 * Generate compatibility explanation using OpenAI
 */
export async function generateCompatibilityExplanation(
  userPersonality: PersonalityTraits,
  partnerPersonality: PersonalityTraits,
  language: string = 'en'
): Promise<string> {
  const languagePrompt = {
    en: 'English',
    ko: 'Korean',
    ja: 'Japanese',
    zh: 'Chinese',
  }[language] || 'English';

  const prompt = `You are a romantic compatibility expert. Based on the following personality traits (Big Five model), generate a brief, engaging explanation (2-3 sentences) of why these two people are compatible.

User Personality:
- Openness: ${userPersonality.openness}%
- Conscientiousness: ${userPersonality.conscientiousness}%
- Extraversion: ${userPersonality.extraversion}%
- Agreeableness: ${userPersonality.agreeableness}%
- Neuroticism: ${userPersonality.neuroticism}%

Partner Personality:
- Openness: ${partnerPersonality.openness}%
- Conscientiousness: ${partnerPersonality.conscientiousness}%
- Extraversion: ${partnerPersonality.extraversion}%
- Agreeableness: ${partnerPersonality.agreeableness}%
- Neuroticism: ${partnerPersonality.neuroticism}%

Please respond in ${languagePrompt}. Keep it romantic, positive, and concise.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a romantic compatibility expert. You must respond ONLY in ${languagePrompt}. Use a natural, warm, and romantic tone.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const languageCode = language === 'ko' ? 'ko' : language === 'ja' ? 'ja' : language === 'zh' ? 'zh' : 'en';
    return response.choices[0]?.message?.content?.trim() || 
      (languageCode === 'ko' ? '두 분은 정말 환상적인 궁합입니다! 서로의 성격이 완벽하게 조화를 이루네요.' : 'You two are meant to be together!');
  } catch (error) {
    console.error('Error generating compatibility explanation:', error);
    return language === 'ko' ? '두 분은 서로의 부족한 점을 채워주는 아름다운 관계가 될 것입니다.' : 'Your personalities complement each other beautifully.';
  }
}

/**
 * Generate reasoning for why the partner face was generated
 */
export async function generateFaceReasoning(
  userPersonality: PersonalityTraits,
  partnerPersonality: PersonalityTraits,
  language: string = 'en'
): Promise<string> {
  const languagePrompt = {
    en: 'English',
    ko: 'Korean',
    ja: 'Japanese',
    zh: 'Chinese',
  }[language] || 'English';

  const prompt = `You are a facial analysis expert. Based on personality traits, explain why the generated partner face has these characteristics (2-3 sentences):

User Personality: Openness ${userPersonality.openness}%, Extraversion ${userPersonality.extraversion}%
Partner Personality: Openness ${partnerPersonality.openness}%, Extraversion ${partnerPersonality.extraversion}%

Focus on how facial features might reflect personality (e.g., warm eyes for agreeableness, sharp jawline for conscientiousness).

Please respond in ${languagePrompt}. Keep it brief and engaging.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a facial analysis expert. You must respond ONLY in ${languagePrompt}. Complete your thoughts and do not cut off sentences.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || 
      (language === 'ko' ? '이 얼굴은 당신의 성격적 특성과 가장 조화로운 균형을 이루는 모습입니다.' : 'This face reflects the perfect balance of personality traits.');
  } catch (error) {
    console.error('Error generating face reasoning:', error);
    return language === 'ko' ? '이목구비의 특징들이 파트너의 따뜻하고 견고한 성격을 잘 표현하고 있습니다.' : 'The facial features perfectly express the personality traits.';
  }
}

/**
 * Generate image prompt for DALL-E based on personality traits
 */
export function generateImagePrompt(personality: PersonalityTraits, userGender?: string, userEthnicity?: string): string {
  // Map personality traits to visual descriptions
  const openness = personality.openness > 60 ? 'creative, expressive' : 'reserved, thoughtful';
  const extraversion = personality.extraversion > 60 ? 'warm, approachable' : 'calm, introspective';
  const agreeableness = personality.agreeableness > 60 ? 'gentle, kind' : 'strong, determined';
  const conscientiousness = personality.conscientiousness > 60 ? 'neat, polished' : 'natural, relaxed';

  // Generate opposite gender for ideal partner
  let genderDescriptor = '';
  if (userGender === 'male') {
    genderDescriptor = 'beautiful young woman, feminine features, elegant face, delicate features, graceful, soft skin, long dark hair, warm smile, kind eyes, attractive, charming';
  } else {
    genderDescriptor = 'handsome young man, masculine features, strong jawline, confident expression, rugged charm, well-defined features, attractive, charming, kind eyes';
  }

  // Add ethnicity descriptor
  let ethnicityDescriptor = '';
  switch (userEthnicity) {
    case 'east_asian':
      ethnicityDescriptor = 'East Asian, with almond-shaped eyes, smooth skin, and delicate facial features';
      break;
    case 'south_asian':
      ethnicityDescriptor = 'South Asian, with warm skin tone, expressive eyes, and distinctive facial features';
      break;
    case 'southeast_asian':
      ethnicityDescriptor = 'Southeast Asian, with warm complexion, beautiful eyes, and graceful features';
      break;
    case 'middle_eastern':
      ethnicityDescriptor = 'Middle Eastern, with distinctive features, warm skin tone, and expressive eyes';
      break;
    case 'african':
      ethnicityDescriptor = 'African, with rich skin tone, beautiful features, and expressive eyes';
      break;
    case 'european':
      ethnicityDescriptor = 'European, with fair complexion, distinctive features, and expressive eyes';
      break;
    case 'latin_american':
      ethnicityDescriptor = 'Latin American, with warm skin tone, beautiful features, and expressive eyes';
      break;
    default:
      ethnicityDescriptor = '';
  }

  const ethnicityPart = ethnicityDescriptor ? `, ${ethnicityDescriptor}` : '';
  const prompt = `Professional studio portrait of an ideal romantic partner. A ${genderDescriptor}${ethnicityPart}. Personality traits: ${openness}, ${extraversion}, ${agreeableness}, ${conscientiousness}. High quality, realistic, 8k resolution, professional photography, soft studio lighting, warm tones, symmetrical face, attractive features, kind eyes, gentle expression. Portrait style.`;

  console.log('Image prompt for', userGender, userEthnicity, 'user:', prompt.substring(0, 120) + '...');
  return prompt;
}

/**
 * Generate partner summary
 */
export async function generatePartnerSummary(
  userPersonality: PersonalityTraits,
  partnerPersonality: PersonalityTraits,
  language: string = 'en'
): Promise<string> {
  const languagePrompt = {
    en: 'English',
    ko: 'Korean',
    ja: 'Japanese',
    zh: 'Chinese',
  }[language] || 'English';

  const prompt = `Create a one-line romantic summary (max 15 words) of an ideal partner based on these personality traits:
- Openness: ${partnerPersonality.openness}%
- Conscientiousness: ${partnerPersonality.conscientiousness}%
- Extraversion: ${partnerPersonality.extraversion}%
- Agreeableness: ${partnerPersonality.agreeableness}%
- Neuroticism: ${partnerPersonality.neuroticism}%

Please respond in ${languagePrompt}. Make it poetic and romantic.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a poetic soul. You must respond ONLY in ${languagePrompt}.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content?.trim() || 
      (language === 'ko' ? '당신만을 기다려온, 당신의 영혼을 채워줄 완벽한 인연입니다.' : 'Your perfect match, waiting to be discovered.');
  } catch (error) {
    console.error('Error generating partner summary:', error);
    return language === 'ko' ? '당신을 위한 단 하나의 인연.' : 'Your ideal romantic partner.';
  }
}
