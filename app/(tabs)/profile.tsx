import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  RefreshControl,
  useColorScheme
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { usePostStore } from '@/store/postStore';
import { useLocation } from '@/hooks/useLocation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/EmptyState';
import { PostCard } from '@/components/PostCard';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Post } from '@/types';
import { Camera, LogOut, Map } from 'lucide-react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const { user, signOut, updateProfile, isLoading: authLoading } = useAuthStore();
  const { userPosts, getUserPosts, isLoading: postsLoading } = usePostStore();
  const { location } = useLocation();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  
  // Load user's posts
  React.useEffect(() => {
    getUserPosts();
  }, []);
  
  const handleRefresh = () => {
    getUserPosts();
  };
  
  const handleUpdateProfile = async () => {
    await updateProfile({ name, phone });
    setIsEditing(false);
  };
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };
  
  const handleViewPost = (post: Post) => {
    router.push(`/post/${post.id}`);
  };
  
  const pickProfileImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant photo library permissions to upload a profile picture.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      // Here you would typically upload the image to storage
      // and update the avatar_url in the user's profile
      Alert.alert('Feature Coming Soon', 'Profile picture upload will be available in a future update.');
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={postsLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={pickProfileImage}
          >
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.profileImageInitial}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </Text>
                <Camera size={24} color="white" style={styles.cameraIcon} />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            {isEditing ? (
              <>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  label="Name"
                />
                
                <Input
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Your phone number"
                  keyboardType="phone-pad"
                  label="Phone"
                />
                
                <View style={styles.editButtonsRow}>
                  <Button
                    title="Cancel"
                    onPress={() => setIsEditing(false)}
                    variant="outline"
                    style={styles.editButton}
                  />
                  
                  <Button
                    title="Save"
                    onPress={handleUpdateProfile}
                    isLoading={authLoading}
                    style={styles.editButton}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.nameContainer}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {user?.name || 'Anonymous User'}
                  </Text>
                </View>
                
                <Text style={[styles.userEmail, { color: colors.subtext }]}>
                  {user?.email}
                </Text>
                
                {user?.phone && (
                  <Text style={[styles.userPhone, { color: colors.subtext }]}>
                    {user.phone}
                  </Text>
                )}
                
                {location && user?.radius_preference && (
                  <View style={styles.locationInfo}>
                    <Map size={14} color={colors.primary} />
                    <Text style={[styles.radiusText, { color: colors.primary }]}>
                      {user.radius_preference}km radius
                    </Text>
                  </View>
                )}
                
                <Button
                  title="Edit Profile"
                  onPress={() => setIsEditing(true)}
                  variant="outline"
                  style={styles.editProfileButton}
                />
              </>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.signOutButton, { borderColor: colors.error }]}
            onPress={handleSignOut}
          >
            <LogOut size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.postsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Posts
          </Text>
          
          {userPosts.length > 0 ? (
            userPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onPress={handleViewPost}
              />
            ))
          ) : (
            <EmptyState
              type="noPosts"
              title="No posts yet"
              message="When you create posts, they will appear here"
              actionTitle="Create a Post"
              onAction={() => router.push('/create')}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 72,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    position: 'relative',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radiusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  editProfileButton: {
    marginTop: 8,
  },
  editButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  signOutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  postsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
});