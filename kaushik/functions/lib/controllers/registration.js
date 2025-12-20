"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerForEvent = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Registers a user for an event using a Transaction to ensure:
 * 1. No overbooking (Race condition safe)
 * 2. No Time Conflicts
 * 3. No Duplicate Registrations
 */
exports.registerForEvent = functions.https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    const userId = context.auth.uid;
    const { eventId } = data;
    if (!eventId) {
        throw new functions.https.HttpsError('invalid-argument', 'Event ID is required.');
    }
    const eventRef = db.collection('events').doc(eventId);
    const userRef = db.collection('users').doc(userId);
    const registrationRef = db.collection('registrations').doc(`${eventId}_${userId}`);
    try {
        const result = await db.runTransaction(async (transaction) => {
            var _a;
            // --- READS ---
            const eventDoc = await transaction.get(eventRef);
            const userDoc = await transaction.get(userRef);
            const existingRegDoc = await transaction.get(registrationRef);
            if (!eventDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Event not found.');
            }
            if (!userDoc.exists) {
                // Auto-create user profile if missing (edge case)
                // transaction.set(userRef, { uid: userId, registeredEventIds: [], points: 0 });
                throw new functions.https.HttpsError('not-found', 'User profile not found.');
            }
            const event = eventDoc.data();
            const user = userDoc.data();
            // --- LOGIC CHECKS ---
            // 1. Duplicate Registration Check
            if (existingRegDoc.exists && ((_a = existingRegDoc.data()) === null || _a === void 0 ? void 0 : _a.status) === 'confirmed') {
                throw new functions.https.HttpsError('already-exists', 'You are already registered for this event.');
            }
            // 2. Time Conflict Check
            // We need to fetch the user's OTHER registered events to check times.
            if (user.registeredEventIds && user.registeredEventIds.length > 0) {
                // NOTE: In production, you might query only future events to save reads.
                // For now, we fetch all to be safe.
                const userEventsRefs = user.registeredEventIds.map(id => db.collection('events').doc(id));
                const userEventsSnapshots = await transaction.getAll(...userEventsRefs);
                for (const doc of userEventsSnapshots) {
                    if (!doc.exists)
                        continue;
                    const existingEvent = doc.data();
                    // Conflict Logic: (StartA < EndB) and (StartB < EndA)
                    const newStart = event.startTime.toMillis();
                    const newEnd = event.endTime.toMillis();
                    const existingStart = existingEvent.startTime.toMillis();
                    const existingEnd = existingEvent.endTime.toMillis();
                    if (newStart < existingEnd && existingStart < newEnd) {
                        throw new functions.https.HttpsError('aborted', `Time Conflict! Overlaps with ${existingEvent.title}`);
                    }
                }
            }
            // 3. Capacity Check
            let newStatus = 'confirmed';
            if (event.registeredCount >= event.capacity) {
                newStatus = 'waitlisted';
                // Optional: Throw error if you don't want a waitlist
                // throw new functions.https.HttpsError('resource-exhausted', 'Event is full.');
            }
            // --- WRITES ---
            // Create Registration
            const registrationData = {
                id: `${eventId}_${userId}`,
                userId,
                eventId,
                status: newStatus,
                registeredAt: admin.firestore.Timestamp.now(),
                attended: false,
                eventSnapshot: {
                    title: event.title,
                    startTime: event.startTime,
                    endTime: event.endTime
                }
            };
            transaction.set(registrationRef, registrationData);
            // Update Event Counts
            if (newStatus === 'confirmed') {
                transaction.update(eventRef, {
                    registeredCount: event.registeredCount + 1
                });
                // Add to User's list only if confirmed (for conflict checks)
                transaction.update(userRef, {
                    registeredEventIds: admin.firestore.FieldValue.arrayUnion(eventId)
                });
            }
            else {
                transaction.update(eventRef, {
                    waitlistCount: event.waitlistCount + 1
                });
            }
            return { status: newStatus, message: newStatus === 'confirmed' ? 'Registration Successful' : 'Added to Waitlist' };
        });
        return result;
    }
    catch (error) {
        console.error("Registration Transaction Failed:", error);
        // Re-throw the error to the client
        throw error;
    }
});
//# sourceMappingURL=registration.js.map