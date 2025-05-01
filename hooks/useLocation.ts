import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { LocationInfo } from '@/types';
import { Platform } from 'react-native';

export function useLocation() {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      // Get location with high accuracy on native, lower on web for faster response
      const locationOptions = {
        accuracy: Platform.OS === 'web' 
          ? Location.Accuracy.Low 
          : Location.Accuracy.High
      };
      
      const currentLocation = await Location.getCurrentPositionAsync(locationOptions);
      
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy
      });
    } catch (error) {
      setErrorMsg('Could not get your location. Please check your permissions and try again.');
      console.error('Location error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    errorMsg,
    isLoading,
    refreshLocation: getLocation
  };
}