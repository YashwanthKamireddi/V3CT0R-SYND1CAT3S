// =============================================
// AUTHENTICATION HELPER FUNCTIONS
// =============================================
// Centralized auth functions for CampusPulse

import { supabase } from './client';
import { Profile, ProfileInsert, ProfileUpdate } from './database.types';

// =============================================
// TYPES
// =============================================
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  studentId?: string;
  branch?: string;
  year?: number;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// =============================================
// SIGN UP
// =============================================
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          student_id: data.studentId,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // 2. Create profile (can also be done via database trigger)
    const profileData: ProfileInsert = {
      id: authData.user.id,
      email: data.email,
      full_name: data.fullName,
      student_id: data.studentId || null,
      branch: data.branch || null,
      year: data.year || null,
      phone: data.phone || null,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail signup if profile creation fails - can retry later
    }

    return {
      success: true,
      data: {
        user: authData.user,
        session: authData.session,
      },
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// =============================================
// SIGN IN
// =============================================
export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        user: authData.user,
        session: authData.session,
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// =============================================
// SIGN OUT
// =============================================
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// =============================================
// GET CURRENT USER
// =============================================
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// =============================================
// GET CURRENT SESSION
// =============================================
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

// =============================================
// GET USER PROFILE
// =============================================
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
};

// =============================================
// UPDATE USER PROFILE
// =============================================
export const updateUserProfile = async (
  userId: string,
  updates: ProfileUpdate
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// =============================================
// PASSWORD RESET
// =============================================
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'campuspulse://reset-password',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// =============================================
// UPDATE PASSWORD
// =============================================
export const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// =============================================
// UPLOAD AVATAR
// =============================================
export const uploadAvatar = async (
  userId: string,
  file: { uri: string; type: string; name: string }
): Promise<AuthResponse> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // Convert URI to blob for upload
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, data: { avatarUrl: publicUrl } };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return { success: false, error: 'Failed to upload avatar' };
  }
};

// =============================================
// AUTH STATE LISTENER
// =============================================
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
