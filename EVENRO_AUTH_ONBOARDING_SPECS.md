# Evenro Authentication & Onboarding Screen Specifications

## 01. Splash Screen

### Layout Structure
```
CONTAINER: Full screen, center-aligned
  |-- BACKGROUND: Solid primary color (#FF6B35) or gradient
  |-- LOGO_CONTAINER: Center (40% from top)
      |-- APP_ICON: 80x80px, white icon on transparent
      |-- APP_NAME: Below icon, 16px gap
  |-- TAGLINE: Center, below name, 8px gap
  |-- LOADING_INDICATOR: Bottom 15%, optional
```

### Typography
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| App Name | 36px | 700 (Bold) | #FFFFFF |
| Tagline | 16px | 400 (Regular) | rgba(255,255,255,0.8) |

### Colors
- Background: #FF6B35 (Primary Orange) or gradient to #E64A19
- All text: White (#FFFFFF)
- Loading spinner: White with 70% opacity

---

## 02-04. Onboarding Screens (1, 2, 3)

### Layout Structure
```
CONTAINER: Full screen, flex-column
  |-- SKIP_BUTTON: Top-right, 20px margin
  |-- ILLUSTRATION_AREA: 50-55% height, center-aligned
      |-- ILLUSTRATION: Max 280x280px, centered
  |-- CONTENT_AREA: Flex-1, padding 24px horizontal
      |-- TITLE: Center-aligned
      |-- DESCRIPTION: Center-aligned, 12px below title
  |-- BOTTOM_AREA: 120px fixed height
      |-- PAGINATION_DOTS: Center, 32px from bottom of content
      |-- CTA_BUTTON: Full-width, 24px horizontal margin
```

### Typography
| Element | Size | Weight | Color | Alignment |
|---------|------|--------|-------|-----------|
| Skip | 14px | 500 | #9E9E9E | Right |
| Title | 28px | 700 | #212121 | Center |
| Description | 16px | 400 | #757575 | Center |
| Button Text | 16px | 600 | #FFFFFF | Center |

### Pagination Dots
```
STYLE:
  - Active dot: 24px width, 8px height, border-radius: 4px
  - Inactive dot: 8px width, 8px height, border-radius: 4px (circle)
  - Gap between dots: 8px
  - Active color: #FF6B35
  - Inactive color: #E0E0E0
```

### Button Style (Primary CTA)
```
HEIGHT: 56px
BORDER_RADIUS: 16px
BACKGROUND: #FF6B35
TEXT_COLOR: #FFFFFF
SHADOW: 0px 4px 12px rgba(255,107,53,0.35)
MARGIN_HORIZONTAL: 24px
```

---

## 06. Sign In Screen

### Layout Structure
```
CONTAINER: Full screen, white background
  |-- HEADER_AREA: Top, flex-start
      |-- BACK_BUTTON: 44x44px, top-left, 16px margin
  |-- CONTENT_AREA: Flex-1, center, padding 24px
      |-- TITLE: Left-aligned
      |-- SUBTITLE: Left-aligned, 8px below
      |-- FORM_CONTAINER: 32px below subtitle
          |-- EMAIL_INPUT: Full-width
          |-- PASSWORD_INPUT: Full-width, 16px below
          |-- FORGOT_PASSWORD: Right-aligned, 12px below
      |-- PRIMARY_BUTTON: Full-width, 32px below form
      |-- DIVIDER: 24px vertical margin
          |-- LINE + "Or continue with" + LINE
      |-- SOCIAL_BUTTONS: Row, center, 16px gap
          |-- GOOGLE_BUTTON
          |-- FACEBOOK_BUTTON
          |-- APPLE_BUTTON
  |-- FOOTER: Bottom, 32px padding
      |-- SIGNUP_LINK: Center
```

### Typography
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Title | 30px | 700 | #212121 |
| Subtitle | 16px | 400 | #757575 |
| Input Label | 14px | 500 | #424242 |
| Input Text | 16px | 400 | #212121 |
| Input Placeholder | 16px | 400 | #9E9E9E |
| Forgot Password | 14px | 500 | #FF6B35 |
| Button Text | 16px | 600 | #FFFFFF |
| Divider Text | 14px | 400 | #9E9E9E |
| Footer Regular | 14px | 400 | #757575 |
| Footer Link | 14px | 600 | #FF6B35 |

### Input Field Styles
```
HEIGHT: 52px
BORDER_RADIUS: 12px
BACKGROUND: #FAFAFA
BORDER: 1px solid #E0E0E0
PADDING_HORIZONTAL: 16px
ICON_SIZE: 20px
ICON_COLOR: #9E9E9E
ICON_LEFT_MARGIN: 16px
TEXT_LEFT_MARGIN: 12px from icon

FOCUS_STATE:
  - Border: 2px solid #FF6B35
  - Background: #FFFFFF

ERROR_STATE:
  - Border: 2px solid #F44336
  - Helper text: 12px, #F44336, 4px below input
```

### Primary Button
```
HEIGHT: 56px
BORDER_RADIUS: 16px
BACKGROUND: #FF6B35
TEXT_COLOR: #FFFFFF
FONT_SIZE: 16px
FONT_WEIGHT: 600
SHADOW: 0 4px 12px rgba(255,107,53,0.35)

DISABLED_STATE:
  - Background: #E0E0E0
  - Text: #9E9E9E
  - No shadow

LOADING_STATE:
  - Show ActivityIndicator (white, size: small)
  - Hide text
```

### Social Login Buttons
```
CONTAINER: Row layout, centered
GAP: 16px

INDIVIDUAL_BUTTON:
  - Size: 56x56px
  - Border-radius: 16px
  - Background: #FFFFFF
  - Border: 1.5px solid #E0E0E0
  - Icon size: 24px

GOOGLE:
  - Icon color: #DB4437 or multi-color logo
FACEBOOK:
  - Icon color: #1877F2
APPLE:
  - Icon color: #000000
```

### Link Text Styles
```
FORGOT_PASSWORD:
  - Color: #FF6B35
  - Size: 14px
  - Weight: 500
  - Position: Right-aligned below password input

SIGNUP_LINK:
  - Regular text: #757575, 14px, 400
  - Link text: #FF6B35, 14px, 600
  - Underline: None
```

---

## 07. Sign Up Screen

### Layout Structure
```
CONTAINER: Full screen, white background
  |-- HEADER_AREA:
      |-- BACK_BUTTON: 44x44px, top-left
  |-- CONTENT_AREA: Scroll view, padding 24px
      |-- TITLE: Left-aligned
      |-- SUBTITLE: Left-aligned, 8px below
      |-- FORM_CONTAINER: 24px below
          |-- NAME_INPUT: Full-width
          |-- EMAIL_INPUT: Full-width, 16px gap
          |-- PHONE_INPUT: Full-width, 16px gap (optional)
          |-- PASSWORD_INPUT: Full-width, 16px gap
          |-- CONFIRM_PASSWORD: Full-width, 16px gap
          |-- TERMS_CHECKBOX: 16px gap
      |-- PRIMARY_BUTTON: Full-width, 24px below
      |-- DIVIDER: 20px margin
      |-- SOCIAL_BUTTONS: Same as Sign In
  |-- FOOTER: Bottom fixed
      |-- SIGNIN_LINK: Center
```

### Additional Input Fields
```
NAME_INPUT:
  - Left icon: User icon
  - Placeholder: "Full Name"

PHONE_INPUT (if present):
  - Left: Country code selector (+1)
  - Placeholder: "Phone Number"
  - Keyboard: phone-pad

CONFIRM_PASSWORD:
  - Left icon: Lock icon
  - Right icon: Eye toggle
  - Placeholder: "Confirm Password"
```

### Terms Checkbox
```
CONTAINER: Row, 16px gap
CHECKBOX:
  - Size: 24x24px
  - Border-radius: 6px
  - Unchecked: Border 2px #E0E0E0, Background transparent
  - Checked: Background #FF6B35, Checkmark white
TEXT:
  - Size: 14px
  - Color: #757575
  - Link color: #FF6B35
  - "I agree to the Terms & Conditions"
```

---

## 08. Verification Screen (OTP)

### Layout Structure
```
CONTAINER: Full screen, white background
  |-- HEADER:
      |-- BACK_BUTTON: Top-left
      |-- TITLE: "Verification" centered or left
  |-- CONTENT: Center, padding 24px
      |-- ILLUSTRATION: Email/Phone icon, 80px
      |-- TITLE: Center
      |-- SUBTITLE: Center, includes masked email/phone
      |-- OTP_INPUT_ROW: 6 boxes, centered, 32px below
      |-- RESEND_TIMER: Center, 16px below
      |-- VERIFY_BUTTON: Full-width, 32px below
```

### OTP Input Boxes
```
LAYOUT: 6 boxes in a row
BOX_SIZE: 48x56px
GAP: 12px
BORDER_RADIUS: 12px
BORDER: 1.5px solid #E0E0E0
BACKGROUND: #FAFAFA
FONT_SIZE: 24px
FONT_WEIGHT: 700
TEXT_COLOR: #212121
TEXT_ALIGN: Center

FOCUSED_STATE:
  - Border: 2px solid #FF6B35
  - Background: #FFFFFF

FILLED_STATE:
  - Border: 2px solid #FF6B35
  - Background: #FFF4F0

ERROR_STATE:
  - Border: 2px solid #F44336
  - All boxes shake animation
```

### Typography
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Title | 24px | 700 | #212121 |
| Subtitle | 14px | 400 | #757575 |
| Masked contact | 14px | 600 | #212121 |
| OTP digits | 24px | 700 | #212121 |
| Timer text | 14px | 400 | #9E9E9E |
| Resend link | 14px | 600 | #FF6B35 |

### Resend Timer
```
INACTIVE (counting):
  - Text: "Resend code in 00:45"
  - Color: #9E9E9E
  - Not tappable

ACTIVE (timer done):
  - Text: "Resend Code"
  - Color: #FF6B35
  - Weight: 600
  - Tappable
```

---

## 10. Select Interest Screen

### Layout Structure
```
CONTAINER: Full screen, white background
  |-- HEADER: Fixed
      |-- BACK_BUTTON: Top-left
      |-- PROGRESS_INDICATOR: Top-center or below back
      |-- SKIP_BUTTON: Top-right (optional)
  |-- CONTENT: Scroll view, padding 20px
      |-- TITLE: Left-aligned
      |-- SUBTITLE: Left-aligned, 8px below
      |-- INTERESTS_GRID: Flex-wrap, 12px gap, 24px below
          |-- INTEREST_CHIP (multiple)
  |-- BOTTOM_BAR: Fixed, 80px height
      |-- SELECTION_COUNT: Left
      |-- CONTINUE_BUTTON: Right or full-width
```

### Progress Indicator (if stepper style)
```
LAYOUT: Row of numbered circles with connecting lines
CIRCLE_SIZE: 32px
CIRCLE_ACTIVE: #FF6B35, white text
CIRCLE_INACTIVE: #E0E0E0, gray text
CIRCLE_COMPLETED: #FF6B35, white checkmark
LINE_WIDTH: 40px
LINE_HEIGHT: 2px
LINE_ACTIVE: #FF6B35
LINE_INACTIVE: #E0E0E0
```

### Interest Chip Styles
```
LAYOUT: Flex-wrap grid
GAP: 12px horizontal, 12px vertical
MIN_WIDTH: Auto (content-based)

CHIP_UNSELECTED:
  - Height: 44px
  - Padding: 12px 16px
  - Border-radius: 22px (pill)
  - Background: #F5F5F5
  - Border: 1.5px solid transparent
  - Text: 14px, 500, #424242
  - Icon: 20px, left of text, 8px gap

CHIP_SELECTED:
  - Background: #FFF4F0
  - Border: 2px solid #FF6B35
  - Text color: #FF6B35
  - Checkmark badge: 20px circle, top-right, #FF6B35 bg

CHIP_ANIMATION:
  - Scale: 0.96 on press
  - Spring animation on selection
```

### Category Icons (Emoji/Icon list)
```
Technology: laptop icon
Music: music-note icon
Sports: football icon
Art & Design: palette icon
Food: utensils icon
Photography: camera icon
Gaming: gamepad icon
Dance: user icon with motion
Theater: masks icon
Literature: book icon
Business: briefcase icon
Science: flask icon
```

### Bottom Bar
```
HEIGHT: 80px + safe area
BACKGROUND: #FFFFFF
BORDER_TOP: 1px solid #F5F5F5
PADDING: 16px 24px

SELECTION_COUNT:
  - Text: "X selected"
  - Size: 14px
  - Color: #757575

MIN_REQUIRED:
  - Text: "Min. 3 required"
  - Size: 12px
  - Color: #9E9E9E

CONTINUE_BUTTON:
  - Full-width or 50% width right-aligned
  - Disabled until min selections met
```

---

## Global Specifications

### Safe Areas
```
TOP_PADDING: Status bar height (44px iOS, varies Android)
BOTTOM_PADDING: Home indicator (34px iOS, varies Android)
```

### Screen Transitions
```
ONBOARDING: Horizontal slide (swipe gesture)
AUTH_FLOW: Push from right
MODAL: Slide from bottom
```

### Keyboard Handling
```
BEHAVIOR: padding (iOS), height (Android)
DISMISS: Tap outside input area
SCROLL: Auto-scroll to focused input
```

### Color Tokens Summary
```
PRIMARY: #FF6B35 (Orange)
SECONDARY: #6C63FF (Purple)
TERTIARY: #00BFA5 (Teal)
SUCCESS: #4CAF50
ERROR: #F44336
WARNING: #FFC107

TEXT_PRIMARY: #212121
TEXT_SECONDARY: #757575
TEXT_TERTIARY: #9E9E9E
TEXT_DISABLED: #BDBDBD

BACKGROUND_PRIMARY: #FFFFFF
BACKGROUND_SECONDARY: #FAFAFA
BACKGROUND_TERTIARY: #F5F5F5

BORDER_LIGHT: #F5F5F5
BORDER_DEFAULT: #E0E0E0
BORDER_MEDIUM: #BDBDBD
```

### Border Radius Tokens
```
sm: 8px   (small elements, tags)
md: 12px  (inputs, buttons)
lg: 16px  (cards, large buttons)
xl: 24px  (modals, sheets)
full: 9999px (pills, avatars)
```

### Shadow Tokens
```
CARD: 0 2px 12px rgba(0,0,0,0.08)
PRIMARY_GLOW: 0 4px 12px rgba(255,107,53,0.35)
FLOATING: 0 8px 16px rgba(0,0,0,0.12)
SHEET: 0 -4px 12px rgba(0,0,0,0.1)
```

### Icon Sizes
```
sm: 16px (inline text)
md: 20px (input icons)
lg: 24px (button icons, social)
xl: 32px (feature icons)
2xl: 48px (illustration accents)
```
