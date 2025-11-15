import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="fixed top-4 right-4 z-50 rounded-full"
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">{language === 'en' ? 'Switch to Arabic' : 'Switch to English'}</span>
    </Button>
  );
};
