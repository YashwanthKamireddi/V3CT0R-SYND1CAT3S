# Environment Variables for Firebase - SETUP INSTRUCTIONS

## How to set up your Firebase credentials:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: campus-pulse-app
3. Click the gear icon (Settings) > Project Settings
4. Scroll down to "Your apps" > Click "Add app" > Web
5. Copy the config values

## Create a file called `.env.local` in the frontend folder with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=campus-pulse-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=campus-pulse-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=campus-pulse-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase config.
