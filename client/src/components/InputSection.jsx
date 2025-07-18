// src/components/InputSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getGeminiReply } from '../services/geminiApi';
import { franc } from 'franc';
function InputSection({ onReply }) {
  // State
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputMethod, setInputMethod] = useState(null);
  const [ttsVoices, setTtsVoices] = useState([]);

  // Refs
  const silenceTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // User and language
  const user = getAuth().currentUser;
  const userLang = localStorage.getItem('lang') || 'en-IN';

  // Initialize TTS voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setTtsVoices(voices);
      if (voices.length === 0) {
        setTimeout(loadVoices, 200);
      }
    };

    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Enhanced TTS function with multiple fallbacks
  const speakResponse = async (text, lang) => {
    try {
      // 1. First try: Google TTS via backend
      await speakWithBackendTTS(text, lang);
    } catch (error) {
      console.error('Backend TTS failed, trying browser TTS:', error);
      
      // 2. Second try: Browser TTS with exact voice match
      if (!speakWithBrowserTTS(text, lang, true)) {
        // 3. Third try: Browser TTS with language family match
        if (!speakWithBrowserTTS(text, lang, false)) {
          // 4. Final fallback: Use default English voice
          speakWithBrowserTTS(
            'Response could not be spoken in your language', 
            'en-US',
            true
          );
        }
      }
    }
  };

  // Backend TTS implementation
  const speakWithBackendTTS = async (text, lang) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const response = await fetch('https://ja-ten.vercel.app/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        lang: getOptimizedLanguageCode(lang)
      })
    });

    if (!response.ok) throw new Error('TTS request failed');

    const data = await response.json();
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    audioRef.current = audio;
    
    return new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  };

  // Browser TTS implementation
  const speakWithBrowserTTS = (text, lang, exactMatch) => {
    const synth = window.speechSynthesis;
    if (!synth) return false;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;

    const voice = findBestVoice(lang, exactMatch);
    if (!voice) return false;

    utterance.voice = voice;
    synth.speak(utterance);
    return true;
  };

  // Voice selection logic
  const findBestVoice = (lang, exactMatch) => {
    const langPrefix = lang.split('-')[0];
    const voices = ttsVoices;

    if (exactMatch) {
      // Try exact match first
      return voices.find(v => v.lang === lang) || 
             voices.find(v => v.lang.replace('_', '-') === lang);
    } else {
      // Then try language family match
      return voices.find(v => v.lang.startsWith(langPrefix)) ||
             voices.find(v => v.lang.split('-')[0] === langPrefix) ||
             voices.find(v => v.lang.split('_')[0] === langPrefix);
    }
  };

  // Language code optimization
  const getOptimizedLanguageCode = (lang) => {
    const optimizedMap = {
      'hi-IN': 'hi-IN', 'en-IN': 'en-IN', 'ta-IN': 'ta-IN',
      'te-IN': 'te-IN', 'kn-IN': 'kn-IN', 'ml-IN': 'ml-IN',
      'bn-IN': 'bn-IN', 'gu-IN': 'gu-IN', 'mr-IN': 'mr-IN',
      'pa-IN': 'pa-IN', 'ur-IN': 'ur-IN', 'or-IN': 'or-IN',
      'fr-IN': 'fr-FR', 'es-IN': 'es-ES', 'de-IN': 'de-DE'
    };
    return optimizedMap[lang] || lang;
  };

  // Language detection (enhanced for Indian languages)
  const detectLanguage = (text) => {
    if (text.length < 3) return userLang;
    
    const languageMap = {
      hin: 'hi-IN', eng: 'en-IN', tam: 'ta-IN', tel: 'te-IN',
      kan: 'kn-IN', mal: 'ml-IN', ben: 'bn-IN', guj: 'gu-IN',
      pan: 'pa-IN', mar: 'mr-IN', ori: 'or-IN', urd: 'ur-IN',
      spa: 'es-ES', fra: 'fr-FR', deu: 'de-DE', ita: 'it-IT'
    };
    
    const code = franc(text, { 
      minLength: 3,
      only: Object.keys(languageMap),
      whitelist: ['hin', 'eng', 'tam', 'tel', 'kan', 'mal', 'ben', 'guj', 'pan', 'mar', 'ori', 'urd']
    });
    
    return languageMap[code] || userLang;
  };

  // Speech recognition functions
  const stopListening = () => {
    clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = userLang;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = true;

    recognitionRef.current.onresult = (event) => {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(stopListening, 3000);

      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      if (event.results[event.results.length - 1].isFinal) {
        setInputMethod('speech');
        handleSubmit(transcript, detectLanguage(transcript));
      } else {
        setInput(transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      stopListening();
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognitionRef.current.start();
    silenceTimerRef.current = setTimeout(stopListening, 3000);
  };

  // Handle form submission
  const handleSubmit = async (textVal, forcedLang) => {
    const finalInput = textVal || input.trim();
    if (!finalInput) return;

    setIsProcessing(true);
    try {
      const responseLang = forcedLang || detectLanguage(finalInput);
      const langCode = responseLang.slice(0, 2);

      const prompt = `You are a wise, emotionally strong Indian woman.
Give a short, warm reply in ${langCode} (2-3 lines).
Provide emotional support and health suggestions for pregnancy-related concerns.
User said: "${finalInput}"`;

      const reply = await getGeminiReply(prompt, langCode);

      // Update UI and speak response
      onReply(reply, responseLang, inputMethod || 'text');
      await speakResponse(reply, responseLang);
      setInput('');
      setInputMethod(null);

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'entries'), {
          input: finalInput,
          response: reply,
          lang: responseLang,
          inputMethod: inputMethod || 'text',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error:', error);
      const fallback = userLang.startsWith('hi')
        ? 'क्षमा करें, तकनीकी समस्या आई है। कृपया पुनः प्रयास करें।'
        : 'Sorry, there was a technical issue. Please try again.';
      onReply(fallback, userLang, inputMethod || 'text');
      speakResponse(fallback, userLang);
    } finally {
      setIsProcessing(false);
    }
  };

  // Translations for UI
  const getTranslations = (lang) => {
    const translations = {
      'hi-IN': { ph: 'जननी से बात करें...', send: 'भेजें', mic: 'बोलें' },
      'te-IN': { ph: 'జననితో మాట్లాడండి...', send: 'పంపు', mic: 'మాట్లాడు' },
      'ta-IN': { ph: 'ஜனனியுடன் பேசுங்கள்...', send: 'அனுப்பு', mic: 'பேச' },
      'kn-IN': { ph: 'ಜನನಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ...', send: 'ಕಳುಹಿಸಿ', mic: 'ಮಾತನಾಡಿ' },
      'mr-IN': { ph: 'जननीसोबत बोला...', send: 'पाठवा', mic: 'बोला' },
      'bn-IN': { ph: 'জননির সঙ্গে কথা বলুন...', send: 'পাঠান', mic: 'বলুন' },
      'gu-IN': { ph: 'જનની સાથે વાત કરો...', send: 'મોકલો', mic: 'બોલો' },
      'ml-IN': { ph: 'ജനനിയുമായി സംസാരിക്കുക...', send: 'അയയ്ക്കുക', mic: 'സംസാരിക്കുക' },
      'pa-IN': { ph: 'ਜਨਨੀ ਨਾਲ ਗੱਲ ਕਰੋ...', send: 'ਭੇਜੋ', mic: 'ਬੋਲੋ' },
      'ur-IN': { ph: 'اپنا سوال لکھیں...', send: 'بھیجیں', mic: 'بولیں' },
      'or-IN': { ph: 'ଜନନୀ ସହିତ କଥା ହୁଅ...', send: 'ପଠାନ୍ତୁ', mic: 'କହନ୍ତୁ' },
      default: { ph: 'Talk to Janani...', send: 'Send', mic: 'Speak' }
    };
    return translations[lang] || translations.default;
  };

  const { ph: placeholder, send, mic: speakLabel } = getTranslations(userLang);

  return (
    <div className="p-4 bg-white shadow-lg rounded-xl max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1 border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-pink-400"
          disabled={isProcessing}
        />
        
        <button
          onClick={() => handleSubmit()}
          disabled={isProcessing}
          className="px-4 py-3 rounded-lg bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? '...' : send}
        </button>
        
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`p-3 rounded-lg ${isListening 
            ? 'bg-red-500 animate-pulse' 
            : 'bg-pink-500'} text-white hover:bg-pink-600 disabled:opacity-50 transition-colors`}
          aria-label={speakLabel}
        >
          {isProcessing ? '...' : (isListening ? '🛑' : '🎙️')}
        </button>
      </div>
      
      {isListening && (
        <div className="mt-2 text-sm text-pink-600 animate-pulse">
          Listening... Speak now
        </div>
      )}
    </div>
  );
}

export default InputSection;