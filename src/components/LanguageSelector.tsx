import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en' as const, name: 'English' },
  { code: 'ar' as const, name: 'العربية' },
  { code: 'es' as const, name: 'Español' },
  { code: 'fr' as const, name: 'Français' },
  { code: 'de' as const, name: 'Deutsch' },
  { code: 'it' as const, name: 'Italiano' },
  { code: 'pt' as const, name: 'Português' },
  { code: 'zh' as const, name: '中文' },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <footer className="border-t bg-background/70 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Select Language</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-1.5">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage(lang.code)}
                className="h-7 px-3 text-xs min-w-[70px]"
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
