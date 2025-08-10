import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenerativeAI } from '@google/generative-ai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// --- Simple JSON file DB ---
const dbPath = path.join(__dirname, 'journal.json')
function ensureDB() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ entries: [] }, null, 2))
}
function readDB() {
  ensureDB()
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
}
function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random()*16)|0, v = c === 'x' ? r : (r&0x3)|0x8
    return v.toString(16)
  })
}

// --- Journal API ---
app.get('/api/journal', (req, res) => {
  const db = readDB()
  res.json(db.entries.sort((a,b)=> (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt)))
})

app.get('/api/journal/search', (req, res) => {
  const { q } = req.query || {}
  if (!q) return res.json([])
  
  const db = readDB()
  const searchTerm = String(q).toLowerCase()
  const matches = db.entries.filter(entry => 
    entry.text.toLowerCase().includes(searchTerm) || 
    entry.title.toLowerCase().includes(searchTerm)
  ).slice(0, 3) // Limit to 3 most relevant matches
  
  res.json(matches)
})

app.post('/api/journal', (req, res) => {
  const { text } = req.body || {}
  if (!text || !String(text).trim()) return res.status(400).json({ error: 'text required' })
  const time = new Date().toISOString()
  const entry = { id: uuid(), text, title: String(text).split(/\n|\r/)[0].slice(0,60) || 'Untitled entry', createdAt: time, updatedAt: time }
  const db = readDB()
  db.entries.unshift(entry)
  writeDB(db)
  res.json(entry)
})

app.delete('/api/journal/:id', (req, res) => {
  const { id } = req.params
  const db = readDB()
  const before = db.entries.length
  db.entries = db.entries.filter(e => e.id !== id)
  writeDB(db)
  res.json({ ok: true, removed: before - db.entries.length })
})

// --- Mood Assessment API ---
app.post('/api/mood', async (req, res) => {
  const { mood } = req.body || {}
  if (!mood || !String(mood).trim()) return res.status(400).json({ error: 'mood required' })

  try {
    const moodResponses = {
      'sunny': "That's wonderful! I'm glad you're feeling bright and positive today. What's contributing to this sunny mood?",
      'cloudy': "I understand. Sometimes we have those overcast days. What's on your mind that might be creating those clouds?",
      'rainy': "I hear you. Rainy days can be tough. Would you like to talk about what's bringing on the rain?",
      'stormy': "I'm here with you through the storm. What's feeling particularly challenging right now?"
    }
    
    const reply = moodResponses[mood.toLowerCase()] || "Thank you for sharing how you're feeling. I'm here to listen."
    res.json({ reply, mood })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'mood_error', details: String(err) })
  }
})

// --- Chat API ---
const genAI = new GoogleGenerativeAI('AIzaSyDw8we4_G2v20QOnw9BOtwmZ2so8wdfrkA')
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

app.post('/api/chat', async (req, res) => {
  const { message } = req.body || {}
  if (!message || !String(message).trim()) return res.status(400).json({ error: 'message required' })

  try {
    // Get recent journal entries for context
    const db = readDB()
    const recentEntries = db.entries.slice(0, 5) // Get last 5 entries
    
    // Check if user is asking about specific journal entries or topics
    const messageLower = message.toLowerCase()
    const journalKeywords = ['journal', 'entry', 'wrote', 'wrote about', 'remember when', 'last time', 'before', 'yesterday', 'today']
    const isAskingAboutJournal = journalKeywords.some(keyword => messageLower.includes(keyword))
    
    let journalContext = ''
    if (isAskingAboutJournal) {
      // Search for relevant entries based on the message
      const searchTerms = messageLower.split(' ').filter(word => word.length > 3)
      const relevantEntries = []
      
      for (const term of searchTerms) {
        const matches = db.entries.filter(entry => 
          entry.text.toLowerCase().includes(term) || 
          entry.title.toLowerCase().includes(term)
        )
        relevantEntries.push(...matches)
      }
      
      // Remove duplicates and get unique entries
      const uniqueEntries = relevantEntries.filter((entry, index, self) => 
        index === self.findIndex(e => e.id === entry.id)
      ).slice(0, 3)
      
      if (uniqueEntries.length > 0) {
        journalContext = `\n\nRelevant journal entries:\n${uniqueEntries.map(e => `- ${e.title}: ${e.text.slice(0, 200)}...`).join('\n')}`
      }
    }
    
    // If no specific journal context found, use recent entries
    if (!journalContext && recentEntries.length > 0) {
      journalContext = `\n\nRecent journal entries for context:\n${recentEntries.map(e => `- ${e.title}: ${e.text.slice(0, 200)}...`).join('\n')}`
    }

    const prompt = `You are NRVE, a supportive mental health companion. Be empathetic, brief, and practical. 

IMPORTANT: Only add mental health disclaimers (like "If you're feeling overwhelmed or distressed, please consider reaching out to a mental health professional") when the user is discussing serious mental health concerns, emotional distress, or crisis situations. For general questions, casual conversation, or non-mental health topics, just answer normally without adding disclaimers.

You can reference the user's journal entries when relevant to provide more personalized support. Keep responses under 200 words.

User message: ${message}${journalContext}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const reply = response.text().trim() || "I'm here with you. Tell me more."
    res.json({ reply })
  } catch (err) {
    console.error(err)
    // Fallback mock if API fails
    const canned = [
      'Thanks for sharing that. What part feels most important right now?',
      'I hear you. Would it help to break this into smaller steps?',
      'What\'s one small, kind thing you can do for yourself today?'
    ]
    const reply = canned[Math.floor(Math.random()*canned.length)]
    res.json({ reply })
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log('NRVE server on http://localhost:'+PORT))
