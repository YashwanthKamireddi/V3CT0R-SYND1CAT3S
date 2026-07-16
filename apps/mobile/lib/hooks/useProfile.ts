// =============================================
// USE PROFILE HOOK
// =============================================
// Custom hook for managing user profile and stats

import { useState, useEffect, useCallback } from 'react';
import { Profile } from '../supabase/database.types';
import { useAuth } from '../context/AuthContext';
import {
  getUserStats,
  getUserRank,
  getPointsHistory,
} from '../services/leaderboardService';
import { uploadAvatar } from '../supabase/auth';

// =============================================
// TYPES
// =============================================
interface UserStats {
  totalPoints: number;
  totalEvents: number;
  totalBadges: number;
  eventsThisMonth: number;
  streak: number;
}

interface PointsTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

// =============================================
// USE PROFILE
// =============================================
export const useProfile = () => {
  const { user, profile, isAuthenticated, updateProfile, refreshProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update profile with loading state
  const update = useCallback(
    async (updates: Partial<Profile>) => {
      setIsUpdating(true);
      setError(null);

      try {
        const result = await updateProfile(updates);
        if (!result.success) {
          setError(result.error || 'Failed to update profile');
        }
        return result;
      } catch (err) {
        const errorMessage = 'Failed to update profile';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    [updateProfile]
  );

  // Update avatar
  const updateAvatar = useCallback(
    async (imageUri: string) => {
      if (!user) return { success: false, error: 'Not authenticated' };

      setIsUpdating(true);
      setError(null);

      try {
        // Create file object from URI
        const fileName = imageUri.split('/').pop() || 'avatar.jpg';
        const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const file = {
          uri: imageUri,
          type: fileType,
          name: fileName,
        };

        const result = await uploadAvatar(user.id, file);
        if (result.success && result.data?.avatarUrl) {
          await updateProfile({ avatar_url: result.data.avatarUrl });
        }
        return result;
      } catch (err) {
        const errorMessage = 'Failed to update avatar';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    [user, updateProfile]
  );

  return {
    user,
    profile,
    isAuthenticated,
    isUpdating,
    error,
    update,
    updateAvatar,
    refresh: refreshProfile,
  };
};

// =============================================
// USE USER STATS
// =============================================
export const useUserStats = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserStats(user.id);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setStats({
          totalPoints: result.data.totalPoints,
          totalEvents: result.data.eventsAttended,
          totalBadges: result.data.badgeCount,
          eventsThisMonth: result.data.eventsThisMonth,
          streak: 0, // Calculate streak separately if needed
        });
      }
    } catch (err) {
      setError('Failed to fetch stats');
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    } else {
      setStats(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
};

// =============================================
// USE USER RANK
// =============================================
export const useUserRank = () => {
  const { user, isAuthenticated } = useAuth();
  const [rank, setRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRank = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserRank(user.id);
      if (result.error) {
        setError(result.error);
      } else {
        setRank(result.rank);
      }
    } catch (err) {
      setError('Failed to fetch rank');
      console.error('Error fetching rank:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRank();
    } else {
      setRank(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchRank]);

  return {
    rank,
    isLoading,
    error,
    refresh: fetchRank,
  };
};

// =============================================
// USE POINTS HISTORY
// =============================================
export const usePointsHistory = (limit: number = 20) => {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getPointsHistory(user.id, limit);
      if (result.error) {
        setError(result.error);
      } else {
        // Transform the data to match PointsTransaction interface
        const transactions: PointsTransaction[] = (result.data || []).map((item) => ({
          id: item.id,
          amount: item.points,
          type: item.type,
          description: item.eventTitle,
          created_at: item.date,
        }));
        setHistory(transactions);
      }
    } catch (err) {
      setError('Failed to fetch points history');
      console.error('Error fetching points history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    } else {
      setHistory([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchHistory]);

  // Calculate total points from history
  const totalPoints = history.reduce((sum, item) => sum + item.amount, 0);

  // Group by date
  const groupedHistory = history.reduce((groups, item) => {
    const date = new Date(item.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, PointsTransaction[]>);

  return {
    history,
    groupedHistory,
    totalPoints,
    isLoading,
    error,
    refresh: fetchHistory,
  };
};

// =============================================
// USE PROFILE COMPLETION
// =============================================
export const useProfileCompletion = () => {
  const { profile } = useAuth();

  const getCompletionPercentage = useCallback(() => {
    if (!profile) return 0;

    const fields = [
      profile.full_name,
      profile.avatar_url,
      profile.branch,
      profile.year,
      profile.phone,
      profile.student_id,
    ];

    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [profile]);

  const getMissingFields = useCallback(() => {
    if (!profile) return [];

    const missing: string[] = [];

    if (!profile.full_name) missing.push('Full Name');
    if (!profile.avatar_url) missing.push('Profile Picture');
    if (!profile.branch) missing.push('Branch');
    if (!profile.year) missing.push('Year');
    if (!profile.phone) missing.push('Phone Number');
    if (!profile.student_id) missing.push('Student ID');

    return missing;
  }, [profile]);

  return {
    completionPercentage: getCompletionPercentage(),
    missingFields: getMissingFields(),
    isComplete: getCompletionPercentage() === 100,
  };
};

// =============================================
// USE EDIT PROFILE
// =============================================
export const useEditProfile = () => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        branch: profile.branch,
        year: profile.year,
        phone: profile.phone,
        student_id: profile.student_id,
      });
    }
  }, [profile]);

  // Update a single field
  const updateField = useCallback(
    <K extends keyof Profile>(field: K, value: Profile[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
      setError(null);
    },
    []
  );

  // Save all changes
  const save = useCallback(async () => {
    if (!isDirty) return { success: true };

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsDirty(false);
      } else {
        setError(result.error || 'Failed to save');
      }
      return result;
    } catch (err) {
      const errorMessage = 'Failed to save profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [formData, isDirty, updateProfile]);

  // Reset form
  const reset = useCallback(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        branch: profile.branch,
        year: profile.year,
        phone: profile.phone,
        student_id: profile.student_id,
      });
      setIsDirty(false);
      setError(null);
    }
  }, [profile]);

  return {
    formData,
    isDirty,
    isSaving,
    error,
    updateField,
    save,
    reset,
  };
};
