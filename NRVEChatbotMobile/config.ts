// API Configuration
export const API_BASE_URL = 'http://localhost:4000'; // Change this to your server URL when deploying

// For development on physical device, you might need to use your computer's IP address
// export const API_BASE_URL = 'http://192.168.1.100:4000'; // Replace with your computer's IP

export const API_ENDPOINTS = {
  chat: `${API_BASE_URL}/api/chat`,
  mood: `${API_BASE_URL}/api/mood`,
  journal: `${API_BASE_URL}/api/journal`,
  journalSearch: `${API_BASE_URL}/api/journal/search`,
};
