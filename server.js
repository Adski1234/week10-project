const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    const allButLast = messages.slice(0, -1);
    const firstUserIndex = allButLast.findIndex(m => m.role === 'user');
    const validHistory = firstUserIndex === -1 ? [] : allButLast.slice(firstUserIndex).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;
    const chat = model.startChat({ history: validHistory });
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();
    res.json({ reply });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));