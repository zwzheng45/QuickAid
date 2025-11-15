import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TravelData {
  driving?: Array<{
    distance: number;
    distanceText: string;
    duration: number;
    durationText: string;
    durationInTraffic: number;
    durationInTrafficText: string;
    status: string;
  }>;
  transit?: Array<{
    distance: number;
    distanceText: string;
    duration: number;
    durationText: string;
    status: string;
  }>;
  walking?: Array<{
    distance: number;
    distanceText: string;
    duration: number;
    durationText: string;
    status: string;
  }>;
}

export const useDistanceMatrix = (
  origin: { lat: number; lng: number } | null,
  destinations: Array<{ lat: number; lng: number }>
) => {
  const [travelData, setTravelData] = useState<TravelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || destinations.length === 0) {
      return;
    }

    const fetchTravelTimes = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Calling calculate-travel-times function...');
        const { data, error: functionError } = await supabase.functions.invoke(
          'calculate-travel-times',
          {
            body: {
              origin,
              destinations,
            },
          }
        );

        if (functionError) {
          console.error('Error calling function:', functionError);
          throw new Error(functionError.message);
        }

        console.log('Travel times calculated successfully:', data);
        setTravelData(data);
      } catch (err) {
        console.error('Error fetching travel times:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch travel times');
      } finally {
        setLoading(false);
      }
    };

    fetchTravelTimes();
  }, [origin, destinations]);

  return { travelData, loading, error };
};
