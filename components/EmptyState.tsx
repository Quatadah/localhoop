import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Button } from './ui/Button';
import { CircleAlert as AlertCircle, Search, Inbox, MapPin } from 'lucide-react-native';

type EmptyStateType = 'search' | 'noPosts' | 'noMessages' | 'noLocation' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  type,
  title,
  message,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const getIcon = () => {
    const iconColor = colors.subtext;
    const iconSize = 64;
    
    switch (type) {
      case 'search':
        return <Search size={iconSize} color={iconColor} />;
      case 'noPosts':
        return <Search size={iconSize} color={iconColor} />;
      case 'noMessages':
        return <Inbox size={iconSize} color={iconColor} />;
      case 'noLocation':
        return <MapPin size={iconSize} color={iconColor} />;
      case 'error':
      default:
        return <AlertCircle size={iconSize} color={colors.error} />;
    }
  };
  
  const getDefaultTitle = () => {
    switch (type) {
      case 'search':
        return 'No results found';
      case 'noPosts':
        return 'No posts yet';
      case 'noMessages':
        return 'No messages yet';
      case 'noLocation':
        return 'Location unavailable';
      case 'error':
      default:
        return 'Something went wrong';
    }
  };
  
  const getDefaultMessage = () => {
    switch (type) {
      case 'search':
        return 'Try adjusting your search or filters';
      case 'noPosts':
        return 'Be the first to share something with your community';
      case 'noMessages':
        return 'Start a conversation by messaging someone';
      case 'noLocation':
        return 'We need your location to show nearby posts';
      case 'error':
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title || getDefaultTitle()}
      </Text>
      
      <Text style={[styles.message, { color: colors.subtext }]}>
        {message || getDefaultMessage()}
      </Text>
      
      {actionTitle && onAction && (
        <Button 
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    minWidth: 160,
  },
});