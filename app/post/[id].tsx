import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Post, PostCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { formatRelativeTime } from '@/utils/date';
import { ArrowLeft, MapPin, MessageCircle, Share2, ExternalLink } from 'lucide-react-native';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchPost();
  }, [id]);
  
  const fetchPost = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        setError('Post ID is missing');
        return;
      }
      
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(id, name, email, phone, avatar_url)
        `)
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      setPost(data as Post);
    } catch (err: any) {
      console.error('Error fetching post:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleContactAuthor = () => {
    if (!post || !post.user_id) return;
    
    router.push({
      pathname: `/messages/new`,
      params: {
        userId: post.user_id,
        postId: post.id
      }
    });
  };
  
  const handleViewOnMap = () => {
    if (!post || !post.location) return;
    
    // For mobile, open in maps app, for web use web maps
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
      web: 'https://maps.google.com/'
    });
    
    const latLng = `${post.location.latitude},${post.location.longitude}`;
    const label = post.title;
    
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latLng}`,
      android: `${scheme}${latLng}?q=${label}`,
      web: `${scheme}?q=${latLng}`
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };
  
  const handleShare = async () => {
    if (!post) return;
    
    try {
      // This is a simplified example as the actual sharing would depend on the platform and deployed URL
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description,
          // In a real app, you'd use the actual URL to the post on your deployed site
          url: `https://localloop.app/post/${post.id}`,
        });
      } else {
        // Fallback for platforms without navigator.share
        alert('Sharing is not available on your device');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
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
  
  const getCategoryColor = (category: PostCategory) => {
    return colors[category.toLowerCase() as keyof typeof colors] || colors.other;
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (error || !post) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error || 'Post not found'}
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: post.title,
          headerShown: true,
          headerBackVisible: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Share2 size={22} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {post.image_url && (
          <Image
            source={{ uri: post.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.content}>
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
          
          <Text style={[styles.title, { color: colors.text }]}>
            {post.title}
          </Text>
          
          <Text style={[styles.description, { color: colors.text }]}>
            {post.description}
          </Text>
          
          <TouchableOpacity style={styles.locationRow} onPress={handleViewOnMap}>
            <MapPin size={16} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.primary }]}>
              {post.distance ? 
                `${post.distance.toFixed(1)} km away` : 
                'View on map'
              }
            </Text>
            <ExternalLink size={14} color={colors.primary} />
          </TouchableOpacity>
          
          <View style={[styles.authorSection, { borderColor: colors.border }]}>
            <Text style={[styles.authorHeading, { color: colors.text }]}>
              Posted by
            </Text>
            
            <View style={styles.authorRow}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarInitial}>
                  {post.user?.name ? post.user.name[0].toUpperCase() : 'U'}
                </Text>
              </View>
              
              <View style={styles.authorInfo}>
                <Text style={[styles.authorName, { color: colors.text }]}>
                  {post.user?.name || 'Anonymous User'}
                </Text>
              </View>
            </View>
            
            {post.user_id !== user?.id && (
              <Button
                title="Message"
                onPress={handleContactAuthor}
                icon={<MessageCircle size={18} color="white" />}
                style={styles.messageButton}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </>
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
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 6,
    marginRight: 4,
  },
  authorSection: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  authorHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    marginTop: 8,
  },
});