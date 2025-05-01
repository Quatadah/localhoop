import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { usePostStore } from '@/store/postStore';
import { useLocation } from '@/hooks/useLocation';
import { PostCard } from '@/components/PostCard';
import { EmptyState } from '@/components/EmptyState';
import { CategoryFilter } from '@/components/CategoryFilter';
import { LocationDistanceSelector } from '@/components/LocationDistanceSelector';
import Colors from '@/constants/Colors';
import { Post } from '@/types';

export default function FeedScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const { filteredPosts, getPosts, isLoading, error } = usePostStore();
  const { location, errorMsg: locationError, refreshLocation } = useLocation();
  
  // Load posts when location is available
  useEffect(() => {
    if (location) {
      getPosts();
    }
  }, [location]);
  
  const handleRefresh = async () => {
    if (!location) {
      await refreshLocation();
    }
    await getPosts();
  };
  
  const handleViewPost = (post: Post) => {
    router.push(`/post/${post.id}`);
  };
  
  const handleMessageAuthor = (post: Post) => {
    router.push({
      pathname: `/messages/new`,
      params: {
        userId: post.user_id,
        postId: post.id
      }
    });
  };
  
  if (locationError) {
    return (
      <EmptyState
        type="noLocation"
        message={locationError}
        actionTitle="Try Again"
        onAction={refreshLocation}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={handleViewPost}
            onMessage={handleMessageAuthor}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <LocationDistanceSelector />
            <CategoryFilter />
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              type="noPosts"
              title="No posts found"
              message="Try adjusting your distance or category filters"
              actionTitle="Refresh"
              onAction={handleRefresh}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
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
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
});