# 🎨 CampusPulse - Evenro Design System Implementation

## Overview

This document outlines the complete UI/UX redesign of CampusPulse, inspired by the Evenro event booking app Figma designs. The new design system features a vibrant orange color palette, modern components, and smooth animations.

---

## 🎨 Design System

### Color Palette

#### Primary - Vibrant Orange
| Token | Hex | Usage |
|-------|-----|-------|
| primary-50 | #FFF4F0 | Lightest backgrounds |
| primary-100 | #FFE4DB | Light backgrounds |
| primary-500 | **#FF6B35** | Main brand color |
| primary-700 | #E64A19 | Hover/pressed states |
| primary-900 | #BF360C | Darkest accents |

#### Secondary - Purple/Violet
| Token | Hex | Usage |
|-------|-----|-------|
| secondary-500 | **#6C63FF** | Secondary accents |

#### Tertiary - Teal
| Token | Hex | Usage |
|-------|-----|-------|
| tertiary-500 | **#00BFA5** | Success states |

#### Semantic Colors
- Success: `#4CAF50`
- Warning: `#FFC107`
- Error: `#F44336`
- Info: `#2196F3`

### Typography

```typescript
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
}
```

### Spacing (8px Grid)

```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
}
```

### Border Radius

```typescript
borderRadius: {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
}
```

---

## 📦 Components Created

### 1. Button (`components/ui/Button.tsx`)
- **Variants**: primary, secondary, outline, ghost, danger
- **Sizes**: sm (40px), md (48px), lg (56px)
- **Features**: Loading state, icons, gradient option
- **Sub-components**: `IconButton`, `FAB`

### 2. Input (`components/ui/Input.tsx`)
- **Variants**: Default, with icons
- **Sizes**: sm, md, lg
- **Sub-components**: `PasswordInput`, `SearchInput`, `OTPInput`
- **Features**: Error states, helper text, focus animations

### 3. EventCard (`components/ui/EventCard.tsx`)
- **Variants**:
  - `default` - Vertical card with image
  - `compact` - Horizontal list item
  - `featured` - Large hero card with gradient
- **Features**: Favorite button, price tag, attendee avatars, category tags

### 4. Chip (`components/ui/Chip.tsx`)
- **Variants**: filled, outlined, soft
- **Sub-components**: `FilterChip`, `CategoryChip`, `InterestTag`, `Badge`
- **Features**: Selection state, emoji/icon support, close button

### 5. Avatar (`components/ui/Avatar.tsx`)
- **Sizes**: xs (24), sm (32), md (40), lg (48), xl (64), 2xl (80)
- **Sub-components**: `AvatarStack` for attendee lists
- **Features**: Badge indicator, initials fallback

### 6. Header (`components/ui/Header.tsx`)
- **Variants**: Default, Transparent, Blur
- **Sub-components**: `LargeHeader` for home screen
- **Features**: Back button, actions, notification badge

---

## 📱 Screens Updated

### Home Screen (`app/(tabs)/index.tsx`)
- Large header with avatar and greeting
- Location selector
- Search bar (tappable)
- Horizontal category chips
- Featured events carousel
- Nearby events list
- Activity stats card

### Tab Layout (`app/(tabs)/_layout.tsx`)
- Custom tab icons with animations
- Evenro color scheme
- Safe area handling

---

## 🎯 Key Features

### Animations
- Spring animations on press (scale 0.96)
- Fade-in animations on scroll (using Reanimated)
- Tab icon scale on focus

### Shadows
```typescript
shadows: {
  card: { shadowOpacity: 0.08, elevation: 4 },
  primaryGlow: { shadowColor: '#FF6B35', shadowOpacity: 0.35 },
  floating: { shadowOpacity: 0.12, elevation: 6 },
  sheet: { shadowOpacity: 0.1, elevation: 10 },
}
```

### Component Sizes
```typescript
button: {
  sm: { height: 40, paddingX: 16 },
  md: { height: 48, paddingX: 20 },
  lg: { height: 56, paddingX: 24 },
}
```

---

## 📂 File Structure

```
apps/mobile/
├── lib/
│   ├── constants/
│   │   ├── theme.ts          # Complete design tokens
│   │   ├── categories.ts     # 15 event categories
│   │   └── badges.ts         # Achievement badges
│   └── types/
│       └── index.ts          # TypeScript types
│
├── components/
│   └── ui/
│       ├── Button.tsx        # Button, IconButton, FAB
│       ├── Input.tsx         # Input, PasswordInput, SearchInput, OTP
│       ├── EventCard.tsx     # 3 variants
│       ├── Card.tsx          # Base card
│       ├── Chip.tsx          # Chip, FilterChip, CategoryChip, Badge
│       ├── Avatar.tsx        # Avatar, AvatarStack
│       ├── Header.tsx        # Header, LargeHeader
│       └── index.ts          # Barrel exports
│
└── app/
    └── (tabs)/
        ├── _layout.tsx       # Custom tab bar
        └── index.tsx         # Home screen
```

---

## 🚀 Dependencies

```json
{
  "expo-linear-gradient": "^14.x",
  "expo-blur": "^14.x",
  "@expo/vector-icons": "^14.x",
  "react-native-reanimated": "^3.x",
  "react-native-gesture-handler": "^2.x",
  "react-native-safe-area-context": "^4.x"
}
```

---

## 🎨 Design Principles

1. **Warm & Inviting**: Orange primary color creates energy and excitement
2. **Clean & Modern**: Generous whitespace, rounded corners
3. **Accessible**: High contrast text, touch targets ≥44px
4. **Animated**: Subtle spring animations for delight
5. **Consistent**: 8px grid, unified component system

---

## 📝 Next Steps

1. **Auth Screens**: Login, Signup, Verification (following Evenro 05-09)
2. **Onboarding**: Splash, carousel screens (following Evenro 01-04)
3. **Event Details**: Full event page with booking
4. **Explore/Search**: Map view, filters
5. **Tickets**: My tickets with past/upcoming tabs
6. **Profile**: User profile, settings
7. **Chat/Messaging**: Event chat feature

---

## 🔗 Resources

- **Figma Reference**: Evenro Event Booking App (59 screens)
- **Icons**: Feather Icons (@expo/vector-icons)
- **Fonts**: System fonts (SF Pro on iOS, Roboto on Android)

---

*Last Updated: January 2025*
*Design System Version: 2.0 - Evenro Inspired*
