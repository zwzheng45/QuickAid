export type TravelMode = 'driving' | 'transit' | 'walking' | 'taxi';

export interface TravelTime {
  mode: TravelMode;
  duration: number; // in minutes
  label: string;
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export function calculateTravelTimes(
  distance: number
): TravelTime[] {
  // London traffic assumptions
  const drivingSpeed = 20; // km/h average in London
  const transitSpeed = 15; // km/h average for public transport
  const walkingSpeed = 5; // km/h
  const taxiSpeed = 25; // km/h (slightly faster than regular traffic)

  return [
    {
      mode: 'driving',
      duration: Math.round((distance / drivingSpeed) * 60),
      label: 'Driving',
    },
    {
      mode: 'transit',
      duration: Math.round((distance / transitSpeed) * 60 + 10), // +10 min for waiting
      label: 'Public Transport',
    },
    {
      mode: 'walking',
      duration: Math.round((distance / walkingSpeed) * 60),
      label: 'Walking',
    },
    {
      mode: 'taxi',
      duration: Math.round((distance / taxiSpeed) * 60),
      label: 'Taxi',
    },
  ];
}

export function getWaitTimeSeverity(waitTime: number): 'low' | 'medium' | 'high' {
  if (waitTime < 60) return 'low';
  if (waitTime < 90) return 'medium';
  return 'high';
}
