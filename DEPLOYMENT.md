# Deployment Guide

This guide covers how to build and deploy the YT2700 application to various platforms.

## Prerequisites

### General
- Node.js 16 or higher
- npm or yarn
- Git
- Expo CLI (`npm install -g expo-cli`)

### iOS Development
- macOS with Xcode 14 or later
- iOS Simulator (comes with Xcode)
- Apple Developer account (for physical device testing and App Store)
- CocoaPods (`sudo gem install cocoapods`)

### Android Development
- Android Studio
- Android SDK (API level 21 or higher)
- Android Emulator or physical device
- Java Development Kit (JDK) 11 or higher

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/schrecknetuser/yt2700.git
   cd yt2700
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on specific platform**
   ```bash
   # iOS Simulator (Mac only)
   npm run ios
   
   # Android Emulator or device
   npm run android
   
   # Web browser
   npm run web
   ```

## Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Type Checking
```bash
npx tsc --noEmit
```

## Building for Production

### iOS Build

#### Using Expo EAS (Recommended)
1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure build**
   ```bash
   eas build:configure
   ```

4. **Build for iOS**
   ```bash
   # For internal testing
   eas build --platform ios --profile development
   
   # For TestFlight
   eas build --platform ios --profile preview
   
   # For App Store
   eas build --platform ios --profile production
   ```

#### Using Xcode (Traditional)
1. **Prebuild the app**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Install iOS dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Open in Xcode**
   ```bash
   open ios/yt2700.xcworkspace
   ```

4. **Configure signing & capabilities**
   - Select your team
   - Configure bundle identifier
   - Enable required capabilities (Audio, Background Modes, CarPlay)

5. **Build and archive**
   - Select "Any iOS Device" as target
   - Product → Archive
   - Upload to App Store Connect or export IPA

### Android Build

#### Using Expo EAS (Recommended)
```bash
# For internal testing
eas build --platform android --profile development

# For Google Play internal testing
eas build --platform android --profile preview

# For Google Play production
eas build --platform android --profile production
```

#### Using Android Studio (Traditional)
1. **Prebuild the app**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Open in Android Studio**
   ```bash
   open -a "Android Studio" android
   ```

3. **Build APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   
   Output: `android/app/build/outputs/apk/release/app-release.apk`

4. **Build AAB (for Google Play)**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Distribution

### iOS App Store

1. **App Store Connect Setup**
   - Create app listing
   - Upload screenshots and metadata
   - Set up TestFlight for beta testing

2. **Upload build**
   - Use Xcode Organizer or Transporter app
   - Or use EAS Submit: `eas submit --platform ios`

3. **Submit for review**
   - Complete all required information
   - Submit for App Review

### Google Play Store

1. **Google Play Console Setup**
   - Create app listing
   - Upload screenshots and metadata
   - Set up internal testing track

2. **Upload build**
   - Upload AAB file to Play Console
   - Or use EAS Submit: `eas submit --platform android`

3. **Roll out**
   - Test on internal track
   - Promote to beta/production

## Environment Configuration

### Production Environment Variables

Create `.env.production` file:
```bash
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_API_BASE_URL=https://www.googleapis.com/youtube/v3

# Backend API (for downloads)
BACKEND_API_URL=https://your-backend-api.com

# Analytics (optional)
ANALYTICS_TRACKING_ID=your_tracking_id

# App Configuration
APP_VERSION=1.0.0
```

### Expo Configuration

Update `app.json` for production:
```json
{
  "expo": {
    "name": "YT2700",
    "slug": "yt2700",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.yt2700",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "UIBackgroundModes": [
          "audio",
          "fetch"
        ]
      }
    },
    "android": {
      "package": "com.yourcompany.yt2700",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "FOREGROUND_SERVICE"
      ]
    }
  }
}
```

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/build.yml`:
```yaml
name: Build and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install --legacy-peer-deps
        
      - name: Run tests
        run: npm test
        
      - name: Type check
        run: npx tsc --noEmit

  build-ios:
    runs-on: macos-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install --legacy-peer-deps
        
      - name: Build iOS
        run: eas build --platform ios --non-interactive

  build-android:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install --legacy-peer-deps
        
      - name: Build Android
        run: eas build --platform android --non-interactive
```

## Performance Optimization

### Production Optimizations

1. **Enable Hermes** (for Android)
   Update `app.json`:
   ```json
   {
     "expo": {
       "android": {
         "jsEngine": "hermes"
       }
     }
   }
   ```

2. **Optimize Images**
   - Use appropriate image sizes
   - Consider using WebP format
   - Implement lazy loading

3. **Code Splitting**
   - Use React.lazy for screen components
   - Implement dynamic imports

4. **Bundle Size Analysis**
   ```bash
   npx react-native-bundle-visualizer
   ```

## Monitoring and Analytics

### Crash Reporting
Consider integrating:
- Sentry
- Firebase Crashlytics
- Bugsnag

### Analytics
- Google Analytics for Firebase
- Amplitude
- Mixpanel

## Security Checklist

- [ ] Secure API keys in environment variables
- [ ] Implement certificate pinning for API calls
- [ ] Enable ProGuard/R8 for Android
- [ ] Use Keychain/Keystore for sensitive data
- [ ] Implement proper authentication
- [ ] Add rate limiting for API calls
- [ ] Validate all user inputs
- [ ] Use HTTPS for all network requests

## Pre-launch Checklist

- [ ] Test on multiple devices and OS versions
- [ ] Verify offline functionality
- [ ] Test download and playback
- [ ] Check CarPlay integration (if implemented)
- [ ] Check Android Auto integration (if implemented)
- [ ] Verify background audio playback
- [ ] Test with different network conditions
- [ ] Check app size and optimize if needed
- [ ] Review and update privacy policy
- [ ] Review and update terms of service
- [ ] Prepare marketing materials
- [ ] Set up app store listings
- [ ] Test in-app purchases (if any)
- [ ] Verify analytics tracking

## Troubleshooting

### Common Issues

**Issue: Metro bundler not starting**
```bash
# Clear cache and restart
npx expo start -c
```

**Issue: iOS build fails**
```bash
# Clean and reinstall pods
cd ios
pod deintegrate
pod install
cd ..
```

**Issue: Android build fails**
```bash
# Clean build
cd android
./gradlew clean
cd ..
```

**Issue: Dependencies conflicts**
```bash
# Reinstall with legacy peer deps
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Support and Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## License

MIT License - See LICENSE file for details
