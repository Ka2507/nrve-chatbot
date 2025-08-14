import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = { id: string; role: "user" | "bot"; text: string; time: string };
type JournalEntry = { id: string; createdAt: string; updatedAt?: string; text: string; title: string };

type CSSVars = React.CSSProperties & Record<string, string>;

const LS_KEYS = {
  chat: "nrve.chat.history.v1",
  moodAssessed: "nrve.mood.assessed.v1",
};

function nowISO() { return new Date().toISOString(); }
function formatStamp(iso: string) {
  try { const d = new Date(iso);
    return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}
function titleFrom(text: string) {
  const firstLine = (text || "").split(/\n|\r/)[0].trim();
  return firstLine ? (firstLine.length > 60 ? firstLine.slice(0,60) + "…" : firstLine) : "Untitled entry";
}
function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8; return v.toString(16);
  });
}

async function api<T = any>(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

const Header: React.FC = () => (
  <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur border-b border-[color:var(--nrve-primary)]/15">
    <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 810.8 347.95" className="rounded-xl shadow-inner">
          <defs>
            <style>{`.cls-1{fill:aqua;}.cls-2{fill:#f0f;}.cls-3{fill:#884bff;}.cls-4{mix-blend-mode:screen;}.cls-5{isolation:isolate;}`}</style>
          </defs>
          <g className="cls-5">
            <g id="Layer_1">
              <g className="cls-4">
                <g>
                  <g>
                    <path className="cls-2" d="M382.77,167.16c3.1-1.66,4.81-2.57,6.51-3.49,24.17-13.02,36.41-35.54,33.28-61.21-4-32.88-17.25-51.27-48.33-55.42-31.9-4.26-103.52-1.99-135.74-2.9-46.44,0-46.79,0-46.79,41.56v74.55l.29,24.67-8.77-16.9c-27.04-39.05-54.29-77.96-81.7-116.75-2.35-3.33-6.15-7.65-9.53-7.88-11.68-.81-23.43-.48-35.59-.39-2.63,.02-4.75,2.16-4.75,4.79V204.26c0,2.05,1.66,3.71,3.71,3.71h36.17c2.05,0,3.71-1.66,3.71-3.71v-61.57c0-6.7,8.61-9.43,12.47-3.96,27.98,39.63,55.51,78.64,82.83,117.33,1.99,2.82,5.22,4.49,8.68,4.49h31.46c4.4,0,7.97-3.57,7.97-7.97V92.29c0-5.67,4.58-10.26,10.25-10.27,27.86-.05,67.52-.11,81.5,.13,9.42,.16,18.99,.41,28.18,2.23,11.18,2.22,20.22,14.84,19.64,25.12-.69,12.31-9.52,21.87-23.11,22.54l-73.73,.06c-5.86,0-10.62,4.75-10.62,10.62v161.84c0,4.13,3.35,7.47,7.47,7.47h30.82c4.13,0,7.47-3.35,7.47-7.47v-121.71c0-4.61,3.73-8.34,8.34-8.34h1.27c6.79,0,12.97,3.95,15.82,10.11,10.34,22.35,20.62,44.57,31.21,67.44,2.26,4.88,7.15,8.02,12.53,8.02h18.12c19.42,0,17.15-10.17,12.53-19.52-11.55-24.97-22.46-49.12-33.56-73.39Z"/>
                    <path className="cls-2" d="M661.24,223.06c-5.87,0-10.62-4.76-10.62-10.62v-29.39c0-6.18,5.02-11.18,11.2-11.16l61.62,.05c6.17,.02,11.19-4.98,11.19-11.15v-18.23c0-6.14-4.97-11.13-11.11-11.15l-72.9-.09-25.69-.09c-8.19-.03-14.85,6.61-14.85,14.8v102.99c0,8.05,6.52,14.57,14.57,14.57l124.8-.18c5.98,0,10.82-4.84,10.82-10.82v-18.89c0-5.98-4.84-10.82-10.82-10.82l-88.22,.18Z"/>
                    <path className="cls-2" d="M757.18,42.32h-194.17c-4.81,0-9.1,3.04-10.7,7.58l-11.36,32.31-25.51,68.27,1.27,14.76-8.49-19.69h.02s0-.02-.01-.03c-10.85-30.63-24.12-69.15-34.59-98.69-2.27-6.4-8.32-10.67-15.11-10.67l-31.9-.32c-1.6,0-3.46,1.94-2.87,3.42l85.9,224.22c.13,.33,.44,.55,.79,.57l2.68,.12c1.82,.08,3.49-1.01,4.14-2.71,22.68-58.5,44.86-115.92,66.56-171.91,1.63-4.22,5.69-6.98,10.21-6.98l56.57,.07h106.56c5.87,0,10.63-4.76,10.63-10.63v-19.07c0-5.87-4.76-10.63-10.63-10.63Z"/>
                  </g>
                  <g>
                    <path className="cls-1" d="M373.73,167.16c3.1-1.66,4.81-2.57,6.51-3.49,24.17-13.02,36.41-35.54,33.28-61.21-4-32.88-17.25-51.27-48.33-55.42-31.9-4.26-103.52-1.99-135.74-2.9-46.44,0-46.79,0-46.79,41.56v74.55l.29,24.67-8.77-16.9c-27.04-39.05-54.29-77.96-81.7-116.75-2.35-3.33-6.15-7.65-9.53-7.88-11.68-.81-23.43-.48-35.59-.39-2.63,.02-4.75,2.16-4.75,4.79V204.26c0,2.05,1.66,3.71,3.71,3.71h36.17c2.05,0,3.71-1.66,3.71-3.71v-61.57c0-6.7,8.61-9.43,12.47-3.96,27.98,39.63,55.51,78.64,82.83,117.33,1.99,2.82,5.22,4.49,8.68,4.49h31.46c4.4,0,7.97-3.57,7.97-7.97V92.29c0-5.67,4.58-10.26,10.25-10.27,27.86-.05,67.52-.11,81.5,.13,9.42,.16,18.99,.41,28.18,2.23,11.18,2.22,20.22,14.84,19.64,25.12-.69,12.31-9.52,21.87-23.11,22.54l-73.73,.06c-5.86,0-10.62,4.75-10.62,10.62v161.84c0,4.13,3.35,7.47,7.47,7.47h30.82c4.13,0,7.47-3.35,7.47-7.47v-121.71c0-4.61,3.73-8.34,8.34-8.34h1.27c6.79,0,12.97,3.95,15.82,10.11,10.34,22.35,20.62,44.57,31.21,67.44,2.26,4.88,7.15,8.02,12.53,8.02h18.12c19.42,0,17.15-10.17,12.53-19.52-11.55-24.97-22.46-49.12-33.56-73.39Z"/>
                    <path className="cls-1" d="M652.2,223.06c-5.87,0-10.62-4.76-10.62-10.62v-29.39c0-6.18,5.02-11.18,11.2-11.16l61.62,.05c6.17,.02,11.19-4.98,11.19-11.15v-18.23c0-6.14-4.97-11.13-11.11-11.15l-72.9-.09-25.69-.09c-8.19-.03-14.85,6.61-14.85,14.8v102.99c0,8.05,6.52,14.57,14.57,14.57l124.8-.18c5.98,0,10.82-4.84,10.82-10.82v-18.89c0-5.98-4.84-10.82-10.82-10.82l-88.22,.18Z"/>
                    <path className="cls-1" d="M748.14,42.32h-194.17c-4.81,0-9.1,3.04-10.7,7.58l-11.36,32.31-25.51,68.27,1.27,14.76-8.49-19.69h.02s0-.02-.01-.03c-10.85-30.63-24.12-69.15-34.59-98.69-2.27-6.4-8.32-10.67-15.11-10.67l-31.9-.32c-1.6,0-3.46,1.94-2.87,3.42l85.9,224.22c.13,.33,.44,.55,.79,.57l2.68,.12c1.82,.08,3.49-1.01,4.14-2.71,22.68-58.5,44.86-115.92,66.56-171.91,1.63-4.22,5.69-6.98,10.21-6.98l56.57,.07h106.56c5.87,0,10.63-4.76,10.63-10.63v-19.07c0-5.87-4.76-10.63-10.63-10.63Z"/>
                  </g>
                  <g>
                    <path className="cls-3" d="M378.25,167.16c3.1-1.66,4.81-2.57,6.51-3.49,24.17-13.02,36.41-35.54,33.28-61.21-4-32.88-17.25-51.27-48.33-55.42-31.9-4.26-103.52-1.99-135.74-2.9-46.44,0-46.79,0-46.79,41.56v74.55l.29,24.67-8.77-16.9c-27.04-39.05-54.29-77.96-81.7-116.75-2.35-3.33-6.15-7.65-9.53-7.88-11.68-.81-23.43-.48-35.59-.39-2.63,.02-4.75,2.16-4.75,4.79V204.26c0,2.05,1.66,3.71,3.71,3.71h36.17c2.05,0,3.71-1.66,3.71-3.71v-61.57c0-6.7,8.61-9.43,12.47-3.96,27.98,39.63,55.51,78.64,82.83,117.33,1.99,2.82,5.22,4.49,8.68,4.49h31.46c4.4,0,7.97-3.57,7.97-7.97V92.29c0-5.67,4.58-10.26,10.25-10.27,27.86-.05,67.52-.11,81.5,.13,9.42,.16,18.99,.41,28.18,2.23,11.18,2.22,20.22,14.84,19.64,25.12-.69,12.31-9.52,21.87-23.11,22.54l-73.73,.06c-5.86,0-10.62,4.75-10.62,10.62v161.84c0,4.13,3.35,7.47,7.47,7.47h30.82c4.13,0,7.47-3.35,7.47-7.47v-121.71c0-4.61,3.73-8.34,8.34-8.34h1.27c6.79,0,12.97,3.95,15.82,10.11,10.34,22.35,20.62,44.57,31.21,67.44,2.26,4.88,7.15,8.02,12.53,8.02h18.12c19.42,0,17.15-10.17,12.53-19.52-11.55-24.97-22.46-49.12-33.56-73.39Z"/>
                    <path className="cls-3" d="M656.72,223.06c-5.87,0-10.62-4.76-10.62-10.62v-29.39c0-6.18,5.02-11.18,11.2-11.16l61.62,.05c6.17,.02,11.19-4.98,11.19-11.15v-18.23c0-6.14-4.97-11.13-11.11-11.15l-72.9-.09-25.69-.09c-8.19-.03-14.85,6.61-14.85,14.8v102.99c0,8.05,6.52,14.57,14.57,14.57l124.8-.18c5.98,0,10.82-4.84,10.82-10.82v-18.89c0-5.98-4.84-10.82-10.82-10.82l-88.22,.18Z"/>
                    <path className="cls-3" d="M752.66,42.32h-194.17c-4.81,0-9.1,3.04-10.7,7.58l-11.36,32.31-25.51,68.27,1.27,14.76-8.49-19.69h.02s0-.02-.01-.03c-10.85-30.63-24.12-69.15-34.59-98.69-2.27-6.4-8.32-10.67-15.11-10.67l-31.9-.32c-1.6,0-3.46,1.94-2.87,3.42l85.9,224.22c.13,.33,.44,.55,.79,.57l2.68,.12c1.82,.08,3.49-1.01,4.14-2.71,22.68-58.5,44.86-115.92,66.56-171.91,1.63-4.22,5.69-6.98,10.21-6.98l56.57,.07h106.56c5.87,0,10.63-4.76,10.63-10.63v-19.07c0-5.87-4.76-10.63-10.63-10.63Z"/>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
        <div className="leading-tight">
          <div className="text-xl font-semibold tracking-tight text-[color:var(--nrve-primary-strong)]">nrve</div>
          <div className="text-xs text-[color:var(--nrve-primary)]/80 -mt-0.5">Mental health companion</div>
        </div>
      </div>
    </div>
  </header>
);

const MoodAssessment: React.FC<{ onComplete: (mood: string) => void }> = ({ onComplete }) => {
  const moods = [
    { id: 'sunny', emoji: '☀️', label: 'Sunny', description: 'Feeling bright and positive' },
    { id: 'cloudy', emoji: '☁️', label: 'Cloudy', description: 'A bit uncertain or mixed' },
    { id: 'rainy', emoji: '🌧️', label: 'Rainy', description: 'Feeling down or sad' },
    { id: 'stormy', emoji: '⛈️', label: 'Stormy', description: 'Really struggling today' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 border border-[color:var(--nrve-primary)]/20">
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">How are you feeling today?</div>
          <div className="text-sm text-[color:var(--nrve-ink)]/60">Choose the weather that matches your mood</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {moods.map(mood => (
            <button
              key={mood.id}
              onClick={() => onComplete(mood.id)}
              className="flex flex-col items-center p-4 rounded-xl border border-[color:var(--nrve-primary)]/20 hover:border-[color:var(--nrve-primary)]/40 hover:bg-[color:var(--nrve-surface)] transition-all bg-white"
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className="font-medium text-[color:var(--nrve-ink)]">{mood.label}</div>
              <div className="text-xs text-[color:var(--nrve-ink)]/60 text-center">{mood.description}</div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ChatMain: React.FC<{ messages: ChatMessage[]; onSend: (t: string)=>void; sending: boolean; }> = ({ messages, onSend, sending }) => {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); if (text.trim()) { onSend(text.trim()); setText(""); } }
  }
  return (
    <div className="flex-1 grid grid-rows-[1fr_auto] h-[calc(100vh-64px)] md:h-[calc(100vh-72px)]">
      <div className="overflow-y-auto pt-6 pb-24 px-2 sm:px-4">
        <ul className="max-w-3xl mx-auto space-y-4">
          {messages.map(m => (
            <li key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`${m.role === "user" ? "text-white bg-[color:var(--nrve-primary-strong)]" : "bg-white text-[color:var(--nrve-ink)] border border-[color:var(--nrve-primary)]/10"} max-w-[85%] rounded-2xl px-4 py-3 shadow-sm`}>
                <div className="text-xs opacity-80 mb-1">{m.role === "user" ? "You" : "NRVE"} · {formatStamp(m.time)}</div>
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            </li>
          ))}
        </ul>
        <div ref={endRef} />
      </div>
      <div className="sticky bottom-4 px-2 sm:px-4">
        <div className="max-w-3xl mx-auto bg-white border border-[color:var(--nrve-primary)]/20 rounded-2xl shadow-md p-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind… (Cmd/Ctrl+Enter to send)"
            className="w-full resize-none outline-none min-h-[88px] bg-white text-[color:var(--nrve-ink)]"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-[color:var(--nrve-ink)]/60">Private by default. NRVE won’t send unless you hit Send.</div>
            <button
              disabled={!text.trim() || sending}
              onClick={() => { if (!text.trim()) return; onSend(text.trim()); setText(""); }}
              className="px-4 py-2 rounded-xl bg-[color:var(--nrve-primary)] text-white disabled:opacity-40 hover:bg-[color:var(--nrve-primary-strong)]"
            >{sending ? "Thinking…" : "Send"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JournalSidebar: React.FC<{
  entries: JournalEntry[];
  draft: string;
  setDraft: (v: string) => void;
  onSave: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
}> = ({ entries, draft, setDraft, onSave, onSelect, onDelete, selectedId }) => {
  return (
    <aside className="w-full md:w-[360px] shrink-0 border-r border-[color:var(--nrve-primary)]/15 bg-[color:var(--nrve-surface)] h-[calc(100vh-64px)] md:h-[calc(100vh-72px)] grid grid-rows-[auto_auto_1fr]">
      <div className="p-4 border-b border-[color:var(--nrve-primary)]/15 bg-white/70 backdrop-blur">
        <div className="text-sm font-semibold text-[color:var(--nrve-primary-strong)]">Journaling</div>
        <div className="text-xs text-[color:var(--nrve-ink)]/60">Write freely. Save to keep it.</div>
      </div>
      <div className="p-3 border-b border-[color:var(--nrve-primary)]/15 bg-white">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Type your thoughts…"
          className="w-full min-h-[120px] outline-none bg-white rounded-xl border border-[color:var(--nrve-primary)]/20 p-3 shadow-sm text-[color:var(--nrve-ink)]"
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-[11px] text-[color:var(--nrve-ink)]/60">Title is the first line.</div>
          <button onClick={onSave} disabled={!draft.trim()} className="px-3 py-1.5 rounded-lg bg-[color:var(--nrve-primary)] text-white disabled:opacity-40 hover:bg-[color:var(--nrve-primary-strong)] text-sm">Save</button>
        </div>
      </div>
      <div className="overflow-y-auto p-2">
        {entries.length === 0 && <div className="text-[color:var(--nrve-ink)]/60 text-sm px-2 py-4">No entries yet.</div>}
        <ul className="space-y-2">
          {entries.map(e => (
            <li key={e.id}>
              <div className={`group border rounded-xl p-3 bg-white hover:shadow-sm ${selectedId === e.id ? "border-[color:var(--nrve-primary)]" : "border-[color:var(--nrve-primary)]/15"}`}>
                <button onClick={() => onSelect(e.id)} className="text-left w-full">
                  <div className="text-sm font-medium truncate text-[color:var(--nrve-ink)]">{e.title}</div>
                  <div className="text-[11px] text-[color:var(--nrve-ink)]/60">{formatStamp(e.updatedAt || e.createdAt)}</div>
                </button>
                <div className="mt-2 text-xs text-[color:var(--nrve-ink)]/70 line-clamp-3 whitespace-pre-wrap">{e.text}</div>
                <div className="mt-2 flex justify-end">
                  <button onClick={() => onDelete(e.id)} className="text-rose-600 border border-rose-200 hover:bg-rose-50 px-2 py-1 rounded-md text-xs">Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

const NRVEApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uuid(), role: "bot", text: "Hi, I'm NRVE. I'm here to listen. What's on your mind today?", time: nowISO() }
  ]);
  const [sending, setSending] = useState(false);
  const [showMoodAssessment, setShowMoodAssessment] = useState(false);
  const [assessingMood, setAssessingMood] = useState(false);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Check if mood assessment is needed on mount
  useEffect(() => {
    setShowMoodAssessment(true);
  }, []);

  // Load journals on mount
  useEffect(() => {
    api<JournalEntry[]>("/api/journal").then(setEntries).catch(()=>{});
  }, []);

  const themeVars: CSSVars = {
    "--nrve-primary": "#884bff",
    "--nrve-primary-strong": "#6a3acc",
    "--nrve-accent": "#3df9ff",
    "--nrve-surface": "#f8f5ff",
    "--nrve-ink": "#090b06",
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
    const payload = { text: draft };
    const created = await api<JournalEntry>("/api/journal", { method: "POST", body: JSON.stringify(payload) });
    setEntries(prev => [created, ...prev]);
    setDraft("");
    setSelectedId(created.id);
  }

  async function selectEntry(id: string) {
    setSelectedId(id);
    // could add editing in place later
  }

  async function deleteEntry(id: string) {
    await api(`/api/journal/${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id != id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div id="nrve-root" style={themeVars} className="min-h-screen text-[color:var(--nrve-ink)] bg-[radial-gradient(1200px_600px_at_50%_0%,var(--nrve-surface),white)]">
      <Header />
      {showMoodAssessment ? (
        <MoodAssessment onComplete={handleMoodAssessment} />
      ) : (
        <>
          <div className="max-w-6xl mx-auto flex gap-0 md:gap-4 px-0 sm:px-2">
            <JournalSidebar
              entries={entries}
              draft={draft}
              setDraft={setDraft}
              onSave={saveDraft}
              onSelect={selectEntry}
              onDelete={deleteEntry}
              selectedId={selectedId}
            />
            <ChatMain messages={messages} onSend={handleSend} sending={sending} />
          </div>
          <footer className="py-6 text-center text-xs text-[color:var(--nrve-ink)]/60">
            © {new Date().getFullYear()} nrve · Journals saved on server when you click Save
          </footer>
        </>
      )}
    </div>
  );
};

export default NRVEApp;
