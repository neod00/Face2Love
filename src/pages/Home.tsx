import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import ImageUpload from '@/components/ImageUpload';
import AgePreference from '@/components/AgePreference';
import LoadingSteps from '@/components/LoadingSteps';
import ResultPage from '@/components/ResultPage';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

type PageState = 'welcome' | 'age_preference' | 'upload' | 'loading' | 'result' | 'error';

interface ResultData {
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

export default function Home() {
  const { t, i18n } = useTranslation();
  const [pageState, setPageState] = useState<PageState>('welcome');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number>(25);
  const [agePreference, setAgePreference] = useState<'older' | 'same' | 'younger'>('same');

  const handleAgePreferenceSubmit = (age: number, preference: 'older' | 'same' | 'younger') => {
    setUserAge(age);
    setAgePreference(preference);
    setPageState('upload');
  };

  const handleImageSelect = async (file: File, preview: string) => {
    setSelectedImage(preview);
    setPageState('loading');
    
    try {
      // Call API to analyze and generate
      const formData = new FormData();
      formData.append('image', file);
      
      const currentLanguage = i18n.language || 'en';
      const queryParams = new URLSearchParams({
        lang: currentLanguage,
        userAge: userAge.toString(),
        agePreference: agePreference,
      });
      
      const response = await fetch(`/api/analyze?${queryParams.toString()}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResultData(data);
      setPageState('result');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(t('error_analysis_failed'));
      setPageState('error');
    }
  };

  const handleTryAgain = () => {
    setSelectedImage(null);
    setResultData(null);
    setErrorMessage(null);
    setPageState('age_preference');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t('app_title')}</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {pageState === 'age_preference' && (
          <div className="flex flex-col items-center justify-center gap-8 py-12">
            <div className="text-center max-w-xl">
              <h2 className="text-4xl font-bold text-foreground mb-2">
                {t('age_preference') || 'Age Preference'}
              </h2>
              <p className="text-muted-foreground">
                {t('upload_description')}
              </p>
            </div>
            <AgePreference onSubmit={handleAgePreferenceSubmit} />
          </div>
        )}

        {pageState === 'welcome' && (
          <div className="flex flex-col items-center justify-center gap-8 py-20">
            {/* Hero Section */}
            <div className="text-center max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                {t('app_tagline')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('upload_description')}
              </p>
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              onClick={() => setPageState('age_preference')}
              className="gap-2 text-lg px-8 py-6"
            >
              <Heart className="w-5 h-5" />
              {t('button_next')}
            </Button>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 w-full">
              {[
                {
                  title: 'AI-Powered',
                  description: 'Advanced facial analysis and personality inference',
                },
                {
                  title: 'Instant Results',
                  description: 'Get your ideal partner face in under 30 seconds',
                },
                {
                  title: 'Shareable',
                  description: 'Share your results with friends and family',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {pageState === 'upload' && (
          <div className="flex flex-col items-center justify-center gap-8 py-12">
            <div className="text-center max-w-xl">
              <h2 className="text-4xl font-bold text-foreground mb-2">
                {t('upload_title')}
              </h2>
              <p className="text-muted-foreground">
                {t('upload_description')}
              </p>
            </div>

            <div className="w-full max-w-md">
              <ImageUpload onImageSelect={handleImageSelect} />
            </div>

            <Button
              variant="outline"
              onClick={() => setPageState('welcome')}
            >
              {t('button_back')}
            </Button>
          </div>
        )}

        {pageState === 'loading' && (
          <div className="flex items-center justify-center py-20">
            <LoadingSteps />
          </div>
        )}

        {pageState === 'result' && resultData && (
          <ResultPage
            partnerImage={resultData.partnerImage}
            summary={resultData.summary}
            compatibility={resultData.compatibility}
            personality={resultData.personality}
            reasoning={resultData.reasoning}
            onTryAgain={handleTryAgain}
          />
        )}

        {pageState === 'error' && (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
            </div>
            <Button onClick={handleTryAgain} size="lg">
              {t('button_try_again')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
