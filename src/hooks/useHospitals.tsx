import { useState, useEffect } from 'react';
import { Hospital } from '@/data/hospitals';

const API_BASE_URL = 'https://hospital-info.zzw.moe';

export const useHospitals = (insurance?: string) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = insurance 
          ? `${API_BASE_URL}/hospitals?insurance=${encodeURIComponent(insurance)}`
          : `${API_BASE_URL}/hospitals`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hospitals: ${response.statusText}`);
        }
        
        const data = await response.json();
        setHospitals(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error fetching hospitals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [insurance]);

  return { hospitals, loading, error };
};

export const useHospital = (id: string | undefined) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchHospital = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/hospitals/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hospital: ${response.statusText}`);
        }
        
        const data = await response.json();
        setHospital(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error fetching hospital:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [id]);

  return { hospital, loading, error };
};
