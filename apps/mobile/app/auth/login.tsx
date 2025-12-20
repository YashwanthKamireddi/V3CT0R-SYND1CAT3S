/**
 * Login/Sign Up Screen - CampusPulse
 * Modern auth UI inspired by Evenro design
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideInLeft,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { tokens } from '@/lib/styles/unified';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AuthMode = 'signin' | 'signup';

// Input Component with Modern Design
interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: keyof typeof Feather.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  error?: string;
}

function ModernInput({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        <View style={[styles.inputIconContainer, isFocused && styles.inputIconContainerFocused]}>
          <Feather
            name={icon}
            size={20}
            color={isFocused ? tokens.colors.primary : tokens.colors.text.tertiary}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <Pressable 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={tokens.colors.text.tertiary}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Animated.Text 
          entering={FadeInDown.duration(200)} 
          style={styles.errorText}
        >
          {error}
        </Animated.Text>
      )}
    </View>
  );
}

// Social Button Component
interface SocialButtonProps {
  type: 'google' | 'apple' | 'facebook';
  onPress: () => void;
}

function SocialButton({ type, onPress }: SocialButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getIcon = () => {
    switch (type) {
      case 'google':
        return (
          <Image
            source={{ uri: 'https://www.google.com/favicon.ico' }}
            style={styles.socialIconImage}
          />
        );
      case 'apple':
        return <Feather name="smartphone" size={22} color="#000000" />;
      case 'facebook':
        return <Feather name="facebook" size={22} color="#1877F2" />;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.socialButton, animatedStyle]}>
        {getIcon()}
      </Animated.View>
    </Pressable>
  );
}

// Checkbox Component
function Checkbox({ 
  checked, 
  onToggle, 
  label 
}: { 
  checked: boolean; 
  onToggle: () => void; 
  label: string;
}) {
  return (
    <Pressable style={styles.checkboxContainer} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Feather name="check" size={14} color="#FFFFFF" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const buttonScale = useSharedValue(1);
  const tabIndicatorPosition = useSharedValue(0);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorPosition.value }],
  }));

  const switchMode = useCallback((newMode: AuthMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
    setErrors({});
    tabIndicatorPosition.value = withSpring(newMode === 'signin' ? 0 : (SCREEN_WIDTH - 48) / 2);
  }, []);

  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = useCallback(() => {
    const isValid = mode === 'signin' ? validateSignIn() : validateSignUp();
    
    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }, 1500);
  }, [mode, email, password, name, phone, confirmPassword, router]);

  const handleSocialLogin = useCallback((provider: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }, 1000);
  }, [router]);

  const clearError = useCallback((field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Illustration */}
      <LinearGradient
        colors={[tokens.colors.primary, tokens.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <Animated.View 
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.headerContent}
        >
          {/* Abstract Pattern */}
          <View style={styles.headerPattern}>
            <View style={[styles.patternCircle, styles.patternCircle1]} />
            <View style={[styles.patternCircle, styles.patternCircle2]} />
            <View style={[styles.patternCircle, styles.patternCircle3]} />
          </View>
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Feather name="zap" size={28} color={tokens.colors.primary} />
            </View>
          </View>
          
          <Text style={styles.headerTitle}>CampusPulse</Text>
          <Text style={styles.headerSubtitle}>
            {mode === 'signin' 
              ? 'Welcome back! Sign in to continue' 
              : 'Create your account to get started'}
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.contentCard}>
          {/* Tab Switcher */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.tabContainer}
          >
            <View style={styles.tabWrapper}>
              <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
              <Pressable 
                style={styles.tab}
                onPress={() => switchMode('signin')}
              >
                <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                  Sign In
                </Text>
              </Pressable>
              <Pressable 
                style={styles.tab}
                onPress={() => switchMode('signup')}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Sign In Form */}
            {mode === 'signin' && (
              <Animated.View
                entering={SlideInLeft.duration(300)}
                exiting={FadeOut.duration(200)}
                style={styles.formContainer}
              >
                <ModernInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError('email');
                  }}
                  icon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                <ModernInput
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
                  icon="lock"
                  secureTextEntry
                  error={errors.password}
                />

                <View style={styles.optionsRow}>
                  <Checkbox 
                    checked={rememberMe}
                    onToggle={() => setRememberMe(!rememberMe)}
                    label="Remember me"
                  />
                  <Pressable onPress={() => {}}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}

            {/* Sign Up Form */}
            {mode === 'signup' && (
              <Animated.View
                entering={SlideInRight.duration(300)}
                exiting={FadeOut.duration(200)}
                style={styles.formContainer}
              >
                <ModernInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    clearError('name');
                  }}
                  icon="user"
                  autoCapitalize="words"
                  error={errors.name}
                />

                <ModernInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError('email');
                  }}
                  icon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                <ModernInput
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    clearError('phone');
                  }}
                  icon="phone"
                  keyboardType="phone-pad"
                  error={errors.phone}
                />

                <ModernInput
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
                  icon="lock"
                  secureTextEntry
                  error={errors.password}
                />

                <ModernInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearError('confirmPassword');
                  }}
                  icon="shield"
                  secureTextEntry
                  error={errors.confirmPassword}
                />
              </Animated.View>
            )}

            {/* Primary Button */}
            <Animated.View 
              entering={FadeInDown.delay(400).duration(400)}
              style={styles.buttonContainer}
            >
              <Pressable
                onPress={handleAuth}
                onPressIn={() => { buttonScale.value = withTiming(0.98, { duration: 100 }); }}
                onPressOut={() => { buttonScale.value = withTiming(1, { duration: 150 }); }}
                disabled={loading}
              >
                <Animated.View style={buttonAnimatedStyle}>
                  <LinearGradient
                    colors={[tokens.colors.primary, tokens.colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>
                          {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        </Text>
                        <Feather name="arrow-right" size={20} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </Animated.View>
              </Pressable>
            </Animated.View>

            {/* Divider */}
            <Animated.View 
              entering={FadeInDown.delay(500).duration(400)}
              style={styles.dividerContainer}
            >
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* Social Buttons */}
            <Animated.View 
              entering={FadeInDown.delay(600).duration(400)}
              style={styles.socialContainer}
            >
              <SocialButton type="google" onPress={() => handleSocialLogin('google')} />
              <SocialButton type="apple" onPress={() => handleSocialLogin('apple')} />
              <SocialButton type="facebook" onPress={() => handleSocialLogin('facebook')} />
            </Animated.View>

            {/* Terms */}
            {mode === 'signup' && (
              <Animated.View 
                entering={FadeInUp.delay(700).duration(400)}
                style={styles.termsContainer}
              >
                <Text style={styles.termsText}>
                  By signing up, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </Animated.View>
            )}

            {/* Bottom Spacing */}
            <View style={{ height: insets.bottom + 20 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  
  // Header
  headerGradient: {
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  patternCircle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  patternCircle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -30,
  },
  patternCircle3: {
    width: 80,
    height: 80,
    top: 60,
    left: 60,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },

  // Content
  keyboardView: {
    flex: 1,
    marginTop: -24,
  },
  contentCard: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },

  // Tabs
  tabContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.background.tertiary,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (SCREEN_WIDTH - 48 - 8) / 2,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.text.tertiary,
  },
  tabTextActive: {
    color: tokens.colors.text.primary,
  },

  // Form
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  formContainer: {
    gap: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderWidth: 1.5,
    borderColor: tokens.colors.border.light,
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.background.primary,
  },
  inputWrapperError: {
    borderColor: tokens.colors.error,
  },
  inputIconContainer: {
    width: 52,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.tertiary,
  },
  inputIconContainerFocused: {
    backgroundColor: `${tokens.colors.primary}15`,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: tokens.colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    color: tokens.colors.error,
    marginTop: 6,
    marginLeft: 8,
  },

  // Options Row
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: tokens.colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: tokens.colors.primary,
    borderColor: tokens.colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.primary,
  },

  // Button
  buttonContainer: {
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.colors.border.light,
  },
  dividerText: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    marginHorizontal: 16,
    fontWeight: '500',
  },

  // Social Buttons
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: tokens.colors.background.secondary,
    borderWidth: 1.5,
    borderColor: tokens.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconImage: {
    width: 24,
    height: 24,
  },

  // Terms
  termsContainer: {
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: tokens.colors.primary,
    fontWeight: '600',
  },
});
