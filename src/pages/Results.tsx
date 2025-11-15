import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { MapPin, Clock, Navigation, Sparkles, Map, List, Car, Bus, PieChart, Footprints, ArrowUpDown, X, Zap, Search, ExternalLink, Bell } from 'lucide-react';
import { Hospital } from '@/data/hospitals';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, calculateTravelTimes, getWaitTimeSeverity, TravelTime } from '@/utils/travelCalculations';
import { useHospitals } from '@/hooks/useHospitals';
import MapView from '@/components/MapView';
import BackgroundMapView from '@/components/BackgroundMapView';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { useDistanceMatrix } from '@/hooks/useDistanceMatrix';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type InsuranceType = 'ihs' | 'bupa' | 'aviva' | 'other';
type SortType = 'distance' | 'waitTime' | 'travelTime' | 'quickRoute';
type HospitalTypeFilter = 'all' | 'A&E' | 'UTC';

const ITEMS_PER_PAGE = 8;

const Results = () => {
  const location = useLocation();
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('ihs');
  const [sortBy, setSortBy] = useState<SortType>('distance');
  const [hospitalTypeFilter, setHospitalTypeFilter] = useState<HospitalTypeFilter>(
    (location.state as { filterType?: HospitalTypeFilter })?.filterType || 'all'
  );
  const [showMap, setShowMap] = useState(false);
  const [requestLocation, setRequestLocation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dismissedHospitals, setDismissedHospitals] = useState<string[]>([]);
  const [customInsurance, setCustomInsurance] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospitalForMap, setSelectedHospitalForMap] = useState<Hospital | null>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { latitude, longitude, error, loading } = useGeolocation(requestLocation);
  const { toast: toastHook } = useToast();
  
  // Fetch hospitals from API
  const searchInsurance = insuranceType === 'other' 
    ? customInsurance.trim() 
    : insuranceType === 'ihs' ? 'IHS' : insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1);
  const { hospitals: apiHospitals, loading: hospitalsLoading, error: hospitalsError } = useHospitals(searchInsurance || undefined);

  useEffect(() => {
    const dismissed = localStorage.getItem('notificationBannerDismissed');
    const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
    setShowNotificationBanner(!dismissed && permission === 'default');
  }, []);

  const handleEnableNotifications = async () => {
    if (typeof Notification === 'undefined') {
      toastHook({
        title: "Not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toastHook({
          title: "Notifications enabled!",
          description: "You'll receive alerts when wait times change.",
        });
        setShowNotificationBanner(false);
        localStorage.setItem('notificationBannerDismissed', 'true');
      } else {
        toastHook({
          title: "Notifications blocked",
          description: "Enable notifications in your browser settings to receive alerts.",
          variant: "destructive",
        });
        setShowNotificationBanner(false);
        localStorage.setItem('notificationBannerDismissed', 'true');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleDismissBanner = () => {
    setShowNotificationBanner(false);
    localStorage.setItem('notificationBannerDismissed', 'true');
  };

  useEffect(() => {
    if (error) {
      toast.error('Could not get your location. Using default location (Nine Elms).');
    }
  }, [error]);

  // Filter hospitals based on hospital type and search query
  const filteredHospitals = useMemo(() => {
    return apiHospitals.filter(hospital => {
      // Hospital type filter
      const matchesType = hospitalTypeFilter === 'all' || hospital.type === hospitalTypeFilter;

      // Search filter
      const matchesSearch = !searchQuery.trim() || 
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [apiHospitals, hospitalTypeFilter, searchQuery]);

  // Get real-time travel data from Google Maps
  const userLocation = useMemo(() => {
    const userLat = latitude || 51.4856;
    const userLng = longitude || -0.1272;
    return { lat: userLat, lng: userLng };
  }, [latitude, longitude]);

  const destinations = useMemo(() => 
    filteredHospitals.map(h => ({ lat: h.coordinates.lat, lng: h.coordinates.lng })),
    [filteredHospitals]
  );

  const { travelData, loading: travelLoading, error: travelError } = useDistanceMatrix(
    userLocation,
    destinations
  );

  useEffect(() => {
    if (travelError) {
      toast.error('Could not fetch real-time travel data. Using estimated times.');
    }
  }, [travelError]);

  // Calculate AI recommendation with weighted scoring
  const hospitalsWithTimes = useMemo(() => {
    const hospitalData = filteredHospitals.map((hospital, index) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        hospital.coordinates.lat,
        hospital.coordinates.lng
      );
      
      let travelTimes: TravelTime[];
      let drivingTime: number;

      // Use real Google Maps data if available, otherwise fall back to calculations
      if (travelData?.driving?.[index] && travelData.driving[index].status === 'OK') {
        const realData = travelData.driving[index];
        drivingTime = Math.round(realData.durationInTraffic / 60); // Convert seconds to minutes
        
        travelTimes = [
          {
            mode: 'driving',
            duration: drivingTime,
            label: 'Driving (live traffic)',
          },
          travelData?.transit?.[index]?.status === 'OK' ? {
            mode: 'transit',
            duration: Math.round(travelData.transit[index].duration / 60),
            label: 'Public Transport',
          } : null,
          travelData?.walking?.[index]?.status === 'OK' ? {
            mode: 'walking',
            duration: Math.round(travelData.walking[index].duration / 60),
            label: 'Walking',
          } : null,
        ].filter(Boolean) as TravelTime[];
      } else {
        // Fallback to mathematical calculations
        travelTimes = calculateTravelTimes(distance);
        drivingTime = travelTimes.find(t => t.mode === 'driving')!.duration;
      }

      const totalTime = drivingTime + hospital.currentWaitTime;
      
      // AI scoring: prioritize travel time (60%) over wait time (40%)
      const aiScore = (drivingTime * 0.6) + (hospital.currentWaitTime * 0.4);
      
      return {
        ...hospital,
        distance,
        travelTimes,
        travelTime: drivingTime,
        totalTime,
        aiScore,
        usingRealData: !!travelData?.driving?.[index],
      };
    });

    // Sort based on selected sort type
    const sorted = [...hospitalData].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'waitTime':
          return a.currentWaitTime - b.currentWaitTime;
        case 'travelTime':
          return a.travelTime - b.travelTime;
        default:
          return a.aiScore - b.aiScore;
      }
    });

    // Always move the AI recommended hospital to the top
    const recommendedIndex = sorted.findIndex(h => h.aiScore === Math.min(...sorted.map(h => h.aiScore)));
    if (recommendedIndex > 0) {
      const [recommended] = sorted.splice(recommendedIndex, 1);
      sorted.unshift(recommended);
    }

    return sorted;
  }, [filteredHospitals, userLocation, travelData, sortBy]);

  // Get AI recommended hospital (always based on aiScore regardless of sort)
  const recommendedHospitalId = useMemo(() => {
    const sorted = [...filteredHospitals.map((hospital, index) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        hospital.coordinates.lat,
        hospital.coordinates.lng
      );
      let drivingTime: number;
      if (travelData?.driving?.[index] && travelData.driving[index].status === 'OK') {
        drivingTime = Math.round(travelData.driving[index].durationInTraffic / 60);
      } else {
        const travelTimes = calculateTravelTimes(distance);
        drivingTime = travelTimes.find(t => t.mode === 'driving')!.duration;
      }
      const aiScore = (drivingTime * 0.6) + (hospital.currentWaitTime * 0.4);
      return { id: hospital.id, aiScore };
    })].sort((a, b) => a.aiScore - b.aiScore);
    return sorted[0]?.id;
  }, [filteredHospitals, userLocation, travelData]);
  
  // Pagination logic
  const totalPages = Math.ceil(hospitalsWithTimes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHospitals = hospitalsWithTimes.slice(startIndex, endIndex);

  // Get wait time color based on actual data range
  const getWaitTimeColor = (waitTime: number) => {
    const allWaitTimes = hospitalsWithTimes.map(h => h.currentWaitTime);
    const minWait = Math.min(...allWaitTimes);
    const maxWait = Math.max(...allWaitTimes);
    const range = maxWait - minWait;
    
    const position = (waitTime - minWait) / range;
    
    if (position < 0.33) return 'bg-success';
    if (position < 0.66) return 'bg-warning';
    return 'bg-destructive';
  };

  // Handle hospital dismissal in QuickRoute mode
  const handleDismissHospital = (hospitalId: string) => {
    setDismissedHospitals(prev => [...prev, hospitalId]);
  };

  // Generate map links
  const getAppleMapsLink = (lat: number, lng: number) => {
    return `http://maps.apple.com/?q=${lat},${lng}`;
  };

  const getGoogleMapsLink = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  // Filter hospitals for QuickRoute mode
  const displayHospitals = useMemo(() => {
    if (sortBy === 'quickRoute') {
      // Show top 5 AI recommended hospitals that haven't been dismissed
      const nonDismissed = hospitalsWithTimes.filter(h => !dismissedHospitals.includes(h.id));
      return nonDismissed.slice(0, 5);
    }
    return paginatedHospitals;
  }, [sortBy, hospitalsWithTimes, dismissedHospitals, paginatedHospitals]);

  // Reset to page 1 when insurance type, sort, hospital type, or search changes
  useEffect(() => {
    setCurrentPage(1);
    setDismissedHospitals([]); // Reset dismissed hospitals when changing filters
  }, [insuranceType, sortBy, hospitalTypeFilter, searchQuery]);

  if (hospitalsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  if (hospitalsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-primary/5 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Hospitals</h2>
          <p className="text-muted-foreground mb-4">We couldn't load the hospital data. Please try again later.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-secondary to-primary/5">
      {/* Notification Banner */}
      {showNotificationBanner && (
        <div className="relative z-20 bg-white/55 backdrop-blur-md border-b border-primary/10 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Bell className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-foreground text-sm font-medium">
                Want live alerts when waits change? Enable notifications.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleEnableNotifications}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              >
                Enable
              </Button>
              <Button
                onClick={handleDismissBanner}
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:bg-primary/5 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Background Map with overlay */}
      <div className="absolute inset-0 opacity-20">
        <BackgroundMapView 
          hospitals={filteredHospitals}
          userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : null}
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 p-6 rounded-2xl bg-white/80 backdrop-blur-xl shadow-elegant border border-primary/10">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
              <Input
                type="text"
                placeholder="Search hospitals by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/60 backdrop-blur-sm border-primary/20 focus:border-primary"
              />
            </div>


            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <p className="text-sm font-medium text-primary/80 mb-2">{t('results.insuranceType')}</p>
                  <Select value={insuranceType} onValueChange={(v) => setInsuranceType(v as InsuranceType)}>
                    <SelectTrigger className="w-[180px] bg-white/60 border-primary/20">
                      <SelectValue placeholder="Select insurance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ihs">IHS</SelectItem>
                      <SelectItem value="bupa">Bupa</SelectItem>
                      <SelectItem value="aviva">Aviva</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {insuranceType === 'other' && (
                  <div>
                    <p className="text-sm font-medium text-primary/80 mb-2">Enter Insurance Name</p>
                    <input
                      type="text"
                      value={customInsurance}
                      onChange={(e) => setCustomInsurance(e.target.value)}
                      placeholder="Type insurance name"
                      className="flex h-10 w-full rounded-md border border-primary/20 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      maxLength={50}
                    />
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-primary/80 mb-2">Sort by</p>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
                    <SelectTrigger className="w-[200px] bg-white/60 border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quickRoute">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-accent" />
                          QuickRoute AI
                        </div>
                      </SelectItem>
                      <SelectItem value="distance">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Distance
                        </div>
                      </SelectItem>
                      <SelectItem value="travelTime">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Travel Time
                        </div>
                      </SelectItem>
                      <SelectItem value="waitTime">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Wait Time
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm font-medium text-primary/80 mb-2">Hospital Type</p>
                  <ToggleGroup 
                    type="single" 
                    value={hospitalTypeFilter === 'all' ? '' : hospitalTypeFilter}
                    onValueChange={(value) => setHospitalTypeFilter((value as HospitalTypeFilter) || 'all')}
                    className="justify-start border border-primary/20 rounded-md bg-white/60 p-0.5 h-10"
                  >
                    <ToggleGroupItem 
                      value="UTC" 
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border-r border-primary/20 rounded-l-md rounded-r-none h-full px-4 text-sm"
                    >
                      UTC
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="A&E" 
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-r-md rounded-l-none h-full px-4 text-sm"
                    >
                      A&E
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {!requestLocation && (
                  <Button
                    variant="outline"
                    onClick={() => setRequestLocation(true)}
                    disabled={loading}
                    className="flex-1 sm:flex-initial border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {loading ? 'Getting location...' : 'Use My Location'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className="flex-1 sm:flex-initial border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                >
                  {showMap ? (
                    <>
                      <List className="mr-2 h-4 w-4" />
                      {t('results.showList')}
                    </>
                  ) : (
                    <>
                      <Map className="mr-2 h-4 w-4" />
                      {t('results.showMap')}
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {latitude && longitude && (
              <div className="flex items-center gap-2 text-sm text-accent font-medium">
                <MapPin className="h-4 w-4" />
                <span>Using your location ({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
              </div>
            )}
          </div>
        </div>

        {showMap && (
          <Card className="mb-8 overflow-hidden shadow-accent border-2 border-primary/20 bg-white/80 backdrop-blur-xl">
            <MapView
              hospitals={filteredHospitals} 
              userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : null}
              onHospitalClick={(id) => navigate(`/hospital/${id}`)}
            />
          </Card>
        )}

        <div className="space-y-4">
          {displayHospitals.map((hospital, index) => {
            const isQuickRouteMode = sortBy === 'quickRoute';
            const quickRouteNumber = isQuickRouteMode ? index + 1 : null;
            
            return (
              <Card 
                key={hospital.id}
                className={`relative transition-all duration-300 hover:shadow-accent hover:-translate-y-1 bg-white/80 backdrop-blur-xl border-2 ${
                  hospital.id === recommendedHospitalId 
                    ? 'border-primary shadow-accent animate-fade-in' 
                    : 'border-primary/10 hover:border-primary/30'
                }`}
              >
                <CardContent className="p-6">
                  {/* Dismiss button for QuickRoute mode */}
                  {isQuickRouteMode && (
                    <button
                      onClick={() => handleDismissHospital(hospital.id)}
                      className="absolute top-3 right-3 text-primary/40 hover:text-primary transition-colors z-10 rounded-full p-1 hover:bg-primary/10"
                      aria-label="Dismiss hospital"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  
                  <div className={`flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 ${isQuickRouteMode ? 'pr-8' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="mt-1">
                          {isQuickRouteMode ? (
                            <div className="rounded-full gradient-primary p-3 min-w-[40px] flex items-center justify-center shadow-md">
                              <span className="text-base font-bold text-white">#{quickRouteNumber}</span>
                            </div>
                          ) : hospital.id === recommendedHospitalId ? (
                            <div className="rounded-full gradient-primary p-2 shadow-md">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                          ) : (
                            <div className="rounded-full bg-secondary p-2">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          {hospital.id === recommendedHospitalId && !isQuickRouteMode && (
                            <div className="mb-2">
                              <Badge className="gradient-primary text-white mb-1 shadow-md">
                                <Sparkles className="mr-1 h-3 w-3" />
                                {t('results.recommendedNow')}
                              </Badge>
                              <p className="text-xs text-primary/80 mt-1 font-medium">
                                {t('results.recommendedExplanation')}
                              </p>
                            </div>
                          )}
                          
                          <h3 className="text-xl font-semibold text-primary-dark mb-1">
                            {hospital.name}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                            <MapPin className="h-3 w-3 text-accent" />
                            {hospital.address}
                          </p>

                          {/* Travel Options and Buttons */}
                          <div className="space-y-2">
                            <details className="group">
                              <summary className="cursor-pointer text-xs font-medium text-primary/80 hover:text-primary flex items-center gap-1 transition-colors">
                                <Car className="h-3 w-3" />
                                Travel options
                              </summary>
                              <div className="mt-2 space-y-1 text-xs flex flex-col items-start">
                                {hospital.travelTimes.map((travel: TravelTime) => (
                                  <div key={travel.mode} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gradient-to-r from-secondary to-white border border-primary/10 w-fit">
                                    <span className="flex items-center gap-1 text-primary">
                                      {travel.mode === 'driving' && <Car className="h-3 w-3" />}
                                      {travel.mode === 'transit' && <Bus className="h-3 w-3" />}
                                      {travel.mode === 'walking' && <Footprints className="h-3 w-3" />}
                                      {travel.mode === 'taxi' && <Car className="h-3 w-3" />}
                                      {travel.label}
                                    </span>
                                    <span className="font-bold text-primary-dark">{travel.duration} min</span>
                                  </div>
                                ))}
                              </div>
                            </details>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => setSelectedHospitalForMap(hospital)}
                                variant="outline"
                                size="sm"
                                className="border-primary/20 hover:border-accent hover:bg-accent/10 hover:text-accent"
                              >
                                <Navigation className="mr-2 h-4 w-4" />
                                Show on Map
                              </Button>
                              <Button
                                onClick={() => navigate(`/hospital/${hospital.id}`)}
                                className={hospital.id === recommendedHospitalId ? 'gradient-primary text-white shadow-md hover:shadow-lg' : 'border-primary/20 hover:border-primary'}
                                variant={hospital.id === recommendedHospitalId ? 'default' : 'outline'}
                                size="sm"
                              >
                                {t('results.viewDetails')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Boxes */}
                    <div className={`grid grid-cols-3 gap-3 text-center lg:min-w-[300px] ${hospital.id === recommendedHospitalId ? 'lg:mt-24' : 'lg:mt-16'}`}>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white to-secondary/30">
                        <p className="text-sm font-medium text-primary/80 mb-2">{t('results.waitTime')}</p>
                        <div className="flex items-center justify-center gap-1">
                          <div 
                            className={`w-2.5 h-2.5 rounded-full ${getWaitTimeColor(hospital.currentWaitTime)}`}
                          />
                          <p className="text-xl font-bold text-primary-dark">
                            {hospital.currentWaitTime}
                            <span className="text-xs font-normal ml-1">{t('results.minutes')}</span>
                          </p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white to-accent/10">
                        <p className="text-sm font-medium text-primary/80 mb-2 flex items-center justify-center gap-1">
                          {t('results.travelTime')}
                          {travelLoading && <span className="text-xs">(loading...)</span>}
                          {hospital.usingRealData && !travelLoading && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 bg-accent text-white">Live</Badge>
                          )}
                        </p>
                        <p className="text-xl font-bold text-primary-dark">
                          {hospital.travelTime}
                          <span className="text-xs font-normal ml-1">{t('results.minutes')}</span>
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white to-primary/10">
                        <p className="text-sm font-medium text-primary/80 mb-2">{t('results.totalTime')}</p>
                        <p className="text-xl font-bold text-primary">
                          {hospital.totalTime}
                          <span className="text-xs font-normal ml-1">{t('results.minutes')}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {totalPages > 1 && sortBy !== 'quickRoute' && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {filteredHospitals.length === 0 && (
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No hospitals found for the selected insurance type.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <p className="text-xs text-primary/30 text-center">
            {t('results.disclaimer')}
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => navigate('/feedback/demo-visit-id')}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Demo: View Feedback Page
          </Button>
        </div>
      </div>

      {/* Map Selection Dialog */}
      <Dialog open={!!selectedHospitalForMap} onOpenChange={(open) => !open && setSelectedHospitalForMap(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>View on Map</DialogTitle>
            <DialogDescription>
              {selectedHospitalForMap?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => {
                if (selectedHospitalForMap) {
                  window.open(getAppleMapsLink(selectedHospitalForMap.coordinates.lat, selectedHospitalForMap.coordinates.lng), '_blank');
                  setSelectedHospitalForMap(null);
                }
              }}
              variant="outline"
              className="w-full justify-start"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Apple Maps
            </Button>
            <Button
              onClick={() => {
                if (selectedHospitalForMap) {
                  window.open(getGoogleMapsLink(selectedHospitalForMap.coordinates.lat, selectedHospitalForMap.coordinates.lng), '_blank');
                  setSelectedHospitalForMap(null);
                }
              }}
              variant="outline"
              className="w-full justify-start"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Google Maps
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default Results;
