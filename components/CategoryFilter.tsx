import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import Colors from '@/constants/Colors';
import { PostCategory } from '@/types';
import { usePostStore } from '@/store/postStore';

export function CategoryFilter() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { selectedCategory, filterByCategory } = usePostStore();
  
  // Define all available categories
  const categories: PostCategory[] = [
    'FREE',
    'LOST_FOUND',
    'EVENT',
    'REQUEST',
    'FOR_SALE',
    'NOTICE',
    'OTHER',
  ];
  
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
  
  const handleSelectCategory = (category: PostCategory | null) => {
    filterByCategory(category);
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && [styles.activeButton, { borderColor: colors.primary }],
            { backgroundColor: !selectedCategory ? colors.primary + '20' : colors.card }
          ]}
          onPress={() => handleSelectCategory(null)}
        >
          <Text 
            style={[
              styles.categoryLabel,
              !selectedCategory ? 
                { color: colors.primary, fontWeight: '600' } : 
                { color: colors.text }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && [
                styles.activeButton, 
                { borderColor: getCategoryColor(category) }
              ],
              { 
                backgroundColor: selectedCategory === category 
                  ? getCategoryColor(category) + '20' 
                  : colors.card 
              }
            ]}
            onPress={() => handleSelectCategory(category)}
          >
            <Text 
              style={[
                styles.categoryLabel,
                selectedCategory === category ? 
                  { color: getCategoryColor(category), fontWeight: '600' } : 
                  { color: colors.text }
              ]}
            >
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeButton: {
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 14,
  }
});