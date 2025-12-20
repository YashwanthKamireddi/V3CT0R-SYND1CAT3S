/**
 * Chip Component - Evenro Design System
 * Category chips, filters, and tag components
 */

import React from 'react';
import { View, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../lib/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipVariant = 'filled' | 'outlined' | 'soft';

interface ChipProps {
  label: string;
  emoji?: string;
  icon?: keyof typeof Feather.glyphMap;
  selected?: boolean;
  disabled?: boolean;
  size?: ChipSize;
  variant?: ChipVariant;
  color?: string;
  onPress?: () => void;
  onClose?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  emoji,
  icon,
  selected = false,
  disabled = false,
  size = 'md',
  variant = 'soft',
  color = theme.colors.primary[500],
  onPress,
  onClose,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, theme.animation.spring);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.animation.spring);
  };

  const sizeConfig = theme.components.chip[size];

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    if (disabled) {
      return {
        container: {
          backgroundColor: theme.colors.neutral[100],
          borderWidth: 0,
        },
        text: {
          color: theme.colors.text.disabled,
        },
      };
    }

    switch (variant) {
      case 'filled':
        return {
          container: {
            backgroundColor: selected ? color : theme.colors.neutral[100],
            borderWidth: 0,
          },
          text: {
            color: selected ? theme.colors.text.inverse : theme.colors.text.primary,
          },
        };
      case 'outlined':
        return {
          container: {
            backgroundColor: selected ? `${color}10` : 'transparent',
            borderWidth: 1.5,
            borderColor: selected ? color : theme.colors.border.default,
          },
          text: {
            color: selected ? color : theme.colors.text.secondary,
          },
        };
      case 'soft':
      default:
        return {
          container: {
            backgroundColor: selected ? color : `${color}15`,
            borderWidth: 0,
          },
          text: {
            color: selected ? theme.colors.text.inverse : color,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingX,
          borderRadius: theme.borderRadius.full,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
          ...variantStyles.container,
        },
        animatedStyle,
        style,
      ]}
    >
      {emoji && <Text style={{ fontSize: iconSize + 2 }}>{emoji}</Text>}
      {icon && !emoji && (
        <Feather name={icon} size={iconSize} color={variantStyles.text.color as string} />
      )}
      <Text
        style={{
          fontSize: sizeConfig.fontSize,
          fontWeight: theme.typography.fontWeight.medium as any,
          ...variantStyles.text,
        }}
      >
        {label}
      </Text>
      {onClose && (
        <Pressable onPress={onClose} hitSlop={8}>
          <Feather name="x" size={iconSize} color={variantStyles.text.color as string} />
        </Pressable>
      )}
    </AnimatedPressable>
  );
};

// Filter Chip with checkmark
interface FilterChipProps extends Omit<ChipProps, 'variant'> {
  count?: number;
}

export const FilterChip: React.FC<FilterChipProps> = ({ selected, count, ...props }) => {
  return (
    <Chip
      {...props}
      selected={selected}
      variant="outlined"
      icon={selected ? 'check' : undefined}
      label={count !== undefined ? `${props.label} (${count})` : props.label}
    />
  );
};

// Category Chip (horizontal scrollable list item)
interface CategoryChipProps {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  id,
  name,
  emoji,
  color = theme.colors.primary[500],
  selected = false,
  onPress,
}) => {
  return (
    <Chip
      label={name}
      emoji={emoji}
      selected={selected}
      color={color}
      variant="soft"
      onPress={onPress}
    />
  );
};

// Interest Tag (for profile/onboarding)
interface InterestTagProps {
  id: string;
  name: string;
  emoji: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const InterestTag: React.FC<InterestTagProps> = ({
  id,
  name,
  emoji,
  color,
  selected = false,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, theme.animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.animation.spring);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          backgroundColor: selected ? color : `${color}10`,
          borderRadius: theme.borderRadius.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          borderWidth: selected ? 0 : 1,
          borderColor: theme.colors.border.light,
        },
        animatedStyle,
        style,
      ]}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium as any,
          color: selected ? theme.colors.text.inverse : theme.colors.text.primary,
        }}
      >
        {name}
      </Text>
      {selected && (
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: 'rgba(255,255,255,0.3)',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto',
          }}
        >
          <Feather name="check" size={12} color={theme.colors.text.inverse} />
        </View>
      )}
    </AnimatedPressable>
  );
};

// Badge component
interface BadgeProps {
  label: string | number;
  color?: string;
  size?: 'sm' | 'md';
  variant?: 'filled' | 'outlined' | 'dot';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = theme.colors.semantic.error,
  size = 'sm',
  variant = 'filled',
}) => {
  if (variant === 'dot') {
    return (
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
    );
  }

  const minSize = size === 'sm' ? 18 : 22;
  const fontSize = size === 'sm' ? 10 : 12;
  const padding = size === 'sm' ? 4 : 6;

  return (
    <View
      style={{
        minWidth: minSize,
        height: minSize,
        paddingHorizontal: padding,
        borderRadius: minSize / 2,
        backgroundColor: variant === 'filled' ? color : 'transparent',
        borderWidth: variant === 'outlined' ? 1 : 0,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize,
          fontWeight: theme.typography.fontWeight.bold as any,
          color: variant === 'filled' ? theme.colors.text.inverse : color,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default Chip;
