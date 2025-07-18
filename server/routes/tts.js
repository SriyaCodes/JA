// server/api/tts.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Validate API key on startup
if (!process.env.GOOGLE_TTS_API_KEY) {
  console.error('❌ GOOGLE_TTS_API_KEY not set in .env');
  process.exit(1);
}

// Supported languages validation
const SUPPORTED_LANGUAGES = new Set([
  'hi-IN', 'en-IN', 'ta-IN', 'te-IN', 'kn-IN', 
  'ml-IN', 'bn-IN', 'gu-IN', 'mr-IN', 'pa-IN',
  'ur-IN', 'or-IN', 'en-US', 'es-ES', 'fr-FR'
]);

router.post('/', async (req, res) => {
  try {
     console.log('TTS request received');
    const { text, lang } = req.body;
    
    // Input validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Valid text is required' });
    }
    if (!SUPPORTED_LANGUAGES.has(lang)) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // Google TTS API request
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
      {
        input: { text },
        voice: {
          languageCode: lang,
          name: `${lang}-Standard-A` // Using standard voice
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
          pitch: 0,
          sampleRateHertz: 24000 // Better quality for Indian languages
        }
      },
      {
        timeout: 10000 // 10 second timeout
      }
    );

    res.json({ 
      audioContent: response.data.audioContent,
      language: lang,
      length: text.length
    });
    
  } catch (error) {
    console.error('TTS error:', error.message);
    
    // Enhanced error handling
    let status = 500;
    let message = 'TTS generation failed';
    
    if (error.response) {
      status = error.response.status;
      message = error.response.data?.error?.message || message;
    } else if (error.request) {
      message = 'No response from TTS service';
    }
    
    res.status(status).json({ 
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;