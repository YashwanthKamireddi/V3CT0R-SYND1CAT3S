/**
 * Avatar Component - CampusPulse Design System
 * User avatars with stacking support for attendee lists
 */

import React from 'react';
import { View, Image, Text, ViewStyle, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { tokens } from '../../lib/styles/unified';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Avatar size values
const AVATAR_SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
};

interface AvatarProps {
  source?: string | { uri: string };
  name?: string;
  size?: AvatarSize;
  showBadge?: boolean;
  badgeColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  showBadge = false,
  badgeColor = tokens.colors.success,
  onPress,
  style,
}) => {
  const sizeValue = AVATAR_SIZES[size];
  const fontSize = sizeValue * 0.4;
  const badgeSize = sizeValue * 0.3;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const imageSource = typeof source === 'string' ? { uri: source } : source;

  const content = (
    <View
      style={[
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          backgroundColor: tokens.colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {imageSource?.uri ? (
        <Image
          source={imageSource}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={{
            fontSize,
            fontWeight: '600',
            color: tokens.colors.primary,
          }}
        >
          {getInitials(name)}
        </Text>
      )}

      {showBadge && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: badgeColor,
            borderWidth: 2,
            borderColor: tokens.colors.background.primary,
          }}
        />
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
};

// Avatar Stack for showing multiple attendees
interface AvatarStackProps {
  avatars: Array<{
    source?: string;
    name?: string;
  }>;
  max?: number;
  size?: AvatarSize;
  showCount?: boolean;
  countText?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  avatars,
  max = 3,
  size = 'sm',
  showCount = true,
  countText,
  onPress,
  style,
}) => {
  const sizeValue = AVATAR_SIZES[size];
  const overlap = sizeValue * 0.3;
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const content = (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <View style={{ flexDirection: 'row' }}>
        {visibleAvatars.map((avatar, index) => (
          <View
            key={index}
            style={{
              marginLeft: index > 0 ? -overlap : 0,
              zIndex: max - index,
            }}
          >
            <Avatar
              source={avatar.source}
              name={avatar.name}
              size={size}
              style={{
                borderWidth: 2,
                borderColor: tokens.colors.background.primary,
              }}
            />
          </View>
        ))}

        {remainingCount > 0 && (
          <View
            style={{
              marginLeft: -overlap,
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              backgroundColor: tokens.colors.background.tertiary,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: tokens.colors.background.primary,
            }}
          >
            <Text
              style={{
                fontSize: sizeValue * 0.35,
                fontWeight: '600',
                color: tokens.colors.text.secondary,
              }}
            >
              +{remainingCount}
            </Text>
          </View>
        )}
      </View>

      {showCount && countText && (
        <Text
          style={{
            marginLeft: tokens.spacing[2],
            fontSize: tokens.typography.size.xs,
            color: tokens.colors.text.tertiary,
          }}
        >
          {countText}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
};

export default Avatar;
