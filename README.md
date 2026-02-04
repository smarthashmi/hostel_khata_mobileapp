# Hostel Khata Mobile App

React Native mobile application for Android and iOS - Expense tracking and splitting system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Expo CLI
- For Android: Android Studio
- For iOS: Xcode (macOS only)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## 📱 Features

- ✅ Cross-platform (Android & iOS)
- ✅ Offline-first architecture with automatic sync
- ✅ Push notifications
- ✅ Biometric authentication (Face ID/Fingerprint)
- ✅ Camera integration for receipt scanning
- ✅ Real-time expense tracking
- ✅ Group management
- ✅ Settlement calculations

## 🛠️ Tech Stack

- **React Native** 0.73+
- **Expo** ~50.0.0
- **TypeScript**
- **React Navigation** 6.x
- **TanStack Query** (React Query)
- **WatermelonDB** (Offline storage)
- **Firebase Cloud Messaging** (Push notifications)
- **React Native Reanimated** (Animations)

## 📂 Project Structure

```
mobile/
├── src/
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   ├── components/     # Reusable UI components
│   ├── services/       # API & sync services
│   ├── hooks/          # Custom React hooks
│   ├── store/          # State management
│   ├── utils/          # Utility functions
│   └── config/         # App configuration
├── android/            # Android native code
├── ios/                # iOS native code
├── assets/             # Images, fonts, animations
└── App.tsx            # Entry point
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
EXPO_PUBLIC_API_URL=https://api-hostelkhata.xivra.pk/api
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
```

### Backend API

This app connects to the Hostel Khata backend API:
- **Production**: https://api-hostelkhata.xivra.pk/api
- **Development**: http://localhost:3000/api (or your local IP)

## 📖 Documentation

- [Development Plan](./docs/development-plan.md)
- [Offline Sync Strategy](./docs/offline-sync.md)
- [API Integration](./docs/api-integration.md)

## 🔗 Related Repositories

- **Backend API**: [hostel_khata](https://github.com/smarthashmi/hostel_khata)
- **Web App**: Included in main repository

## 🚀 Deployment

### Android

```bash
# Build APK
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### iOS

```bash
# Build IPA
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## 📝 Development Roadmap

- [x] Phase 1: Project Setup & Foundation
- [ ] Phase 2: Authentication & Onboarding
- [ ] Phase 3: Core Features (Groups & Transactions)
- [ ] Phase 4: Advanced Features (Offline, Push Notifications)
- [ ] Phase 5: Platform-Specific Optimizations
- [ ] Phase 6: Testing & QA
- [ ] Phase 7: Deployment & Launch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC

## 👥 Authors

- Smart Hashmi - [@smarthashmi](https://github.com/smarthashmi)

## 🙏 Acknowledgments

- React Native community
- Expo team
- All contributors
