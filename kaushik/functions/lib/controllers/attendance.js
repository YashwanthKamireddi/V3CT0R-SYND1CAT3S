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
exports.verifyAttendance = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Verifies User Attendance via QR Code
 * Called when a student scans the Event QR code.
 */
exports.verifyAttendance = functions.https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    const userId = context.auth.uid;
    const { eventId, qrToken } = data;
    // 2. Validate Input
    if (!eventId || !qrToken) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid QR Code.');
    }
    // 3. fetch Event & Registration
    const eventRef = db.collection('events').doc(eventId);
    const regRef = db.collection('registrations').doc(`${eventId}_${userId}`);
    const eventDoc = await eventRef.get();
    const regDoc = await regRef.get();
    if (!eventDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Event does not exist.');
    }
    if (!regDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'You are not registered for this event.');
    }
    const event = eventDoc.data();
    const registration = regDoc.data();
    // 4. Validate Token (Simple version: Token matches eventSecret stored in DB)
    // Real-world: Use JWT or rotating TOTP
    if ((event === null || event === void 0 ? void 0 : event.qrSecret) !== qrToken) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid Event Token. Are you at the right event?');
    }
    // 5. Time Window Check (e.g., Allow check-in 15 mins before to 1 hour after start)
    const now = admin.firestore.Timestamp.now().toMillis();
    const startTime = event === null || event === void 0 ? void 0 : event.startTime.toMillis();
    const endTime = event === null || event === void 0 ? void 0 : event.endTime.toMillis();
    // Configurable buffer
    const PRE_EVENT_BUFFER = 30 * 60 * 1000; // 30 mins
    if (now < (startTime - PRE_EVENT_BUFFER)) {
        throw new functions.https.HttpsError('failed-precondition', 'Event has not started yet.');
    }
    if (now > endTime) {
        throw new functions.https.HttpsError('failed-precondition', 'Event has already ended.');
    }
    // 6. Idempotency Check (Already attended?)
    if (registration === null || registration === void 0 ? void 0 : registration.attended) {
        return { success: true, message: 'Already checked in!', alreadyAttended: true };
    }
    // 7. Success - Update Records
    const batch = db.batch();
    // Mark registration as attended
    batch.update(regRef, {
        attended: true,
        attendedAt: admin.firestore.Timestamp.now()
    });
    // Add to User's attended history & Award Points
    const POINTS_PER_EVENT = 50;
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
        attendedEventIds: admin.firestore.FieldValue.arrayUnion(eventId),
        points: admin.firestore.FieldValue.increment(POINTS_PER_EVENT)
    });
    await batch.commit();
    return {
        success: true,
        message: 'Check-in Successful! +50 Points',
        pointsEarned: POINTS_PER_EVENT
    };
});
//# sourceMappingURL=attendance.js.map