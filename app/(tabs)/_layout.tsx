import Colors from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useMessageStore } from '@/store/messageStore';
import { Tabs } from 'expo-router';
import { Chrome as Home, Map, MessageCircle, CirclePlus as PlusCircle, User } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const { user } = useAuthStore();
  const { conversations, getConversations, subscribeToMessages } = useMessageStore();
  
  // Fetch conversations and subscribe to new messages
  useEffect(() => {
    if (user) {
      getConversations();
      const unsubscribe = subscribeToMessages();
      
      return () => {
        unsubscribe();
      };
    }
  }, [user]);
  
  // Calculate unread message count
  const unreadCount = conversations.reduce((count, conversation) => {
    return count + (conversation.unread_count || 0);
  }, 0);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerTitle: 'Local Loop',
        }}
      />
      
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="create"
        options={{
          title: 'Post',
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}