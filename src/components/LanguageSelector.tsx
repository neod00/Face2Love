import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  onLanguageChange?: (lang: string) => void;
  className?: string;
}

export default function LanguageSelector({ onLanguageChange, className = '' }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ko', label: '한국어' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    onLanguageChange?.(langCode);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="w-4 h-4 text-muted-foreground" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={i18n.language === lang.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange(lang.code)}
            className="text-xs"
          >
            {lang.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
