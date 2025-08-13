# NRVE Chatbot Mobile App

A React Native mobile version of the NRVE mental health companion chatbot, built with Expo.

## Features

- **Chat Interface**: Talk to NRVE, your AI mental health companion
- **Mood Assessment**: Start each session with a mood check-in
- **Journaling**: Write and save personal thoughts and reflections
- **Mobile Optimized**: Designed specifically for mobile devices with tab navigation
- **Real-time Chat**: Instant responses from the AI companion
- **Journal Management**: Create, view, and delete journal entries

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Physical device for testing (optional but recommended)

## Installation

1. **Install Expo CLI globally** (if not already installed):
   ```bash
   npm install -g @expo/cli
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API endpoint**:
   - Open `config.ts`
   - Update `API_BASE_URL` to point to your server
   - For local development: `http://localhost:4000`
   - For physical device testing: Use your computer's IP address (e.g., `http://192.168.1.100:4000`)

## Running the App

### Development Mode

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Choose your platform**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

### Platform-Specific Commands

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

## Server Setup

Make sure your NRVE server is running on the configured port (default: 4000).

1. Navigate to the server directory:
   ```bash
   cd ../server
   ```

2. Install server dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node index.js
   ```

## Mobile-Specific Features

### Tab Navigation
- **Chat Tab**: Main conversation interface with NRVE
- **Journal Tab**: Write and manage personal journal entries

### Mobile Optimizations
- Touch-friendly interface
- Keyboard-aware input handling
- Responsive design for different screen sizes
- Native mobile gestures and interactions

### Platform Considerations
- **iOS**: Optimized for iOS design patterns
- **Android**: Material Design-inspired components
- **Cross-platform**: Consistent experience across platforms

## Configuration

### API Configuration (`config.ts`)
```typescript
export const API_BASE_URL = 'http://localhost:4000';
```

### Environment Variables
Create a `.env` file for environment-specific configuration:
```
API_BASE_URL=http://your-server-url:4000
```

## Building for Production

### Expo Build
```bash
expo build:android  # For Android
expo build:ios      # For iOS
```

### EAS Build (Recommended)
1. Install EAS CLI:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. Configure EAS:
   ```bash
   eas build:configure
   ```

3. Build for platforms:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx expo start --clear
   ```

2. **iOS Simulator not working**:
   - Make sure Xcode is installed
   - Open iOS Simulator manually first

3. **Android Emulator not working**:
   - Make sure Android Studio is installed
   - Start Android Emulator manually first

4. **API connection issues**:
   - Check if server is running
   - Verify API_BASE_URL in config.ts
   - For physical device, use computer's IP address

### Development Tips

- Use Expo Go app for quick testing on physical devices
- Enable hot reloading for faster development
- Use React Native Debugger for debugging
- Test on both iOS and Android regularly

## Project Structure

```
NRVEChatbotMobile/
├── App.tsx              # Main app component
├── config.ts            # API configuration
├── package.json         # Dependencies
├── app.json            # Expo configuration
├── tsconfig.json       # TypeScript configuration
└── assets/             # Images and static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is part of the NRVE mental health companion application.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Expo documentation
3. Check React Native documentation
4. Open an issue in the repository
