import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FeedbackForm } from '@/components/FeedbackForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VisitData {
  id: string;
  hospital_name: string;
  wait_time: number;
}

const Feedback = () => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisit = async () => {
      if (!visitId) {
        toast({
          title: "Invalid visit ID",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Handle demo mode
      if (visitId === 'demo-visit-id') {
        setVisit({
          id: 'demo-visit-id',
          hospital_name: 'Demo Hospital - Sample Visit',
          wait_time: 45
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('hospital_visits')
          .select('id, hospital_name, wait_time')
          .eq('id', visitId)
          .single();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Visit not found",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setVisit(data);
      } catch (error) {
        console.error('Error fetching visit:', error);
        toast({
          title: "Error loading visit data",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [visitId, navigate]);

  const handleComplete = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (!visit) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <FeedbackForm
          visitId={visit.id}
          hospitalName={visit.hospital_name}
          estimatedWaitTime={visit.wait_time}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
};

export default Feedback;
