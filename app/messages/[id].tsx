import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Colors from '@/constants/Colors';
import { useMessageStore } from '@/store/messageStore';
import { useAuthStore } from '@/store/authStore';
import { MessageBubble } from '@/components/MessageBubble';
import { EmptyState } from '@/components/EmptyState';
import { ArrowLeft, Send } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function MessageScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const { 
    currentConversation, 
    messages, 
    getMessages, 
    sendMessage, 
    isLoading,
    error
  } = useMessageStore();
  
  const { user } = useAuthStore();
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    if (id && id !== 'new') {
      getMessages(id as string);
    }
  }, [id]);
  
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    await sendMessage(messageText);
    setMessageText('');
  };
  
  const getOtherParticipantName = () => {
    if (!currentConversation?.participants) return 'User';
    
    // Find the participant that isn't the current user
    const otherParticipant = currentConversation.participants.find(
      p => p.id !== user?.id
    );
    
    return otherParticipant?.name || 'User';
  };
  
  const getConversationTitle = () => {
    // If this is about a post, show "Re: Post Title"
    if (currentConversation?.post) {
      return `Re: ${currentConversation.post.title}`;
    }
    
    // Otherwise show the other person's name
    return getOtherParticipantName();
  };
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  if (id === 'new') {
    // This should handle new conversation creation from post details
    // For simplicity, we'll just redirect back
    router.replace('/');
    return null;
  }
  
  if (isLoading && !currentConversation) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (error || !currentConversation) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error || 'Conversation not found'}
        </Text>
        <TouchableOpacity 
          style={[styles.backButton, { borderColor: colors.border }]} 
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.text }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerTitle: getConversationTitle(),
          headerShown: true,
          headerBackVisible: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {currentConversation.post && (
        <View style={[styles.postBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.subtext, fontSize: 12 }}>
            Discussing post:
          </Text>
          <Text 
            style={{ color: colors.text, fontWeight: '500' }}
            numberOfLines={1}
          >
            {currentConversation.post.title}
          </Text>
        </View>
      )}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isFromCurrentUser={item.sender_id === user?.id}
          />
        )}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={
          <EmptyState
            type="noMessages"
            title="No messages yet"
            message="Start the conversation by sending a message"
          />
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      <View style={[styles.inputContainer, { 
        backgroundColor: colors.background,
        borderTopColor: colors.border
      }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          }]}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={colors.subtext}
          multiline
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { backgroundColor: messageText.trim() ? colors.primary : colors.card }
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Send 
              size={20} 
              color={messageText.trim() ? 'white' : colors.subtext} 
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  headerBackButton: {
    padding: 8,
  },
  postBanner: {
    padding: 8,
    borderBottomWidth: 1,
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    borderWidth: 1,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});