# NRVE Mental Health Chatbot

A beautiful, AI-powered mental health companion built with React, TypeScript, and Gemini AI.

## 🌟 Features

- **🤖 AI-Powered Conversations**: Powered by Google's Gemini AI for empathetic, supportive responses
- **📝 Personal Journaling**: Write and save your thoughts with automatic title generation
- **🌤️ Mood Assessment**: Weather-based mood tracking on every visit
- **🎨 Beautiful UI**: Modern design with purple/cyan color scheme and smooth animations
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🔍 Smart Context**: AI can reference your journal entries for personalized support
- **⚡ Real-time Chat**: Instant responses with typing indicators

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ka2507/nrve-chatbot.git
   cd nrve-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

## 🏗️ Project Structure

```
nrve-fullstack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── server/                 # Express backend
│   ├── index.js           # Main server file
│   ├── package.json       # Backend dependencies
│   └── journal.json       # Journal data storage
└── package.json           # Root workspace configuration
```

## 🎯 How It Works

### Mood Assessment
Every time you visit NRVE, you'll be asked "How are you feeling today?" with four weather options:
- ☀️ **Sunny** - Feeling bright and positive
- ☁️ **Cloudy** - A bit uncertain or mixed
- 🌧️ **Rainy** - Feeling down or sad
- ⛈️ **Stormy** - Really struggling today

### AI Conversations
- **Smart Responses**: NRVE provides empathetic, supportive responses
- **Context Awareness**: Can reference your journal entries when relevant
- **Appropriate Disclaimers**: Only adds mental health resources when discussing serious concerns
- **General Questions**: Answers normal questions without unnecessary medical disclaimers

### Journal Integration
- **Automatic Saving**: Click "Save" to store your thoughts
- **Smart Titles**: First line becomes the entry title
- **Search & Reference**: AI can find and reference relevant journal entries
- **Persistent Storage**: All entries saved to server

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend
- **Express.js** - Web server
- **Google Generative AI** - Gemini AI integration
- **CORS** - Cross-origin resource sharing
- **JSON File Storage** - Simple data persistence

## 🎨 Design System

### Color Palette
- **Primary Purple**: #884bff
- **Cyan Accent**: #3df9ff
- **Magenta**: #f722ff
- **Yellow**: #fff73a
- **White**: #ffffff
- **Black**: #090b06

### Features
- **Responsive Layout**: Adapts to any screen size
- **Smooth Animations**: Framer Motion powered transitions
- **Modern UI**: Clean, accessible design
- **Dark Mode Ready**: Infrastructure in place for future dark theme

## 🔧 API Endpoints

### Chat
- `POST /api/chat` - Send message to AI
- `POST /api/mood` - Submit mood assessment

### Journal
- `GET /api/journal` - Get all journal entries
- `POST /api/journal` - Create new journal entry
- `DELETE /api/journal/:id` - Delete journal entry
- `GET /api/journal/search?q=term` - Search journal entries

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build -w client
```

### Backend (Railway/Render)
```bash
npm start -w server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the AI capabilities
- **React Team** for the amazing framework
- **Vite Team** for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

If you have any questions or need support, please open an issue on GitHub.

---

**NRVE** - Your mental health companion, always here to listen. 💜

