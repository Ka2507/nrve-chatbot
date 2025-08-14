# NRVE Chatbot - Pure React Native Integration Package

## 🎯 Integration Package for Existing React Native Projects

This folder contains a **pure React Native version** of the NRVE chatbot, designed for seamless integration into existing React Native projects without any Expo dependencies.

## 📋 Quick Integration (3 Steps)

### 1. Copy the Main Component
```bash
# Copy this file to your project
cp NRVEChatbotPure/src/App.tsx your-project/src/components/NRVEApp.tsx
```

### 2. Install Dependencies
Add to your `package.json`:
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.0"
  }
}
```

### 3. Use in Your App
```typescript
import NRVEApp from './components/NRVEApp';

// In your navigation or main component
<NRVEApp />
```

## 🔧 What You Get

### ✅ Features Included
- **AI Chat Interface**: Powered by Google Gemini AI
- **Journal System**: Save, view, and delete entries
- **Mood Assessment**: Weather-based mood tracking
- **Mobile-Optimized UI**: Clean, responsive design
- **TypeScript**: Full type safety
- **Error Handling**: Comprehensive logging and error handling

### 🎨 UI Components
- **Header**: Logo + journal navigation button
- **MoodAssessment**: Initial mood selection
- **ChatMain**: Chat interface with message history
- **JournalSidebar**: Journal list and creation
- **JournalDetailScreen**: Detailed journal view

## 🔌 API Requirements

Your backend must provide:
- `GET /api/journal` - Fetch entries
- `POST /api/journal` - Create entry
- `DELETE /api/journal/:id` - Delete entry
- `POST /api/chat` - Send message
- `POST /api/mood` - Submit mood

## 📱 Platform Support

- ✅ **iOS**: Full support
- ✅ **Android**: Full support
- 🌐 **Web**: Requires `react-native-web` setup

## 🎯 Integration Examples

### Standalone App
```typescript
import NRVEApp from './components/NRVEApp';
export default function App() {
  return <NRVEApp />;
}
```

### Navigation Integration
```typescript
<Stack.Screen 
  name="Chatbot" 
  component={NRVEApp}
  options={{ headerShown: false }}
/>
```

### Tab Integration
```typescript
<Tab.Screen 
  name="NRVE" 
  component={NRVEApp}
  options={{
    tabBarIcon: ({ color }) => <Icon name="chat" color={color} />
  }}
/>
```

## ⚙️ Configuration

### Update API URL
```typescript
// In App.tsx, change this line:
const API_BASE_URL = 'http://your-server-url:4000';
```

### Customize Styling
All styles are in the `StyleSheet.create()` object at the bottom of `App.tsx`.

## 🐛 Troubleshooting

- **Metro issues**: `npx react-native start --reset-cache`
- **iOS build**: Clean build folder in Xcode
- **Android build**: `cd android && ./gradlew clean`

## 📋 Integration Checklist

- [ ] Copy `src/App.tsx`
- [ ] Install dependencies
- [ ] Update API URL
- [ ] Import and use component
- [ ] Test all features
- [ ] Customize if needed

## 🎉 Result

You'll have a fully functional NRVE chatbot integrated into your React Native app with:
- No Expo dependencies
- Clean, maintainable code
- Full TypeScript support
- Mobile-optimized UI
- Ready for production

---

**For detailed integration instructions, see `../PURE_REACT_NATIVE_INTEGRATION.md`**
