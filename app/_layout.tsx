import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/authStore';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const colorScheme = useColorScheme();
  const { loadUser, isLoading, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  
  // Mark component as mounted after the first render
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle authentication routing after component is mounted
  useEffect(() => {
    if (!mounted) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    
    // Use setTimeout to ensure this happens after rendering cycle
    setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/signin');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 100); // Use a slightly longer delay
  }, [user, segments, mounted, router]);
  
  // Load user session
  useEffect(() => {
    loadUser();
  }, []);
  
  // Hide splash screen once loaded
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);
  
  // While loading user session, show nothing
  if (isLoading) {
    return null;
  }

  return (
    <>
      <Slot />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}