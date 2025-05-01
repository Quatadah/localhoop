import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Slider from '@react-native-community/slider';
import Colors from '@/constants/Colors';
import { usePostStore } from '@/store/postStore';
import { useAuthStore } from '@/store/authStore';
import { MapPin } from 'lucide-react-native';

export function LocationDistanceSelector() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { setMaxDistance, maxDistance } = usePostStore();
  const { user, updateLocationPreference } = useAuthStore();
  const [localDistance, setLocalDistance] = useState(maxDistance);
  
  const handleValueChange = (value: number) => {
    setLocalDistance(value);
  };
  
  const handleSlidingComplete = (value: number) => {
    setMaxDistance(value);
    
    // Also update the user's preference in the database if user is logged in
    if (user?.location) {
      updateLocationPreference(
        user.location.latitude,
        user.location.longitude,
        value
      );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.headerRow}>
        <MapPin size={16} color={colors.primary} />
        <Text style={[styles.label, { color: colors.text }]}>
          Show posts within
        </Text>
      </View>
      
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={localDistance}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        
        <View style={styles.labelContainer}>
          <Text style={[styles.distanceValue, { color: colors.primary }]}>
            {localDistance.toFixed(0)} km
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  labelContainer: {
    minWidth: 45,
    marginLeft: 8,
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});