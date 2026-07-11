# Firebase Google Authentication Configuration Guide

This guide describes how to activate and configure **Google Sign-In via Firebase Authentication** for your launched web application and Capacitor mobile applications.

The **frontend code is already 100% complete** and wired up! No further changes are needed in your codebase. You just need to activate the service inside your Firebase & Google Cloud Consoles.

---

## 1. Google Auth Implementation in the Code

Your codebase is already fully implemented with Firebase Google Authentication:
- **Initialization**: `/src/lib/firebase.ts` initializes the standard `GoogleAuthProvider` and exports it as `googleProvider`.
- **Sign-In Action**: `/src/components/AuthModal.tsx` imports `signInWithPopup` and triggers it via the Google button using `signInWithPopup(auth, googleProvider)`.
- **State Observer**: `/src/context/AppContext.tsx` listens to state changes via `onAuthStateChanged`, automatically synchronizes the new Google user with your Firestore `users` collection, and sets their standard usage tier.

---

## 2. Step-by-Step Activation in Firebase Console

Since Google Sign-In requires your Firebase project to trust your application's domain, you must perform these steps in your [Firebase Console](https://console.firebase.google.com/):

### Step A: Enable Google Auth Provider
1. Go to your **Firebase Console**.
2. Select your Firebase project (e.g., `gen-lang-client-...` or your custom project).
3. Click on **Authentication** in the left sidebar menu.
4. Go to the **Sign-in method** tab.
5. Click **Add new provider** and select **Google**.
6. Toggle the **Enable** switch.
7. Enter a **Project support email** (your developer/admin email address).
8. Click **Save**.

### Step B: Whitelist Your Launched Web Domains
If your application is deployed to a live domain (e.g., Vercel, Netlify, Github Pages, or Cloud Run), you must whitelist it:
1. In the **Authentication** section, go to the **Settings** tab.
2. Click **Authorized domains** (under the domain listing section).
3. Click **Add domain**.
4. Enter your production/launched URL (e.g., `your-app-domain.com` or the `ais-pre-hji562mg...run.app` preview domain).
5. Click **Add**.

*Note: Firebase automatically adds `localhost` and `your-project-id.firebaseapp.com` by default.*

---

## 3. Configuring OAuth Consent Screen (Google Cloud Console)

Sometimes, Google Authentication requires configuring user permissions in the [Google Cloud Console](https://console.cloud.google.com/):

1. Log in to the Google Cloud Console with the same Google account.
2. Select your Firebase project from the top dropdown menu.
3. Go to **APIs & Services > OAuth consent screen**.
4. Set User Type to **External** and fill in your app details (App name, Support email, Developer contact email).
5. Go to **APIs & Services > Credentials** if you need to restrict or generate API keys.

---

## 4. Configuring Google Auth for Capacitor Mobile App

If you are running the app on a mobile device (iOS/Android) via the Capacitor package we installed, you have two choices for Google Sign-In:

### Option A: Standard Firebase Popup (Using `signInWithRedirect`)
If you want to keep the configuration 100% client-side without adding extra plugins, update your `AuthModal.tsx` to use `signInWithRedirect` instead of `signInWithPopup` on mobile, since popups are often blocked or fail in mobile webviews:

```typescript
import { signInWithRedirect, signInWithPopup } from 'firebase/auth';

const handleGoogleSignIn = async () => {
  setLoading(true);
  setError(null);
  try {
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  } catch (err: any) {
    // Error Handling
  }
};
```

### Option B: Native Google Sign-In (Best Experience)
For a premium experience that uses the phone's native Google Sign-In manager, you can install the official Capacitor community plugin:
1. Run: `npm install @capacitor-community/google-active-signin`
2. Follow their native configuration for Android (`google-services.json`) and iOS (`GoogleService-Info.plist`).

---

## 5. Changing Firebase Config Credentials

If you plan to switch the Firebase project to your own custom Firebase production database instead of the default development sandbox, update the `firebaseConfig` object in `/src/lib/firebase.ts` with your new credentials:

```typescript
const firebaseConfig = {
  projectId: "your-production-project-id",
  appId: "your-app-id",
  apiKey: "your-api-key",
  authDomain: "your-auth-domain.firebaseapp.com",
  storageBucket: "your-storage-bucket.appspot.com",
  messagingSenderId: "your-messaging-sender-id"
};
```
