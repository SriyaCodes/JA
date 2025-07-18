// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import fetch from 'cross-fetch';
globalThis.fetch = fetch;

// Import routes
import modelsRoute from './routes/models.js';
import geminiRoute from './routes/gemini.js';
import ttsRoute from './routes/tts.js';  // Add this line

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/models', modelsRoute);
app.use('/api/gemini', geminiRoute);
app.use('/api/tts', ttsRoute);  // Add this line

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('✅ Janani Backend is Running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log(`- http://localhost:${PORT}/api/models`);
  console.log(`- http://localhost:${PORT}/api/gemini`);
  console.log(`- http://localhost:${PORT}/api/tts`);  // Add this line
});