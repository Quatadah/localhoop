import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, phone?: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateLocationPreference: (latitude: number, longitude: number, radius: number) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  signUp: async (email, password, phone, name) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            phone,
            name
          }
        }
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Create a profile record in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            phone,
            name,
            radius_preference: 5 // Default radius of 5km
          });
          
        if (profileError) throw profileError;
      }
      
      set({ session: data.session, isLoading: false });
      await get().loadUser();
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Sign up error:', error.message);
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      set({ session: data.session, isLoading: false });
      await get().loadUser();
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Sign in error:', error.message);
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null, session: null, isLoading: false });
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Sign out error:', error.message);
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        set({ user: null, session: null, isLoading: false });
        return;
      }
      
      set({ session });
      
      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      set({ 
        user: profile || {
          id: session.user.id,
          email: session.user.email,
          created_at: session.user.created_at,
          radius_preference: 5 // Default radius of 5km
        },
        isLoading: false 
      });
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Load user error:', error.message);
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      set({ 
        user: { ...user, ...updates },
        isLoading: false 
      });
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Update profile error:', error.message);
    }
  },

  updateLocationPreference: async (latitude, longitude, radius) => {
    const { user } = get();
    if (!user) return;

    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          location: { latitude, longitude },
          radius_preference: radius
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      set({ 
        user: { 
          ...user, 
          location: { latitude, longitude },
          radius_preference: radius
        },
        isLoading: false 
      });
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Update location preference error:', error.message);
    }
  }
}));