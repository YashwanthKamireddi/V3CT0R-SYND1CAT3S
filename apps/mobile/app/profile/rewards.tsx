/**
 * Rewards Store Page - CampusPulse
 * Redeem participation points for rewards and perks
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { tokens } from '@/lib/styles/unified';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/lib/supabase/client';

// Reward interface
interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  category: 'merch' | 'food' | 'experiences' | 'digital';
  stock?: number;
  popular?: boolean;
}

// Sample rewards data
const REWARDS: Reward[] = [
  {
    id: '1',
    name: 'Campus Café Voucher',
    description: 'Free coffee or snack at the campus café',
    points: 100,
    icon: 'coffee',
    color: '#795548',
    category: 'food',
    stock: 25,
    popular: true,
  },
  {
    id: '2',
    name: 'CampusPulse T-Shirt',
    description: 'Exclusive limited edition event t-shirt',
    points: 500,
    icon: 'shopping-bag',
    color: '#9C27B0',
    category: 'merch',
    stock: 10,
    popular: true,
  },
  {
    id: '3',
    name: 'Library Priority Access',
    description: 'Skip the queue for study room bookings',
    points: 200,
    icon: 'book-open',
    color: '#2196F3',
    category: 'experiences',
    stock: 50,
  },
  {
    id: '4',
    name: 'Event Early Access',
    description: 'Get priority registration for 3 events',
    points: 300,
    icon: 'zap',
    color: '#FF9800',
    category: 'digital',
  },
  {
    id: '5',
    name: 'Canteen Meal Voucher',
    description: '₹100 off on your next canteen meal',
    points: 150,
    icon: 'box',
    color: '#4CAF50',
    category: 'food',
    stock: 40,
  },
  {
    id: '6',
    name: 'Premium Badge Frame',
    description: 'Exclusive profile frame for your achievements',
    points: 250,
    icon: 'award',
    color: '#FFD700',
    category: 'digital',
  },
  {
    id: '7',
    name: 'Workshop Certificate',
    description: 'Official certificate for attended workshops',
    points: 400,
    icon: 'file-text',
    color: '#607D8B',
    category: 'digital',
    stock: 100,
  },
  {
    id: '8',
    name: 'Sticker Pack',
    description: 'Campus club sticker collection',
    points: 75,
    icon: 'star',
    color: '#E91E63',
    category: 'merch',
    stock: 60,
  },
];

const USER_POINTS = 850;

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid' },
  { id: 'food', name: 'Food', icon: 'coffee' },
  { id: 'merch', name: 'Merch', icon: 'shopping-bag' },
  { id: 'digital', name: 'Digital', icon: 'download' },
  { id: 'experiences', name: 'Experiences', icon: 'compass' },
];

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const userPoints = profile?.total_points ?? 0;

  const filteredRewards = selectedCategory === 'all'
    ? REWARDS
    : REWARDS.filter(r => r.category === selectedCategory);

  const handleRedeem = (reward: Reward) => {
    if (userPoints < reward.points) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.points - userPoints} more points to redeem this reward.`
      );
      return;
    }
    setSelectedReward(reward);
    setShowConfirmModal(true);
  };

  const confirmRedeem = async () => {
    if (!selectedReward || !profile) return;
    try {
      await supabase
        .from('profiles')
        .update({ total_points: userPoints - selectedReward.points })
        .eq('id', profile.id);
      await refreshProfile();
      setShowConfirmModal(false);
      Alert.alert(
        'Reward Redeemed! 🎉',
        `You've successfully redeemed "${selectedReward.name}". Check your email for details.`,
      );
      setSelectedReward(null);
    } catch (e) {
      Alert.alert('Redemption failed', 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Rewards Store',
          headerStyle: { backgroundColor: tokens.colors.background.primary },
          headerTitleStyle: { color: tokens.colors.text.primary, fontWeight: '600' },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerTintColor: tokens.colors.text.primary,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [
                styles.backButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Feather name="chevron-left" size={22} color={tokens.colors.text.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Points Balance Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.balanceCard}>
          <LinearGradient
            colors={[tokens.colors.primary, '#7C3AED', '#9333EA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.balanceContent}>
            <View style={styles.balanceTop}>
              <View style={styles.coinIcon}>
                <Feather name="award" size={24} color="#FFD700" />
              </View>
              <View>
                <Text style={styles.balanceLabel}>Available Points</Text>
                <Text style={styles.balanceValue}>{userPoints.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.balanceActions}>
              <Pressable style={styles.earnMoreButton}>
                <Feather name="plus-circle" size={16} color="#FFFFFF" />
                <Text style={styles.earnMoreText}>Earn More</Text>
              </Pressable>
              <Pressable style={styles.historyButton}>
                <Feather name="clock" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.historyText}>History</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Feather
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? '#FFFFFF' : tokens.colors.text.secondary}
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Popular Section */}
        {selectedCategory === 'all' && (
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Text style={styles.sectionTitle}>🔥 Popular Rewards</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularContainer}
            >
              {REWARDS.filter(r => r.popular).map((reward, index) => (
                <Pressable
                  key={reward.id}
                  style={styles.popularCard}
                  onPress={() => handleRedeem(reward)}
                >
                  <View style={[styles.popularIcon, { backgroundColor: reward.color + '20' }]}>
                    <Feather name={reward.icon} size={28} color={reward.color} />
                  </View>
                  <Text style={styles.popularName} numberOfLines={2}>{reward.name}</Text>
                  <View style={styles.popularPoints}>
                    <Feather name="award" size={14} color={tokens.colors.primary} />
                    <Text style={styles.popularPointsText}>{reward.points}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* All Rewards Grid */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Rewards' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </Text>
          <View style={styles.rewardsGrid}>
            {filteredRewards.map((reward, index) => (
              <Animated.View
                key={reward.id}
                entering={FadeInUp.delay(400 + index * 50).duration(400)}
                style={styles.rewardCardWrapper}
              >
                <Pressable
                  style={[
                    styles.rewardCard,
                    userPoints < reward.points && styles.rewardCardDisabled
                  ]}
                  onPress={() => handleRedeem(reward)}
                >
                  {/* Icon */}
                  <View style={[styles.rewardIcon, { backgroundColor: reward.color + '15' }]}>
                    <Feather name={reward.icon} size={24} color={reward.color} />
                  </View>

                  {/* Info */}
                  <Text style={styles.rewardName} numberOfLines={2}>{reward.name}</Text>
                  <Text style={styles.rewardDesc} numberOfLines={2}>{reward.description}</Text>

                  {/* Stock */}
                  {reward.stock !== undefined && reward.stock < 20 && (
                    <Text style={styles.stockText}>Only {reward.stock} left!</Text>
                  )}

                  {/* Points & Button */}
                  <View style={styles.rewardFooter}>
                    <View style={styles.pointsBadge}>
                      <Feather name="award" size={12} color={tokens.colors.primary} />
                      <Text style={styles.pointsText}>{reward.points}</Text>
                    </View>
                    <Pressable
                      style={[
                        styles.redeemButton,
                        userPoints < reward.points && styles.redeemButtonDisabled
                      ]}
                    >
                      <Text style={[
                        styles.redeemButtonText,
                        userPoints < reward.points && styles.redeemButtonTextDisabled
                      ]}>
                        {userPoints >= reward.points ? 'Redeem' : 'Locked'}
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* How to Earn Points */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)} style={styles.howToEarn}>
          <Text style={styles.howToEarnTitle}>How to Earn Points</Text>
          <View style={styles.earnMethod}>
            <Feather name="calendar" size={18} color={tokens.colors.primary} />
            <View style={styles.earnMethodInfo}>
              <Text style={styles.earnMethodTitle}>Attend Events</Text>
              <Text style={styles.earnMethodDesc}>50-100 points per event</Text>
            </View>
          </View>
          <View style={styles.earnMethod}>
            <Feather name="user-check" size={18} color={tokens.colors.success} />
            <View style={styles.earnMethodInfo}>
              <Text style={styles.earnMethodTitle}>Check-in on Time</Text>
              <Text style={styles.earnMethodDesc}>+10 bonus points</Text>
            </View>
          </View>
          <View style={styles.earnMethod}>
            <Feather name="share-2" size={18} color="#FF9800" />
            <View style={styles.earnMethodInfo}>
              <Text style={styles.earnMethodTitle}>Refer Friends</Text>
              <Text style={styles.earnMethodDesc}>25 points per referral</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Confirm Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={ZoomIn.duration(300)}
            style={styles.confirmModal}
          >
            {selectedReward && (
              <>
                <View style={[styles.modalIcon, { backgroundColor: selectedReward.color + '20' }]}>
                  <Feather name={selectedReward.icon} size={40} color={selectedReward.color} />
                </View>
                <Text style={styles.modalTitle}>Confirm Redemption</Text>
                <Text style={styles.modalRewardName}>{selectedReward.name}</Text>
                <Text style={styles.modalDesc}>{selectedReward.description}</Text>

                <View style={styles.modalPointsRow}>
                  <Text style={styles.modalPointsLabel}>Points Required</Text>
                  <View style={styles.modalPointsBadge}>
                    <Feather name="award" size={16} color={tokens.colors.primary} />
                    <Text style={styles.modalPointsValue}>{selectedReward.points}</Text>
                  </View>
                </View>

                <View style={styles.modalBalanceRow}>
                  <Text style={styles.modalBalanceLabel}>Your Balance After</Text>
                  <Text style={styles.modalBalanceValue}>
                    {userPoints - selectedReward.points} points
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.confirmButton}
                    onPress={confirmRedeem}
                  >
                    <Text style={styles.confirmButtonText}>Redeem</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  balanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  balanceContent: {
    padding: 24,
  },
  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  coinIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  earnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  earnMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  categoriesContainer: {
    paddingBottom: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: tokens.colors.background.secondary,
  },
  categoryChipActive: {
    backgroundColor: tokens.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.text.secondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 20,
    marginTop: 12,
  },
  popularContainer: {
    paddingBottom: 10,
    gap: 14,
  },
  popularCard: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  popularIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  popularName: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  popularPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularPointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  rewardCardWrapper: {
    width: '50%',
    padding: 6,
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    minHeight: 220,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  rewardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 4,
    minHeight: 36, // 2 lines reserved
  },
  rewardDesc: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    lineHeight: 16,
    marginBottom: 8,
    minHeight: 32, // 2 lines reserved
  },
  stockText: {
    fontSize: 11,
    color: tokens.colors.error,
    fontWeight: '500',
    marginBottom: 8,
  },
  rewardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  redeemButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: tokens.colors.background.secondary,
  },
  redeemButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  redeemButtonTextDisabled: {
    color: tokens.colors.text.tertiary,
  },
  howToEarn: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },
  howToEarnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 16,
  },
  earnMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  earnMethodInfo: {
    flex: 1,
  },
  earnMethodTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.text.primary,
  },
  earnMethodDesc: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 8,
  },
  modalRewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  modalPointsLabel: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },
  modalPointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalPointsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.primary,
  },
  modalBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
    marginBottom: 20,
  },
  modalBalanceLabel: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },
  modalBalanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: tokens.colors.background.secondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
