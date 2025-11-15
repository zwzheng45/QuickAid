import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FeedbackFormProps {
  visitId: string;
  hospitalName: string;
  estimatedWaitTime: number;
  onComplete?: () => void;
}

export const FeedbackForm = ({ visitId, hospitalName, estimatedWaitTime, onComplete }: FeedbackFormProps) => {
  const [visitCompleted, setVisitCompleted] = useState<boolean | null>(null);
  const [waitTimeAccurate, setWaitTimeAccurate] = useState<boolean | null>(null);
  const [actualWaitTime, setActualWaitTime] = useState<number[]>([estimatedWaitTime]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatWaitTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} and ${remainingMinutes} minutes`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (visitCompleted === null) {
      toast({
        title: "Please answer all required questions",
        description: "Let us know if you completed your visit",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('visit_feedback')
        .insert({
          visit_id: visitId,
          visit_completed: visitCompleted,
          wait_time_accurate: waitTimeAccurate,
          actual_wait_time: actualWaitTime[0],
          rating: null,
          comments: null
        });

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "Your response helps us improve our service",
      });

      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error submitting feedback",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="font-display text-2xl font-semibold tracking-tight">
          How was your visit?
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          We'd love to hear about your experience at {hospitalName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium font-display">
              Did you complete your hospital visit?
            </Label>
            <RadioGroup 
              value={visitCompleted === null ? undefined : visitCompleted.toString()}
              onValueChange={(value) => setVisitCompleted(value === 'true')}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="true" id="completed-yes" />
                <Label htmlFor="completed-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="false" id="completed-no" />
                <Label htmlFor="completed-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {visitCompleted && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium font-display">
                  Was the estimated wait time accurate? ({estimatedWaitTime} minutes)
                </Label>
                <RadioGroup
                  value={waitTimeAccurate === null ? undefined : waitTimeAccurate.toString()}
                  onValueChange={(value) => setWaitTimeAccurate(value === 'true')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="true" id="accurate-yes" />
                    <Label htmlFor="accurate-yes" className="text-sm cursor-pointer">Yes, it was accurate</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="false" id="accurate-no" />
                    <Label htmlFor="accurate-no" className="text-sm cursor-pointer">No, it was different</Label>
                  </div>
                </RadioGroup>
              </div>

              {waitTimeAccurate === false && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="actual-wait" className="text-sm font-medium font-display">
                      What was the actual wait time?
                    </Label>
                    <div className="text-center text-lg font-semibold text-primary mb-2 font-display">
                      {formatWaitTime(actualWaitTime[0])}
                    </div>
                  </div>
                  <Slider
                    id="actual-wait"
                    min={0}
                    max={Math.max(240, estimatedWaitTime * 2)}
                    step={1}
                    value={actualWaitTime}
                    onValueChange={(value) => {
                      const rounded = Math.round(value[0] / 5) * 5;
                      setActualWaitTime([rounded]);
                    }}
                    className="w-full transition-all duration-150 ease-out"
                  />
                  <div className="relative flex justify-between text-xs text-muted-foreground">
                    <span>0 min</span>
                    <span 
                      className="absolute text-primary font-semibold"
                      style={{ 
                        left: `${(estimatedWaitTime / Math.max(240, estimatedWaitTime * 2)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      Estimated: {estimatedWaitTime} min
                    </span>
                    <span>{formatWaitTime(Math.max(240, estimatedWaitTime * 2))}</span>
                  </div>
                </div>
              )}
            </>
          )}

          <Button 
            type="submit" 
            className="w-full font-display text-sm h-10 mt-6" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
