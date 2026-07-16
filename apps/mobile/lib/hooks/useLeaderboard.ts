// =============================================
// USE LEADERBOARD HOOK
// =============================================
// Custom hook for leaderboard functionality

import { useState, useEffect, useCallback } from 'react';
import {
  getLeaderboard,
  getTopUsers,
  getLeaderboardByBranch,
  getNearbyUsers,
} from '../services/leaderboardService';
import { LeaderboardEntry } from '../supabase/database.types';
import { useAuth } from '../context/AuthContext';

// =============================================
// USE LEADERBOARD
// =============================================
export const useLeaderboard = (limit: number = 50) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getLeaderboard(limit);
      if (result.error) {
        setError(result.error);
      } else {
        setLeaderboard(result.data || []);
      }
    } catch (err) {
      setError('Failed to fetch leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Top 3 users
  const topThree = leaderboard.slice(0, 3);

  // Rest of leaderboard
  const rest = leaderboard.slice(3);

  return {
    leaderboard,
    topThree,
    rest,
    isLoading,
    error,
    refresh: fetchLeaderboard,
  };
};

// =============================================
// USE TOP USERS
// =============================================
export const useTopUsers = (limit: number = 10) => {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getTopUsers(limit);
      if (result.error) {
        setError(result.error);
      } else {
        setUsers(result.data || []);
      }
    } catch (err) {
      setError('Failed to fetch top users');
      console.error('Error fetching top users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopUsers();
  }, [fetchTopUsers]);

  return {
    users,
    isLoading,
    error,
    refresh: fetchTopUsers,
  };
};

// =============================================
// USE BRANCH LEADERBOARD
// =============================================
export const useBranchLeaderboard = (branch: string | null, limit: number = 20) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    if (!branch) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getLeaderboardByBranch(branch, limit);
      if (result.error) {
        setError(result.error);
      } else {
        setLeaderboard(result.data || []);
      }
    } catch (err) {
      setError('Failed to fetch branch leaderboard');
      console.error('Error fetching branch leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [branch, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    refresh: fetchLeaderboard,
  };
};

// =============================================
// USE NEARBY USERS
// =============================================
export const useNearbyUsers = (range: number = 5) => {
  const { user, isAuthenticated } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyUsers = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getNearbyUsers(user.id, range);
      if (result.error) {
        setError(result.error);
      } else {
        setNearbyUsers(result.data || []);
      }
    } catch (err) {
      setError('Failed to fetch nearby users');
      console.error('Error fetching nearby users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, range]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNearbyUsers();
    } else {
      setNearbyUsers([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchNearbyUsers]);

  return {
    nearbyUsers,
    isLoading,
    error,
    refresh: fetchNearbyUsers,
  };
};

// =============================================
// USE LEADERBOARD WITH FILTERS
// =============================================
type TimeFilter = 'all' | 'month' | 'week';
type BranchFilter = string | 'all';

export const useFilteredLeaderboard = (initialLimit: number = 50) => {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [branchFilter, setBranchFilter] = useState<BranchFilter>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data: LeaderboardEntry[] = [];

      if (branchFilter !== 'all') {
        const result = await getLeaderboardByBranch(branchFilter, initialLimit);
        if (!result.error) {
          data = result.data || [];
        }
      } else {
        const result = await getLeaderboard(initialLimit);
        if (!result.error) {
          data = result.data || [];
        }
      }

      // Time filtering would be done server-side ideally
      // For now, we just return all data
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to fetch leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [branchFilter, initialLimit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Find current user's position
  const userPosition = user
    ? leaderboard.findIndex((entry) => entry.id === user.id) + 1
    : null;

  // Get user's entry
  const userEntry = user
    ? leaderboard.find((entry) => entry.id === user.id)
    : null;

  return {
    leaderboard,
    timeFilter,
    branchFilter,
    setTimeFilter,
    setBranchFilter,
    userPosition,
    userEntry,
    isLoading,
    error,
    refresh: fetchLeaderboard,
  };
};
