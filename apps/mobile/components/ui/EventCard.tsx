/**
 * EventCard Component - Evenro Design System
 * Premium event card with multiple variants following Evenro design language
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  Pressable,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../lib/constants/theme';
import { getCategoryById, getCategoryColor } from '../../lib/constants/categories';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EventCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  image?: ImageSourcePropType | string;
  imageUrl?: string;
  date: string;
  time?: string;
  location: string;
  price?: number | 'Free';
  category?: string;
  categoryColor?: string;
  points?: number;
  capacity?: { current: number; max: number };
  attendeeCount?: number;
  attendeeImages?: string[];
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  variant?: 'default' | 'compact' | 'featured';
  status?: 'available' | 'almostFull' | 'full' | 'registered' | 'conflict';
  style?: ViewStyle;
}

export function EventCard({
  id,
  title,
  subtitle,
  image,
  imageUrl,
  date,
  time,
  location,
  price,
  category,
  categoryColor: customCategoryColor,
  points,
  capacity,
  attendeeCount,
  attendeeImages,
  isFavorite = false,
  onPress,
  onFavoritePress,
  variant = 'default',
  status = 'available',
  style,
}: EventCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, theme.animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.animation.spring);
  };

  // Handle both image prop and imageUrl
  const imageSource = image
    ? typeof image === 'string'
      ? { uri: image }
      : image
    : imageUrl
    ? { uri: imageUrl }
    : undefined;

  const categoryData = category ? getCategoryById(category) : null;
  const categoryColor = customCategoryColor || (categoryData?.color ?? theme.colors.primary[500]);
  const categoryLightColor = categoryData?.lightColor ?? `${categoryColor}15`;

  const priceText = price === 'Free' || price === 0 ? 'Free' : price ? `$${price}` : null;
  const finalAttendeeCount = attendeeCount ?? capacity?.current;

  // Compact variant - horizontal list item
  if (variant === 'compact') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          {
            flexDirection: 'row',
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            gap: theme.spacing.md,
            ...theme.shadows.card,
          },
          animatedStyle,
          style,
        ]}
      >
        {/* Thumbnail */}
        {imageSource && (
          <Image
            source={imageSource}
            style={{
              width: 100,
              height: 100,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.neutral[100],
            }}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          {/* Category Tag */}
          {categoryData && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: categoryLightColor,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.sm,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: theme.typography.fontWeight.medium as any,
                  color: categoryColor,
                }}
              >
                {categoryData.name}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text
            numberOfLines={2}
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold as any,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xs,
            }}
          >
            {title}
          </Text>

          {/* Date & Location */}
          <View style={{ gap: theme.spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
              <Feather name="calendar" size={12} color={theme.colors.text.tertiary} />
              <Text
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.tertiary,
                }}
              >
                {date}{time ? ` • ${time}` : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
              <Feather name="map-pin" size={12} color={theme.colors.text.tertiary} />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.tertiary,
                  flex: 1,
                }}
              >
                {location}
              </Text>
            </View>
          </View>
        </View>

        {/* Favorite Button */}
        {onFavoritePress && (
          <Pressable
            onPress={onFavoritePress}
            hitSlop={8}
            style={{
              position: 'absolute',
              top: theme.spacing.md,
              right: theme.spacing.md,
            }}
          >
            <Feather
              name="heart"
              size={20}
              color={isFavorite ? theme.colors.semantic.error : theme.colors.text.tertiary}
              style={{ opacity: isFavorite ? 1 : 0.6 }}
            />
          </Pressable>
        )}
      </AnimatedPressable>
    );
  }

  // Featured variant - large hero card
  if (variant === 'featured') {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          {
            width: SCREEN_WIDTH - 40,
            height: 280,
            borderRadius: theme.borderRadius.xl,
            overflow: 'hidden',
            ...theme.shadows.lg,
          },
          animatedStyle,
          style,
        ]}
      >
        {/* Background Image */}
        {imageSource && (
          <Image
            source={imageSource}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            resizeMode="cover"
          />
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' }}
        />

        {/* Favorite Button */}
        {onFavoritePress && (
          <Pressable
            onPress={onFavoritePress}
            style={{
              position: 'absolute',
              top: theme.spacing.lg,
              right: theme.spacing.lg,
              width: 36,
              height: 36,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: theme.borderRadius.full,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather
              name="heart"
              size={18}
              color={isFavorite ? theme.colors.semantic.error : theme.colors.text.secondary}
            />
          </Pressable>
        )}

        {/* Featured Badge */}
        <View
          style={{
            position: 'absolute',
            top: theme.spacing.lg,
            left: theme.spacing.lg,
            backgroundColor: theme.colors.primary[500],
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.borderRadius.full,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: theme.typography.fontWeight.bold as any,
              color: theme.colors.text.inverse,
              letterSpacing: 0.5,
            }}
          >
            FEATURED
          </Text>
        </View>

        {/* Content */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: theme.spacing.xl,
          }}
        >
          {/* Category Tag */}
          {categoryData && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: categoryColor,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.sm,
                marginBottom: theme.spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: theme.typography.fontWeight.semibold as any,
                  color: theme.colors.text.inverse,
                }}
              >
                {categoryData.name}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text
            numberOfLines={2}
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold as any,
              color: theme.colors.text.inverse,
              marginBottom: theme.spacing.sm,
            }}
          >
            {title}
          </Text>

          {/* Meta Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
              <Feather name="calendar" size={14} color={theme.colors.neutral[300]} />
              <Text style={{ fontSize: 13, color: theme.colors.neutral[300] }}>
                {date}{time ? ` • ${time}` : ''}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
              <Feather name="map-pin" size={14} color={theme.colors.neutral[300]} />
              <Text
                numberOfLines={1}
                style={{ fontSize: 13, color: theme.colors.neutral[300], maxWidth: 120 }}
              >
                {location}
              </Text>
            </View>
          </View>

          {/* Price & Attendees */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: theme.spacing.md,
            }}
          >
            {priceText && (
              <Text
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold as any,
                  color: theme.colors.primary[300],
                }}
              >
                {priceText}
              </Text>
            )}

            {finalAttendeeCount && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                {/* Attendee Avatars Stack */}
                <View style={{ flexDirection: 'row' }}>
                  {(attendeeImages || []).slice(0, 3).map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderWidth: 2,
                        borderColor: theme.colors.dark[900],
                        marginLeft: idx > 0 ? -10 : 0,
                      }}
                    />
                  ))}
                </View>
                <Text style={{ fontSize: 12, color: theme.colors.neutral[300] }}>
                  +{finalAttendeeCount} going
                </Text>
              </View>
            )}
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  // Default variant - vertical card
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          overflow: 'hidden',
          ...theme.shadows.card,
        },
        animatedStyle,
        style,
      ]}
    >
      {/* Image */}
      <View style={{ height: 160, position: 'relative', backgroundColor: theme.colors.neutral[100] }}>
        {imageSource && (
          <Image source={imageSource} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        )}

        {/* Favorite Button */}
        {onFavoritePress && (
          <Pressable
            onPress={onFavoritePress}
            style={{
              position: 'absolute',
              top: theme.spacing.md,
              right: theme.spacing.md,
              width: 36,
              height: 36,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: theme.borderRadius.full,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather
              name="heart"
              size={18}
              color={isFavorite ? theme.colors.semantic.error : theme.colors.text.secondary}
            />
          </Pressable>
        )}

        {/* Price Tag */}
        {priceText && (
          <View
            style={{
              position: 'absolute',
              bottom: theme.spacing.md,
              left: theme.spacing.md,
              backgroundColor: theme.colors.primary[500],
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.borderRadius.sm,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: theme.typography.fontWeight.bold as any,
                color: theme.colors.text.inverse,
              }}
            >
              {priceText}
            </Text>
          </View>
        )}

        {/* Points Badge */}
        {points && (
          <View
            style={{
              position: 'absolute',
              top: theme.spacing.md,
              left: theme.spacing.md,
              backgroundColor: theme.colors.semantic.warning,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.borderRadius.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Feather name="star" size={12} color={theme.colors.text.inverse} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: theme.typography.fontWeight.bold as any,
                color: theme.colors.text.inverse,
              }}
            >
              {points}pts
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ padding: theme.spacing.lg }}>
        {/* Category Tag */}
        {categoryData && (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: categoryLightColor,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.borderRadius.sm,
              marginBottom: theme.spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: theme.typography.fontWeight.medium as any,
                color: categoryColor,
              }}
            >
              {categoryData.name}
            </Text>
          </View>
        )}

        {/* Title */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.semibold as any,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}
        >
          {title}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text
            numberOfLines={1}
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.tertiary,
              marginBottom: theme.spacing.sm,
            }}
          >
            {subtitle}
          </Text>
        )}

        {/* Date & Time */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.lg,
            marginBottom: theme.spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <Feather name="calendar" size={14} color={theme.colors.primary[500]} />
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}
            >
              {date}
            </Text>
          </View>
          {time && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
              <Feather name="clock" size={14} color={theme.colors.primary[500]} />
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                }}
              >
                {time}
              </Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <Feather name="map-pin" size={14} color={theme.colors.text.tertiary} />
          <Text
            numberOfLines={1}
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.tertiary,
              flex: 1,
            }}
          >
            {location}
          </Text>
        </View>

        {/* Capacity or Attendees */}
        {(capacity || finalAttendeeCount) && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: theme.spacing.md,
              paddingTop: theme.spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border.light,
            }}
          >
            {capacity ? (
              <>
                <Feather name="users" size={14} color={theme.colors.text.tertiary} />
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                    marginLeft: theme.spacing.xs,
                  }}
                >
                  {capacity.current}/{capacity.max} spots
                </Text>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row' }}>
                  {(attendeeImages || []).slice(0, 3).map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: theme.colors.background.primary,
                        marginLeft: idx > 0 ? -8 : 0,
                      }}
                    />
                  ))}
                </View>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.tertiary,
                    marginLeft: theme.spacing.sm,
                  }}
                >
                  +{finalAttendeeCount} going
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

export default EventCard;
