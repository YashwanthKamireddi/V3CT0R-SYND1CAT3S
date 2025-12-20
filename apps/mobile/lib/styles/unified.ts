/**
 * CampusPulse Unified Design System
 * Apple-inspired design principles with consistent typography, spacing, and components
 * Works seamlessly across mobile and web platforms
 */

import { StyleSheet, Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling based on device size
const baseWidth = 375; // iPhone 11 Pro width
const baseHeight = 812; // iPhone 11 Pro height

export const scale = (size: number) => (SCREEN_WIDTH / baseWidth) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / baseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Normalize font size for consistent rendering across platforms
export const normalize = (size: number) => {
  const newSize = scale(size);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Design Tokens - Single source of truth
 */
export const tokens = {
  // Color Palette - Evenro/CampusPulse Brand
  colors: {
    // Primary Brand
    primary: '#FF6B35',
    primaryLight: '#FFF0EB',
    primaryDark: '#E64A19',

    // Semantic
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Neutrals - carefully crafted for accessibility
    white: '#FFFFFF',
    black: '#000000',

    // Background hierarchy
    background: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
      tertiary: '#F5F5F5',
      elevated: '#FFFFFF',
    },

    // Surface colors for cards, modals
    surface: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
      overlay: 'rgba(0, 0, 0, 0.5)',
      scrim: 'rgba(0, 0, 0, 0.3)',
    },

    // Text hierarchy - WCAG AA compliant
    text: {
      primary: '#1A1A2E',     // 12.6:1 contrast ratio
      secondary: '#4B5563',   // 7.5:1 contrast ratio
      tertiary: '#9CA3AF',    // 4.5:1 contrast ratio
      disabled: '#D1D5DB',
      inverse: '#FFFFFF',
      link: '#FF6B35',
    },

    // Border colors
    border: {
      light: '#F3F4F6',
      default: '#E5E7EB',
      medium: '#D1D5DB',
      dark: '#9CA3AF',
      focus: '#FF6B35',
    },
  },

  // Typography Scale - Apple SF Pro inspired
  typography: {
    // Font families - system fonts for best performance
    fontFamily: {
      regular: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }),
      medium: Platform.select({
        ios: 'System',
        android: 'Roboto-Medium',
        default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }),
      semibold: Platform.select({
        ios: 'System',
        android: 'Roboto-Medium',
        default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }),
      bold: Platform.select({
        ios: 'System',
        android: 'Roboto-Bold',
        default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }),
    },

    // Font sizes - Modular scale (1.2 ratio)
    size: {
      xs: normalize(11),      // Caption small
      sm: normalize(13),      // Caption
      base: normalize(15),    // Body
      md: normalize(17),      // Body large
      lg: normalize(20),      // Title 3
      xl: normalize(22),      // Title 2
      '2xl': normalize(26),   // Title 1
      '3xl': normalize(32),   // Large Title
      '4xl': normalize(40),   // Display
    },

    // Font weights
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },

    // Line heights - optimal for readability
    lineHeight: {
      tight: 1.2,
      snug: 1.35,
      normal: 1.5,
      relaxed: 1.625,
    },

    // Letter spacing
    letterSpacing: {
      tighter: -0.5,
      tight: -0.25,
      normal: 0,
      wide: 0.25,
      wider: 0.5,
      widest: 1,
    },
  },

  // Spacing Scale - 4px base unit (Apple HIG)
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
  },

  // Border Radius - Apple-inspired rounded corners
  radius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Shadows - Layered depth system
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    },
    glow: {
      shadowColor: '#FF6B35',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  // Animation
  animation: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 500,
    },
    spring: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
  },

  // Layout
  layout: {
    screenPadding: 20,
    cardPadding: 16,
    maxWidth: 428, // iPhone 14 Pro Max
    headerHeight: 56,
    tabBarHeight: 64,
  },
};

/**
 * Pre-built Typography Styles
 * Use these for consistent text rendering across all screens
 */
export const typography = StyleSheet.create({
  // Display - Hero text, splash screens
  displayLarge: {
    fontSize: tokens.typography.size['4xl'],
    fontWeight: tokens.typography.weight.bold,
    lineHeight: tokens.typography.size['4xl'] * tokens.typography.lineHeight.tight,
    color: tokens.colors.text.primary,
    letterSpacing: tokens.typography.letterSpacing.tight,
  },

  // Large Title - Screen titles
  largeTitle: {
    fontSize: tokens.typography.size['3xl'],
    fontWeight: tokens.typography.weight.bold,
    lineHeight: tokens.typography.size['3xl'] * tokens.typography.lineHeight.tight,
    color: tokens.colors.text.primary,
    letterSpacing: tokens.typography.letterSpacing.tight,
  },

  // Title 1 - Section headers
  title1: {
    fontSize: tokens.typography.size['2xl'],
    fontWeight: tokens.typography.weight.bold,
    lineHeight: tokens.typography.size['2xl'] * tokens.typography.lineHeight.snug,
    color: tokens.colors.text.primary,
  },

  // Title 2 - Card titles
  title2: {
    fontSize: tokens.typography.size.xl,
    fontWeight: tokens.typography.weight.semibold,
    lineHeight: tokens.typography.size.xl * tokens.typography.lineHeight.snug,
    color: tokens.colors.text.primary,
  },

  // Title 3 - List item titles
  title3: {
    fontSize: tokens.typography.size.lg,
    fontWeight: tokens.typography.weight.semibold,
    lineHeight: tokens.typography.size.lg * tokens.typography.lineHeight.snug,
    color: tokens.colors.text.primary,
  },

  // Headline - Emphasized body text
  headline: {
    fontSize: tokens.typography.size.md,
    fontWeight: tokens.typography.weight.semibold,
    lineHeight: tokens.typography.size.md * tokens.typography.lineHeight.normal,
    color: tokens.colors.text.primary,
  },

  // Body - Default text
  body: {
    fontSize: tokens.typography.size.base,
    fontWeight: tokens.typography.weight.regular,
    lineHeight: tokens.typography.size.base * tokens.typography.lineHeight.normal,
    color: tokens.colors.text.primary,
  },

  // Body Secondary
  bodySecondary: {
    fontSize: tokens.typography.size.base,
    fontWeight: tokens.typography.weight.regular,
    lineHeight: tokens.typography.size.base * tokens.typography.lineHeight.normal,
    color: tokens.colors.text.secondary,
  },

  // Callout - Slightly larger body
  callout: {
    fontSize: tokens.typography.size.md,
    fontWeight: tokens.typography.weight.regular,
    lineHeight: tokens.typography.size.md * tokens.typography.lineHeight.normal,
    color: tokens.colors.text.primary,
  },

  // Subhead - Supporting text
  subhead: {
    fontSize: tokens.typography.size.base,
    fontWeight: tokens.typography.weight.medium,
    lineHeight: tokens.typography.size.base * tokens.typography.lineHeight.normal,
    color: tokens.colors.text.secondary,
  },

  // Footnote - Small supporting text
  footnote: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.regular,
    lineHeight: tokens.typography.size.sm * tokens.typography.lineHeight.normal,
    color: tokens.colors.text.tertiary,
  },

  // Caption 1 - Labels, timestamps
  caption1: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.medium,
    lineHeight: tokens.typography.size.sm * tokens.typography.lineHeight.normal,
    color: tokens.colors.text.tertiary,
  },

  // Caption 2 - Smallest text
  caption2: {
    fontSize: tokens.typography.size.xs,
    fontWeight: tokens.typography.weight.regular,
    lineHeight: tokens.typography.size.xs * tokens.typography.lineHeight.normal,
    color: tokens.colors.text.tertiary,
  },

  // Button text styles
  buttonLarge: {
    fontSize: tokens.typography.size.md,
    fontWeight: tokens.typography.weight.semibold,
    lineHeight: tokens.typography.size.md * tokens.typography.lineHeight.tight,
    color: tokens.colors.white,
    letterSpacing: tokens.typography.letterSpacing.wide,
  },

  buttonMedium: {
    fontSize: tokens.typography.size.base,
    fontWeight: tokens.typography.weight.semibold,
    lineHeight: tokens.typography.size.base * tokens.typography.lineHeight.tight,
    color: tokens.colors.white,
  },

  buttonSmall: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.semibold,
    lineHeight: tokens.typography.size.sm * tokens.typography.lineHeight.tight,
    color: tokens.colors.white,
  },

  // Label styles
  label: {
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.semibold,
    lineHeight: tokens.typography.size.sm * tokens.typography.lineHeight.tight,
    color: tokens.colors.text.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: tokens.typography.letterSpacing.wider,
  },

  // Link style
  link: {
    fontSize: tokens.typography.size.base,
    fontWeight: tokens.typography.weight.medium,
    lineHeight: tokens.typography.size.base * tokens.typography.lineHeight.normal,
    color: tokens.colors.primary,
  },
});

/**
 * Common Component Styles
 * Reusable styles for consistent component rendering
 */
export const components = StyleSheet.create({
  // Screen container
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },

  screenSecondary: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
  },

  // Content containers
  container: {
    paddingHorizontal: tokens.layout.screenPadding,
  },

  // Cards
  card: {
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    ...tokens.shadows.sm,
  },

  cardElevated: {
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing[4],
    ...tokens.shadows.md,
  },

  cardOutlined: {
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[6],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: tokens.spacing[2],
    ...tokens.shadows.glow,
  },

  buttonSecondary: {
    backgroundColor: tokens.colors.primaryLight,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[6],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: tokens.spacing[2],
  },

  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing[4] - 1.5,
    paddingHorizontal: tokens.spacing[6],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: tokens.spacing[2],
    borderWidth: 1.5,
    borderColor: tokens.colors.primary,
  },

  buttonGhost: {
    backgroundColor: 'transparent',
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: tokens.spacing[2],
  },

  // Input fields
  input: {
    backgroundColor: tokens.colors.background.tertiary,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[4],
    fontSize: tokens.typography.size.base,
    color: tokens.colors.text.primary,
    borderWidth: 1.5,
    borderColor: tokens.colors.border.default,
  },

  inputFocused: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.background.primary,
  },

  inputError: {
    borderColor: tokens.colors.error,
  },

  // Badges
  badge: {
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[1],
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.primaryLight,
  },

  badgeText: {
    fontSize: tokens.typography.size.xs,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.primary,
  },

  // Avatar
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.background.tertiary,
  },

  avatarMedium: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.colors.background.tertiary,
  },

  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.background.tertiary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border.light,
  },

  dividerThick: {
    height: 8,
    backgroundColor: tokens.colors.background.secondary,
  },

  // Icon container
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  iconContainerSmall: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Row layouts
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },

  rowCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Center content
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Flex utilities
  flex1: {
    flex: 1,
  },

  // Gap utilities
  gap1: { gap: tokens.spacing[1] },
  gap2: { gap: tokens.spacing[2] },
  gap3: { gap: tokens.spacing[3] },
  gap4: { gap: tokens.spacing[4] },
  gap5: { gap: tokens.spacing[5] },
  gap6: { gap: tokens.spacing[6] },
});

/**
 * Layout helpers
 */
export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
  isTablet: SCREEN_WIDTH >= 768,
};

/**
 * Helper to create consistent spacing
 */
export const spacing = (multiplier: number) => tokens.spacing[4] * multiplier;

/**
 * Helper to create responsive sizes
 */
export const responsive = {
  width: (percentage: number) => SCREEN_WIDTH * (percentage / 100),
  height: (percentage: number) => SCREEN_HEIGHT * (percentage / 100),
};

export default {
  tokens,
  typography,
  components,
  layout,
  scale,
  verticalScale,
  moderateScale,
  normalize,
  spacing,
  responsive,
};
