/**
 * CampusPulse Design System - Evenro Inspired
 * Modern event booking app theme with warm orange accents
 * Based on Evenro Figma designs for premium UI/UX
 */

export const theme = {
  colors: {
    // Primary Orange palette - Main brand identity
    primary: {
      50: '#FFF4F0',
      100: '#FFE4DB',
      200: '#FFCBBA',
      300: '#FFAB91',
      400: '#FF8A65',
      500: '#FF6B35', // Main brand color - Vibrant Orange
      600: '#F4511E',
      700: '#E64A19',
      800: '#D84315',
      900: '#BF360C',
    },

    // Secondary Purple/Violet palette - Accent color
    secondary: {
      50: '#F3F0FF',
      100: '#E9E4FF',
      200: '#D4CCFF',
      300: '#B8A9FF',
      400: '#9D85FF',
      500: '#6C63FF', // Main secondary - Purple
      600: '#5B52E6',
      700: '#4A42CC',
      800: '#3933B3',
      900: '#282499',
    },

    // Tertiary Teal palette - Success/Available states
    tertiary: {
      50: '#E0F7F4',
      100: '#B3ECE4',
      200: '#80E0D3',
      300: '#4DD4C1',
      400: '#26CAB3',
      500: '#00BFA5', // Main tertiary - Teal
      600: '#00AC95',
      700: '#009985',
      800: '#008675',
      900: '#006655',
    },

    // Neutral palette - UI backgrounds and text
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },

    // Dark Navy palette - Headers and deep backgrounds
    dark: {
      50: '#E8E9ED',
      100: '#C5C7D0',
      200: '#9FA3B3',
      300: '#787F96',
      400: '#5B6480',
      500: '#3E496A',
      600: '#384262',
      700: '#303957',
      800: '#28304D',
      900: '#1A1A2E', // Deep navy for dark mode
    },

    // Semantic colors
    semantic: {
      success: '#4CAF50',
      successLight: '#E8F5E9',
      warning: '#FFC107',
      warningLight: '#FFF8E1',
      error: '#F44336',
      errorLight: '#FFEBEE',
      info: '#2196F3',
      infoLight: '#E3F2FD',
    },

    // Quick access colors
    background: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
      tertiary: '#F5F5F5',
      dark: '#1A1A2E',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },

    text: {
      primary: '#212121',
      secondary: '#616161',
      tertiary: '#9E9E9E',
      disabled: '#BDBDBD',
      inverse: '#FFFFFF',
      link: '#2196F3',
    },

    border: {
      light: '#F5F5F5',
      default: '#E0E0E0',
      medium: '#BDBDBD',
      dark: '#9E9E9E',
    },

    // Social colors
    social: {
      google: '#DB4437',
      facebook: '#1877F2',
      apple: '#000000',
      twitter: '#1DA1F2',
    }
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
    '7xl': 80,
    '8xl': 96,
  },

  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'Cal Sans, Inter, sans-serif',
    },

    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    lineHeight: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    }
  },

  borderRadius: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    full: 9999,
  },

  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    // Primary glow for CTAs
    primaryGlow: {
      shadowColor: '#FF6B35',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    // Card shadow
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    // Floating element shadow
    floating: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    // Bottom sheet shadow
    sheet: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 10,
    },
  },

  opacity: {
    0: 0,
    5: 0.05,
    10: 0.1,
    20: 0.2,
    30: 0.3,
    40: 0.4,
    50: 0.5,
    60: 0.6,
    70: 0.7,
    80: 0.8,
    90: 0.9,
    100: 1,
  },

  transitions: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      easeIn: [0.4, 0, 1, 1],
      easeOut: [0, 0, 0.2, 1],
      easeInOut: [0.4, 0, 0.2, 1],
    }
  },

  layout: {
    containerPadding: 16,
    cardPadding: 16,
    screenPadding: 20,
    maxWidth: 1200,
    headerHeight: 56,
    tabBarHeight: 64,
    bottomSafeArea: 34,
  },

  // Component specific sizes
  components: {
    button: {
      sm: { height: 40, paddingX: 16, fontSize: 14 },
      md: { height: 48, paddingX: 20, fontSize: 15 },
      lg: { height: 56, paddingX: 24, fontSize: 16 },
    },
    input: {
      sm: { height: 44, paddingX: 14, fontSize: 14 },
      md: { height: 52, paddingX: 16, fontSize: 16 },
      lg: { height: 60, paddingX: 18, fontSize: 16 },
    },
    card: {
      sm: { borderRadius: 12, padding: 12 },
      md: { borderRadius: 16, padding: 16 },
      lg: { borderRadius: 20, padding: 20 },
    },
    chip: {
      sm: { height: 28, paddingX: 10, fontSize: 11 },
      md: { height: 32, paddingX: 14, fontSize: 12 },
      lg: { height: 36, paddingX: 16, fontSize: 14 },
    },
    avatar: {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
      '2xl': 80,
    },
    iconButton: {
      sm: 36,
      md: 44,
      lg: 52,
    },
  },

  // Animation presets
  animation: {
    spring: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    timing: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    scale: {
      pressed: 0.96,
      hover: 1.02,
    },
  },

  zIndex: {
    base: 1,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
  }
} as const;

export type Theme = typeof theme;

// Type helpers for better autocomplete
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeShadows = typeof theme.shadows;
export type ThemeComponents = typeof theme.components;

// Utility function to get theme value
export const getThemeValue = <T extends keyof Theme>(
  category: T,
  ...path: string[]
): any => {
  let value: any = theme[category];
  for (const key of path) {
    value = value?.[key];
  }
  return value;
};

// Quick color accessors
export const colors = theme.colors;
export const spacing = theme.spacing;
export const shadows = theme.shadows;
export const typography = theme.typography;
export const borderRadius = theme.borderRadius;

export default theme;
