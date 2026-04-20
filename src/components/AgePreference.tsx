import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface AgePreferenceProps {
  onSubmit: (age: number, preference: 'older' | 'same' | 'younger') => void;
}

export default function AgePreference({ onSubmit }: AgePreferenceProps) {
  const { t } = useTranslation();
  const [userAge, setUserAge] = useState<number>(25);
  const [preference, setPreference] = useState<'older' | 'same' | 'younger'>('same');

  const handleSubmit = () => {
    if (userAge >= 18 && userAge <= 100) {
      onSubmit(userAge, preference);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Age Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          {t('your_age') || 'Your Age'}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="18"
            max="100"
            value={userAge}
            onChange={(e) => setUserAge(Math.max(18, Math.min(100, parseInt(e.target.value) || 18)))}
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-lg font-semibold text-muted-foreground">years</span>
        </div>
      </div>

      {/* Age Preference */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          {t('age_preference') || 'Age Preference'}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'older', label: t('older_partner') || 'Older', emoji: '👵' },
            { value: 'same', label: t('same_age') || 'Same Age', emoji: '👯' },
            { value: 'younger', label: t('younger_partner') || 'Younger', emoji: '👶' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPreference(option.value as 'older' | 'same' | 'younger')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                preference === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-2">{option.emoji}</div>
              <div className="text-sm font-medium text-foreground">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        size="lg"
        className="w-full gap-2 text-lg"
      >
        {t('button_next') || 'Next'}
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
