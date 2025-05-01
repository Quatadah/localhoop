import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { Post, PostCategory } from '@/types';
import Colors from '@/constants/Colors';
import { formatRelativeTime } from '@/utils/date';
import { MapPin, MessageCircle } from 'lucide-react-native';

interface PostCardProps {
  post: Post;
  onPress: (post: Post) => void;
  onMessage?: (post: Post) => void;
}

export function PostCard({ post, onPress, onMessage }: PostCardProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const getCategoryColor = (category: PostCategory) => {
    return colors[category.toLowerCase() as keyof typeof colors] || colors.other;
  };
  
  const getCategoryLabel = (category: PostCategory) => {
    switch (category) {
      case 'FREE':
        return 'Free';
      case 'LOST_FOUND':
        return 'Lost & Found';
      case 'EVENT':
        return 'Event';
      case 'REQUEST':
        return 'Request';
      case 'FOR_SALE':
        return 'For Sale';
      case 'NOTICE':
        return 'Notice';
      case 'OTHER':
      default:
        return 'Other';
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress(post)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View 
          style={[
            styles.categoryBadge, 
            { backgroundColor: getCategoryColor(post.category) }
          ]}
        >
          <Text style={styles.categoryText}>
            {getCategoryLabel(post.category)}
          </Text>
        </View>
        
        <Text style={[styles.date, { color: colors.subtext }]}>
          {formatRelativeTime(post.created_at)}
        </Text>
      </View>
      
      <View style={styles.content}>
        {post.image_url && (
          <Image 
            source={{ uri: post.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        <View style={[styles.textContainer, !post.image_url && { paddingTop: 8 }]}>
          <Text 
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {post.title}
          </Text>
          
          <Text 
            style={[styles.description, { color: colors.subtext }]}
            numberOfLines={3}
          >
            {post.description}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.locationContainer}>
          <MapPin size={14} color={colors.subtext} />
          <Text style={[styles.distance, { color: colors.subtext }]}>
            {post.distance !== undefined ? `${post.distance.toFixed(1)} km away` : 'Distance unknown'}
          </Text>
        </View>
        
        {onMessage && (
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={(e) => {
              e.stopPropagation();
              onMessage(post);
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <MessageCircle size={18} color={colors.primary} />
            <Text style={[styles.messageText, { color: colors.primary }]}>
              Message
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
  },
  content: {
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: 100,
  },
  textContainer: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    marginLeft: 4,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});