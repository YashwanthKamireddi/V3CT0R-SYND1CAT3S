/**
 * Button Component - Evenro Design System
 * Premium button component with multiple variants, sizes, and states
 */

import React from 'react';
import {
  Text,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../lib/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children?: React.ReactNode;
  title?: string; // Backward compatibility
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
  className?: string;
}

export function Button({
  children,
  title,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  gradient = false,
  className,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (!isDisabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const sizeConfig = theme.components.button[size];
  const isDisabled = disabled || loading;

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.neutral[300] : theme.colors.primary[500],
            ...(!isDisabled && theme.shadows.primaryGlow),
          },
          text: {
            color: theme.colors.text.inverse,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.neutral[200] : theme.colors.secondary[500],
            ...(!isDisabled && theme.shadows.md),
          },
          text: {
            color: theme.colors.text.inverse,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled ? theme.colors.neutral[300] : theme.colors.primary[500],
          },
          text: {
            color: isDisabled ? theme.colors.neutral[400] : theme.colors.primary[500],
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: isDisabled ? theme.colors.neutral[400] : theme.colors.primary[500],
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled ? theme.colors.neutral[300] : theme.colors.semantic.error,
            ...(!isDisabled && theme.shadows.md),
          },
          text: {
            color: theme.colors.text.inverse,
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingX,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    ...(fullWidth && { width: '100%' }),
    ...variantStyles.container,
    ...style,
  };

  const labelStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: theme.typography.fontWeight.semibold as any,
    ...variantStyles.text,
    ...textStyle,
  };

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 18 : 20;
  const iconColor = variantStyles.text.color as string;

  const displayText = children || title;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary[500] : '#FFFFFF'}
        />
      ) : (
        <>
          {leftIcon && <Feather name={leftIcon} size={iconSize} color={iconColor} />}
          {displayText && <Text style={labelStyle}>{displayText}</Text>}
          {rightIcon && <Feather name={rightIcon} size={iconSize} color={iconColor} />}
        </>
      )}
    </>
  );

  // Primary gradient button
  if (variant === 'primary' && gradient && !isDisabled) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={animatedStyle}
      >
        <LinearGradient
          colors={[theme.colors.primary[500], theme.colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[containerStyle, { ...theme.shadows.primaryGlow }]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[containerStyle, animatedStyle]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

// Icon Button Component
interface IconButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  color,
  backgroundColor,
  disabled = false,
  style,
}: IconButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const buttonSize = theme.components.iconButton[size];
  const iconSize = size === 'sm' ? 18 : size === 'md' ? 22 : 26;

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: backgroundColor || theme.colors.primary[500],
          ...theme.shadows.sm,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: color || theme.colors.border.default,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: backgroundColor || theme.colors.neutral[100],
        };
    }
  };

  const getIconColor = () => {
    if (disabled) return theme.colors.neutral[400];
    if (color) return color;
    if (variant === 'filled') return theme.colors.text.inverse;
    return theme.colors.text.primary;
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: theme.borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          ...getVariantStyles(),
        },
        animatedStyle,
        style,
      ]}
    >
      <Feather name={icon} size={iconSize} color={getIconColor()} />
    </AnimatedPressable>
  );
}

// FAB - Floating Action Button
interface FABProps {
  icon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  label?: string;
  style?: ViewStyle;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
}

export function FAB({
  icon = 'plus',
  onPress,
  label,
  style,
  position = 'bottom-right',
}: FABProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'bottom-center':
        return { alignSelf: 'center' };
      case 'bottom-left':
        return { left: theme.spacing.xl };
      default:
        return { right: theme.spacing.xl };
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          position: 'absolute',
          bottom: theme.layout.tabBarHeight + theme.spacing['2xl'],
          backgroundColor: theme.colors.primary[500],
          borderRadius: label ? theme.borderRadius.lg : theme.borderRadius.full,
          paddingHorizontal: label ? theme.spacing.xl : 0,
          height: 56,
          minWidth: 56,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          ...theme.shadows.primaryGlow,
          ...getPositionStyle(),
        },
        animatedStyle,
        style,
      ]}
    >
      <Feather name={icon} size={24} color={theme.colors.text.inverse} />
      {label && (
        <Text
          style={{
            color: theme.colors.text.inverse,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold as any,
          }}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

export default Button;
