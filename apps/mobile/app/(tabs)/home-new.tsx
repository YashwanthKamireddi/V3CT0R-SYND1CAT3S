import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '@/components/events';
import { MOCK_EVENTS } from '@/lib/data/mockEvents';
import { theme } from '@/lib/constants/theme';
import { useRouter } from 'expo-router';
import type { Event } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();

  const featuredEvent = MOCK_EVENTS.find(e => e.isFeatured) || MOCK_EVENTS[0];
  const trendingEvents = MOCK_EVENTS.filter(e => !e.isFeatured).slice(0, 3);

  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: '/event/[id]',
      params: { id: eventId }
    });
  };

  const handleRegister = (eventId: string) => {
    console.log('Register for event:', eventId);
    // TODO: Implement registration logic
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>👋 Hi, Yash</Text>
              <Text style={styles.subtitle}>Discover amazing events</Text>
            </View>
            <View style={styles.headerIcons}>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </View>

          {/* Featured Event */}
          {featuredEvent && (
            <View style={styles.section}>
              <EventCard
                event={featuredEvent as Event}
                variant="featured"
                onPress={() => handleEventPress(featuredEvent.id!)}
              />
            </View>
          )}

          {/* Trending Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
              <Text style={styles.seeAll}>See All</Text>
            </View>

            {trendingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event as Event}
                variant="default"
                onPress={() => handleEventPress(event.id!)}
                onRegister={() => handleRegister(event.id!)}
              />
            ))}
          </View>

          {/* This Week Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 This Week</Text>
            {MOCK_EVENTS.slice(3).map((event) => (
              <EventCard
                key={event.id}
                event={event as Event}
                variant="compact"
                onPress={() => handleEventPress(event.id!)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: theme.spacing['3xl'],
  },
  greeting: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  headerIcons: {
    position: 'relative',
  },
  notificationBadge: {
    backgroundColor: theme.colors.primary[500],
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  seeAll: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
});
