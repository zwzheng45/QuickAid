import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Hospital } from '@/data/hospitals';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundMapViewProps {
  hospitals: Hospital[];
  userLocation: { lat: number; lng: number } | null;
}

const BackgroundMapView = ({ hospitals, userLocation }: BackgroundMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const centerLat = userLocation?.lat || 51.4856;
    const centerLng = userLocation?.lng || -0.1272;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [centerLng, centerLat],
      zoom: 11,
      interactive: false,
      attributionControl: false,
    });

    // Fit map to show all hospitals
    if (hospitals.length > 0) {
      map.current.on('load', () => {
        const bounds = new mapboxgl.LngLatBounds();
        
        if (userLocation) {
          bounds.extend([userLocation.lng, userLocation.lat]);
        }
        
        hospitals.forEach(hospital => {
          bounds.extend([hospital.coordinates.lng, hospital.coordinates.lat]);
        });

        map.current?.fitBounds(bounds, { padding: 100 });
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, hospitals, userLocation]);

  if (!mapboxToken) return null;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full opacity-40"
        style={{
          filter: 'blur(1px) saturate(0.8)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/50" />
    </div>
  );
};

export default BackgroundMapView;
