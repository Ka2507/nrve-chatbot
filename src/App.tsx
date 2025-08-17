import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type ChatMessage = { id: string; role: "user" | "bot"; text: string; time: string };
type JournalEntry = { id: string; createdAt: string; updatedAt?: string; text: string; title: string; preview?: string; favorite?: boolean };

const API_BASE_URL = 'http://localhost:4000';

function nowISO() { return new Date().toISOString(); }
function formatStamp(iso: string) {
  try { 
    const d = new Date(iso);
    return d.toLocaleString(undefined, { 
      year: "numeric", 
      month: "short", 
      day: "2-digit", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  } catch { return iso; }
}
function titleFrom(text: string) {
  const firstLine = (text || "").split(/\n|\r/)[0].trim();
  return firstLine ? (firstLine.length > 60 ? firstLine.slice(0,60) + "…" : firstLine) : "Untitled entry";
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8; return v.toString(16);
  });
}

async function api<T = any>(path: string, opts: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  console.log('API call to:', url, 'with options:', opts);
  
  try {
    const res = await fetch(url, { 
      headers: { "Content-Type": "application/json" }, 
      ...opts 
    });
    
    console.log('API response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error response:', errorText);
      throw new Error(errorText);
    }
    
    const data = await res.json();
    console.log('API response data:', data);
    return data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

const Header: React.FC<{ onJournalPress: () => void }> = ({ onJournalPress }) => (
  <View style={styles.header}>
    <View style={styles.logoContainer}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>NRVE</Text>
      </View>
      <View style={styles.logoTextContainer}>
        <Text style={styles.logoTitle}>Rocky</Text>
        <Text style={styles.logoSubtitle}>Mental health companion</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.journalButton} onPress={onJournalPress}>
      <Text style={styles.journalButtonText}>📖 Journal</Text>
    </TouchableOpacity>
  </View>
);

const MoodAssessment: React.FC<{ onComplete: (mood: string) => void }> = ({ onComplete }) => {
  const moods = [
    { id: 'sunny', emoji: '☀️', label: 'Sunny', description: 'Feeling bright and positive' },
    { id: 'cloudy', emoji: '☁️', label: 'Cloudy', description: 'A bit uncertain or mixed' },
    { id: 'rainy', emoji: '🌧️', label: 'Rainy', description: 'Feeling down or sad' },
    { id: 'stormy', emoji: '⛈️', label: 'Stormy', description: 'Really struggling today' }
  ];

  return (
    <View style={styles.moodContainer}>
      <View style={styles.moodCard}>
        <View style={styles.moodHeader}>
          <Text style={styles.moodTitle}>How are you feeling today?</Text>
          <Text style={styles.moodSubtitle}>Choose the weather that matches your mood</Text>
        </View>
        <View style={styles.moodGrid}>
          {moods.map(mood => (
            <TouchableOpacity
              key={mood.id}
              style={styles.moodButton}
              onPress={() => onComplete(mood.id)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
              <Text style={styles.moodDescription}>{mood.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const ChatMain: React.FC<{ 
  messages: ChatMessage[]; 
  onSend: (t: string) => void; 
  sending: boolean; 
}> = ({ messages, onSend, sending }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <View style={styles.chatContainer}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map(m => (
          <View key={m.id} style={[
            styles.messageContainer,
            m.role === "user" ? styles.userMessage : styles.botMessage
          ]}>
            <View style={[
              styles.messageBubble,
              m.role === "user" ? styles.userBubble : styles.botBubble
            ]}>
              <Text style={[
                styles.messageHeader,
                m.role === "user" ? styles.userMessageHeader : styles.botMessageHeader
              ]}>
                {m.role === "user" ? "You" : "NRVE"} · {formatStamp(m.time)}
              </Text>
              <Text style={[
                styles.messageText,
                m.role === "user" ? styles.userText : styles.botText
              ]}>
                {m.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Share what's on your mind…"
            style={styles.textInput}
            multiline
            maxLength={1000}
          />
          <View style={styles.inputFooter}>
            <Text style={styles.inputHint}>Private by default</Text>
            <TouchableOpacity
              disabled={!text.trim() || sending}
              onPress={handleSend}
              style={[
                styles.sendButton,
                (!text.trim() || sending) && styles.sendButtonDisabled
              ]}
            >
              <Text style={styles.sendButtonText}>
                {sending ? "Thinking…" : "Send"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const JournalDetailScreen: React.FC<{
  entry: JournalEntry;
  onBack: () => void;
}> = ({ entry, onBack }) => {
  return (
    <View style={styles.journalDetailContainer}>
      <View style={styles.journalDetailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.journalDetailTitle}>{entry.title}</Text>
      </View>
      <View style={styles.journalDetailContent}>
        <Text style={styles.journalDetailDate}>
          {formatStamp(entry.updatedAt || entry.createdAt)}
        </Text>
        <Text style={styles.journalDetailText}>{entry.text}</Text>
      </View>
    </View>
  );
};

const JournalSidebar: React.FC<{
  entries: JournalEntry[];
  draft: string;
  setDraft: (v: string) => void;
  onSave: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  selectedId: string | null;
  onBack: () => void;
}> = ({ entries, draft, setDraft, onSave, onSelect, onDelete, onToggleFavorite, selectedId, onBack }) => {
  const handleDelete = (id: string) => {
    console.log('handleDelete called with id:', id);
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          console.log('Delete confirmed for id:', id);
          onDelete(id);
        }}
      ]
    );
  };

  return (
    <View style={styles.journalContainer}>
      <View style={styles.journalHeader}>
        <View style={styles.journalHeaderTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.journalTitle}>Journaling</Text>
        </View>
        <Text style={styles.journalSubtitle}>Write freely. Save to keep it.</Text>
      </View>
      
      <View style={styles.draftContainer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type your thoughts…"
          style={styles.draftInput}
          multiline
          maxLength={2000}
        />
        <View style={styles.draftFooter}>
          <Text style={styles.draftHint}>Title is the first line.</Text>
          <TouchableOpacity 
            onPress={onSave} 
            disabled={!draft.trim()} 
            style={[
              styles.saveButton,
              !draft.trim() && styles.saveButtonDisabled
            ]}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.entriesContainer}>
        {entries.length === 0 && (
          <Text style={styles.noEntries}>No entries yet.</Text>
        )}
        {entries.map(e => (
          <View key={e.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <TouchableOpacity 
                style={styles.entryContent}
                onPress={() => onSelect(e.id)}
              >
                <Text style={styles.entryTitle}>{e.title}</Text>
                {e.preview && (
                  <Text style={styles.entryPreview}>{e.preview}...</Text>
                )}
                <Text style={styles.entryDate}>
                  {formatStamp(e.updatedAt || e.createdAt)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => onToggleFavorite(e.id)}
                style={styles.favoriteButton}
                activeOpacity={0.7}
              >
                <Text style={styles.favoriteIcon}>{e.favorite === true ? '★' : '☆'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.entryActions}>
              <TouchableOpacity 
                onPress={() => {
                  console.log('Delete button pressed for entry:', e.id);
                  handleDelete(e.id);
                }}
                style={styles.deleteButton}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const NRVEApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uuid(), role: "bot", text: "Hi, I'm NRVE. I'm here to listen. What's on your mind today?", time: nowISO() }
  ]);
  const [sending, setSending] = useState(false);
  const [showMoodAssessment, setShowMoodAssessment] = useState(false);
  const [assessingMood, setAssessingMood] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showJournalDetail, setShowJournalDetail] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Check if mood assessment is needed on mount
  useEffect(() => {
    setShowMoodAssessment(true);
  }, []);

  // Load journals on mount
  useEffect(() => {
    api<JournalEntry[]>("/api/journal").then(setEntries).catch((error) => {
      console.log('Failed to load journals:', error);
    });
  }, []);

  async function handleMoodAssessment(mood: string) {
    setAssessingMood(true);
    try {
      const data = await api<{ reply: string }>("/api/mood", { method: "POST", body: JSON.stringify({ mood }) });
      const bot: ChatMessage = { id: uuid(), role: "bot", text: data.reply, time: nowISO() };
      setMessages(prev => [...prev, bot]);
      setShowMoodAssessment(false);
    } catch (e: any) {
      const bot: ChatMessage = { id: uuid(), role: "bot", text: "Thank you for sharing how you're feeling. I'm here to listen.", time: nowISO() };
      setMessages(prev => [...prev, bot]);
      setShowMoodAssessment(false);
    } finally {
      setAssessingMood(false);
    }
  }

  async function handleSend(text: string) {
    const user: ChatMessage = { id: uuid(), role: "user", text, time: nowISO() };
    setMessages(prev => [...prev, user]);
    setSending(true);
    try {
      const data = await api<{ reply: string }>("/api/chat", { method: "POST", body: JSON.stringify({ message: text }) });
      const bot: ChatMessage = { id: uuid(), role: "bot", text: data.reply, time: nowISO() };
      setMessages(prev => [...prev, bot]);
    } catch (e: any) {
      const bot: ChatMessage = { id: uuid(), role: "bot", text: "Sorry, I ran into an issue reaching the server.", time: nowISO() };
      setMessages(prev => [...prev, bot]);
    } finally {
      setSending(false);
    }
  }

  async function saveDraft() {
    if (!draft.trim()) return;
    
    console.log('Attempting to save draft:', draft);
    const payload = { text: draft };
    
    try {
      console.log('Making API call to save entry');
      const created = await api<JournalEntry>("/api/journal", { method: "POST", body: JSON.stringify(payload) });
      console.log('Successfully saved entry:', created);
      
      setEntries(prev => {
        const updated = [created, ...prev];
        console.log('Updated entries count:', updated.length);
        return updated;
      });
      
      setDraft("");
      setSelectedId(created.id);
      
      console.log('Save completed successfully');
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      Alert.alert("Error", "Failed to save journal entry. Please try again.");
    }
  }

  async function selectEntry(id: string) {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setSelectedEntry(entry);
      setShowJournalDetail(true);
    }
  }

  async function deleteEntry(id: string) {
    try {
      console.log('deleteEntry called with id:', id);
      
      // First update the UI optimistically
      setEntries(prev => {
        const filtered = prev.filter(e => e.id !== id);
        console.log('Optimistically updated entries count:', filtered.length);
        return filtered;
      });
      
      // Clear any selected states
      if (selectedId === id) {
        setSelectedId(null);
      }
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
        setShowJournalDetail(false);
      }
      
      // Then make the API call
      console.log('Making API call to delete entry:', id);
      const response = await api(`/api/journal/${id}`, { method: "DELETE" });
      console.log('API response:', response);
      
      Alert.alert("Success", "Journal entry deleted successfully.");
      
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      
      // Revert the optimistic update on error
      // We would need to reload the entries here, but for now just show error
      Alert.alert("Error", "Failed to delete journal entry. Please try again.");
    }
  }

  async function toggleFavorite(id: string) {
    try {
      const entry = entries.find(e => e.id === id);
      if (!entry) return;
      
      const newFavoriteStatus = !(entry.favorite === true);
      console.log('Toggling favorite for entry:', id, 'from', entry.favorite, 'to', newFavoriteStatus);
      
      // Update UI optimistically
      setEntries(prev => prev.map(e => 
        e.id === id ? { ...e, favorite: newFavoriteStatus } : e
      ));
      
      // Update selected entry if it's the same one
      if (selectedEntry?.id === id) {
        setSelectedEntry(prev => prev ? { ...prev, favorite: newFavoriteStatus } : null);
      }
      
      // Make API call
      const response = await api<JournalEntry>(`/api/journal/${id}/favorite`, { 
        method: "PATCH", 
        body: JSON.stringify({ favorite: newFavoriteStatus }) 
      });
      console.log('Favorite toggle response:', response);
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      
      // Revert optimistic update on error
      setEntries(prev => prev.map(e => 
        e.id === id ? { ...e, favorite: !(e.favorite === true) } : e
      ));
      
      if (selectedEntry?.id === id) {
        setSelectedEntry(prev => prev ? { ...prev, favorite: !(prev.favorite === true) } : null);
      }
      
      Alert.alert("Error", "Failed to update favorite status. Please try again.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f5ff" />
      <Header onJournalPress={() => setActiveTab('journal')} />
      {showMoodAssessment ? (
        <MoodAssessment onComplete={handleMoodAssessment} />
      ) : (
        <View style={styles.mainContainer}>
          {activeTab === 'chat' && (
            <ChatMain messages={messages} onSend={handleSend} sending={sending} />
          )}
          {activeTab === 'journal' && !showJournalDetail && (
            <JournalSidebar
              entries={entries}
              draft={draft}
              setDraft={setDraft}
              onSave={saveDraft}
              onSelect={selectEntry}
              onDelete={deleteEntry}
              onToggleFavorite={toggleFavorite}
              selectedId={selectedId}
              onBack={() => setActiveTab('chat')}
            />
          )}
          {activeTab === 'journal' && showJournalDetail && selectedEntry && (
            <JournalDetailScreen
              entry={selectedEntry}
              onBack={() => {
                setShowJournalDetail(false);
                setSelectedEntry(null);
              }}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5ff',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 75, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: '#884bff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoTextContainer: {
    flexDirection: 'column',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6a3acc',
  },
  logoSubtitle: {
    fontSize: 12,
    color: 'rgba(136, 75, 255, 0.8)',
    marginTop: -2,
  },
  journalButton: {
    backgroundColor: '#884bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  journalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  moodContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  moodCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
  },
  moodHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  moodTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#090b06',
    marginBottom: 8,
  },
  moodSubtitle: {
    fontSize: 14,
    color: 'rgba(9, 11, 6, 0.6)',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(136, 75, 255, 0.2)',
    backgroundColor: 'white',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#090b06',
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 12,
    color: 'rgba(9, 11, 6, 0.6)',
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#6a3acc',
  },
  botBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(136, 75, 255, 0.1)',
  },
  messageHeader: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  userMessageHeader: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  botMessageHeader: {
    color: 'rgba(9, 11, 6, 0.6)',
  },
  messageText: {
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: '#090b06',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(136, 75, 255, 0.2)',
    padding: 16,
  },
  inputWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(136, 75, 255, 0.2)',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    minHeight: 88,
    fontSize: 16,
    color: '#090b06',
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  inputHint: {
    fontSize: 12,
    color: 'rgba(9, 11, 6, 0.6)',
    flex: 1,
  },
  sendButton: {
    backgroundColor: '#884bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  journalContainer: {
    flex: 1,
    backgroundColor: '#f8f5ff',
  },
  journalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 75, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  journalHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    color: '#884bff',
    fontSize: 16,
    fontWeight: '500',
  },
  journalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a3acc',
  },
  journalSubtitle: {
    fontSize: 12,
    color: 'rgba(9, 11, 6, 0.6)',
    marginTop: 2,
  },
  draftContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 75, 255, 0.15)',
    backgroundColor: 'white',
  },
  draftInput: {
    minHeight: 120,
    fontSize: 14,
    color: '#090b06',
    textAlignVertical: 'top',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(136, 75, 255, 0.2)',
    backgroundColor: 'white',
  },
  draftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  draftHint: {
    fontSize: 11,
    color: 'rgba(9, 11, 6, 0.6)',
  },
  saveButton: {
    backgroundColor: '#884bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  entriesContainer: {
    flex: 1,
    padding: 8,
  },
  noEntries: {
    color: 'rgba(9, 11, 6, 0.6)',
    fontSize: 14,
    padding: 16,
    textAlign: 'center',
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#090b06',
    marginBottom: 2,
  },
  entryPreview: {
    fontSize: 10,
    color: 'rgba(9, 11, 6, 0.5)',
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 11,
    color: 'rgba(9, 11, 6, 0.6)',
    marginBottom: 8,
  },
  entryActions: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  favoriteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  favoriteIcon: {
    fontSize: 16,
    color: '#fbbf24',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
  },
  journalDetailContainer: {
    flex: 1,
    backgroundColor: '#f8f5ff',
  },
  journalDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 75, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  journalDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#090b06',
    flex: 1,
    textAlign: 'center',
  },
  journalDetailContent: {
    flex: 1,
    padding: 16,
  },
  journalDetailDate: {
    fontSize: 12,
    color: 'rgba(9, 11, 6, 0.6)',
    marginBottom: 16,
  },
  journalDetailText: {
    fontSize: 16,
    color: '#090b06',
    lineHeight: 24,
  },
});

export default NRVEApp;
