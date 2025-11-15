import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destinations } = await req.json();
    
    console.log('Calculating travel times from:', origin);
    console.log('To destinations:', destinations);

    if (!origin || !destinations || destinations.length === 0) {
      throw new Error('Missing required parameters: origin and destinations');
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Format coordinates for Distance Matrix API
    const originString = `${origin.lat},${origin.lng}`;
    const destinationsString = destinations
      .map((dest: { lat: number; lng: number }) => `${dest.lat},${dest.lng}`)
      .join('|');

    // Calculate travel times for different modes
    const modes = ['driving', 'transit', 'walking'];
    const results = await Promise.all(
      modes.map(async (mode) => {
        const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
        url.searchParams.append('origins', originString);
        url.searchParams.append('destinations', destinationsString);
        url.searchParams.append('mode', mode);
        
        // For driving, include traffic data
        if (mode === 'driving') {
          url.searchParams.append('departure_time', 'now');
        }
        
        url.searchParams.append('key', apiKey);

        console.log(`Fetching ${mode} travel times...`);
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          console.error(`Error fetching ${mode} data:`, response.statusText);
          return { mode, error: true };
        }

        const data = await response.json();
        console.log(`${mode} response status:`, data.status);

        if (data.status !== 'OK') {
          console.error(`Distance Matrix API error for ${mode}:`, data);
          return { mode, error: true };
        }

        return {
          mode,
          elements: data.rows[0].elements,
        };
      })
    );

    // Process results into a cleaner format
    const travelData = results.reduce((acc, result) => {
      if (!result.error) {
        acc[result.mode] = result.elements.map((element: any) => ({
          distance: element.distance?.value || 0,
          distanceText: element.distance?.text || 'N/A',
          duration: element.duration?.value || 0,
          durationText: element.duration?.text || 'N/A',
          durationInTraffic: element.duration_in_traffic?.value || element.duration?.value || 0,
          durationInTrafficText: element.duration_in_traffic?.text || element.duration?.text || 'N/A',
          status: element.status,
        }));
      }
      return acc;
    }, {} as Record<string, any[]>);

    console.log('Successfully calculated travel times for all modes');

    return new Response(JSON.stringify(travelData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in calculate-travel-times:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
