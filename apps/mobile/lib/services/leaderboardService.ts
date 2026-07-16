// =============================================
// LEADERBOARD SERVICE
// =============================================
// Leaderboard and points-related API calls

import { supabase } from '../supabase/client';
import { LeaderboardEntry, Profile } from '../supabase/database.types';

// =============================================
// GET LEADERBOARD
// =============================================
export const getLeaderboard = async (
  limit: number = 50
): Promise<{ data: LeaderboardEntry[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, total_points, events_attended, branch, year')
      .eq('is_active', true)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    // Add rank to each entry
    const rankedData = (data || []).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return { data: rankedData as LeaderboardEntry[], error: null };
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return { data: null, error: 'Failed to fetch leaderboard' };
  }
};

// =============================================
// GET USER RANK
// =============================================
export const getUserRank = async (
  userId: string
): Promise<{ rank: number | null; error: string | null }> => {
  try {
    // Get user's points
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { rank: null, error: null };
    }

    // Count users with more points
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gt('total_points', user.total_points)
      .eq('is_active', true);

    if (countError) {
      return { rank: null, error: countError.message };
    }

    return { rank: (count || 0) + 1, error: null };
  } catch (error) {
    console.error('Get user rank error:', error);
    return { rank: null, error: 'Failed to fetch rank' };
  }
};

// =============================================
// GET TOP USERS
// =============================================
export const getTopUsers = async (
  limit: number = 10
): Promise<{ data: LeaderboardEntry[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, total_points, events_attended, branch, year')
      .eq('is_active', true)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    const rankedData = (data || []).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return { data: rankedData as LeaderboardEntry[], error: null };
  } catch (error) {
    console.error('Get top users error:', error);
    return { data: null, error: 'Failed to fetch top users' };
  }
};

// =============================================
// GET LEADERBOARD BY BRANCH
// =============================================
export const getLeaderboardByBranch = async (
  branch: string,
  limit: number = 50
): Promise<{ data: LeaderboardEntry[] | null; error: string | null }> => {
  try {
    // Leaderboard view doesn't support filters, so we query profiles directly
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, total_points, branch, year')
      .eq('branch', branch)
      .eq('role', 'student')
      .eq('is_active', true)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    // Add rank
    const rankedData = data.map((user, index) => ({
      ...user,
      rank: index + 1,
    })) as LeaderboardEntry[];

    return { data: rankedData, error: null };
  } catch (error) {
    console.error('Get leaderboard by branch error:', error);
    return { data: null, error: 'Failed to fetch branch leaderboard' };
  }
};

// =============================================
// GET USER STATS
// =============================================
export const getUserStats = async (
  userId: string
): Promise<{
  data: {
    totalPoints: number;
    eventsAttended: number;
    rank: number | null;
    badgeCount: number;
    pointsThisMonth: number;
    eventsThisMonth: number;
  } | null;
  error: string | null;
}> => {
  try {
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_points, events_attended')
      .eq('id', userId)
      .single();

    if (profileError) {
      return { data: null, error: profileError.message };
    }

    // Get rank
    const { rank } = await getUserRank(userId);

    // Get badge count
    const { count: badgeCount } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyAttendance } = await supabase
      .from('attendance')
      .select('points_awarded')
      .eq('user_id', userId)
      .gte('checked_in_at', startOfMonth.toISOString());

    const pointsThisMonth = monthlyAttendance?.reduce(
      (sum, a) => sum + (a.points_awarded ?? 0),
      0
    ) || 0;
    const eventsThisMonth = monthlyAttendance?.length || 0;

    return {
      data: {
        totalPoints: profile.total_points ?? 0,
        eventsAttended: profile.events_attended ?? 0,
        rank,
        badgeCount: badgeCount || 0,
        pointsThisMonth,
        eventsThisMonth,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    return { data: null, error: 'Failed to fetch stats' };
  }
};

// =============================================
// GET POINTS HISTORY
// =============================================
export const getPointsHistory = async (
  userId: string,
  limit: number = 20
): Promise<{
  data: Array<{
    id: string;
    points: number;
    eventTitle: string;
    date: string;
    type: string;
  }> | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        id,
        points_awarded,
        checked_in_at,
        events (
          title
        )
      `)
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    const history = data?.map((item: any) => ({
      id: item.id,
      points: item.points_awarded,
      eventTitle: item.events?.title || 'Event',
      date: item.checked_in_at,
      type: 'attendance',
    }));

    return { data: history || [], error: null };
  } catch (error) {
    console.error('Get points history error:', error);
    return { data: null, error: 'Failed to fetch points history' };
  }
};

// =============================================
// GET NEARBY USERS (Users close in rank)
// =============================================
export const getNearbyUsers = async (
  userId: string,
  range: number = 5
): Promise<{ data: LeaderboardEntry[] | null; userRank: number | null; error: string | null }> => {
  try {
    // First get user's rank
    const { data: userEntry, error: rankError } = await supabase
      .from('leaderboard')
      .select('rank')
      .eq('id', userId)
      .single();

    if (rankError || !userEntry || userEntry.rank === null) {
      return { data: null, userRank: null, error: 'User not found on leaderboard' };
    }

    const userRank = userEntry.rank;
    const minRank = Math.max(1, userRank - range);
    const maxRank = userRank + range;

    // Get users in range
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .gte('rank', minRank)
      .lte('rank', maxRank);

    if (error) {
      return { data: null, userRank, error: error.message };
    }

    return { data, userRank, error: null };
  } catch (error) {
    console.error('Get nearby users error:', error);
    return { data: null, userRank: null, error: 'Failed to fetch nearby users' };
  }
};
