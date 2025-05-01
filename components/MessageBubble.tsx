import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Message } from '@/types';
import Colors from '@/constants/Colors';
import { formatTime } from '@/utils/date';

interface MessageBubbleProps {
  message: Message;
  isFromCurrentUser: boolean;
}

export function MessageBubble({ message, isFromCurrentUser }: MessageBubbleProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  return (
    <View 
      style={[
        styles.container,
        isFromCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
      ]}
    >
      <View 
        style={[
          styles.bubble,
          isFromCurrentUser ? 
            [styles.currentUserBubble, { backgroundColor: colors.primary }] : 
            [styles.otherUserBubble, { backgroundColor: colors.card }]
        ]}
      >
        <Text 
          style={[
            styles.messageText,
            isFromCurrentUser ? 
              { color: 'white' } : 
              { color: colors.text }
          ]}
        >
          {message.content}
        </Text>
      </View>
      
      <Text 
        style={[
          styles.timestamp,
          { color: colors.subtext }
        ]}
      >
        {formatTime(message.created_at)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    minHeight: 40,
  },
  currentUserBubble: {
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
    marginHorizontal: 4,
  },
});