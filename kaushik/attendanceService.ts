// Attendance Service - QR code verification and check-in
// Client-side implementation for free tier

import {
    doc,
    getDoc,
    updateDoc,
    Timestamp,
    increment,
    arrayUnion
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Registration, Event } from './types';

const REGISTRATIONS_COLLECTION = 'registrations';
const EVENTS_COLLECTION = 'events';
const USERS_COLLECTION = 'users';

export interface AttendanceResult {
    success: boolean;
    message: string;
    pointsEarned?: number;
    alreadyAttended?: boolean;
    error?: string;
}

// Points awarded per event attendance
const POINTS_PER_EVENT = 50;

// Pre-event check-in buffer (30 minutes before event start)
const PRE_EVENT_BUFFER_MS = 30 * 60 * 1000;

// Verify attendance via QR code
export async function verifyAttendance(eventId: string, qrToken: string): Promise<AttendanceResult> {
    const user = auth.currentUser;

    if (!user) {
        return { success: false, message: 'You must be logged in', error: 'unauthenticated' };
    }

    const userId = user.uid;

    if (!eventId || !qrToken) {
        return { success: false, message: 'Invalid QR code', error: 'invalid-argument' };
    }

    try {
        // Get event data
        const eventRef = doc(db, EVENTS_COLLECTION, eventId);
        const eventSnap = await getDoc(eventRef);

        if (!eventSnap.exists()) {
            return { success: false, message: 'Event does not exist', error: 'not-found' };
        }

        const event = eventSnap.data() as Event;

        // Get registration
        const registrationId = `${eventId}_${userId}`;
        const regRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);
        const regSnap = await getDoc(regRef);

        if (!regSnap.exists()) {
            return { success: false, message: 'You are not registered for this event', error: 'not-registered' };
        }

        const registration = regSnap.data() as Registration;

        // Validate QR token
        if (event.qrSecret !== qrToken) {
            return { success: false, message: 'Invalid event token. Are you at the right event?', error: 'invalid-token' };
        }

        // Time window check
        const now = Date.now();
        const startTime = event.startTime.toMillis();
        const endTime = event.endTime.toMillis();

        if (now < (startTime - PRE_EVENT_BUFFER_MS)) {
            return { success: false, message: 'Event has not started yet', error: 'too-early' };
        }

        if (now > endTime) {
            return { success: false, message: 'Event has already ended', error: 'too-late' };
        }

        // Check if already attended
        if (registration.attended) {
            return {
                success: true,
                message: 'Already checked in!',
                alreadyAttended: true,
                pointsEarned: 0
            };
        }

        // Mark attendance
        await updateDoc(regRef, {
            attended: true,
            attendedAt: Timestamp.now()
        });

        // Award points to user
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
            attendedEventIds: arrayUnion(eventId),
            points: increment(POINTS_PER_EVENT)
        });

        return {
            success: true,
            message: `Check-in successful! +${POINTS_PER_EVENT} Points`,
            pointsEarned: POINTS_PER_EVENT
        };

    } catch (error: any) {
        console.error('Attendance verification error:', error);
        return { success: false, message: 'Check-in failed', error: error.message };
    }
}

// Generate QR secret for an event (organizer use)
export function generateQRSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Set QR secret for an event
export async function setEventQRSecret(eventId: string, secret: string): Promise<void> {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, { qrSecret: secret });
}
