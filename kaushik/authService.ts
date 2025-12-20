// Authentication Service - User management
// Uses Firebase Auth (free tier: 50K monthly users)

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from './types';

const USERS_COLLECTION = 'users';

// Sign up with email/password
export async function signUp(
    email: string,
    password: string,
    displayName: string
): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        await updateProfile(credential.user, { displayName });

        // Create user profile in Firestore
        const userData: User = {
            uid: credential.user.uid,
            email: email,
            displayName: displayName,
            registeredEventIds: [],
            attendedEventIds: [],
            points: 0,
            role: 'student'
        };

        await setDoc(doc(db, USERS_COLLECTION, credential.user.uid), userData);

        return { success: true, user: userData };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Sign in with email/password
export async function signIn(
    email: string,
    password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);

        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, credential.user.uid));

        if (userDoc.exists()) {
            return { success: true, user: userDoc.data() as User };
        } else {
            // Create profile if missing
            const userData: User = {
                uid: credential.user.uid,
                email: credential.user.email || email,
                displayName: credential.user.displayName || 'User',
                registeredEventIds: [],
                attendedEventIds: [],
                points: 0,
                role: 'student'
            };
            await setDoc(doc(db, USERS_COLLECTION, credential.user.uid), userData);
            return { success: true, user: userData };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);

        // Check if user exists
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, credential.user.uid));

        if (userDoc.exists()) {
            return { success: true, user: userDoc.data() as User };
        } else {
            // Create new user profile
            const userData: User = {
                uid: credential.user.uid,
                email: credential.user.email || '',
                displayName: credential.user.displayName || 'User',
                registeredEventIds: [],
                attendedEventIds: [],
                points: 0,
                role: 'student'
            };
            await setDoc(doc(db, USERS_COLLECTION, credential.user.uid), userData);
            return { success: true, user: userData };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Sign out
export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
    if (userDoc.exists()) {
        return userDoc.data() as User;
    }
    return null;
}

// Subscribe to auth state changes
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
        return userDoc.data() as User;
    }
    return null;
}
