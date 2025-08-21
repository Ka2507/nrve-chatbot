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
  const lines = String(text).split(/\n|\r/)
  const title = lines[0].slice(0,60) || 'Untitled entry'
  
  // Extract preview: get the first 10 characters of the content after the title
  const contentAfterTitle = String(text).replace(lines[0], '').trim()
  const preview = contentAfterTitle.slice(0, 10)
  
  const entry = { id: uuid(), text, title, preview, createdAt: time, updatedAt: time, favorite: false }
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

app.patch('/api/journal/:id/favorite', (req, res) => {
  const { id } = req.params
  const { favorite } = req.body || {}
  const db = readDB()
  const entry = db.entries.find(e => e.id === id)
  if (!entry) return res.status(404).json({ error: 'entry not found' })
  
  entry.favorite = Boolean(favorite)
  entry.updatedAt = new Date().toISOString()
  writeDB(db)
  res.json(entry)
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

// --- Prompts API ---
app.post('/api/prompt', async (req, res) => {
  const { promptType, input } = req.body || {}
  if (!promptType || !input || !String(input).trim()) {
    return res.status(400).json({ error: 'promptType and input required' })
  }

  try {
    let prompt = ''
    
    switch (promptType) {
      case 'artist':
        prompt = `Provide a brief, accurate explanation of what influenced ${input} as a music artist. Focus on their musical influences, inspirations, and what shaped their creative style. This should only cover music-related artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is up-to-date and factual.`
        break
      case 'place':
        prompt = `List 3-5 famous or notable music artists who visited or are from ${input}. Include brief context about their connection to this location. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      case 'location':
        prompt = `List 3-5 famous music artists who are from ${input}. Include brief context about their connection to this location and their musical contributions. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      case 'ethnicity':
        prompt = `List 3-5 famous music artists who are of ${input} ethnicity. Include brief context about their background and musical contributions. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and respectful.`
        break
      case 'car':
        prompt = `List 3-5 famous music artists who are known to drive or own ${input} cars. Include brief context about their car preferences and any public mentions of this vehicle. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      case 'gaming':
        prompt = `List 3-5 famous music artists who are known to play games on ${input}. Include brief context about their gaming preferences and any public mentions of this gaming platform. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      case 'videogame':
        prompt = `List 3-5 famous music artists who are known to play ${input}. Include brief context about their gaming preferences and any public mentions of this video game. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      case 'fashion':
        prompt = `List 3-5 famous music artists who are known for ${input} fashion style. Include brief context about their fashion choices and how they express this style. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      case 'rolemodel':
        prompt = `List 3-5 famous music artists who are related to or influenced by ${input} as a role model. Include brief context about their connection or how they've been inspired by this person. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      case 'food':
        prompt = `List 3-5 famous music artists who are known to enjoy ${input}. Include brief context about their food preferences and any public mentions of this food. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      case 'spendtime':
        prompt = `List 3-5 famous music artists who are known to spend significant time at ${input}. Include brief context about their connection to this place and why they spend time there. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      case 'era':
        prompt = `List 3-5 famous music artists who were prominent during the ${input} era. Include brief context about their musical contributions and impact during that time period. Focus only on music artists (singers, producers, DJs, bands, etc.). Keep it under 150 words and ensure the information is accurate and up-to-date.`
        break
      default:
        return res.status(400).json({ error: 'invalid prompt type' })
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const reply = response.text().trim() || "I couldn't find specific information about that. Could you try a different artist or location?"
    res.json({ reply })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'prompt_error', details: String(err) })
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log('NRVE server on http://localhost:'+PORT))
