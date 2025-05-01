import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMessageStore } from '@/store/messageStore';
import Colors from '@/constants/Colors';

export default function NewMessageScreen() {
  const { userId, postId } = useLocalSearchParams();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const { getOrCreateConversation, isLoading } = useMessageStore();
  
  useEffect(() => {
    async function setupConversation() {
      if (!userId) {
        router.replace('/messages');
        return;
      }
      
      // Create or get conversation and redirect to it
      const conversationId = await getOrCreateConversation(
        userId as string, 
        postId as string | undefined
      );
      
      if (conversationId) {
        router.replace(`/messages/${conversationId}`);
      } else {
        router.replace('/messages');
      }
    }
    
    setupConversation();
  }, [userId, postId]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});