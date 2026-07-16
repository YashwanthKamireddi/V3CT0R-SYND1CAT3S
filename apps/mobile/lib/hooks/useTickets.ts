// =============================================
// USE TICKETS HOOK
// =============================================
// Custom hook for managing user tickets/registrations

import { useState, useEffect, useCallback } from 'react';
import { RegistrationWithEvent } from '../supabase/database.types';
import {
  getUserRegistrations,
  getRegistrationById,
  registerForEvent,
  cancelRegistration,
  isUserRegistered,
} from '../services/registrationService';
import { useAuth } from '../context/AuthContext';

// =============================================
// TYPES
// =============================================
interface TicketsState {
  upcoming: RegistrationWithEvent[];
  past: RegistrationWithEvent[];
}

// =============================================
// USE TICKETS
// =============================================
export const useTickets = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<TicketsState>({ upcoming: [], past: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [upcomingResult, pastResult] = await Promise.all([
        getUserRegistrations(user.id, 'upcoming'),
        getUserRegistrations(user.id, 'past'),
      ]);

      setTickets({
        upcoming: upcomingResult.data || [],
        past: pastResult.data || []
      });

      if (upcomingResult.error || pastResult.error) {
        setError(upcomingResult.error || pastResult.error);
      }
    } catch (err) {
      setError('Failed to fetch tickets');
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    } else {
      setTickets({ upcoming: [], past: [] });
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchTickets]);

  return {
    upcoming: tickets.upcoming,
    past: tickets.past,
    allTickets: [...tickets.upcoming, ...tickets.past],
    isLoading,
    error,
    refresh: fetchTickets,
  };
};

// =============================================
// USE SINGLE TICKET
// =============================================
export const useTicket = (registrationId: string | null) => {
  const [ticket, setTicket] = useState<RegistrationWithEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!registrationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getRegistrationById(registrationId);
      if (result.error) {
        setError(result.error);
      } else {
        setTicket(result.data);
      }
    } catch (err) {
      setError('Failed to fetch ticket');
      console.error('Error fetching ticket:', err);
    } finally {
      setIsLoading(false);
    }
  }, [registrationId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return {
    ticket,
    isLoading,
    error,
    refresh: fetchTicket,
  };
};

// =============================================
// USE REGISTRATION
// =============================================
export const useRegistration = (eventId: string | null) => {
  const { user, isAuthenticated } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<RegistrationWithEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is registered for this event
  const checkRegistration = useCallback(async () => {
    if (!user || !eventId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await isUserRegistered(user.id, eventId);
      setIsRegistered(result.isRegistered);

      if (result.isRegistered && result.registration) {
        setRegistration(result.registration as RegistrationWithEvent);
      }
    } catch (err) {
      console.error('Error checking registration:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  // Register for event
  const register = useCallback(async () => {
    if (!user || !eventId) {
      return { success: false, error: 'Not authenticated' };
    }

    setIsRegistering(true);
    setError(null);

    try {
      const result = await registerForEvent(user.id, eventId);

      if (result.success) {
        setIsRegistered(true);
        await checkRegistration(); // Refresh registration data
      }

      return result;
    } catch (err) {
      const errorMessage = 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsRegistering(false);
    }
  }, [user, eventId, checkRegistration]);

  // Cancel registration
  const cancel = useCallback(async () => {
    if (!registration || !user) {
      return { success: false, error: 'No registration found' };
    }

    setIsCancelling(true);
    setError(null);

    try {
      const result = await cancelRegistration(registration.id, user.id);

      if (result.success) {
        setIsRegistered(false);
        setRegistration(null);
      }

      return result;
    } catch (err) {
      const errorMessage = 'Cancellation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCancelling(false);
    }
  }, [registration, user]);

  useEffect(() => {
    if (isAuthenticated && eventId) {
      checkRegistration();
    }
  }, [isAuthenticated, eventId, checkRegistration]);

  return {
    isRegistered,
    registration,
    isLoading,
    isRegistering,
    isCancelling,
    error,
    register,
    cancel,
    refresh: checkRegistration,
  };
};

// =============================================
// USE UPCOMING TICKETS COUNT
// =============================================
export const useUpcomingTicketsCount = () => {
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await getUserRegistrations(user.id, 'upcoming');
      setCount(result.data?.length || 0);
    } catch (err) {
      console.error('Error fetching ticket count:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCount();
    } else {
      setCount(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchCount]);

  return {
    count,
    isLoading,
    refresh: fetchCount,
  };
};
