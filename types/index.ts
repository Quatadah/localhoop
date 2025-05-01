export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  radius_preference?: number; // in kilometers
}

export interface Post {
  id: string;
  title: string;
  description: string;
  category: PostCategory;
  image_url?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  user_id: string;
  created_at: string;
  user?: User;
  distance?: number; // calculated field
}

export type PostCategory = 
  | 'FREE'
  | 'LOST_FOUND'
  | 'EVENT'
  | 'REQUEST'
  | 'FOR_SALE'
  | 'NOTICE'
  | 'OTHER';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  post_id?: string;
  user_ids: string[];
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  participants?: User[];
  post?: Post;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy?: number;
}