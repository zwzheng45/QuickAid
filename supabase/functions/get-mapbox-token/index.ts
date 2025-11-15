import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAPBOX_PUBLIC_TOKEN = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!MAPBOX_PUBLIC_TOKEN) {
      throw new Error('MAPBOX_PUBLIC_TOKEN is not configured');
    }

    return new Response(
      JSON.stringify({ token: MAPBOX_PUBLIC_TOKEN }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-mapbox-token:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
