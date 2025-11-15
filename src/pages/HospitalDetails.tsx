import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone, Clock, CheckCircle2, Navigation, Sparkles, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { requestNotificationPermission, scheduleVisitFeedbackNotification } from '@/utils/notifications';
import { toast } from '@/hooks/use-toast';
import { useHospital } from '@/hooks/useHospitals';

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  
  const { hospital, loading: hospitalLoading, error: hospitalError } = useHospital(id);
  const hospitalData = location.state as { travelTime?: number; travelMode?: string } | undefined;

  useEffect(() => {
    const generateExplanation = async () => {
      if (!hospital) return;
      
      setLoadingAi(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-hospital-recommendation', {
          body: {
            hospitalName: hospital.name,
            travelTime: hospitalData?.travelTime || 15,
            waitTime: hospital.currentWaitTime,
            travelMode: hospitalData?.travelMode || 'driving'
          }
        });

        if (error) throw error;
        if (data?.explanation) {
          setAiExplanation(data.explanation);
        }
      } catch (error) {
        console.error('Error generating AI explanation:', error);
      } finally {
        setLoadingAi(false);
      }
    };

    generateExplanation();
  }, [hospital, hospitalData]);

  if (hospitalLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (!hospital || hospitalError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hospital not found</h1>
          <Button onClick={() => navigate('/results')}>
            {t('details.back')}
          </Button>
        </div>
      </div>
    );
  }

  const getDirections = async () => {
    const travelTime = hospitalData?.travelTime || 15;
    const waitTime = hospital.currentWaitTime;
    const totalTime = travelTime + waitTime;

    // Request notification permission
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications to receive feedback requests",
        variant: "destructive"
      });
    }

    try {
      // Save visit to database
      const estimatedEndTime = new Date();
      estimatedEndTime.setMinutes(estimatedEndTime.getMinutes() + totalTime);

      const { data, error } = await supabase
        .from('hospital_visits')
        .insert({
          hospital_id: hospital.id,
          hospital_name: hospital.name,
          travel_time: travelTime,
          wait_time: waitTime,
          total_estimated_time: totalTime,
          estimated_end_time: estimatedEndTime.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (data && hasPermission) {
        // Schedule notification for after estimated visit time
        scheduleVisitFeedbackNotification(data.id, hospital.name, totalTime);
        
        toast({
          title: "Journey started!",
          description: `We'll check in with you in about ${totalTime} minutes`,
        });
      }
    } catch (error) {
      console.error('Error saving visit:', error);
      toast({
        title: "Error",
        description: "Could not save visit information",
        variant: "destructive"
      });
    }

    // Open directions
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`,
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/results')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('details.back')}
        </Button>

        <div className="space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl mb-2">{hospital.name}</CardTitle>
                  <Badge variant={hospital.type === 'A&E' ? 'default' : 'secondary'} className="text-xs">
                    {hospital.type}
                  </Badge>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-sm text-muted-foreground mb-1">{t('details.currentWait')}</p>
                  <p className="text-3xl font-bold text-primary">
                    {hospital.currentWaitTime}
                    <span className="text-sm font-normal ml-1">{t('results.minutes')}</span>
                  </p>
                </div>
              </div>
            </CardHeader>

              <div className="space-y-6 pl-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {t('details.address')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{hospital.address}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      {t('details.phone')}
                    </h3>
                    <a href={`tel:${hospital.phone}`} className="text-sm text-primary hover:underline">
                      {hospital.phone}
                    </a>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {t('details.hours')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{hospital.openingHours}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">{t('details.acceptedInsurance')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {hospital.acceptedInsurances.map((insurance) => (
                        <Badge key={insurance} variant="outline" className="text-xs">
                          {insurance}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => window.location.href = `tel:${hospital.phone}`}
                    variant="outline"
                    className="flex-1"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Hospital
                  </Button>
                  <Button onClick={getDirections} className="flex-1">
                    <Navigation className="mr-2 h-4 w-4" />
                    {t('details.getDirections')}
                  </Button>
                </div>
              </div>
          </Card>

          {aiExplanation && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Why QuickAid Recommends This
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{aiExplanation}</p>
              </CardContent>
            </Card>
          )}

          {loadingAi && !aiExplanation && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  Why QuickAid Recommends This
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Generating personalized recommendation...</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('details.whatToBring')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {hospital.type === 'A&E' ? (
                  <>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('details.ae.item1')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('details.ae.item2')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('details.ae.item3')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('details.ae.item4')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('details.ae.item5')}</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('details.utc.item1')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('details.utc.item2')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('details.utc.item3')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{t('details.utc.item4')}</span>
                    </li>
                  </>
                )}
              </ul>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Need your NHS number?</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open('https://www.nhs.uk/nhs-services/online-services/find-nhs-number/', '_blank')}
                    variant="outline"
                    className="flex-0"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Find your NHS number
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/30">
            <CardHeader>
              <CardTitle>{t('afterVisit.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('afterVisit.subtitle')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="rounded-full bg-primary/10 p-2 h-fit">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t('afterVisit.gp')}</h4>
                  <p className="text-sm text-muted-foreground">{t('afterVisit.gpDesc')}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="rounded-full bg-primary/10 p-2 h-fit">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t('afterVisit.prescription')}</h4>
                  <p className="text-sm text-muted-foreground">{t('afterVisit.prescriptionDesc')}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="rounded-full bg-primary/10 p-2 h-fit">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t('afterVisit.followup')}</h4>
                  <p className="text-sm text-muted-foreground">{t('afterVisit.followupDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;
