import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon
}: ButtonProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    let baseStyle: StyleProp<ViewStyle> = {
      ...styles.button,
      ...getButtonSizeStyles(size)
    };
    
    switch (variant) {
      case 'primary':
        baseStyle = {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
        break;
      case 'secondary':
        baseStyle = {
          ...baseStyle,
          backgroundColor: colors.secondary,
        };
        break;
      case 'outline':
        baseStyle = {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
        break;
      case 'ghost':
        baseStyle = {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
        break;
      case 'danger':
        baseStyle = {
          ...baseStyle,
          backgroundColor: colors.error,
        };
        break;
    }
    
    if (disabled || isLoading) {
      baseStyle = {
        ...baseStyle,
        opacity: 0.6,
      };
    }
    
    return baseStyle;
  };
  
  const getTextStyles = (): StyleProp<TextStyle> => {
    let baseStyle: StyleProp<TextStyle> = {
      ...styles.text,
      ...getTextSizeStyles(size)
    };
    
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        baseStyle = {
          ...baseStyle,
          color: '#fff',
        };
        break;
      case 'outline':
      case 'ghost':
        baseStyle = {
          ...baseStyle,
          color: colors.primary,
        };
        break;
    }
    
    return baseStyle;
  };
  
  const getButtonSizeStyles = (size: ButtonSize): StyleProp<ViewStyle> => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 4,
        };
      case 'lg':
        return {
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 8,
        };
      default:
        return {
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 6,
        };
    }
  };
  
  const getTextSizeStyles = (size: ButtonSize): StyleProp<TextStyle> => {
    switch (size) {
      case 'sm':
        return {
          fontSize: 14,
        };
      case 'lg':
        return {
          fontSize: 18,
        };
      default:
        return {
          fontSize: 16,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} 
          size="small" 
        />
      ) : (
        <>
          {icon && icon}
          <Text style={[getTextStyles(), icon && { marginLeft: 8 }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  }
});