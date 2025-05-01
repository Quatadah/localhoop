import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  useColorScheme,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { usePostStore } from '@/store/postStore';
import { useLocation } from '@/hooks/useLocation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PostCategory } from '@/types';
import Colors from '@/constants/Colors';
import { EmptyState } from '@/components/EmptyState';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, X, Camera } from 'lucide-react-native';

export default function CreatePostScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const { createPost, isLoading } = usePostStore();
  const { location, errorMsg: locationError, refreshLocation } = useLocation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PostCategory>('OTHER');
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  
  // Available categories
  const categories: PostCategory[] = [
    'FREE',
    'LOST_FOUND',
    'EVENT',
    'REQUEST',
    'FOR_SALE',
    'NOTICE',
    'OTHER',
  ];
  
  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Location Required', 'We need your location to create a post.');
      return;
    }
    
    if (validateForm()) {
      const post = await createPost(
        title,
        description,
        category,
        location,
        imageUri || undefined
      );
      
      if (post) {
        Alert.alert('Success', 'Your post has been created!');
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('OTHER');
        setImageUri(null);
        // Navigate to post
        router.push(`/post/${post.id}`);
      }
    }
  };
  
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant photo library permissions to upload an image.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant camera permissions to take a photo.');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const removeImage = () => {
    setImageUri(null);
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
  
  const getCategoryColor = (cat: PostCategory) => {
    const key = cat.toLowerCase() as keyof typeof colors;
    return colors[key] || colors.other;
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Create a Post</Text>
          
          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title for your post"
            error={titleError}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Category</Text>
          <View style={styles.categoriesContainer}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && [
                    styles.selectedCategory,
                    { borderColor: getCategoryColor(cat) }
                  ],
                  { backgroundColor: category === cat ? getCategoryColor(cat) + '20' : colors.card }
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat && { color: getCategoryColor(cat), fontWeight: '600' }
                  ]}
                >
                  {getCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what you want to share with your neighbors"
            multiline
            numberOfLines={5}
            error={descriptionError}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Photo (Optional)</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                onPress={removeImage}
              >
                <X size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageButtonsContainer}>
              <Button
                title="Choose from Library"
                onPress={pickImage}
                variant="outline"
                style={styles.imageButton}
                icon={<ImageIcon size={16} color={colors.primary} />}
              />
              <Button
                title="Take Photo"
                onPress={takePhoto}
                variant="outline"
                style={styles.imageButton}
                icon={<Camera size={16} color={colors.primary} />}
              />
            </View>
          )}
          
          <Text style={[styles.locationNote, { color: colors.subtext }]}>
            Your post will be tagged with your current location
          </Text>
          
          <Button
            title="Post to Community"
            onPress={handleSubmit}
            isLoading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategory: {
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    marginRight: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationNote: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: 8,
  },
});