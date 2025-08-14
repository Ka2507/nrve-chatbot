# NRVE Chatbot - Pure React Native

This is a pure React Native version of the NRVE chatbot application, designed for easy integration into existing React Native projects.

## Features

- ✅ **Pure React Native**: No Expo dependencies, ready for integration
- ✅ **Chat Interface**: AI-powered conversation with mood assessment
- ✅ **Journal Functionality**: Save, view, and delete journal entries
- ✅ **Mobile-Optimized UI**: Clean, responsive design for mobile devices
- ✅ **API Integration**: Connects to the NRVE backend server

## Prerequisites

- Node.js (v18 or higher)
- React Native CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Metro bundler:**
   ```bash
   npm start
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

4. **Run on Android:**
   ```bash
   npm run android
   ```

## Server Setup

Make sure the NRVE backend server is running on `http://localhost:4000`:

```bash
cd ../server
node index.js
```

## Integration Guide

This app is designed to be easily integrated into existing React Native projects:

### 1. Copy Components
Copy the `src/App.tsx` file and its components to your project.

### 2. Install Dependencies
Ensure your project has these React Native dependencies:
- `react-native`
- `react`

### 3. API Configuration
Update the `API_BASE_URL` constant in the App.tsx file to match your server configuration.

### 4. Styling
The app uses React Native StyleSheet for styling, which is compatible with any React Native project.

## Project Structure

```
NRVEChatbotPure/
├── src/
│   └── App.tsx          # Main application component
├── package.json         # Dependencies and scripts
├── metro.config.js      # Metro bundler configuration
├── babel.config.js      # Babel configuration
├── tsconfig.json        # TypeScript configuration
└── index.js             # Entry point
```

## Key Components

- **Header**: Logo and journal navigation button
- **MoodAssessment**: Initial mood selection interface
- **ChatMain**: Main chat interface with message history
- **JournalSidebar**: Journal entry list and creation
- **JournalDetailScreen**: Detailed view of journal entries

## API Endpoints

The app connects to these backend endpoints:
- `GET /api/journal` - Fetch journal entries
- `POST /api/journal` - Create new journal entry
- `DELETE /api/journal/:id` - Delete journal entry
- `POST /api/chat` - Send chat message
- `POST /api/mood` - Submit mood assessment

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **iOS build issues**: Clean build folder in Xcode
3. **Android build issues**: Clean project with `cd android && ./gradlew clean`

### Development

- Use `npm start` to start the Metro bundler
- Use `npm run ios` or `npm run android` to run on simulators
- Check console logs for debugging information

## License

This project is part of the NRVE chatbot application.

