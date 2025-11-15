import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Hospital } from '@/data/hospitals';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MapViewProps {
  hospitals: Hospital[];
  userLocation: { lat: number; lng: number } | null;
  onHospitalClick?: (hospitalId: string) => void;
}

const MapView = ({ hospitals, userLocation, onHospitalClick }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenLoading, setTokenLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);

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
      } finally {
        setTokenLoading(false);
      }
    };
    fetchToken();
  }, []);

  // Get marker color based on wait time (busyness)
  const getMarkerColor = (waitTime: number): string => {
    if (waitTime <= 30) return '#10B981'; // Green - less busy
    if (waitTime <= 60) return '#F59E0B'; // Orange - moderately busy
    return '#EF4444'; // Red - very busy
  };

  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const centerLat = userLocation?.lat || 51.4856;
    const centerLng = userLocation?.lng || -0.1272;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({ color: '#0070F3' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><strong>Your Location</strong></div>'))
        .addTo(map.current);
      markersRef.current.push(userMarker);
    }

    // Add hospital markers with color coding based on busyness
    hospitals.forEach((hospital) => {
      const el = document.createElement('div');
      el.className = 'hospital-marker';
      el.style.backgroundColor = getMarkerColor(hospital.currentWaitTime);
      el.style.width = '45px';
      el.style.height = '45px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.transition = 'transform 0.2s';
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([hospital.coordinates.lng, hospital.coordinates.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-sm mb-1">${hospital.name}</h3>
              <p class="text-xs text-gray-600 mb-2">${hospital.type}</p>
              <p class="text-xs mb-1">Wait: <strong>${hospital.currentWaitTime} min</strong></p>
              <button 
                onclick="window.viewHospitalDetails('${hospital.id}')"
                class="text-xs bg-blue-600 text-white px-3 py-1 rounded mt-2 hover:bg-blue-700"
              >
                View Details
              </button>
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener('click', () => {
        if (onHospitalClick) {
          onHospitalClick(hospital.id);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (hospitals.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      hospitals.forEach(hospital => {
        bounds.extend([hospital.coordinates.lng, hospital.coordinates.lat]);
      });

      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [hospitals, userLocation, onHospitalClick]);

  if (tokenLoading) {
    return (
      <div className="h-96 bg-muted flex items-center justify-center rounded-lg">
        <div className="text-center text-muted-foreground p-6">
          <p className="text-sm font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="h-96 bg-muted flex items-center justify-center rounded-lg">
        <div className="text-center text-muted-foreground p-6">
          <p className="text-sm font-medium">Map unavailable</p>
          <p className="text-xs mt-2">Unable to load Mapbox token</p>
        </div>
      </div>
    );
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredHospitals([]);
      return;
    }
    
    const matches = hospitals.filter(h => 
      h.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredHospitals(matches);
  };

  // Zoom to specific hospital
  const zoomToHospital = (hospital: Hospital) => {
    if (map.current) {
      map.current.flyTo({
        center: [hospital.coordinates.lng, hospital.coordinates.lat],
        zoom: 15,
        duration: 1500
      });
      
      // Find and trigger popup for this hospital
      const marker = markersRef.current.find((m, idx) => {
        return hospitals[idx]?.id === hospital.id;
      });
      marker?.togglePopup();
    }
    setSearchQuery('');
    setFilteredHospitals([]);
  };

  return (
    <div className="relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-10 w-72">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-background/95 backdrop-blur-sm shadow-lg border-border"
          />
        </div>
        
        {/* Search Results Dropdown */}
        {filteredHospitals.length > 0 && (
          <div className="mt-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border max-h-60 overflow-y-auto">
            {filteredHospitals.map((hospital) => (
              <button
                key={hospital.id}
                onClick={() => zoomToHospital(hospital)}
                className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
              >
                <div className="font-medium text-sm">{hospital.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {hospital.type} • Wait: {hospital.currentWaitTime} min
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={mapContainer} className="h-96 rounded-lg shadow-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs">
        <div className="font-semibold mb-2">Busyness Level</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
            <span>Less busy (&lt;30 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#F59E0B]"></div>
            <span>Moderate (30-60 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#EF4444]"></div>
            <span>Very busy (&gt;60 min)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
