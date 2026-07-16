/**
 * My Clubs Page - CampusPulse
 * Display clubs the student has joined and their activities
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
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
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/lib/supabase/client';

// Club interface
interface Club {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  memberCount: number;
  eventsHosted: number;
  role: 'member' | 'coordinator' | 'president';
  joinedDate: string;
  upcomingEvents: number;
  category: 'Tech' | 'Cultural' | 'Sports' | 'Research' | 'Business';
  image?: string;
}

interface SuggestedClub {
  id: string;
  name: string;
  shortName: string;
  memberCount: number;
  color: string;
  category: 'Tech' | 'Cultural' | 'Sports' | 'Research' | 'Business';
  image?: string;
}

// ==========================================
// TECH CLUBS - University Technical Societies
// ==========================================
const TECH_CLUBS: Club[] = [
  {
    id: 'tech-1',
    name: 'Google Developer Student Club',
    shortName: 'GDSC',
    description: 'Build solutions for local businesses using Google technology. Learn, grow and connect with developers worldwide.',
    color: '#4285F4',
    memberCount: 456,
    eventsHosted: 28,
    role: 'coordinator',
    joinedDate: 'Aug 2024',
    upcomingEvents: 4,
    category: 'Tech',
    image: 'https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,h_250,q_auto:good,w_250/v1/gcs/platform-data-dsc/chapter_banners/JECOJEAB_5b79d5c.jpeg',
  },
  {
    id: 'tech-2',
    name: 'IEEE Student Branch',
    shortName: 'IEEE',
    description: 'The largest professional organization for electrical engineering and computing professionals. Workshops, hackathons & networking.',
    color: '#00629B',
    memberCount: 312,
    eventsHosted: 35,
    role: 'member',
    joinedDate: 'Sep 2024',
    upcomingEvents: 3,
    category: 'Tech',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/IEEE_logo.svg/1200px-IEEE_logo.svg.png',
  },
  {
    id: 'tech-3',
    name: 'CodeChef Campus Chapter',
    shortName: 'CC',
    description: 'Competitive programming community. Weekly contests, DSA workshops, and preparation for ICPC and other coding competitions.',
    color: '#5B4638',
    memberCount: 234,
    eventsHosted: 42,
    role: 'member',
    joinedDate: 'Oct 2024',
    upcomingEvents: 5,
    category: 'Tech',
    image: 'https://s3.amazonaws.com/codechef_shared/sites/all/themes/flavor/flavor_flavor/logo_big.png',
  },
  {
    id: 'tech-4',
    name: 'ACM Student Chapter',
    shortName: 'ACM',
    description: 'Association for Computing Machinery - advancing computing as a science and profession. Research, seminars & tech talks.',
    color: '#0085CA',
    memberCount: 178,
    eventsHosted: 22,
    role: 'member',
    joinedDate: 'Nov 2024',
    upcomingEvents: 2,
    category: 'Tech',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Association_for_Computing_Machinery_%28ACM%29_logo.svg/1200px-Association_for_Computing_Machinery_%28ACM%29_logo.svg.png',
  },
  {
    id: 'tech-5',
    name: 'AI & Machine Learning Club',
    shortName: 'AIML',
    description: 'Explore the frontiers of artificial intelligence, deep learning, and data science through hands-on projects and research.',
    color: '#9C27B0',
    memberCount: 267,
    eventsHosted: 18,
    role: 'coordinator',
    joinedDate: 'Aug 2024',
    upcomingEvents: 3,
    category: 'Tech',
    image: 'https://cdn-icons-png.flaticon.com/512/8637/8637099.png',
  },
  {
    id: 'tech-6',
    name: 'Robotics & Automation Club',
    shortName: 'RAC',
    description: 'Design, build and program robots. Participate in national robotics competitions like Robocon and Robofest.',
    color: '#FF5722',
    memberCount: 145,
    eventsHosted: 15,
    role: 'member',
    joinedDate: 'Sep 2024',
    upcomingEvents: 2,
    category: 'Tech',
    image: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
  },
  {
    id: 'tech-7',
    name: 'Cybersecurity Club',
    shortName: 'CSC',
    description: 'Learn ethical hacking, CTF competitions, network security, and protect systems from cyber threats.',
    color: '#2E7D32',
    memberCount: 189,
    eventsHosted: 20,
    role: 'member',
    joinedDate: 'Oct 2024',
    upcomingEvents: 4,
    category: 'Tech',
    image: 'https://cdn-icons-png.flaticon.com/512/2716/2716652.png',
  },
  {
    id: 'tech-8',
    name: 'Open Source Community',
    shortName: 'OSC',
    description: 'Contribute to open source projects, learn Git/GitHub, and collaborate with developers worldwide.',
    color: '#24292E',
    memberCount: 198,
    eventsHosted: 25,
    role: 'member',
    joinedDate: 'Nov 2024',
    upcomingEvents: 3,
    category: 'Tech',
    image: 'https://cdn-icons-png.flaticon.com/512/2111/2111425.png',
  },
];

// ==========================================
// CULTURAL CLUBS - Arts & Creative Societies
// ==========================================
const CULTURAL_CLUBS: Club[] = [
  {
    id: 'cult-1',
    name: 'Spic Macay - Cultural Heritage',
    shortName: 'SPIC',
    description: 'Society for Promotion of Indian Classical Music and Culture Amongst Youth. Classical music, dance & heritage events.',
    color: '#E91E63',
    memberCount: 234,
    eventsHosted: 32,
    role: 'member',
    joinedDate: 'Aug 2024',
    upcomingEvents: 4,
    category: 'Cultural',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Spicmacay_new_logo.png/220px-Spicmacay_new_logo.png',
  },
  {
    id: 'cult-2',
    name: 'Dramatics Society - Natya',
    shortName: 'NATYA',
    description: 'Theatre and drama club. Nukkad Natak, stage plays, mono-acts, and street theatre performances.',
    color: '#673AB7',
    memberCount: 156,
    eventsHosted: 28,
    role: 'coordinator',
    joinedDate: 'Sep 2024',
    upcomingEvents: 3,
    category: 'Cultural',
    image: 'https://cdn-icons-png.flaticon.com/512/3658/3658777.png',
  },
  {
    id: 'cult-3',
    name: 'Nritya - Dance Club',
    shortName: 'NRITYA',
    description: 'From Bharatanatyam to Hip-Hop! All dance forms united under one roof. Performances, workshops & flash mobs.',
    color: '#FF4081',
    memberCount: 312,
    eventsHosted: 45,
    role: 'member',
    joinedDate: 'Aug 2024',
    upcomingEvents: 5,
    category: 'Cultural',
    image: 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png',
  },
  {
    id: 'cult-4',
    name: 'Sargam - Music Society',
    shortName: 'SARGAM',
    description: 'Vocal and instrumental music club. Indian classical, Western, band performances and open mics.',
    color: '#00BCD4',
    memberCount: 278,
    eventsHosted: 38,
    role: 'member',
    joinedDate: 'Sep 2024',
    upcomingEvents: 4,
    category: 'Cultural',
    image: 'https://cdn-icons-png.flaticon.com/512/2995/2995101.png',
  },
  {
    id: 'cult-5',
    name: 'Photography & Film Club',
    shortName: 'PFC',
    description: 'Capture moments, create films. Photography walks, short films, documentaries & visual storytelling.',
    color: '#FF9800',
    memberCount: 198,
    eventsHosted: 24,
    role: 'president',
    joinedDate: 'Aug 2024',
    upcomingEvents: 3,
    category: 'Cultural',
    image: 'https://cdn-icons-png.flaticon.com/512/685/685655.png',
  },
  {
    id: 'cult-6',
    name: 'Literary Society - Quill',
    shortName: 'QUILL',
    description: 'Poetry, creative writing, debates, MUNs, and literary events. Words are our playground!',
    color: '#795548',
    memberCount: 145,
    eventsHosted: 30,
    role: 'member',
    joinedDate: 'Oct 2024',
    upcomingEvents: 2,
    category: 'Cultural',
    image: 'https://cdn-icons-png.flaticon.com/512/2541/2541988.png',
  },
  {
    id: 'cult-7',
    name: 'Art & Design Club',
    shortName: 'ADC',
    description: 'Sketching, painting, digital art, UI/UX design, and everything creative. Express yourself through art!',
    color: '#9C27B0',
    memberCount: 167,
    eventsHosted: 22,
    role: 'member',
    joinedDate: 'Nov 2024',
    upcomingEvents: 3,
    category: 'Cultural',
    image: 'https://cdn-icons-png.flaticon.com/512/1048/1048944.png',
  },
  {
    id: 'cult-8',
    name: 'Fashion & Design Club',
    shortName: 'FDC',
    description: 'Fashion shows, design competitions, styling workshops, and runway events. Glamour meets creativity!',
    color: '#F44336',
    memberCount: 123,
    eventsHosted: 12,
    role: 'member',
    joinedDate: 'Nov 2024',
    upcomingEvents: 2,
    category: 'Cultural',
    image: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png',
  },
];

// Combined clubs for "My Clubs" section
const myClubs: Club[] = [
  ...TECH_CLUBS.slice(0, 3), // GDSC, IEEE, CodeChef
  ...CULTURAL_CLUBS.slice(0, 2), // SPIC MACAY, Dramatics
];

// Suggested clubs for discovery
const SUGGESTED_CLUBS: SuggestedClub[] = [
  {
    id: 'sug-1',
    name: 'Entrepreneurship Cell',
    shortName: 'E-Cell',
    memberCount: 389,
    color: '#00BCD4',
    category: 'Business',
    image: 'https://cdn-icons-png.flaticon.com/512/2910/2910791.png',
  },
  {
    id: 'sug-2',
    name: 'NSS - National Service Scheme',
    shortName: 'NSS',
    memberCount: 456,
    color: '#2196F3',
    category: 'Cultural',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/National_Service_Scheme.svg/1200px-National_Service_Scheme.svg.png',
  },
  {
    id: 'sug-3',
    name: 'Blockchain & Web3 Club',
    shortName: 'BWC',
    memberCount: 156,
    color: '#FF6B35',
    category: 'Tech',
    image: 'https://cdn-icons-png.flaticon.com/512/2152/2152539.png',
  },
  {
    id: 'sug-4',
    name: 'Quiz Club - Inquisitive',
    shortName: 'IQC',
    memberCount: 178,
    color: '#4CAF50',
    category: 'Cultural',
    image: 'https://cdn-icons-png.flaticon.com/512/3048/3048178.png',
  },
  {
    id: 'sug-5',
    name: 'Gaming & eSports Club',
    shortName: 'GEC',
    memberCount: 234,
    color: '#9C27B0',
    category: 'Tech',
    image: 'https://cdn-icons-png.flaticon.com/512/3612/3612569.png',
  },
];

const roleColors = {
  member: { bg: tokens.colors.background.secondary, text: tokens.colors.text.secondary },
  coordinator: { bg: tokens.colors.primaryLight, text: tokens.colors.primary },
  president: { bg: '#FFF3E0', text: '#E65100' },
};

export default function ClubsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'my' | 'tech' | 'cultural' | 'discover'>('my');
  const { profile } = useAuth();
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: clubsData } = await supabase
        .from('clubs')
        .select('id, name, slug, description, category, logo_url, banner_url, member_count, is_active, created_at')
        .eq('is_active', true);

      const techCats = ['technical', 'tech', 'workshop'];
      const cultCats = ['cultural', 'arts'];
      const mapped: Club[] = (clubsData ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        shortName:
          (c.slug ?? c.name).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'CLUB',
        description: c.description ?? '',
        color: techCats.includes(c.category ?? '') ? '#4285F4' : '#A855F7',
        memberCount: c.member_count ?? 0,
        eventsHosted: 0,
        role: 'member',
        joinedDate: c.created_at
          ? new Date(c.created_at).toLocaleString('en-US', { month: 'short', year: 'numeric' })
          : '',
        upcomingEvents: 0,
        category: techCats.includes(c.category ?? '') ? 'Tech'
          : cultCats.includes(c.category ?? '') ? 'Cultural' : 'Research',
        image: c.logo_url ?? c.banner_url ?? undefined,
      }));
      setAllClubs(mapped);

      // Compute "my clubs": clubs the user has registrations in
      if (profile?.id) {
        const { data: regs } = await supabase
          .from('registrations')
          .select('events:event_id (club_id)')
          .eq('user_id', profile.id);
        const myClubIds = new Set(
          (regs ?? [])
            .map((r: any) => r.events?.club_id)
            .filter(Boolean) as string[],
        );
        setMyClubs(mapped.filter((c) => myClubIds.has(c.id)));
      } else {
        setMyClubs([]);
      }
    };
    load();
  }, [profile?.id]);

  const displayClubs = useMemo(() => {
    switch (activeTab) {
      case 'tech':
        return allClubs.filter((c) => c.category === 'Tech');
      case 'cultural':
        return allClubs.filter((c) => c.category === 'Cultural');
      case 'discover':
        return allClubs;
      case 'my':
      default:
        return myClubs;
    }
  }, [activeTab, allClubs, myClubs]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Campus Clubs',
          headerStyle: { backgroundColor: tokens.colors.background.primary },
          headerTitleStyle: { color: tokens.colors.text.primary, fontWeight: '700', fontSize: 20 },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerTintColor: tokens.colors.text.primary,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
            >
              <Feather name="chevron-left" size={22} color={tokens.colors.text.primary} />
            </Pressable>
          ),
        }}
      />

      {/* Category Tabs */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          <Pressable
            style={[styles.tab, activeTab === 'my' && styles.tabActive]}
            onPress={() => setActiveTab('my')}
          >
            <Feather
              name="heart"
              size={16}
              color={activeTab === 'my' ? '#FFFFFF' : tokens.colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
              My Clubs
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'tech' && styles.tabActive]}
            onPress={() => setActiveTab('tech')}
          >
            <Feather
              name="code"
              size={16}
              color={activeTab === 'tech' ? '#FFFFFF' : tokens.colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === 'tech' && styles.tabTextActive]}>
              Tech Clubs
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'cultural' && styles.tabActive]}
            onPress={() => setActiveTab('cultural')}
          >
            <Feather
              name="music"
              size={16}
              color={activeTab === 'cultural' ? '#FFFFFF' : tokens.colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === 'cultural' && styles.tabTextActive]}>
              Cultural
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
            onPress={() => setActiveTab('discover')}
          >
            <Feather
              name="compass"
              size={16}
              color={activeTab === 'discover' ? '#FFFFFF' : tokens.colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
              Discover
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab !== 'discover' ? (
          <>
            {/* Summary Stats - Only show for "My Clubs" */}
            {activeTab === 'my' && (
              <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Feather name="users" size={20} color={tokens.colors.primary} />
                  <Text style={styles.summaryValue}>{myClubs.length}</Text>
                  <Text style={styles.summaryLabel}>Clubs Joined</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Feather name="calendar" size={20} color={tokens.colors.success} />
                  <Text style={styles.summaryValue}>
                    {myClubs.reduce((acc, club) => acc + club.upcomingEvents, 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Upcoming Events</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Feather name="star" size={20} color="#FF9800" />
                  <Text style={styles.summaryValue}>
                    {myClubs.filter(c => c.role !== 'member').length}
                  </Text>
                  <Text style={styles.summaryLabel}>Leadership Roles</Text>
                </View>
              </Animated.View>
            )}

            {/* Section Header for Tech/Cultural tabs */}
            {activeTab !== 'my' && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {activeTab === 'tech' ? '💻 Tech Clubs' : '🎭 Cultural Clubs'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {activeTab === 'tech'
                    ? 'Innovation, coding, research & technology'
                    : 'Arts, music, dance, drama & creativity'}
                </Text>
              </Animated.View>
            )}

            {/* Club Cards */}
            {displayClubs.map((club, index) => (
              <Animated.View
                key={club.id}
                entering={FadeInUp.delay(200 + index * 80).duration(400)}
              >
                <Pressable style={styles.clubCard}>
                  {/* Club Header with Image */}
                  <View style={styles.clubHeader}>
                    <View style={[styles.clubAvatarContainer, { backgroundColor: club.color + '15' }]}>
                      {club.image ? (
                        <Image
                          source={{ uri: club.image }}
                          style={styles.clubImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={[styles.clubAvatar, { backgroundColor: club.color }]}>
                          <Text style={styles.clubAvatarText}>{club.shortName}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.clubInfo}>
                      <Text style={styles.clubName}>{club.name}</Text>
                      <View style={styles.clubMeta}>
                        <View style={[styles.categoryBadge, { backgroundColor: club.color + '20' }]}>
                          <Text style={[styles.categoryText, { color: club.color }]}>{club.category}</Text>
                        </View>
                      </View>
                    </View>
                    {activeTab === 'my' && (
                      <View style={[
                        styles.roleBadge,
                        { backgroundColor: roleColors[club.role].bg }
                      ]}>
                        <Text style={[
                          styles.roleText,
                          { color: roleColors[club.role].text }
                        ]}>
                          {club.role.charAt(0).toUpperCase() + club.role.slice(1)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Club Description */}
                  <Text style={styles.clubDescription} numberOfLines={2}>{club.description}</Text>

                  {/* Club Stats */}
                  <View style={styles.clubStats}>
                    <View style={styles.clubStatItem}>
                      <Feather name="users" size={14} color={tokens.colors.text.tertiary} />
                      <Text style={styles.clubStatText}>{club.memberCount} members</Text>
                    </View>
                    <View style={styles.clubStatItem}>
                      <Feather name="calendar" size={14} color={tokens.colors.text.tertiary} />
                      <Text style={styles.clubStatText}>{club.eventsHosted} events</Text>
                    </View>
                    {activeTab === 'my' && (
                      <View style={styles.clubStatItem}>
                        <Feather name="clock" size={14} color={tokens.colors.text.tertiary} />
                        <Text style={styles.clubStatText}>Since {club.joinedDate}</Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  {activeTab === 'my' ? (
                    club.upcomingEvents > 0 && (
                      <View style={styles.upcomingBadge}>
                        <Feather name="bell" size={14} color={tokens.colors.primary} />
                        <Text style={styles.upcomingText}>
                          {club.upcomingEvents} upcoming event{club.upcomingEvents > 1 ? 's' : ''}
                        </Text>
                        <Feather name="chevron-right" size={16} color={tokens.colors.text.tertiary} />
                      </View>
                    )
                  ) : (
                    <View style={styles.clubActions}>
                      <Pressable style={[styles.actionButton, styles.viewButton]}>
                        <Feather name="eye" size={16} color={tokens.colors.primary} />
                        <Text style={styles.viewButtonText}>View</Text>
                      </Pressable>
                      <Pressable style={[styles.actionButton, styles.joinClubButton]}>
                        <Feather name="plus" size={16} color="#FFFFFF" />
                        <Text style={styles.joinClubButtonText}>Join Club</Text>
                      </Pressable>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </>
        ) : (
          <>
            {/* Discover Section */}
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text style={styles.discoverTitle}>🔥 Recommended for You</Text>
              <Text style={styles.discoverSubtitle}>
                Based on your interests and campus trends
              </Text>
            </Animated.View>

            {SUGGESTED_CLUBS.map((club, index) => (
              <Animated.View
                key={club.id}
                entering={FadeInUp.delay(100 + index * 80).duration(400)}
              >
                <Pressable style={styles.suggestedCard}>
                  <View style={[styles.suggestedAvatarContainer, { backgroundColor: club.color + '15' }]}>
                    {club.image ? (
                      <Image
                        source={{ uri: club.image }}
                        style={styles.suggestedImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={[styles.clubAvatar, { backgroundColor: club.color }]}>
                        <Text style={styles.clubAvatarText}>{club.shortName}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.suggestedInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <View style={styles.suggestedMeta}>
                      <View style={[styles.categoryBadge, { backgroundColor: club.color + '20' }]}>
                        <Text style={[styles.categoryText, { color: club.color }]}>{club.category}</Text>
                      </View>
                      <Text style={styles.suggestedMembers}>
                        {club.memberCount} members
                      </Text>
                    </View>
                  </View>
                  <Pressable style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Join</Text>
                  </Pressable>
                </Pressable>
              </Animated.View>
            ))}

            {/* Quick Access to Categories */}
            <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.quickAccessSection}>
              <Text style={styles.quickAccessTitle}>Browse by Category</Text>
              <View style={styles.quickAccessGrid}>
                <Pressable
                  style={[styles.quickAccessCard, { backgroundColor: '#4285F420' }]}
                  onPress={() => setActiveTab('tech')}
                >
                  <Feather name="code" size={24} color="#4285F4" />
                  <Text style={[styles.quickAccessText, { color: '#4285F4' }]}>Tech Clubs</Text>
                  <Text style={styles.quickAccessCount}>{TECH_CLUBS.length} clubs</Text>
                </Pressable>
                <Pressable
                  style={[styles.quickAccessCard, { backgroundColor: '#E91E6320' }]}
                  onPress={() => setActiveTab('cultural')}
                >
                  <Feather name="music" size={24} color="#E91E63" />
                  <Text style={[styles.quickAccessText, { color: '#E91E63' }]}>Cultural</Text>
                  <Text style={styles.quickAccessCount}>{CULTURAL_CLUBS.length} clubs</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Browse All */}
            <Animated.View entering={FadeInUp.delay(600).duration(400)}>
              <Pressable style={styles.browseAllButton}>
                <Feather name="compass" size={20} color={tokens.colors.primary} />
                <Text style={styles.browseAllText}>Explore All Campus Clubs</Text>
                <Feather name="chevron-right" size={20} color={tokens.colors.primary} />
              </Pressable>
            </Animated.View>
          </>
        )}
      </ScrollView>
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
  tabsContainer: {
    marginBottom: 16,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: tokens.colors.background.secondary,
  },
  tabActive: {
    backgroundColor: tokens.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: tokens.colors.text.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: tokens.colors.border.light,
    marginVertical: 4,
  },
  clubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  clubImage: {
    width: 40,
    height: 40,
  },
  clubAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clubInfo: {
    flex: 1,
    marginLeft: 14,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 6,
  },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  clubCategory: {
    fontSize: 13,
    color: tokens.colors.text.tertiary,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clubDescription: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  clubStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  clubStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubStatText: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
  },
  clubActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewButton: {
    backgroundColor: tokens.colors.primaryLight,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
  joinClubButton: {
    backgroundColor: tokens.colors.primary,
  },
  joinClubButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tokens.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  upcomingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: tokens.colors.primary,
  },
  discoverTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  discoverSubtitle: {
    fontSize: 14,
    color: tokens.colors.text.secondary,
    marginBottom: 20,
  },
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestedAvatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  suggestedImage: {
    width: 36,
    height: 36,
  },
  suggestedInfo: {
    flex: 1,
    marginLeft: 14,
  },
  suggestedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  suggestedCategory: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
    backgroundColor: tokens.colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggestedMembers: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
  },
  joinButton: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickAccessSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    marginBottom: 14,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAccessCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 10,
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickAccessCount: {
    fontSize: 12,
    color: tokens.colors.text.tertiary,
  },
  browseAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.primaryLight,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  browseAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.primary,
  },
});
