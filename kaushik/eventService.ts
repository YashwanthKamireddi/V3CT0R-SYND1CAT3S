// Event Service - Client-side Firestore operations
// All operations are free tier compatible

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Event } from './types';

const EVENTS_COLLECTION = 'events';

// Get all events
export async function getAllEvents(): Promise<Event[]> {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(eventsRef, orderBy('startTime', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Event));
}

// Get single event by ID
export async function getEventById(eventId: string): Promise<Event | null> {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const snapshot = await getDoc(eventRef);

    if (!snapshot.exists()) return null;

    return {
        id: snapshot.id,
        ...snapshot.data()
    } as Event;
}

// Get events by category
export async function getEventsByCategory(category: string): Promise<Event[]> {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(
        eventsRef,
        where('category', '==', category),
        orderBy('startTime', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Event));
}

// Get upcoming events
export async function getUpcomingEvents(limitCount: number = 10): Promise<Event[]> {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const now = Timestamp.now();
    const q = query(
        eventsRef,
        where('startTime', '>=', now),
        orderBy('startTime', 'asc'),
        limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Event));
}

// Create new event
export async function createEvent(eventData: Omit<Event, 'id'>): Promise<string> {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const docRef = await addDoc(eventsRef, {
        ...eventData,
        registeredCount: 0,
        waitlistCount: 0,
        attendees: 0,
        createdAt: Timestamp.now()
    });

    return docRef.id;
}

// Update event
export async function updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
        ...updates,
        updatedAt: Timestamp.now()
    });
}

// Delete event
export async function deleteEvent(eventId: string): Promise<void> {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(eventRef);
}

// Get stats for dashboard
export async function getEventStats(): Promise<{
    totalEvents: number;
    totalRegistrations: number;
    avgAttendance: number;
}> {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const snapshot = await getDocs(eventsRef);

    let totalEvents = snapshot.size;
    let totalRegistrations = 0;
    let totalAttended = 0;

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalRegistrations += data.registeredCount || 0;
        totalAttended += data.attendees || 0;
    });

    const avgAttendance = totalRegistrations > 0
        ? Math.round((totalAttended / totalRegistrations) * 100)
        : 0;

    return {
        totalEvents,
        totalRegistrations,
        avgAttendance
    };
}
