// =============================================
// REGISTRATION SERVICE
// =============================================
// All registration and ticket-related API calls

import { supabase } from '../supabase/client';
import { Registration, RegistrationWithEvent } from '../supabase/database.types';
import { generateQRToken } from './qrService';

// =============================================
// TYPES
// =============================================
export interface RegistrationResult {
  success: boolean;
  data?: Registration;
  error?: string;
}

// =============================================
// REGISTER FOR EVENT
// =============================================
export const registerForEvent = async (
  userId: string,
  eventId: string
): Promise<RegistrationResult> => {
  try {
    // 1. Check if already registered
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    if (existing) {
      return { success: false, error: 'You are already registered for this event' };
    }

    // 2. Check event capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('max_attendees, current_attendees, is_active, registration_deadline')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return { success: false, error: 'Event not found' };
    }

    if (!event.is_active) {
      return { success: false, error: 'Registration is closed for this event' };
    }

    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      if (deadline < new Date()) {
        return { success: false, error: 'Registration deadline has passed' };
      }
    }

    // Determine status based on capacity
    let status: 'confirmed' | 'waitlist' = 'confirmed';
    if (event.max_attendees && (event.current_attendees ?? 0) >= event.max_attendees) {
      status = 'waitlist';
    }

    // 3. Generate unique QR token
    const qrToken = generateQRToken(userId, eventId);

    // 4. Create registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        user_id: userId,
        event_id: eventId,
        qr_token: qrToken,
        status: status,
      })
      .select()
      .single();

    if (regError) {
      console.error('Registration error:', regError);
      return { success: false, error: 'Failed to register. Please try again.' };
    }

    // 5. Increment event registration count
    await supabase
      .from('events')
      .update({ current_attendees: (event.current_attendees || 0) + 1 })
      .eq('id', eventId);

    // 6. Create default reminders
    await createDefaultReminders(registration.id, userId, eventId);

    // 7. Send notification
    await createRegistrationNotification(userId, eventId, status);

    return { success: true, data: registration };
  } catch (error) {
    console.error('Register for event error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// =============================================
// CANCEL REGISTRATION
// =============================================
export const cancelRegistration = async (
  registrationId: string,
  userId: string
): Promise<RegistrationResult> => {
  try {
    // 1. Get registration details
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('event_id, status, checked_in')
      .eq('id', registrationId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !registration) {
      return { success: false, error: 'Registration not found' };
    }

    if (registration.status === 'cancelled') {
      return { success: false, error: 'Registration is already cancelled' };
    }

    if (registration.checked_in) {
      return { success: false, error: 'Cannot cancel - you have already checked in to this event' };
    }

    // 2. Update registration status
    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        status: 'cancelled',
      })
      .eq('id', registrationId);

    if (updateError) {
      return { success: false, error: 'Failed to cancel registration' };
    }

    // 3. Decrement event registration count
    if (!registration.event_id) return { success: true };
    const { data: event } = await supabase
      .from('events')
      .select('current_attendees')
      .eq('id', registration.event_id)
      .single();

    if (event && (event.current_attendees ?? 0) > 0) {
      await supabase
        .from('events')
        .update({ current_attendees: (event.current_attendees ?? 0) - 1 })
        .eq('id', registration.event_id);
    }

    // 4. Delete reminders
    await supabase
      .from('reminders')
      .delete()
      .eq('registration_id', registrationId);

    return { success: true };
  } catch (error) {
    console.error('Cancel registration error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// =============================================
// GET USER REGISTRATIONS
// =============================================
export const getUserRegistrations = async (
  userId: string,
  status?: 'upcoming' | 'past' | 'all'
): Promise<{ data: RegistrationWithEvent[] | null; error: string | null }> => {
  try {
    let query = supabase
      .from('registrations')
      .select(`
        *,
        events (
          *,
          clubs (
            id,
            name,
            slug,
            logo_url
          )
        )
      `)
      .eq('user_id', userId)
      .neq('status', 'cancelled')
      .order('registered_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    // Filter by upcoming/past based on event date
    let filteredData = data as RegistrationWithEvent[];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (status === 'upcoming') {
      filteredData = filteredData.filter((reg) => {
        const eventDate = new Date(reg.events.date);
        return eventDate >= today && !reg.checked_in;
      });
    } else if (status === 'past') {
      filteredData = filteredData.filter((reg) => {
        const eventDate = new Date(reg.events.date);
        return eventDate < today || reg.checked_in;
      });
    }

    return { data: filteredData, error: null };
  } catch (error) {
    console.error('Get user registrations error:', error);
    return { data: null, error: 'Failed to fetch registrations' };
  }
};

// =============================================
// GET REGISTRATION BY ID
// =============================================
export const getRegistrationById = async (
  registrationId: string
): Promise<{ data: RegistrationWithEvent | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events (
          *,
          clubs (
            id,
            name,
            slug,
            logo_url
          )
        )
      `)
      .eq('id', registrationId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as RegistrationWithEvent, error: null };
  } catch (error) {
    console.error('Get registration by ID error:', error);
    return { data: null, error: 'Failed to fetch registration' };
  }
};

// =============================================
// GET REGISTRATION BY QR TOKEN
// =============================================
export const getRegistrationByQRToken = async (
  qrToken: string
): Promise<{ data: RegistrationWithEvent | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events (
          *,
          clubs (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('qr_token', qrToken)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as RegistrationWithEvent, error: null };
  } catch (error) {
    console.error('Get registration by QR token error:', error);
    return { data: null, error: 'Failed to fetch registration' };
  }
};

// =============================================
// CHECK IF USER IS REGISTERED
// =============================================
export const isUserRegistered = async (
  userId: string,
  eventId: string
): Promise<{ isRegistered: boolean; registration?: Registration }> => {
  try {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .neq('status', 'cancelled')
      .single();

    return { isRegistered: !!data, registration: data || undefined };
  } catch (error) {
    return { isRegistered: false };
  }
};

// =============================================
// HELPER: CREATE DEFAULT REMINDERS
// =============================================
const createDefaultReminders = async (
  registrationId: string,
  userId: string,
  eventId: string
) => {
  try {
    // Get event date
    const { data: event } = await supabase
      .from('events')
      .select('date')
      .eq('id', eventId)
      .single();

    if (!event) return;

    const eventDateTime = new Date(event.date);

    // Create reminder times — schema columns are remind_at + type (sent/sent_at/etc are generated aliases)
    const reminders = [
      {
        registration_id: registrationId,
        user_id: userId,
        event_id: eventId,
        type: '1day',
        remind_at: new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        registration_id: registrationId,
        user_id: userId,
        event_id: eventId,
        type: '2hr',
        remind_at: new Date(eventDateTime.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        registration_id: registrationId,
        user_id: userId,
        event_id: eventId,
        type: '30min',
        remind_at: new Date(eventDateTime.getTime() - 30 * 60 * 1000).toISOString(),
      },
    ].filter((r) => new Date(r.remind_at) > new Date()); // Only future reminders

    if (reminders.length > 0) {
      await supabase.from('reminders').insert(reminders);
    }
  } catch (error) {
    console.error('Create reminders error:', error);
  }
};

// =============================================
// HELPER: CREATE REGISTRATION NOTIFICATION
// =============================================
const createRegistrationNotification = async (
  userId: string,
  eventId: string,
  status: 'confirmed' | 'waitlist'
) => {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single();

    if (!event) return;

    const title =
      status === 'confirmed'
        ? 'Registration Confirmed! ✓'
        : 'Added to Waitlist';

    const message =
      status === 'confirmed'
        ? `You're registered for ${event.title}. See you there!`
        : `You've been added to the waitlist for ${event.title}. We'll notify you if a spot opens up.`;

    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type: 'event',
      icon: status === 'confirmed' ? 'check-circle' : 'clock',
      color: status === 'confirmed' ? '#10B981' : '#F59E0B',
      event_id: eventId,
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
};
