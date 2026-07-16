// =============================================
// AUTH CONTEXT
// =============================================
// Global authentication state management

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { Profile } from '../supabase/database.types';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getUserProfile,
  updateUserProfile,
  SignInData,
  SignUpData,
} from '../supabase/auth';

// =============================================
// TYPES
// =============================================
interface AuthContextType {
  // State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
}

// =============================================
// CONTEXT
// =============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================
// PROVIDER
// =============================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =============================================
  // FETCH PROFILE
  // =============================================
  const fetchProfile = useCallback(async (userId: string) => {
    const profileData = await getUserProfile(userId);
    setProfile(profileData);
  }, []);

  // =============================================
  // INITIALIZE AUTH STATE
  // =============================================
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('Auth state changed:', event);

        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // =============================================
  // SIGN IN
  // =============================================
  const signIn = useCallback(async (data: SignInData) => {
    setIsLoading(true);
    try {
      const result = await authSignIn(data);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Profile will be fetched automatically by auth state listener
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =============================================
  // SIGN UP
  // =============================================
  const signUp = useCallback(async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const result = await authSignUp(data);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =============================================
  // SIGN OUT
  // =============================================
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authSignOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =============================================
  // REFRESH PROFILE
  // =============================================
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // =============================================
  // UPDATE PROFILE
  // =============================================
  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const result = await updateUserProfile(user.id, updates);

      if (result.success) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      }

      return result;
    },
    [user]
  );

  // =============================================
  // CONTEXT VALUE
  // =============================================
  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =============================================
// HOOK
// =============================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// =============================================
// EXPORT DEFAULT
// =============================================
export default AuthContext;
