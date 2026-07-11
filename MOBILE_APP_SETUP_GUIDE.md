# Mobile Integration Guide: Packaging PDF & Image Suite for iOS & Android

This guide explains how to compile, package, and launch **PDF & Image Suite** as a native iOS and Android application using **Capacitor** (by Ionic). Since your app is built on modern, lightweight client-side components with local storage and dynamic rendering, packaging it into a native hybrid mobile container is incredibly seamless.

---

## How It Works

Capacitor embeds the production-ready compiled React web assets (`dist/` folder) directly into a native iOS/Android shell. 
- All client-side tools (splitting, merging, compressing, high-fidelity PDF.js rendering) execute **100% locally** on the device's webview.
- Any network operations (such as Firebase auth or Stripe upgrade actions) are bridged securely using native cookies and security standard handlers.

---

## 1. Prerequisites

Before building the mobile apps locally, ensure you have the required native tooling installed on your laptop/computer:

### For Android:
1. **Node.js**: Installed (version 18+).
2. **Android Studio**: [Download & Install Android Studio](https://developer.android.com/studio).
3. **Android SDK**: Install standard Android SDK platforms (API 33 or higher) via the Android Studio SDK Manager.

### For iOS (Mac Only):
1. **macOS**: Required to build iOS binaries.
2. **Xcode**: Download Xcode from the Mac App Store.
3. **Cocoapods**: Run `brew install cocoapods` or `sudo gem install cocoapods` inside your terminal.

---

## 2. Compiling and Bundling the App

We have preconfigured mobile scripts in your `package.json` to handle the build and synchronization process. Run the following commands in the root of your project:

### Step A: Build and Sync Web Assets
This compiles your React TypeScript application and copies all files (along with the custom app icon, service worker, and web manifest) into Capacitor's mobile wrapper.
```bash
npm run cap:sync
```

### Step B: Launch Native Android Shell
This adds the native Android project folder to your root directory and opens it in **Android Studio**:
```bash
npm run cap:android
```

### Step C: Launch Native iOS Shell (Mac Only)
This adds the native Xcode project and automatically launches **Xcode**:
```bash
npm run cap:ios
```

---

## 3. Configuring Native App Credentials

Once Android Studio or Xcode is loaded, you can customize your app's bundle identifier, launcher icons, and permission flags.

### A. Configuring the Android Project:
- **Bundle ID**: Defined in `capacitor.config.ts` as `com.pdfimagesuite.app`. You can update this to match your domain.
- **Launcher Icons**:
  1. In Android Studio, right-click the `app` folder.
  2. Select **New > Image Asset**.
  3. Under **Path**, choose your desired icon image. (We generated a premium app icon located at `./src/assets/images/app_icon_pwa_1783783085506.jpg` for you!).
  4. Adjust scaling and click **Finish**.

### B. Configuring the iOS Project:
- **Signing & Capabilities**: 
  1. Open the project in Xcode.
  2. Select the root `App` target.
  3. Go to the **Signing & Capabilities** tab.
  4. Select your Apple Developer Team and ensure the Bundle Identifier matches.
- **App Icons**: Drag and drop your high-resolution app icon into the `AppIcon` slot inside Xcode’s `Assets` catalog.

---

## 4. Running the App on Your Device

### A. Running on Android:
1. Connect your Android phone to your computer via USB.
2. Enable **USB Debugging** in your phone’s Developer Options.
3. In Android Studio, select your phone in the top toolbar run target.
4. Click the green **Run (Play button)** icon.
5. Android Studio will compile the Gradle project and launch the app natively on your phone!

### B. Running on iOS:
1. Connect your iPhone/iPad to your Mac.
2. Select your device from Xcode's scheme device dropdown.
3. Click the **Play button** in the top left.
4. Xcode will compile the Swift binaries and sideload the app onto your device.

---

## 5. Live Reload for Quick Development

If you want to edit your code and see changes update instantly on your mobile screen without re-compiling:
1. Ensure your phone and computer are connected to the same Wi-Fi network.
2. Find your computer's local IP address (e.g., `192.168.1.50`).
3. Temporarily update the `server` block in `capacitor.config.ts` to forward to your dev server:
   ```ts
   server: {
     url: 'http://192.168.1.50:3000',
     cleartext: true
   }
   ```
4. Run `npx cap copy` and click run in Android Studio/Xcode. Now any changes you save in AI Studio will reflect instantly on your physical device!

---

*This guide was generated to help you package your custom web SaaS into native mobile applications. For further information or advanced native plugin additions (such as native Share sheets, Camera access, or Local Notifications), consult the official [Capacitor Documentation](https://capacitorjs.com/docs).*
