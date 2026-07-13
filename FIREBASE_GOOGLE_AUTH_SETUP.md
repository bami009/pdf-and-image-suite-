# Firebase Google Authentication Configuration Guide

This guide describes how to activate and configure **Google Sign-In via Firebase Authentication** for your launched web application and Capacitor mobile applications.

The frontend uses the Firebase web SDK in a browser and native Firebase Google Sign-In in Capacitor Android/iOS builds. You must still complete the Firebase and native-platform configuration below.

---

## 1. Google Auth Implementation in the Code

Your codebase is already fully implemented with Firebase Google Authentication:
- **Initialization**: `/src/lib/firebase.ts` initializes browser persistence for web and IndexedDB persistence for native Capacitor apps.
- **Sign-In Action**: `/src/lib/firebase.ts` uses Firebase's native Google SDK on Android/iOS, then signs the JavaScript SDK into the same Firebase account so Firestore continues to work. Browsers retain the standard `signInWithPopup` flow.
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

The app now uses `@capacitor-firebase/authentication` for native Google Sign-In on Android and iOS, while continuing to use a popup in desktop/mobile browsers.

### Android
1. Run `npm install` and then `npx cap add android` (once) or `npx cap sync android` (after changes).
2. In Firebase Console → Project settings → Your apps, register an Android app with package name `com.pdfimagesuite.app` and download `google-services.json` into `android/app/`.
3. Add your Android app's SHA-1 fingerprint in the Firebase Android app settings. In Android Studio's terminal, run `./gradlew signingReport` from the `android` folder to obtain it.
4. In `android/variables.gradle`, inside `ext { ... }`, add:

```gradle
rgcfaIncludeGoogle = true
androidxCredentialsVersion = '1.3.0'
```

5. Run `npx cap sync android`, then build and test on a device.

### iOS
1. Run `npm install` and then `npx cap add ios` (once) or `npx cap sync ios` (after changes).
2. Register the iOS app in Firebase using bundle ID `com.pdfimagesuite.app`, then add `GoogleService-Info.plist` to the Xcode App target.
3. With CocoaPods, add this line inside the `App` target in `ios/App/Podfile`:

```ruby
pod 'CapacitorFirebaseAuthentication/Google', :path => '../../node_modules/@capacitor-firebase/authentication'
```

4. In Xcode, add the `REVERSED_CLIENT_ID` value from `GoogleService-Info.plist` as a URL scheme under the App target's **Info → URL Types**.
5. Run `npx cap sync ios`, then build and test on a device.

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
