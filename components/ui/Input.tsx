import React, { useState } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  TouchableOpacity
} from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export type InputVariant = 'default' | 'underlined';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  variant?: InputVariant;
  maxLength?: number;
  testID?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  variant = 'default',
  maxLength,
  testID,
}: InputProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const getContainerStyles = (): StyleProp<ViewStyle> => {
    let baseStyle: StyleProp<ViewStyle> = {
      ...styles.container
    };
    
    switch (variant) {
      case 'underlined':
        baseStyle = {
          ...baseStyle,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderBottomColor: error ? colors.error : colors.border,
          borderRadius: 0,
          paddingHorizontal: 0,
        };
        break;
      default:
        baseStyle = {
          ...baseStyle,
          borderWidth: 1,
          borderColor: error ? colors.error : colors.border,
          backgroundColor: colors.card,
        };
    }
    
    if (error) {
      baseStyle = {
        ...baseStyle,
        borderColor: colors.error,
      };
    }
    
    return baseStyle;
  };
  
  const getInputStyles = (): StyleProp<TextStyle> => {
    return {
      ...styles.input,
      color: colors.text,
    };
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}
      
      <View style={getContainerStyles()}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.subtext}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          style={[getInputStyles(), inputStyle, multiline && styles.multiline]}
          maxLength={maxLength}
          testID={testID}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color={colors.subtext} />
            ) : (
              <Eye size={18} color={colors.subtext} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    height: '100%',
  },
  multiline: {
    height: 'auto',
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  eyeIcon: {
    padding: 4,
  }
});