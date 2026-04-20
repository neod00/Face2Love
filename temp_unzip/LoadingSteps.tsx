import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface LoadingStep {
  key: string;
  label: string;
  duration: number;
}

interface LoadingStepsProps {
  currentStep?: number;
  totalSteps?: number;
}

export default function LoadingSteps({ currentStep = 0, totalSteps = 4 }: LoadingStepsProps) {
  const { t } = useTranslation();
  const [displayStep, setDisplayStep] = useState(0);

  const steps: LoadingStep[] = [
    { key: 'analyzing', label: t('loading_analyzing'), duration: 3000 },
    { key: 'personality', label: t('loading_personality'), duration: 3000 },
    { key: 'matching', label: t('loading_matching'), duration: 3000 },
    { key: 'generating', label: t('loading_generating'), duration: 4000 },
  ];

  useEffect(() => {
    if (currentStep >= steps.length) return;

    const timer = setTimeout(() => {
      if (displayStep < steps.length - 1) {
        setDisplayStep(displayStep + 1);
      }
    }, steps[displayStep].duration);

    return () => clearTimeout(timer);
  }, [displayStep, steps]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      {/* Main Loading Message */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {steps[displayStep]?.label}
        </h2>
        <p className="text-sm text-muted-foreground">
          {displayStep + 1} / {steps.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((displayStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex gap-3">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${index <= displayStep 
                ? 'bg-primary scale-100' 
                : 'bg-border scale-75'
              }
            `}
          />
        ))}
      </div>

      {/* Animated Dots */}
      <div className="flex gap-2 justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.4s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
