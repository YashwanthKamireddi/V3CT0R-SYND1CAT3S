/**
 * Header Component - Evenro Design System
 * App header with back navigation, title, and action buttons
 */

import React from 'react';
import { View, Text, ViewStyle, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme } from '../../lib/constants/theme';
import { IconButton } from './Button';

interface HeaderAction {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  badge?: number;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  transparent?: boolean;
  blur?: boolean;
  leftAction?: HeaderAction;
  rightActions?: HeaderAction[];
  centerContent?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  transparent = false,
  blur = false,
  leftAction,
  rightActions,
  centerContent,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const headerContent = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: theme.layout.headerHeight,
          paddingHorizontal: theme.spacing.lg,
        },
      ]}
    >
      {/* Left Section */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        {showBack && (
          <IconButton
            icon="chevron-left"
            onPress={handleBackPress}
            variant={transparent ? 'ghost' : 'default'}
            size="md"
          />
        )}
        {leftAction && (
          <IconButton
            icon={leftAction.icon}
            onPress={leftAction.onPress}
            variant={transparent ? 'ghost' : 'default'}
            size="md"
          />
        )}
      </View>

      {/* Center Section */}
      {centerContent ? (
        centerContent
      ) : (
        <View style={{ flex: 1, marginHorizontal: theme.spacing.md }}>
          {title && (
            <Text
              numberOfLines={1}
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold as any,
                color: transparent ? theme.colors.text.inverse : theme.colors.text.primary,
                textAlign: 'center',
              }}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              numberOfLines={1}
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: transparent ? 'rgba(255,255,255,0.7)' : theme.colors.text.tertiary,
                textAlign: 'center',
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Right Section */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        {rightActions?.map((action, index) => (
          <View key={index} style={{ position: 'relative' }}>
            <IconButton
              icon={action.icon}
              onPress={action.onPress}
              variant={transparent ? 'ghost' : 'default'}
              size="md"
              color={transparent ? theme.colors.text.inverse : undefined}
            />
            {action.badge !== undefined && action.badge > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.semantic.error,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: theme.typography.fontWeight.bold as any,
                    color: theme.colors.text.inverse,
                  }}
                >
                  {action.badge > 99 ? '99+' : action.badge}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const containerStyle: ViewStyle = {
    paddingTop: insets.top,
    backgroundColor: transparent ? 'transparent' : theme.colors.background.primary,
    ...(transparent ? {} : theme.shadows.sm),
    ...style,
  };

  if (blur) {
    return (
      <BlurView
        intensity={80}
        tint="light"
        style={[containerStyle, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }]}
      >
        {headerContent}
      </BlurView>
    );
  }

  return <View style={containerStyle}>{headerContent}</View>;
};

// Large Header with profile info (for home screen)
interface LargeHeaderProps {
  greeting?: string;
  name: string;
  avatar?: string;
  location?: string;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  onSearchPress?: () => void;
  style?: ViewStyle;
}

export const LargeHeader: React.FC<LargeHeaderProps> = ({
  greeting,
  name,
  avatar,
  location,
  onAvatarPress,
  onNotificationPress,
  notificationCount,
  onSearchPress,
  style,
}) => {
  const insets = useSafeAreaInsets();

  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View
      style={[
        {
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
          backgroundColor: theme.colors.background.primary,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left - Profile */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.primary[100],
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {avatar ? (
              <View style={{ width: '100%', height: '100%' }}>
                {/* Image placeholder - would use Image component */}
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: theme.typography.fontWeight.semibold as any,
                  color: theme.colors.primary[500],
                }}
              >
                {name.slice(0, 2).toUpperCase()}
              </Text>
            )}
          </View>

          <View>
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.tertiary,
              }}
            >
              {getGreeting()} 👋
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold as any,
                color: theme.colors.text.primary,
              }}
            >
              {name}
            </Text>
          </View>
        </View>

        {/* Right - Actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          {onSearchPress && <IconButton icon="search" onPress={onSearchPress} />}
          {onNotificationPress && (
            <View style={{ position: 'relative' }}>
              <IconButton icon="bell" onPress={onNotificationPress} />
              {notificationCount !== undefined && notificationCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: theme.colors.semantic.error,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: theme.typography.fontWeight.bold as any,
                      color: theme.colors.text.inverse,
                    }}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Location */}
      {location && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.md,
          }}
        >
          <Feather name="map-pin" size={14} color={theme.colors.primary[500]} />
          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            {location}
          </Text>
          <Feather name="chevron-down" size={14} color={theme.colors.text.tertiary} />
        </View>
      )}
    </View>
  );
};

export default Header;
