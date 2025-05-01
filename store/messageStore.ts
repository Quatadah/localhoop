import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Conversation, Message } from '@/types';
import { useAuthStore } from './authStore';

interface MessageState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  getConversations: () => Promise<void>;
  getOrCreateConversation: (userId: string, postId?: string) => Promise<string>;
  getMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  subscribeToMessages: () => () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  
  getConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ error: 'User not authenticated', isLoading: false });
        return;
      }
      
      // Get all conversations that include the current user
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:profiles!conversations_user_ids(id, name, avatar_url),
          post:posts(*)
        `)
        .filter('user_ids', 'cs', `{${user.id}}`)
        .order('last_message_at', { ascending: false });
        
      if (error) throw error;
      
      // Calculate unread count for each conversation
      const conversationsWithUnread = await Promise.all((data as Conversation[]).map(async conversation => {
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .eq('recipient_id', user.id)
          .eq('read', false);
          
        if (countError) throw countError;
        
        return {
          ...conversation,
          unread_count: count || 0
        };
      }));
      
      set({ 
        conversations: conversationsWithUnread,
        isLoading: false 
      });
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Get conversations error:', error.message);
    }
  },
  
  getOrCreateConversation: async (otherUserId, postId) => {
    try {
      set({ isLoading: true, error: null });
      
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');
      
      // Check if conversation already exists between these users
      const { data: existingConversations, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .filter('user_ids', 'cs', `{${user.id}}`)
        .filter('user_ids', 'cs', `{${otherUserId}}`)
        .maybeSingle();
        
      if (searchError) throw searchError;
      
      // If conversation exists, return its ID
      if (existingConversations) {
        // Fetch the full conversation details
        const { data: fullConversation, error: fetchError } = await supabase
          .from('conversations')
          .select(`
            *,
            participants:profiles!conversations_user_ids(id, name, avatar_url),
            post:posts(*)
          `)
          .eq('id', existingConversations.id)
          .single();
          
        if (fetchError) throw fetchError;
        
        set({ 
          currentConversation: fullConversation as Conversation,
          isLoading: false 
        });
        
        await get().getMessages(existingConversations.id);
        
        return existingConversations.id;
      }
      
      // Otherwise, create a new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_ids: [user.id, otherUserId],
          post_id: postId
        })
        .select()
        .single();
        
      if (createError) throw createError;
      
      // Get the full details of the new conversation
      const { data: fullConversation, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:profiles!conversations_user_ids(id, name, avatar_url),
          post:posts(*)
        `)
        .eq('id', newConversation.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      set({ 
        currentConversation: fullConversation as Conversation,
        isLoading: false 
      });
      
      await get().getConversations(); // Refresh the conversations list
      
      return newConversation.id;
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Get or create conversation error:', error.message);
      return '';
    }
  },
  
  getMessages: async (conversationId) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      set({ 
        messages: data as Message[],
        isLoading: false 
      });
      
      // Mark messages as read
      await get().markAsRead(conversationId);
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Get messages error:', error.message);
    }
  },
  
  sendMessage: async (content) => {
    try {
      set({ isLoading: true, error: null });
      
      const user = useAuthStore.getState().user;
      const { currentConversation } = get();
      
      if (!user) throw new Error('User not authenticated');
      if (!currentConversation) throw new Error('No conversation selected');
      
      // Determine the recipient ID (the other user)
      const recipientId = currentConversation.user_ids.find(id => id !== user.id);
      if (!recipientId) throw new Error('Recipient not found');
      
      // Create new message
      const { data: newMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation.id,
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          read: false
        })
        .select()
        .single();
        
      if (messageError) throw messageError;
      
      // Update conversation with last message info
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', currentConversation.id);
        
      if (conversationError) throw conversationError;
      
      // Update local state
      set(state => ({
        messages: [...state.messages, newMessage as Message],
        isLoading: false
      }));
      
      await get().getConversations(); // Refresh conversations list with updated last message
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Send message error:', error.message);
    }
  },
  
  markAsRead: async (conversationId) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      // Mark all messages in this conversation as read where user is recipient
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('read', false);
        
      if (error) throw error;
      
      // Update local state
      await get().getMessages(conversationId);
      await get().getConversations(); // Refresh unread counts
      
    } catch (error: any) {
      console.error('Mark as read error:', error.message);
    }
  },
  
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
    
    if (conversation) {
      get().getMessages(conversation.id);
    } else {
      set({ messages: [] });
    }
  },
  
  subscribeToMessages: () => {
    const user = useAuthStore.getState().user;
    if (!user) return () => {};
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('message-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`
      }, payload => {
        const newMessage = payload.new as Message;
        
        // If this message belongs to the current conversation, add it
        if (get().currentConversation?.id === newMessage.conversation_id) {
          set(state => ({
            messages: [...state.messages, newMessage]
          }));
          get().markAsRead(newMessage.conversation_id);
        }
        
        // Refresh conversations list to update last message info
        get().getConversations();
      })
      .subscribe();
      
    // Return cleanup function
    return () => {
      supabase.removeChannel(subscription);
    };
  }
}));