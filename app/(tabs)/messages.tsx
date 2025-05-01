import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { useMessageStore } from '@/store/messageStore';
import { EmptyState } from '@/components/EmptyState';
import Colors from '@/constants/Colors';
import { Conversation } from '@/types';
import { formatRelativeTime } from '@/utils/date';

export default function MessagesScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const { conversations, getConversations, isLoading } = useMessageStore();
  
  useEffect(() => {
    getConversations();
  }, []);
  
  const handleSelectConversation = (conversation: Conversation) => {
    router.push(`/messages/${conversation.id}`);
  };
  
  // Find other participant's name for display
  const getOtherParticipantName = (conversation: Conversation) => {
    if (!conversation.participants || conversation.participants.length === 0) {
      return 'Unknown User';
    }
    
    // Find first participant that isn't the current user
    const otherParticipant = conversation.participants[0];
    return otherParticipant?.name || 'Anonymous User';
  };
  
  // Get post title if conversation is about a post
  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.post) {
      return `Re: ${conversation.post.title}`;
    }
    return 'Direct Message';
  };
  
  // Render a conversation list item
  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: colors.card }]}
      onPress={() => handleSelectConversation(item)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.participantName, { color: colors.text }]}>
            {getOtherParticipantName(item)}
          </Text>
          <Text style={[styles.timestamp, { color: colors.subtext }]}>
            {item.last_message_at ? formatRelativeTime(item.last_message_at) : ''}
          </Text>
        </View>
        
        <Text style={[styles.conversationTitle, { color: colors.text }]}>
          {getConversationTitle(item)}
        </Text>
        
        <Text 
          style={[
            styles.lastMessage, 
            { color: colors.subtext },
            item.unread_count ? { fontWeight: '600', color: colors.text } : {}
          ]}
          numberOfLines={1}
        >
          {item.last_message || 'No messages yet'}
        </Text>
      </View>
      
      {item.unread_count ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{item.unread_count}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={getConversations}
        ListEmptyComponent={
          <EmptyState
            type="noMessages"
            title="No Messages"
            message="Start a conversation by messaging someone from a post"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 72,
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
});