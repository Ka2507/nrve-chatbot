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
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { API_BASE_URL } from './config';

type ChatMessage = { id: string; role: "user" | "bot"; text: string; time: string };
type JournalEntry = { id: string; createdAt: string; updatedAt?: string; text: string; title: string; preview?: string; favorite?: boolean };

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

const Header: React.FC<{ onJournalPress: () => void; onPromptsPress: () => void }> = ({ onJournalPress, onPromptsPress }) => (
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
    <View style={styles.headerButtons}>
      <TouchableOpacity style={styles.promptsButton} onPress={onPromptsPress}>
        <Text style={styles.promptsButtonText}>💡 Prompts</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.journalButton} onPress={onJournalPress}>
        <Text style={styles.journalButtonText}>📖 Journal</Text>
      </TouchableOpacity>
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

const SwipeableJournalEntry: React.FC<{
  entry: JournalEntry;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}> = ({ entry, onSelect, onDelete, onToggleFavorite }) => {
  const [translateX, setTranslateX] = useState(0);
  const [showDeleteAction, setShowDeleteAction] = useState(false);
  const [showOpenAction, setShowOpenAction] = useState(false);

  const onGestureEvent = (event: any) => {
    const { translationX } = event.nativeEvent;
    setTranslateX(translationX);
    
    // Show delete action when swiping right (positive translationX)
    if (translationX > 50) {
      setShowDeleteAction(true);
      setShowOpenAction(false);
    } 
    // Show open action when swiping left (negative translationX)
    else if (translationX < -50) {
      setShowOpenAction(true);
      setShowDeleteAction(false);
    } 
    // Hide both actions when not swiping enough
    else {
      setShowDeleteAction(false);
      setShowOpenAction(false);
    }
  };

  const onHandlerStateChange = (event: any) => {
    const { state, translationX } = event.nativeEvent;
    
    if (state === State.END) {
      // Swipe right to delete (translationX > 100)
      if (translationX > 100) {
        onDelete(entry.id);
      }
      // Swipe left to open (translationX < -100)
      else if (translationX < -100) {
        onSelect(entry.id);
      }
      
      // Reset position and hide actions
      setTranslateX(0);
      setShowDeleteAction(false);
      setShowOpenAction(false);
    }
  };

  return (
    <View style={styles.swipeableContainer}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <View style={[
          styles.entryCard,
          { transform: [{ translateX }] }
        ]}>
          <View style={styles.entryHeader}>
            <TouchableOpacity 
              style={styles.entryContent}
              onPress={() => onSelect(entry.id)}
            >
              <Text style={styles.entryTitle}>{entry.title}</Text>
              {entry.preview && (
                <Text style={styles.entryPreview}>{entry.preview}...</Text>
              )}
              <Text style={styles.entryDate}>
                {formatStamp(entry.updatedAt || entry.createdAt)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onToggleFavorite(entry.id)}
              style={styles.favoriteButton}
              activeOpacity={0.7}
            >
              <Text style={styles.favoriteIcon}>{entry.favorite === true ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PanGestureHandler>
      
      {/* Delete action background (right side) */}
      {showDeleteAction && (
        <View style={styles.deleteActionBackground}>
          <Text style={styles.deleteActionText}>Delete</Text>
        </View>
      )}
      
      {/* Open action background (left side) */}
      {showOpenAction && (
        <View style={styles.openActionBackground}>
          <Text style={styles.openActionText}>Open</Text>
        </View>
      )}
    </View>
  );
};

const JournalDetailScreen: React.FC<{
  entry: JournalEntry;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ entry, onBack, onToggleFavorite, onDelete }) => {
  return (
    <View style={styles.journalDetailContainer}>
      <View style={styles.journalDetailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.journalDetailTitle}>{entry.title}</Text>
        <View style={styles.detailActions}>
          <TouchableOpacity 
            onPress={() => onToggleFavorite(entry.id)}
            style={styles.detailFavoriteButton}
            activeOpacity={0.7}
          >
            <Text style={styles.detailFavoriteIcon}>{entry.favorite === true ? '★' : '☆'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onDelete(entry.id)}
            style={styles.detailDeleteButton}
            activeOpacity={0.7}
          >
            <Text style={styles.detailDeleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
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

const PromptsScreen: React.FC<{
  onBack: () => void;
  onSelectPrompt: (prompt: string) => void;
}> = ({ onBack, onSelectPrompt }) => {
  const prompts = [
    {
      id: 'artist',
      title: "Who's your favorite music artist?",
      description: "Learn about what influenced your favorite musician",
      emoji: '🎵'
    },
    {
      id: 'place',
      title: "What's your favorite place to visit?",
      description: "Discover famous musicians connected to that location",
      emoji: '🌍'
    },
    {
      id: 'location',
      title: "Where are you from?",
      description: "Find famous musicians from your hometown",
      emoji: '🏠'
    }
  ];

  return (
    <View style={styles.promptsContainer}>
      <View style={styles.promptsHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.promptsTitle}>Creative Prompts</Text>
      </View>
      <View style={styles.promptsContent}>
        <Text style={styles.promptsSubtitle}>Choose a prompt to explore music and culture</Text>
        {prompts.map(prompt => (
          <TouchableOpacity
            key={prompt.id}
            style={styles.promptCard}
            onPress={() => onSelectPrompt(prompt.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.promptEmoji}>{prompt.emoji}</Text>
            <View style={styles.promptContent}>
              <Text style={styles.promptTitle}>{prompt.title}</Text>
              <Text style={styles.promptDescription}>{prompt.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const PromptInputScreen: React.FC<{
  promptType: string;
  onBack: () => void;
  onSubmit: (input: string) => void;
}> = ({ promptType, onBack, onSubmit }) => {
  const [input, setInput] = useState('');
  
  const getPromptTitle = () => {
    switch (promptType) {
      case 'artist': return "Who's your favorite music artist?";
      case 'place': return "What's your favorite place to visit?";
      case 'location': return "Where are you from?";
      default: return "Enter your answer";
    }
  };

  const getPlaceholder = () => {
    switch (promptType) {
      case 'artist': return "e.g., Drake, Taylor Swift, Skrillex...";
      case 'place': return "e.g., Los Angeles, Nashville, London...";
      case 'location': return "e.g., Toronto, California, Manchester...";
      default: return "Enter your answer";
    }
  };

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  return (
    <View style={styles.promptInputContainer}>
      <View style={styles.promptInputHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.promptInputTitle}>{getPromptTitle()}</Text>
      </View>
      <View style={styles.promptInputContent}>
        <Text style={styles.promptInputSubtitle}>Tell me more about it</Text>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={getPlaceholder()}
          style={styles.promptInputField}
          multiline
          maxLength={100}
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!input.trim()}
          style={[
            styles.promptSubmitButton,
            !input.trim() && styles.promptSubmitButtonDisabled
          ]}
        >
          <Text style={styles.promptSubmitButtonText}>Submit</Text>
        </TouchableOpacity>
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
    console.log('onDelete function:', onDelete);
    
    // For debugging, let's try calling onDelete directly first
    console.log('Calling onDelete directly for testing...');
    onDelete(id);
    
    // Comment out the Alert for now to test if the issue is with the Alert
    /*
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
    */
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
        {entries
          .sort((a, b) => {
            // Sort by favorite status first (favorited entries go to top)
            if (a.favorite === true && b.favorite !== true) return -1;
            if (a.favorite !== true && b.favorite === true) return 1;
            // Then sort by date (newest first)
            return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
          })
          .map(e => (
            <SwipeableJournalEntry
              key={e.id}
              entry={e}
              onSelect={onSelect}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
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
  
  // Undo functionality state
  const [deletedEntry, setDeletedEntry] = useState<JournalEntry | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Prompts functionality state
  const [showPromptsInput, setShowPromptsInput] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [promptInput, setPromptInput] = useState<string>('');

  // Check if mood assessment is needed on mount
  useEffect(() => {
    setShowMoodAssessment(true);
  }, []);

  // Load journals on mount
  useEffect(() => {
    loadEntries();
  }, []);

  // Function to load entries from server
  const loadEntries = async () => {
    try {
      console.log('Loading entries from server...');
      const loadedEntries = await api<JournalEntry[]>("/api/journal");
      console.log('Loaded entries count:', loadedEntries.length);
      setEntries(loadedEntries);
    } catch (error) {
      console.log('Failed to load journals:', error);
    }
  };

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
    let currentEntries: JournalEntry[] = [];
    
    try {
      console.log('deleteEntry called with id:', id);
      
      // Store the current entries for potential rollback
      currentEntries = [...entries];
      
      // Find the entry to be deleted for undo functionality
      const entryToDelete = entries.find(e => e.id === id);
      if (entryToDelete) {
        setDeletedEntry(entryToDelete);
        setShowUndo(true);
        
        // Set 5-second timeout for undo
        const timeout = setTimeout(() => {
          setShowUndo(false);
          setDeletedEntry(null);
        }, 5000);
        setUndoTimeout(timeout);
      }
      
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
      
      // Verify the deletion was successful
      if (response && response.ok) {
        console.log('Entry deleted successfully from server');
        // No need to show success alert as the UI is already updated
      } else {
        throw new Error('Server did not confirm deletion');
      }
      
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      
      // Clear undo state on error
      setShowUndo(false);
      setDeletedEntry(null);
      if (undoTimeout) {
        clearTimeout(undoTimeout);
        setUndoTimeout(null);
      }
      
      // Revert the optimistic update on error by reloading from server
      try {
        console.log('Reloading entries from server due to delete error');
        const reloadedEntries = await api<JournalEntry[]>("/api/journal");
        setEntries(reloadedEntries);
      } catch (reloadError) {
        console.error('Failed to reload entries:', reloadError);
        // If reload fails, revert to the previous state
        setEntries(currentEntries);
      }
      
      Alert.alert("Error", "Failed to delete journal entry. Please try again.");
    }
  }

  async function undoDelete() {
    if (!deletedEntry) return;
    
    try {
      console.log('Undoing delete for entry:', deletedEntry.id);
      
      // Clear undo state
      setShowUndo(false);
      setDeletedEntry(null);
      if (undoTimeout) {
        clearTimeout(undoTimeout);
        setUndoTimeout(null);
      }
      
      // Restore the entry to the list
      setEntries(prev => [deletedEntry, ...prev]);
      
      // Make API call to restore the entry
      const response = await api<JournalEntry>("/api/journal", { 
        method: "POST", 
        body: JSON.stringify({ text: deletedEntry.text }) 
      });
      console.log('Entry restored successfully:', response);
      
    } catch (error) {
      console.error('Failed to undo delete:', error);
      Alert.alert("Error", "Failed to restore journal entry. Please try again.");
    }
  }

  async function handlePromptSelect(promptType: string) {
    setCurrentPrompt(promptType);
    setShowPromptsInput(true);
  }

  async function handlePromptSubmit(input: string) {
    setShowPromptsInput(false);
    setPromptInput('');
    
    // Create user message
    const userMessage = { id: uuid(), role: "user" as const, text: input, time: nowISO() };
    setMessages(prev => [...prev, userMessage]);
    setSending(true);
    
    try {
      // Send to server with prompt type
      const data = await api<{ reply: string }>("/api/prompt", { 
        method: "POST", 
        body: JSON.stringify({ 
          promptType: currentPrompt, 
          input: input 
        }) 
      });
      
      const botMessage = { id: uuid(), role: "bot" as const, text: data.reply, time: nowISO() };
      setMessages(prev => [...prev, botMessage]);
      setActiveTab('chat');
      
    } catch (error) {
      console.error('Failed to get prompt response:', error);
      const botMessage = { id: uuid(), role: "bot" as const, text: "Sorry, I couldn't find information about that. Please try again.", time: nowISO() };
      setMessages(prev => [...prev, botMessage]);
      setActiveTab('chat');
    } finally {
      setSending(false);
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
        e.id === id ? { ...e, favorite: !e.favorite } : e
      ));
      
      if (selectedEntry?.id === id) {
        setSelectedEntry(prev => prev ? { ...prev, favorite: !prev.favorite } : null);
      }
      
      Alert.alert("Error", "Failed to update favorite status. Please try again.");
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f5ff" />
        <Header 
          onJournalPress={() => setActiveTab('journal')} 
          onPromptsPress={() => setActiveTab('prompts')} 
        />
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
                onToggleFavorite={toggleFavorite}
                onDelete={deleteEntry}
              />
            )}
            {activeTab === 'prompts' && !showPromptsInput && (
              <PromptsScreen
                onBack={() => setActiveTab('chat')}
                onSelectPrompt={handlePromptSelect}
              />
            )}
            {activeTab === 'prompts' && showPromptsInput && (
              <PromptInputScreen
                promptType={currentPrompt}
                onBack={() => setShowPromptsInput(false)}
                onSubmit={handlePromptSubmit}
              />
            )}
          </View>
        )}
        
        {/* Undo button */}
        {showUndo && (
          <View style={styles.undoContainer}>
            <Text style={styles.undoText}>
              Entry deleted • Tap to undo
            </Text>
            <TouchableOpacity
              onPress={undoDelete}
              style={styles.undoButton}
            >
              <Text style={styles.undoButtonText}>Undo</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  promptsButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  promptsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  journalButton: {
    backgroundColor: '#884bff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  journalButtonText: {
    color: 'white',
    fontSize: 12,
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
  detailFavoriteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailFavoriteIcon: {
    fontSize: 20,
    color: '#fbbf24',
  },
  detailActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailDeleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailDeleteIcon: {
    fontSize: 18,
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
  swipeableContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  deleteActionBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    zIndex: 1,
  },
  deleteActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  openActionBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#884bff',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    zIndex: 1,
  },
  openActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  undoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#884bff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  undoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  undoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  undoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  promptsContainer: {
    flex: 1,
    backgroundColor: '#f8f5ff',
  },
  promptsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 75, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  promptsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#090b06',
    flex: 1,
    textAlign: 'center',
  },
  promptsContent: {
    flex: 1,
    padding: 16,
  },
  promptsSubtitle: {
    fontSize: 14,
    color: 'rgba(9, 11, 6, 0.6)',
    marginBottom: 24,
    textAlign: 'center',
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  promptContent: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#090b06',
    marginBottom: 4,
  },
  promptDescription: {
    fontSize: 12,
    color: 'rgba(9, 11, 6, 0.6)',
  },
  promptInputContainer: {
    flex: 1,
    backgroundColor: '#f8f5ff',
  },
  promptInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 75, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  promptInputTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#090b06',
    flex: 1,
    textAlign: 'center',
  },
  promptInputContent: {
    flex: 1,
    padding: 16,
  },
  promptInputSubtitle: {
    fontSize: 14,
    color: 'rgba(9, 11, 6, 0.6)',
    marginBottom: 16,
    textAlign: 'center',
  },
  promptInputField: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#090b06',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(136, 75, 255, 0.2)',
  },
  promptSubmitButton: {
    backgroundColor: '#884bff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  promptSubmitButtonDisabled: {
    opacity: 0.4,
  },
  promptSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NRVEApp;
