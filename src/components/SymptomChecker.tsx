import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Heart, Phone, Stethoscope, Building2, PillBottle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type CareLevel = 'emergency' | 'ae' | 'utc' | 'gp' | 'pharmacy';

interface SymptomCheckerProps {
  onComplete: (careLevel: CareLevel) => void;
}

const SymptomChecker = ({ onComplete }: SymptomCheckerProps) => {
  const { t } = useLanguage();

  const handleSeveritySelect = (level: 'severe' | 'moderate' | 'mild') => {
    if (level === 'severe') {
      onComplete('emergency');
    } else if (level === 'moderate') {
      onComplete('ae');
    } else {
      onComplete('gp');
    }
  };

  return (
    <Card className="shadow-accent border-2 border-primary/20 bg-white/90 backdrop-blur-xl">
      <CardContent className="pt-8 pb-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full gradient-primary p-3 shadow-md">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-primary-dark font-display">
              Symptom Assessment
            </h2>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Let's understand how urgent your situation is
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSeveritySelect('severe')}
            className="w-full p-4 text-left rounded-xl border-2 border-destructive/20 hover:border-destructive hover:bg-destructive/5 transition-all hover:shadow-md bg-white"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-primary-dark mb-1 text-sm">Severe / Life-threatening</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Chest pain, severe bleeding, difficulty breathing, loss of consciousness, stroke symptoms
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSeveritySelect('moderate')}
            className="w-full p-4 text-left rounded-xl border-2 border-warning/20 hover:border-warning hover:bg-warning/5 transition-all hover:shadow-md bg-white"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-primary-dark mb-1 text-sm">Moderate / Urgent</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  High fever, persistent vomiting, severe pain, suspected fracture, deep cuts
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSeveritySelect('mild')}
            className="w-full p-4 text-left rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all hover:shadow-md bg-white"
          >
            <div className="flex items-start gap-3">
              <Heart className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-primary-dark mb-1 text-sm">Mild / Non-urgent</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Minor cuts, sprains, cold/flu symptoms, rashes, minor infections
                </p>
              </div>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SymptomChecker;
