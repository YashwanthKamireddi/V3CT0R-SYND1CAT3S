/**
 * Edit Profile Page - CampusPulse
 * Edit student profile information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { tokens } from '@/lib/styles/unified';

// Initial user data (in production, fetch from API/state)
const INITIAL_USER = {
  name: 'Yash Wankhede',
  email: 'yash.wankhede@university.edu',
  phone: '+91 98765 43210',
  department: 'Computer Science',
  year: '3rd Year',
  rollNo: 'CS21B1042',
  bio: 'Passionate about tech, hackathons, and building cool stuff!',
  interests: ['Hackathons', 'AI/ML', 'Web Dev', 'Open Source'],
  linkedin: 'linkedin.com/in/yashwankhede',
  github: 'github.com/yashwankhede',
  avatar: null,
};

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
  'Electrical',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

const INTEREST_OPTIONS = [
  'Hackathons',
  'AI/ML',
  'Web Dev',
  'Mobile Dev',
  'Cloud Computing',
  'Cybersecurity',
  'Data Science',
  'Blockchain',
  'IoT',
  'Robotics',
  'Open Source',
  'UI/UX Design',
  'Game Dev',
  'DevOps',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState(INITIAL_USER);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    updateField('interests', newInterests);
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    // In production, save to API
    Alert.alert(
      'Profile Updated',
      'Your profile has been updated successfully!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Edit Profile',
          headerStyle: { backgroundColor: tokens.colors.background.primary },
          headerTitleStyle: { color: tokens.colors.text.primary, fontWeight: '600' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={handleCancel} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSave} style={styles.headerButton}>
              <Text style={[styles.saveText, !hasChanges && styles.saveTextDisabled]}>
                Save
              </Text>
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[tokens.colors.primary, '#7C3AED']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {formData.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </LinearGradient>
              <Pressable style={styles.editAvatarButton}>
                <Feather name="camera" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </Animated.View>

          {/* Basic Info Section */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Enter your full name"
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={formData.email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor={tokens.colors.text.tertiary}
              />
              <Text style={styles.inputHint}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={tokens.colors.text.tertiary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => updateField('bio', text)}
                placeholder="Tell us about yourself..."
                placeholderTextColor={tokens.colors.text.tertiary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.charCount}>{formData.bio.length}/200</Text>
            </View>
          </Animated.View>

          {/* Academic Info Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Text style={styles.sectionTitle}>Academic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Roll Number</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={formData.rollNo}
                editable={false}
                placeholder="Roll number"
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Department</Text>
              <Pressable
                style={styles.selectInput}
                onPress={() => setShowDepartmentPicker(!showDepartmentPicker)}
              >
                <Text style={styles.selectText}>{formData.department}</Text>
                <Feather
                  name={showDepartmentPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={tokens.colors.text.secondary}
                />
              </Pressable>
              {showDepartmentPicker && (
                <View style={styles.pickerOptions}>
                  {DEPARTMENTS.map((dept) => (
                    <Pressable
                      key={dept}
                      style={[
                        styles.pickerOption,
                        formData.department === dept && styles.pickerOptionActive
                      ]}
                      onPress={() => {
                        updateField('department', dept);
                        setShowDepartmentPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.department === dept && styles.pickerOptionTextActive
                      ]}>
                        {dept}
                      </Text>
                      {formData.department === dept && (
                        <Feather name="check" size={18} color={tokens.colors.primary} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Year</Text>
              <Pressable
                style={styles.selectInput}
                onPress={() => setShowYearPicker(!showYearPicker)}
              >
                <Text style={styles.selectText}>{formData.year}</Text>
                <Feather
                  name={showYearPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={tokens.colors.text.secondary}
                />
              </Pressable>
              {showYearPicker && (
                <View style={styles.pickerOptions}>
                  {YEARS.map((year) => (
                    <Pressable
                      key={year}
                      style={[
                        styles.pickerOption,
                        formData.year === year && styles.pickerOptionActive
                      ]}
                      onPress={() => {
                        updateField('year', year);
                        setShowYearPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.year === year && styles.pickerOptionTextActive
                      ]}>
                        {year}
                      </Text>
                      {formData.year === year && (
                        <Feather name="check" size={18} color={tokens.colors.primary} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>

          {/* Interests Section */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <Text style={styles.sectionSubtitle}>
              Select topics you're interested in for personalized recommendations
            </Text>
            <View style={styles.interestsGrid}>
              {INTEREST_OPTIONS.map((interest) => (
                <Pressable
                  key={interest}
                  style={[
                    styles.interestChip,
                    formData.interests.includes(interest) && styles.interestChipActive
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={[
                    styles.interestText,
                    formData.interests.includes(interest) && styles.interestTextActive
                  ]}>
                    {interest}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Social Links Section */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <Text style={styles.sectionTitle}>Social Links</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>LinkedIn</Text>
              <View style={styles.socialInput}>
                <Feather name="linkedin" size={20} color={tokens.colors.text.tertiary} />
                <TextInput
                  style={styles.socialTextInput}
                  value={formData.linkedin}
                  onChangeText={(text) => updateField('linkedin', text)}
                  placeholder="linkedin.com/in/username"
                  placeholderTextColor={tokens.colors.text.tertiary}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>GitHub</Text>
              <View style={styles.socialInput}>
                <Feather name="github" size={20} color={tokens.colors.text.tertiary} />
                <TextInput
                  style={styles.socialTextInput}
                  value={formData.github}
                  onChangeText={(text) => updateField('github', text)}
                  placeholder="github.com/username"
                  placeholderTextColor={tokens.colors.text.tertiary}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Account</Text>
            <Pressable style={styles.dangerButton}>
              <Feather name="log-out" size={18} color={tokens.colors.error} />
              <Text style={styles.dangerButtonText}>Sign Out</Text>
            </Pressable>
            <Pressable style={[styles.dangerButton, styles.deleteButton]}>
              <Feather name="trash-2" size={18} color={tokens.colors.error} />
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 16,
    color: tokens.colors.text.secondary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  saveTextDisabled: {
    color: tokens.colors.text.tertiary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: tokens.colors.background.primary,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colors.text.secondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: tokens.colors.text.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  disabledInput: {
    backgroundColor: tokens.colors.background.secondary,
    color: tokens.colors.text.tertiary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  inputHint: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    marginTop: 6,
  },
  charCount: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    textAlign: 'right',
    marginTop: 6,
  },
  selectInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    color: tokens.colors.text.primary,
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.default,
  },
  pickerOptionActive: {
    backgroundColor: tokens.colors.primaryLight,
  },
  pickerOptionText: {
    fontSize: 15,
    color: tokens.colors.text.primary,
  },
  pickerOptionTextActive: {
    color: tokens.colors.primary,
    fontWeight: '500',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  interestChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: tokens.colors.background.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
  },
  interestChipActive: {
    backgroundColor: tokens.colors.primaryLight,
    borderColor: tokens.colors.primary,
  },
  interestText: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },
  interestTextActive: {
    color: tokens.colors.primary,
    fontWeight: '500',
  },
  socialInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border.default,
    gap: 12,
  },
  socialTextInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: tokens.colors.text.primary,
  },
  dangerZone: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.default,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: tokens.colors.errorLight,
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: tokens.colors.error,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: tokens.colors.error,
  },
});
