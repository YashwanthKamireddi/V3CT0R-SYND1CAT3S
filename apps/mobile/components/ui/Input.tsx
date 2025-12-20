/**
 * Input Component - Evenro Design System
 * Premium input fields with multiple variants and states
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../../lib/constants/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  size?: InputSize;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      size = 'md',
      error,
      helper,
      leftIcon,
      rightIcon,
      onRightIconPress,
      disabled = false,
      containerStyle,
      inputStyle,
      required = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);

    const sizeConfig = theme.components.input[size];

    const handleFocus = () => {
      setIsFocused(true);
      focusAnim.value = withTiming(1, { duration: theme.animation.timing.fast });
    };

    const handleBlur = () => {
      setIsFocused(false);
      focusAnim.value = withTiming(0, { duration: theme.animation.timing.fast });
    };

    const animatedContainerStyle = useAnimatedStyle(() => {
      const borderColor = error
        ? theme.colors.semantic.error
        : interpolateColor(
            focusAnim.value,
            [0, 1],
            [theme.colors.border.default, theme.colors.primary[500]]
          );

      return {
        borderColor,
        borderWidth: focusAnim.value === 1 || error ? 2 : 1,
      };
    });

    const containerBaseStyle: ViewStyle = {
      height: sizeConfig.height,
      borderRadius: theme.borderRadius.md,
      backgroundColor: disabled ? theme.colors.neutral[100] : theme.colors.background.secondary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: sizeConfig.paddingX,
      gap: theme.spacing.md,
    };

    const inputBaseStyle: TextStyle = {
      flex: 1,
      fontSize: sizeConfig.fontSize,
      color: disabled ? theme.colors.text.tertiary : theme.colors.text.primary,
    };

    const iconColor = isFocused
      ? theme.colors.primary[500]
      : error
      ? theme.colors.semantic.error
      : theme.colors.text.tertiary;

    return (
      <View style={containerStyle}>
        {label && (
          <View style={{ flexDirection: 'row', marginBottom: theme.spacing.sm }}>
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium as any,
                color: theme.colors.text.secondary,
              }}
            >
              {label}
            </Text>
            {required && (
              <Text style={{ color: theme.colors.semantic.error, marginLeft: 2 }}>*</Text>
            )}
          </View>
        )}

        <AnimatedView style={[containerBaseStyle, animatedContainerStyle]}>
          {leftIcon && <Feather name={leftIcon} size={20} color={iconColor} />}

          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.tertiary}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            style={[inputBaseStyle, inputStyle]}
            {...props}
          />

          {rightIcon && (
            <Pressable onPress={onRightIconPress} hitSlop={8}>
              <Feather name={rightIcon} size={20} color={iconColor} />
            </Pressable>
          )}
        </AnimatedView>

        {(error || helper) && (
          <Text
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: error ? theme.colors.semantic.error : theme.colors.text.tertiary,
              marginTop: theme.spacing.xs,
              marginLeft: theme.spacing.xs,
            }}
          >
            {error || helper}
          </Text>
        )}
      </View>
    );
  }
);

// Password Input Component
interface PasswordInputProps extends Omit<InputProps, 'rightIcon' | 'onRightIconPress'> {}

export const PasswordInput = forwardRef<TextInput, PasswordInputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      ref={ref}
      {...props}
      secureTextEntry={!showPassword}
      rightIcon={showPassword ? 'eye-off' : 'eye'}
      onRightIconPress={() => setShowPassword(!showPassword)}
    />
  );
});

// Search Input Component
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onSearch?: (text: string) => void;
  onClear?: () => void;
}

export const SearchInput = forwardRef<TextInput, SearchInputProps>(
  ({ value, onChangeText, onSearch, onClear, placeholder = 'Search...', ...props }, ref) => {
    const handleSubmit = () => {
      if (onSearch && value) {
        onSearch(value);
      }
    };

    const handleClear = () => {
      onChangeText?.('');
      onClear?.();
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        leftIcon="search"
        rightIcon={value ? 'x' : undefined}
        onRightIconPress={handleClear}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        {...props}
      />
    );
  }
);

// OTP Input Component
interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const inputRefs = React.useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newValue = value.split('');
    newValue[index] = text;
    const result = newValue.join('').slice(0, length);
    onChange(result);

    // Move to next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.md,
          justifyContent: 'center',
        }}
      >
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={{
              width: 48,
              height: 56,
              borderRadius: theme.borderRadius.md,
              borderWidth: value[index] ? 2 : 1,
              borderColor: error
                ? theme.colors.semantic.error
                : value[index]
                ? theme.colors.primary[500]
                : theme.colors.border.default,
              backgroundColor: theme.colors.background.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={value[index] || ''}
              onChangeText={(text) => handleChange(text.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!disabled}
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold as any,
                color: theme.colors.text.primary,
                textAlign: 'center',
              }}
            />
          </View>
        ))}
      </View>

      {error && (
        <Text
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.semantic.error,
            marginTop: theme.spacing.sm,
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
