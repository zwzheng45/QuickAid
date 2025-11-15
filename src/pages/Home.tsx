import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Heart, Phone, Building2, Stethoscope, PillBottle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SymptomChecker from '@/components/SymptomChecker';

type CareLevel = 'emergency' | 'ae' | 'utc' | 'gp' | 'pharmacy';

const Home = () => {
  const [showEmergency, setShowEmergency] = useState(false);
  const [showChecker, setShowChecker] = useState(false);
  const [recommendedCare, setRecommendedCare] = useState<CareLevel | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSymptomCheckerComplete = (careLevel: CareLevel) => {
    if (careLevel === 'emergency') {
      setShowEmergency(true);
    } else {
      setRecommendedCare(careLevel);
      if (careLevel === 'ae' || careLevel === 'utc') {
        navigate('/results', { state: { filterType: 'all' } });
      }
    }
  };

  const call999 = () => {
    window.location.href = 'tel:999';
  };

  const call111 = () => {
    window.location.href = 'tel:111';
  };

  if (showEmergency) {
    return (
      <div className="min-h-screen bg-destructive flex items-center justify-center p-6">
        <Card className="max-w-sm w-full bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardContent className="pt-6 pb-5 text-center">
            <div className="mb-5 flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-destructive mb-3">
              {t('home.emergency.title')}
            </h1>
            <p className="text-sm mb-6 text-foreground font-semibold">
              {t('home.emergency.message')}
            </p>
            <div className="space-y-3">
              <Button
                onClick={call999}
                size="lg"
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-base py-5 font-bold"
              >
                <Phone className="mr-2 h-5 w-5" />
                {t('home.emergency.call')}
              </Button>
              <Button
                onClick={() => navigate('/results', { state: { filterType: 'A&E' } })}
                size="lg"
                variant="outline"
                className="w-full border-2 border-destructive text-destructive hover:bg-destructive/10 font-bold"
              >
                <Building2 className="mr-2 h-5 w-5" />
                Find Nearest A&E
              </Button>
              <Button
                onClick={() => setShowEmergency(false)}
                variant="outline"
                size="lg"
                className="w-full border-2 font-bold"
              >
                {t('home.emergency.back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recommendedCare === 'gp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-primary/10 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-accent bg-white/90 backdrop-blur-xl border-2 border-primary/20">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full gradient-primary p-4 shadow-md">
                <Stethoscope className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-primary-dark mb-4">
              Visit Your GP
            </h1>
            <p className="text-base mb-6 text-muted-foreground font-medium">
              Your symptoms suggest scheduling an appointment with your GP or local health centre would be most appropriate.
            </p>
            <div className="space-y-3">
              <Button
                onClick={call111}
                size="lg"
                variant="outline"
                className="w-full border-primary/20 hover:border-accent hover:bg-accent/10 hover:text-accent"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call 111 for NHS Advice
              </Button>
              <Button
                onClick={() => setRecommendedCare(null)}
                variant="outline"
                size="lg"
                className="w-full border-primary/20 hover:border-primary hover:bg-primary/5"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recommendedCare === 'pharmacy') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-primary/10 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-accent bg-white/90 backdrop-blur-xl border-2 border-primary/20">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-success/20 p-4 shadow-md">
                <PillBottle className="h-16 w-16 text-success" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-primary-dark mb-4">
              Visit a Pharmacy
            </h1>
            <p className="text-base mb-6 text-muted-foreground font-medium">
              Your symptoms can likely be managed with over-the-counter medication. Visit your local pharmacy for advice.
            </p>
            <div className="space-y-3">
              <Button
                onClick={call111}
                size="lg"
                variant="outline"
                className="w-full border-primary/20 hover:border-accent hover:bg-accent/10 hover:text-accent"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call 111 for NHS Advice
              </Button>
              <Button
                onClick={() => setRecommendedCare(null)}
                variant="outline"
                size="lg"
                className="w-full border-primary/20 hover:border-primary hover:bg-primary/5"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showChecker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-primary/10 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <SymptomChecker onComplete={handleSymptomCheckerComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-urgent flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 animate-pulse shadow-lg">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-white mb-2 tracking-tight drop-shadow-md">
            {t('home.safetyQuestion')}
          </h1>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20">
            <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-sm font-bold">{t('home.chestPain')}</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20">
            <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-sm font-bold">{t('home.heavyBleeding')}</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20">
            <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-sm font-bold">{t('home.breathing')}</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20">
            <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-sm font-bold">{t('home.visionLoss')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => {
              setShowEmergency(true);
            }}
            size="lg"
            className="w-full text-sm py-6 font-bold bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
          >
            {t('home.yes')}
          </Button>
          <Button
            onClick={() => setShowChecker(true)}
            size="lg"
            className="w-full text-sm py-6 font-bold bg-white/20 text-white hover:bg-white/30 border-2 border-white/30 backdrop-blur-sm transition-all hover:shadow-lg"
          >
            {t('home.no')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
