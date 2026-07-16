// =============================================
// QR SERVICE
// =============================================
// QR code generation and validation

import { supabase } from '../supabase/client';

// =============================================
// TYPES
// =============================================
export interface QRData {
  userId: string;
  eventId: string;
  registrationId: string;
  token: string;
  timestamp: number;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  data?: {
    userName: string;
    eventTitle: string;
    pointsAwarded: number;
    checkInTime: string;
  };
  error?: string;
}

// =============================================
// GENERATE QR TOKEN
// =============================================
export const generateQRToken = (userId: string, eventId: string): string => {
  // Create a unique token combining user, event, and timestamp
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 15);
  const token = `CP-${userId.substring(0, 8)}-${eventId.substring(0, 8)}-${timestamp}-${randomPart}`;
  return token;
};

// =============================================
// GENERATE QR CODE DATA
// =============================================
export const generateQRData = (
  userId: string,
  eventId: string,
  registrationId: string,
  token: string
): string => {
  const qrData: QRData = {
    userId,
    eventId,
    registrationId,
    token,
    timestamp: Date.now(),
  };

  // Encode as base64 JSON
  return btoa(JSON.stringify(qrData));
};

// =============================================
// PARSE QR CODE DATA
// =============================================
export const parseQRData = (encodedData: string): QRData | null => {
  try {
    const decoded = atob(encodedData);
    const data = JSON.parse(decoded) as QRData;

    // Validate required fields
    if (!data.userId || !data.eventId || !data.token) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to parse QR data:', error);
    return null;
  }
};

// =============================================
// VALIDATE QR TOKEN
// =============================================
export const validateQRToken = async (
  qrToken: string
): Promise<{
  valid: boolean;
  registration?: any;
  error?: string;
}> => {
  try {
    // Find registration by token
    const { data: registration, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events (
          id,
          title,
          date,
          end_date,
          points,
          is_active
        ),
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('qr_token', qrToken)
      .single();

    if (error || !registration) {
      return { valid: false, error: 'Invalid QR code' };
    }

    // Check if already attended
    if (registration.checked_in) {
      return { valid: false, error: 'Already checked in', registration };
    }

    // Check if cancelled
    if (registration.status === 'cancelled') {
      return { valid: false, error: 'Registration was cancelled', registration };
    }

    // Check event is active
    if (!registration.events || !registration.events.is_active) {
      return { valid: false, error: 'Event has been cancelled', registration };
    }

    // Check if event is today or ongoing
    const now = new Date();
    const eventDate = new Date(registration.events.date);
    const endDate = registration.events.end_date
      ? new Date(registration.events.end_date)
      : new Date(eventDate.getTime() + 24 * 60 * 60 * 1000); // Default 1 day duration

    if (now < eventDate) {
      return { valid: false, error: 'This event has not started yet', registration };
    }

    if (now > endDate) {
      return { valid: false, error: 'This event has already ended', registration };
    }

    return { valid: true, registration };
  } catch (error) {
    console.error('Validate QR token error:', error);
    return { valid: false, error: 'Failed to validate QR code' };
  }
};

// =============================================
// PROCESS CHECK-IN
// =============================================
export const processCheckIn = async (
  qrToken: string,
  checkedInBy?: string
): Promise<CheckInResult> => {
  try {
    // 1. Validate QR token
    const validation = await validateQRToken(qrToken);

    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Invalid QR code',
        error: validation.error,
      };
    }

    const registration = validation.registration;
    const pointsToAward = registration.events.points || 10;

    // 2. Create attendance record
    const { error: attendanceError } = await supabase.from('attendance').insert({
      registration_id: registration.id,
      user_id: registration.user_id,
      event_id: registration.event_id,
      points_awarded: pointsToAward,
      checked_in_by: checkedInBy || null,
    });

    if (attendanceError) {
      console.error('Attendance creation error:', attendanceError);
      return {
        success: false,
        message: 'Failed to record attendance',
        error: attendanceError.message,
      };
    }

    // 3. Update registration status
    await supabase
      .from('registrations')
      .update({
        checked_in: true,
        check_in_time: new Date().toISOString()
      })
      .eq('id', registration.id);

    // 4. Update user points and events attended
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_points, events_attended')
      .eq('id', registration.user_id)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          total_points: (profile.total_points ?? 0) + pointsToAward,
          events_attended: (profile.events_attended ?? 0) + 1,
        })
        .eq('id', registration.user_id);
    }

    // 5. Create notification
    await supabase.from('notifications').insert({
      user_id: registration.user_id,
      title: `Points Earned! +${pointsToAward} pts 🎉`,
      message: `You earned ${pointsToAward} points for attending ${registration.events.title}!`,
      type: 'points',
      icon: 'award',
      color: '#F59E0B',
      event_id: registration.event_id,
    });

    // 6. Check for badge eligibility
    await checkAndAwardBadges(registration.user_id);

    return {
      success: true,
      message: 'Check-in successful!',
      data: {
        userName: registration.profiles?.full_name || 'Student',
        eventTitle: registration.events.title,
        pointsAwarded: pointsToAward,
        checkInTime: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Process check-in error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: 'Check-in failed',
    };
  }
};

// =============================================
// CHECK AND AWARD BADGES
// =============================================
const checkAndAwardBadges = async (userId: string) => {
  try {
    // Get user stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_points, events_attended')
      .eq('id', userId)
      .single();

    if (!profile) return;

    // Get all badges user doesn't have yet
    const { data: existingBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const existingBadgeIds = existingBadges?.map((b) => b.badge_id) || [];

    // Get eligible badges
    const { data: badges } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .not('id', 'in', `(${existingBadgeIds.join(',') || 'null'})`);

    if (!badges) return;

    // Check eligibility for each badge
    for (const badge of badges) {
      let eligible = false;

      switch (badge.requirement_type) {
        case 'events_attended':
          eligible = (profile.events_attended ?? 0) >= (badge.requirement_value || 0);
          break;
        case 'points_earned':
          eligible = (profile.total_points ?? 0) >= (badge.requirement_value || 0);
          break;
        // Add more cases as needed
      }

      if (eligible) {
        // Award badge
        await supabase.from('user_badges').insert({
          user_id: userId,
          badge_id: badge.id,
        });

        // Create notification
        await supabase.from('notifications').insert({
          user_id: userId,
          title: `New Badge: ${badge.name} 🏅`,
          message: badge.description,
          type: 'badge',
          icon: 'award',
          color: badge.color,
        });

        // Award bonus points if any
        if ((badge.points_bonus ?? 0) > 0) {
          await supabase
            .from('profiles')
            .update({ total_points: (profile.total_points ?? 0) + (badge.points_bonus ?? 0) })
            .eq('id', userId);
        }
      }
    }
  } catch (error) {
    console.error('Check badges error:', error);
  }
};

// =============================================
// GET QR CODE FOR REGISTRATION
// =============================================
export const getQRCodeForRegistration = async (
  registrationId: string,
  userId: string
): Promise<{ qrToken: string | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('qr_token')
      .eq('id', registrationId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { qrToken: null, error: 'Registration not found' };
    }

    return { qrToken: data.qr_token, error: null };
  } catch (error) {
    return { qrToken: null, error: 'Failed to get QR code' };
  }
};
