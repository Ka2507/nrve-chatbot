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
type JournalEntry = { id: string; createdAt: string; updatedAt?: string; text: string; title: string };

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
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8; return v.toString(16);
  });
}

async function api<T = any>(path: string, opts: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { 
      headers: { "Content-Type": "application/json" }, 
      ...opts 
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

const Header: React.FC = () => (
  <View style={styles.header}>
    <View style={styles.logoContainer}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>NRVE</Text>
      </View>
      <View style={styles.logoTextContainer}>
        <Text style={styles.logoTitle}>nrve</Text>
        <Text style={styles.logoSubtitle}>Mental health companion</Text>
      </View>
    </View>
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

const JournalScreen: React.FC<{
  entries: JournalEntry[];
  draft: string;
  setDraft: (v: string) => void;
  onSave: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
}> = ({ entries, draft, setDraft, onSave, onSelect, onDelete, selectedId }) => {
  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(id) }
      ]
    );
  };

  return (
    <View style={styles.journalScreen}>
      <View style={styles.journalHeader}>
        <Text style={styles.journalTitle}>Journaling</Text>
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
          <View key={e.id} style={[
            styles.entryCard,
            selectedId === e.id && styles.selectedEntry
          ]}>
            <TouchableOpacity 
              onPress={() => onSelect(e.id)} 
              style={styles.entryContent}
            >
              <Text style={styles.entryTitle}>{e.title}</Text>
              <Text style={styles.entryDate}>
                {formatStamp(e.updatedAt || e.createdAt)}
              </Text>
            </TouchableOpacity>
            <Text style={styles.entryPreview} numberOfLines={3}>
              {e.text}
            </Text>
            <View style={styles.entryActions}>
              <TouchableOpacity 
                onPress={() => handleDelete(e.id)}
                style={styles.deleteButton}
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

const TabBar: React.FC<{ activeTab: string; onTabPress: (tab: string) => void }> = ({ activeTab, onTabPress }) => (
  <View style={styles.tabBar}>
    <TouchableOpacity 
      style={styles.tabButton} 
      onPress={() => onTabPress('chat')}
    >
      <Text style={[styles.tabLabel, activeTab === 'chat' && styles.activeTabLabel]}>💬 Chat</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.tabButton} 
      onPress={() => onTabPress('journal')}
    >
      <Text style={[styles.tabLabel, activeTab === 'journal' && styles.activeTabLabel]}>📖 Journal</Text>
    </TouchableOpacity>
  </View>
);

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
    const payload = { text: draft };
    try {
      const created = await api<JournalEntry>("/api/journal", { method: "POST", body: JSON.stringify(payload) });
      setEntries(prev => [created, ...prev]);
      setDraft("");
      setSelectedId(created.id);
    } catch (error) {
      console.log('Failed to save journal entry:', error);
    }
  }

  async function selectEntry(id: string) {
    setSelectedId(id);
  }

  async function deleteEntry(id: string) {
    try {
      await api(`/api/journal/${id}`, { method: "DELETE" });
      setEntries(prev => prev.filter(e => e.id != id));
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      console.log('Failed to delete journal entry:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f5ff" />
      <Header />
      {showMoodAssessment ? (
        <MoodAssessment onComplete={handleMoodAssessment} />
      ) : (
        <>
          <View style={styles.mainContainer}>
            {activeTab === 'chat' && (
              <ChatMain messages={messages} onSend={handleSend} sending={sending} />
            )}
            {activeTab === 'journal' && (
              <JournalScreen
                entries={entries}
                draft={draft}
                setDraft={setDraft}
                onSave={saveDraft}
                onSelect={selectEntry}
                onDelete={deleteEntry}
                selectedId={selectedId}
              />
            )}
          </View>
          <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </>
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
  journalScreen: {
    flex: 1,
    backgroundColor: '#f8f5ff',
  },
  journalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 75, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
  selectedEntry: {
    borderColor: '#884bff',
  },
  entryContent: {
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#090b06',
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 11,
    color: 'rgba(9, 11, 6, 0.6)',
  },
  entryPreview: {
    fontSize: 12,
    color: 'rgba(9, 11, 6, 0.7)',
    lineHeight: 16,
    marginBottom: 8,
  },
  entryActions: {
    alignItems: 'flex-end',
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(136, 75, 255, 0.15)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 14,
    color: '#666',
  },
  activeTabLabel: {
    color: '#884bff',
    fontWeight: '500',
  },
});

export default NRVEApp;
