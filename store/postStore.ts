import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Post, PostCategory, LocationInfo } from '@/types';
import { getDistance } from 'geolib';
import { useAuthStore } from './authStore';

interface PostState {
  posts: Post[];
  userPosts: Post[];
  filteredPosts: Post[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: PostCategory | null;
  maxDistance: number;
  createPost: (
    title: string, 
    description: string, 
    category: PostCategory, 
    location: LocationInfo,
    imageUri?: string
  ) => Promise<Post | null>;
  getPosts: () => Promise<void>;
  getUserPosts: () => Promise<void>;
  filterByCategory: (category: PostCategory | null) => void;
  setMaxDistance: (distance: number) => void;
  filterPostsByLocation: (userLocation: LocationInfo) => void;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  userPosts: [],
  filteredPosts: [],
  isLoading: false,
  error: null,
  selectedCategory: null,
  maxDistance: 5, // Default 5km radius
  
  createPost: async (title, description, category, location, imageUri) => {
    try {
      set({ isLoading: true, error: null });
      
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');
      
      let image_url = undefined;
      
      // If an image was provided, upload it to storage
      if (imageUri) {
        const imageName = `${user.id}/${Date.now()}.jpg`;
        
        // Convert URI to blob for upload
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const { data, error: uploadError } = await supabase
          .storage
          .from('post_images')
          .upload(imageName, blob, {
            contentType: 'image/jpeg'
          });
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('post_images')
          .getPublicUrl(imageName);
          
        image_url = publicUrl;
      }
      
      // Create the post in the database
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title,
          description,
          category,
          location,
          image_url,
          user_id: user.id
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      const newPost = data as Post;
      
      // Update local state
      set(state => ({
        posts: [newPost, ...state.posts],
        userPosts: [newPost, ...state.userPosts],
        isLoading: false
      }));
      
      await get().getPosts(); // Refresh posts
      
      return newPost;
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Create post error:', error.message);
      return null;
    }
  },
  
  getPosts: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const user = useAuthStore.getState().user;
      if (!user || !user.location) {
        set({ error: 'Location not available', isLoading: false });
        return;
      }
      
      // Get all posts with user profiles
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(id, name, avatar_url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Calculate distance from user for each post
      const postsWithDistance = (data as Post[]).map(post => {
        if (post.location && user.location) {
          const distance = getDistance(
            { latitude: user.location.latitude, longitude: user.location.longitude },
            { latitude: post.location.latitude, longitude: post.location.longitude }
          ) / 1000; // Convert to kilometers
          
          return { ...post, distance };
        }
        return post;
      });
      
      set({ 
        posts: postsWithDistance,
        filteredPosts: postsWithDistance,
        isLoading: false 
      });
      
      // Apply current filters
      if (get().selectedCategory) {
        get().filterByCategory(get().selectedCategory);
      }
      
      if (user.location) {
        get().filterPostsByLocation(user.location);
      }
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Get posts error:', error.message);
    }
  },
  
  getUserPosts: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ error: 'User not authenticated', isLoading: false });
        return;
      }
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      set({ 
        userPosts: data as Post[],
        isLoading: false 
      });
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Get user posts error:', error.message);
    }
  },
  
  filterByCategory: (category) => {
    set({ selectedCategory: category });
    
    const { posts } = get();
    
    if (!category) {
      set({ filteredPosts: posts });
      return;
    }
    
    const filtered = posts.filter(post => post.category === category);
    set({ filteredPosts: filtered });
    
    // Also apply distance filter
    const user = useAuthStore.getState().user;
    if (user?.location) {
      get().filterPostsByLocation(user.location);
    }
  },
  
  setMaxDistance: (distance) => {
    set({ maxDistance: distance });
    
    // Re-apply location filter with new distance
    const user = useAuthStore.getState().user;
    if (user?.location) {
      get().filterPostsByLocation(user.location);
    }
  },
  
  filterPostsByLocation: (userLocation) => {
    const { posts, selectedCategory, maxDistance } = get();
    
    // First apply category filter if active
    let postsToFilter = selectedCategory 
      ? posts.filter(post => post.category === selectedCategory) 
      : posts;
    
    // Then filter by distance
    const filtered = postsToFilter.filter(post => {
      if (!post.location) return false;
      
      const distance = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: post.location.latitude, longitude: post.location.longitude }
      ) / 1000; // Convert to kilometers
      
      return distance <= maxDistance;
    });
    
    set({ filteredPosts: filtered });
  }
}));