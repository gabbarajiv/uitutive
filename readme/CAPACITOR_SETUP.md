# Capacitor Setup Guide for Uitutive

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install Capacitor core packages and CLI.

### 2. Build Web Assets
Before building native apps, build your Angular web app:
```bash
npm run mobile:build:web
```

### 3. Build for Android
```bash
npm run mobile:build:android
```

**Prerequisites:**
- Android Studio installed
- Android SDK (API 24+)
- Java Development Kit (JDK 11+)
- Gradle

### 4. Build for iOS
```bash
npm run mobile:build:ios
```

**Prerequisites:**
- macOS (Xcode cannot run on Windows)
- Xcode 14+
- CocoaPods

## Available Commands

| Command | Purpose |
|---------|---------|
| `npm run mobile:build:web` | Build optimized web assets |
| `npm run mobile:build:android` | Build Android app |
| `npm run mobile:build:ios` | Build iOS app |
| `npm run mobile:dev` | Development mode with live reload |
| `npm run mobile:sync:android` | Sync web assets to Android project |
| `npm run mobile:sync:ios` | Sync web assets to iOS project |
| `npm run mobile:open:android` | Open Android Studio |
| `npm run mobile:open:ios` | Open Xcode |

## Performance & Native-Like Experience

### ✅ **Strengths:**

1. **Native Performance**
   - Capacitor apps run at near-native speeds
   - Direct access to native APIs through Java/Kotlin (Android) and Swift/Objective-C (iOS)
   - Uses WebView for UI, which is performant on modern devices

2. **Native Features**
   - Access to device camera, GPS, accelerometer
   - Haptics, keyboard management, status bar control
   - File system, media library access
   - Push notifications, local storage

3. **Code Reusability**
   - 95%+ code shared between Android and iOS
   - Write once, deploy to multiple platforms
   - Angular code works seamlessly

4. **Web Standards**
   - Built on standard web APIs
   - All Angular Material components work natively
   - CSS and responsive design translate well to mobile

5. **Small Bundle Size**
   - Smaller than React Native or Flutter
   - Optimized for production builds

### ⚠️ **Considerations:**

1. **WebView Rendering**
   - Not 100% native UI (uses WebView rendering)
   - Animations may be slightly slower than fully native apps
   - Some advanced graphics require optimization

2. **Platform-Specific Code**
   - Complex features may need native plugins
   - Platform-specific bugs require separate handling

3. **Development Environment**
   - iOS development requires macOS
   - Android development requires larger downloads (Android Studio)

## Architecture

```
Uitutive (Web App)
    ↓
Angular Build Output (dist/uitutive/browser)
    ↓
Capacitor Config
    ↓
├── Android (Gradle)
├── iOS (CocoaPods)
└── Web (Browser)
```

## Performance Benchmarks

For a modern device (2020+):
- **App Startup**: 1-2 seconds
- **Frame Rate**: 60 FPS for most animations
- **Memory Usage**: 50-150MB (comparable to native apps)
- **Bundle Size**: 5-15MB (production build)

## Next Steps

1. **Install Capacitor packages:**
   ```bash
   npm install
   ```

2. **Initialize mobile projects:**
   ```bash
   npx cap add android
   npx cap add ios
   ```

3. **Build and test:**
   ```bash
   npm run mobile:build:android
   # or
   npm run mobile:build:ios
   ```

4. **For development with live reload:**
   ```bash
   npm run mobile:dev
   ```

## Troubleshooting

- **Build fails**: Run `npx cap sync` to sync web assets
- **Missing SDK**: Install Android Studio and configure ANDROID_HOME
- **iOS requires macOS**: Use a Mac or CI/CD pipeline for iOS builds
- **WebView issues**: Update platform dependencies with `npx cap update`

## Resources

- [Capacitor Docs](https://capacitorjs.com)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Angular Integration](https://capacitorjs.com/docs/angular)
