import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Share2, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface ResultPageProps {
  partnerImage: string;
  summary: string;
  compatibility: string;
  personality: PersonalityTraits;
  reasoning: string;
  onTryAgain: () => void;
}

export default function ResultPage({
  partnerImage,
  summary,
  compatibility,
  personality,
  reasoning,
  onTryAgain,
}: ResultPageProps) {
  const { t } = useTranslation();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const personalityItems = [
    { key: 'openness', label: t('personality_openness') },
    { key: 'conscientiousness', label: t('personality_conscientiousness') },
    { key: 'extraversion', label: t('personality_extraversion') },
    { key: 'agreeableness', label: t('personality_agreeableness') },
    { key: 'neuroticism', label: t('personality_neuroticism') },
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('app_title'),
          text: summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {t('result_title')}
          </h1>
          <p className="text-lg text-muted-foreground">{summary}</p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Partner Image */}
          <div
            className={`flex items-center justify-center transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img
                src={partnerImage}
                alt="Partner"
                onLoad={() => setIsImageLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            {/* Compatibility */}
            <Card
              className={`p-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('result_compatibility')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {compatibility}
              </p>
            </Card>

            {/* Personality Breakdown */}
            <Card
              className={`p-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {t('result_personality')}
              </h3>
              <div className="space-y-3">
                {personalityItems.map((item) => {
                  const value = personality[item.key as keyof PersonalityTraits] || 0;
                  return (
                    <div key={item.key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(value)}%
                        </span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Reasoning */}
            <Card
              className={`p-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('result_reasoning')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reasoning}
              </p>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div
          className={`flex gap-4 justify-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={onTryAgain}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t('button_try_again')}
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            {t('button_share')}
          </Button>
        </div>
      </div>
    </div>
  );
}
