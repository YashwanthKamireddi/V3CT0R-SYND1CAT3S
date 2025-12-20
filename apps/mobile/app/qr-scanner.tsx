/**
 * QR Scanner Screen - CampusPulse
 * Real QR code scanning for event check-in attendance using expo-camera
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';

import { tokens } from '@/lib/styles/unified';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCANNER_SIZE = SCREEN_WIDTH * 0.75;

// Mock QR validation (in production, this would call your backend)
const validateQRCode = async (qrData: string, eventId: string): Promise<{
  success: boolean;
  message: string;
  pointsEarned?: number;
  eventName?: string;
  checkInTime?: string;
}> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock validation logic - accept various QR formats
  if (qrData.includes('CP-') || qrData.includes('CAMPUS') || qrData.includes('EVENT') || qrData.length > 5) {
    return {
      success: true,
      message: 'Check-in successful!',
      pointsEarned: 50,
      eventName: 'CodeVerse Hackathon 2025',
      checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  return {
    success: false,
    message: 'Invalid QR code or event has ended',
  };
};

export default function QRScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { eventId, ticketNumber } = useLocalSearchParams();

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    pointsEarned?: number;
    eventName?: string;
    checkInTime?: string;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [torch, setTorch] = useState(false);
  const processingRef = useRef(false);

  // Animation values
  const scanLinePosition = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const successScale = useSharedValue(0);
  const cornerGlow = useSharedValue(0);

  // Scanning line animation
  useEffect(() => {
    if (isScanning) {
      scanLinePosition.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1
      );

      cornerGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.4, { duration: 1500 })
        ),
        -1
      );
    }
  }, [isScanning]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLinePosition.value * (SCANNER_SIZE - 4) }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const cornerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(cornerGlow.value, [0, 1], [0.5, 1]),
    shadowOpacity: interpolate(cornerGlow.value, [0, 1], [0.3, 0.8]),
  }));

  // Handle barcode scan
  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (processingRef.current || !isScanning) return;

    processingRef.current = true;
    setIsScanning(false);
    setScannedData(result.data);

    // Haptic feedback on scan
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Validate the QR code
    const validationResult = await validateQRCode(result.data, eventId as string || '1');

    setScanResult(validationResult);
    setShowResult(true);

    if (validationResult.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    processingRef.current = false;
  };

  const handleClose = () => {
    router.back();
  };

  const handleDone = () => {
    router.back();
  };

  const handleScanAgain = () => {
    setShowResult(false);
    setScanResult(null);
    setScannedData(null);
    setIsScanning(true);
  };

  const toggleTorch = () => {
    setTorch(!torch);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Permission handling
  if (!permission) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.permissionContainer}>
          <Feather name="loader" size={48} color={tokens.colors.primary} />
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f0f23']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.permissionContainer, { paddingTop: insets.top }]}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.permissionContent}>
            <View style={styles.permissionIcon}>
              <Feather name="camera-off" size={48} color={tokens.colors.primary} />
            </View>
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionSubtitle}>
              We need camera permission to scan QR codes for event check-in
            </Text>
            <Pressable style={styles.permissionButton} onPress={requestPermission}>
              <LinearGradient
                colors={[tokens.colors.primary, tokens.colors.primary + 'CC']}
                style={styles.permissionButtonGradient}
              >
                <Feather name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.backButtonAlt} onPress={handleClose}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'aztec', 'datamatrix', 'pdf417'],
        }}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
      />

      {/* Dark Overlay with cutout */}
      <View style={styles.overlayContainer}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scannerCutout} />
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Feather name="x" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <Pressable style={styles.torchButton} onPress={toggleTorch}>
          <Feather name={torch ? 'zap' : 'zap-off'} size={22} color={torch ? tokens.colors.warning : '#FFFFFF'} />
        </Pressable>
      </Animated.View>

      {/* Scanner Frame */}
      <View style={styles.scannerContainer}>
        <Animated.View style={[styles.scannerFrame, pulseStyle]}>
          {/* Animated Corner markers */}
          <Animated.View style={[styles.corner, styles.cornerTopLeft, cornerStyle]} />
          <Animated.View style={[styles.corner, styles.cornerTopRight, cornerStyle]} />
          <Animated.View style={[styles.corner, styles.cornerBottomLeft, cornerStyle]} />
          <Animated.View style={[styles.corner, styles.cornerBottomRight, cornerStyle]} />

          {/* Scanning line */}
          {isScanning && (
            <Animated.View style={[styles.scanLine, scanLineStyle]}>
              <LinearGradient
                colors={['transparent', tokens.colors.primary, 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.scanLineGradient}
              />
            </Animated.View>
          )}

          {/* Processing indicator */}
          {!isScanning && !showResult && (
            <View style={styles.processingContainer}>
              <Feather name="loader" size={48} color={tokens.colors.primary} />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
        </Animated.View>

        {/* Instructions */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.instructions}>
          <View style={styles.instructionBadge}>
            <Feather name="maximize" size={16} color="#FFFFFF" />
            <Text style={styles.instructionText}>
              {isScanning
                ? 'Position QR code within the frame'
                : 'Processing your check-in...'}
            </Text>
          </View>
          <Text style={styles.subInstructionText}>
            Hold steady for automatic detection
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Info */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(400)}
        style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.tipContainer}>
          <Feather name="info" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={styles.tipText}>
            Make sure the QR code is well-lit and in focus
          </Text>
        </View>
      </Animated.View>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResult(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.resultCard}
          >
            {/* Success/Error Icon with animation */}
            <View style={[
              styles.resultIconContainer,
              { backgroundColor: scanResult?.success ? tokens.colors.successLight : tokens.colors.errorLight }
            ]}>
              <Animated.View entering={FadeIn.delay(150).springify()}>
                <Feather
                  name={scanResult?.success ? 'check-circle' : 'x-circle'}
                  size={56}
                  color={scanResult?.success ? tokens.colors.success : tokens.colors.error}
                />
              </Animated.View>
            </View>

            {/* Result Text */}
            <Text style={styles.resultTitle}>
              {scanResult?.success ? '🎉 Check-in Successful!' : 'Check-in Failed'}
            </Text>

            <Text style={styles.resultMessage}>
              {scanResult?.message}
            </Text>

            {/* Check-in Time */}
            {scanResult?.success && scanResult?.checkInTime && (
              <View style={styles.checkInTimeContainer}>
                <Feather name="clock" size={16} color={tokens.colors.text.secondary} />
                <Text style={styles.checkInTimeText}>Checked in at {scanResult.checkInTime}</Text>
              </View>
            )}

            {/* Points Earned */}
            {scanResult?.success && scanResult?.pointsEarned && (
              <Animated.View
                entering={FadeInUp.delay(200).springify()}
                style={styles.pointsContainer}
              >
                <LinearGradient
                  colors={[tokens.colors.primary + '15', tokens.colors.primary + '05']}
                  style={styles.pointsGradient}
                >
                  <Feather name="award" size={28} color={tokens.colors.primary} />
                  <View>
                    <Text style={styles.pointsLabel}>Points Earned</Text>
                    <Text style={styles.pointsText}>+{scanResult.pointsEarned}</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Event Name */}
            {scanResult?.eventName && (
              <View style={styles.eventInfoContainer}>
                <Feather name="calendar" size={16} color={tokens.colors.text.secondary} />
                <Text style={styles.eventInfoText}>{scanResult.eventName}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              {!scanResult?.success && (
                <Pressable style={styles.scanAgainButton} onPress={handleScanAgain}>
                  <Feather name="refresh-cw" size={18} color={tokens.colors.primary} />
                  <Text style={styles.scanAgainButtonText}>Scan Again</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.doneButton, !scanResult?.success && styles.doneButtonSmall]}
                onPress={handleDone}
              >
                <Text style={styles.doneButtonText}>
                  {scanResult?.success ? 'Done' : 'Close'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Permission Screen
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permissionContent: {
    alignItems: 'center',
    width: '100%',
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tokens.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  permissionText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  permissionButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backButtonAlt: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  // Overlay for camera cutout
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCANNER_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scannerCutout: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    backgroundColor: 'transparent',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  torchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Scanner Frame
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: tokens.colors.primary,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 5,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 24,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 24,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 24,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 24,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
  },
  scanLineGradient: {
    flex: 1,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Instructions
  instructions: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 40,
  },
  instructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subInstructionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  // Bottom Section
  bottomSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  resultIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  resultMessage: {
    fontSize: 15,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  checkInTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  checkInTimeText: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
  },
  pointsContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  pointsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pointsLabel: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    marginBottom: 2,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: '800',
    color: tokens.colors.primary,
  },
  eventInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 12,
  },
  eventInfoText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  scanAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.primaryLight,
    paddingVertical: 16,
    borderRadius: 14,
  },
  scanAgainButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  doneButton: {
    flex: 1,
    backgroundColor: tokens.colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonSmall: {
    flex: 1,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
