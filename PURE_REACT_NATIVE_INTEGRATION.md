# Pure React Native Integration Guide

## 🎯 Purpose
This branch contains a **pure React Native version** of the NRVE chatbot, designed for easy integration into existing React Native projects without any Expo dependencies.

## 📁 Files to Integrate

### Core Files (Required)
```
NRVEChatbotPure/
├── src/
│   └── App.tsx              # Main application component (COPY THIS)
├── package.json             # Dependencies reference (COPY DEPENDENCIES)
└── README.md               # Integration instructions
```

### Configuration Files (Optional - for new projects)
```
NRVEChatbotPure/
├── metro.config.js         # Metro bundler config
├── babel.config.js         # Babel configuration
├── tsconfig.json           # TypeScript configuration
└── index.js                # Entry point
```

## 🚀 Integration Steps

### Step 1: Copy the Main Component
Copy `NRVEChatbotPure/src/App.tsx` to your project's components folder.

### Step 2: Install Dependencies
Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.0"
  }
}
```

### Step 3: Update API Configuration
In the `App.tsx` file, update the API base URL:

```typescript
// Change this line in App.tsx
const API_BASE_URL = 'http://your-server-url:4000';
```

### Step 4: Import and Use
Import the component in your main app:

```typescript
import NRVEApp from './path/to/App';

// Use it in your navigation or main component
<NRVEApp />
```

## 🔧 Key Features

### ✅ What's Included
- **Pure React Native**: No Expo dependencies
- **Chat Interface**: AI-powered conversation with mood assessment
- **Journal Functionality**: Save, view, and delete journal entries
- **Mobile-Optimized UI**: Clean, responsive design
- **API Integration**: Connects to NRVE backend server
- **TypeScript**: Full type safety
- **Error Handling**: Comprehensive error handling and logging

### 🎨 UI Components
- **Header**: Logo and journal navigation button
- **MoodAssessment**: Initial mood selection interface
- **ChatMain**: Main chat interface with message history
- **JournalSidebar**: Journal entry list and creation
- **JournalDetailScreen**: Detailed view of journal entries

## 🔌 API Endpoints Required

Your backend server must provide these endpoints:
- `GET /api/journal` - Fetch journal entries
- `POST /api/journal` - Create new journal entry
- `DELETE /api/journal/:id` - Delete journal entry
- `POST /api/chat` - Send chat message
- `POST /api/mood` - Submit mood assessment

## 📱 Platform Compatibility

### ✅ Supported Platforms
- **iOS**: Full support
- **Android**: Full support
- **Web**: Requires additional setup (react-native-web)

### 🌐 Web Support (Optional)
If you need web support, install:
```bash
npm install react-native-web react-dom --legacy-peer-deps
```

## 🎯 Integration Examples

### Example 1: Standalone App
```typescript
// App.tsx
import React from 'react';
import NRVEApp from './components/NRVEApp';

export default function App() {
  return <NRVEApp />;
}
```

### Example 2: Navigation Integration
```typescript
// In your navigation
import NRVEApp from './components/NRVEApp';

<Stack.Screen 
  name="Chatbot" 
  component={NRVEApp}
  options={{ headerShown: false }}
/>
```

### Example 3: Tab Integration
```typescript
// In your tab navigator
<Tab.Screen 
  name="NRVE" 
  component={NRVEApp}
  options={{
    tabBarIcon: ({ color }) => (
      <Icon name="chat" color={color} />
    ),
  }}
/>
```

## 🔍 Customization

### Styling
All styles are in the `StyleSheet.create()` object at the bottom of `App.tsx`. Modify colors, spacing, and layout as needed.

### API Configuration
Update the `API_BASE_URL` constant to point to your server.

### Component Props
The main `NRVEApp` component is self-contained and doesn't require props.

## 🐛 Troubleshooting

### Common Issues
1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **iOS build issues**: Clean build folder in Xcode
3. **Android build issues**: Clean project with `cd android && ./gradlew clean`

### Development
- Use `npm start` to start the Metro bundler
- Use `npm run ios` or `npm run android` to run on simulators
- Check console logs for debugging information

## 📋 Checklist for Integration

- [ ] Copy `src/App.tsx` to your project
- [ ] Install required dependencies
- [ ] Update `API_BASE_URL` in App.tsx
- [ ] Import and use `NRVEApp` component
- [ ] Test chat functionality
- [ ] Test journal save/delete
- [ ] Test mood assessment
- [ ] Customize styling if needed

## 🎉 Success!

Once integrated, you'll have a fully functional NRVE chatbot with:
- AI-powered conversations
- Personal journaling
- Mood tracking
- Mobile-optimized UI
- No Expo dependencies

## 📞 Support

If you encounter issues during integration:
1. Check the console logs for error messages
2. Verify your API server is running
3. Ensure all dependencies are installed
4. Test on both iOS and Android simulators

---

**Note**: This is a pure React Native implementation designed for maximum compatibility with existing React Native projects.
