import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────
   MALAYALAM → MANGLISH TRANSLITERATION TABLE
   ───────────────────────────────────────────── */
const ML_TO_MANGLISH: Record<string, string> = {
  'അ': 'a', 'ആ': 'aa', 'ഇ': 'i', 'ഈ': 'ee',
  'ഉ': 'u', 'ഊ': 'oo', 'ഋ': 'ri', 'എ': 'e',
  'ഏ': 'ae', 'ഐ': 'ai', 'ഒ': 'o', 'ഓ': 'o',
  'ഔ': 'au', 'അം': 'am', 'അഃ': 'ah',
  'ക': 'k', 'ഖ': 'kh', 'ഗ': 'g', 'ഘ': 'gh', 'ങ': 'ng',
  'ച': 'ch', 'ഛ': 'chh', 'ജ': 'j', 'ഝ': 'jh', 'ഞ': 'nj',
  'ട': 't', 'ഠ': 'th', 'ഡ': 'd', 'ഢ': 'dh', 'ണ': 'n',
  'ത': 'th', 'ഥ': 'th', 'ദ': 'd', 'ധ': 'dh', 'ന': 'n',
  'പ': 'p', 'ഫ': 'ph', 'ബ': 'b', 'ഭ': 'bh', 'മ': 'm',
  'യ': 'y', 'ര': 'r', 'ല': 'l', 'വ': 'v', 'ശ': 'sh',
  'ഷ': 'sh', 'സ': 's', 'ഹ': 'h', 'ള': 'l', 'ഴ': 'zh', 'റ': 'r',
  'ാ': 'aa', 'ി': 'i', 'ീ': 'ee', 'ു': 'u', 'ൂ': 'oo',
  'ൃ': 'ri', 'െ': 'e', 'േ': 'ae', 'ൈ': 'ai', 'ൊ': 'o',
  'ോ': 'o', 'ൌ': 'au', 'ൗ': 'au',
  'ം': 'm', 'ഃ': 'h', '്': '',
  'ൻ': 'n', 'ൾ': 'l', 'ൽ': 'l', 'ൺ': 'n', 'ൿ': 'k', 'ർ': 'r',
  '൧': '1', '൨': '2', '൩': '3', '൪': '4', '൫': '5',
  '൬': '6', '൭': '7', '൮': '8', '൯': '9', '൦': '0',
};

const MALAYALAM_CONSONANTS = new Set([
  'ക','ഖ','ഗ','ഘ','ങ','ച','ഛ','ജ','ഝ','ഞ',
  'ട','ഠ','ഡ','ഢ','ണ','ത','ഥ','ദ','ധ','ന',
  'പ','ഫ','ബ','ഭ','മ','യ','ര','ല','വ','ശ',
  'ഷ','സ','ഹ','ള','ഴ','റ',
]);

const MALAYALAM_MATRAS = new Set([
  'ാ','ി','ീ','ു','ൂ','ൃ','െ','േ','ൈ','ൊ','ോ','ൌ','ൗ','്',
]);

function malayalamToManglish(text: string): string {
  if (!text?.trim()) return '';
  let result = '';
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const twoChar = ch + (chars[i + 1] || '');
    if (ML_TO_MANGLISH[twoChar] !== undefined) {
      result += ML_TO_MANGLISH[twoChar];
      i++;
      continue;
    }
    if (ML_TO_MANGLISH[ch] !== undefined) {
      const mapped = ML_TO_MANGLISH[ch];
      const nextCh = chars[i + 1];
      const nextIsMatra = nextCh ? MALAYALAM_MATRAS.has(nextCh) : false;
      result += mapped;
      if (MALAYALAM_CONSONANTS.has(ch) && !nextIsMatra && mapped !== '') {
        result += 'a';
      }
      continue;
    }
    result += ch;
  }
  return result.replace(/\s+/g, ' ').trim();
}

/* ─────────────────────────────────────────────
   TRANSLATION HELPERS
   ───────────────────────────────────────────── */
const TRANSLATE_LANG_CODES: Record<string, string> = {
  english: 'en', tamil: 'ta', hindi: 'hi', arabic: 'ar',
};

async function translateText(text: string, targetLang: string): Promise<string> {
  const langCode = TRANSLATE_LANG_CODES[targetLang];
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ml&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Translation service error (HTTP ${resp.status})`);
  const data = await resp.json();
  return data[0].map((chunk: any) => chunk[0]).filter(Boolean).join('');
}

async function getManglish(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ml&tl=en&dt=t&dt=rm&q=${encodeURIComponent(text)}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('network');
    const data = await resp.json();
    const romanized = data[0]
      .map((chunk: any) => (chunk && chunk[3]) || '')
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (romanized) return romanized;
  } catch (e) {
    console.warn('Manglish romanization API failed, using built-in fallback:', e);
  }
  return malayalamToManglish(text);
}

/* ─────────────────────────────────────────────
   TTS (Text-to-Speech) Helper
   ───────────────────────────────────────────── */
const TTS_LANG: Record<string, string> = {
  manglish: 'en-IN', english: 'en-US', tamil: 'ta-IN', hindi: 'hi-IN', arabic: 'ar-SA',
};

function getBestVoice(locale: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  let voice = voices.find(v => v.lang === locale);
  if (voice) return voice;
  const prefix = locale.split('-')[0];
  voice = voices.find(v => v.lang.startsWith(prefix));
  return voice || null;
}

/* ─────────────────────────────────────────────
   LANGUAGE META
   ───────────────────────────────────────────── */
const LANG_META: Record<string, { flag: string; name: string }> = {
  manglish: { flag: '🔤', name: 'Manglish' },
  english:  { flag: '🇬🇧', name: 'English' },
  tamil:    { flag: '🇮🇳', name: 'Tamil' },
  hindi:    { flag: '🇮🇳', name: 'Hindi' },
  arabic:   { flag: '🇦🇪', name: 'Arabic' },
};

type StatusType = 'ready' | 'listening' | 'error';

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */
interface VoiceTranslatorProps {
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const VoiceTranslator: React.FC<VoiceTranslatorProps> = ({ showToast }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [currentLang, setCurrentLang] = useState('manglish');
  const [outputText, setOutputText] = useState('');
  const [translating, setTranslating] = useState(false);
  const [status, setStatus] = useState<StatusType>('ready');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const translateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    showToast?.(msg, type);
  }, [showToast]);

  // Cancel TTS
  const cancelTTS = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Translation
  const doTranslation = useCallback(async (text: string, lang: string) => {
    if (!text.trim()) return;
    cancelTTS();
    setTranslating(true);
    try {
      let result: string;
      if (lang === 'manglish') {
        result = await getManglish(text);
      } else {
        result = await translateText(text, lang);
      }
      setOutputText(result);
    } catch (err: any) {
      toast(`⚠️ Translation failed: ${err.message}`, 'error');
    } finally {
      setTranslating(false);
    }
  }, [cancelTTS, toast]);

  // Debounced translation
  const scheduleTranslation = useCallback((text: string, lang: string) => {
    if (translateTimerRef.current) clearTimeout(translateTimerRef.current);
    if (!text) return;
    translateTimerRef.current = setTimeout(() => doTranslation(text, lang), 800);
  }, [doTranslation]);

  // Speech Recognition
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setStatus('error');
      return;
    }

    const recognition = new SR();
    recognition.lang = 'ml-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isRecordingRef.current = true;
      setIsRecording(true);
      setStatus('listening');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = finalTranscriptRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t + ' ';
        } else {
          interim += t;
        }
      }
      finalTranscriptRef.current = final;
      setFinalTranscript(final.trim());
      setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        if (isRecordingRef.current) {
          try { recognition.stop(); } catch(_) {}
          setTimeout(() => {
            if (isRecordingRef.current) try { recognition.start(); } catch(_) {}
          }, 200);
        }
        return;
      }
      if (event.error === 'aborted') return;
      let msg = '';
      switch (event.error) {
        case 'not-allowed':
          msg = '🎤 Microphone access denied. Please allow microphone permission.';
          break;
        case 'network':
          msg = '🌐 Network error. Please check your connection.';
          break;
        default:
          msg = `⚠️ Speech error: ${event.error}`;
      }
      if (msg) toast(msg, 'error');
      isRecordingRef.current = false;
      setIsRecording(false);
      setStatus('ready');
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try { recognition.start(); } catch(_) {}
      } else {
        setIsRecording(false);
        setStatus('ready');
        setInterimText('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch(_) {}
    };
  }, [toast]);

  // Auto-translate on transcript change
  useEffect(() => {
    if (finalTranscript.trim()) {
      scheduleTranslation(finalTranscript.trim(), currentLang);
    }
  }, [finalTranscript, currentLang, scheduleTranslation]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast('❌ Speech Recognition not available.', 'error');
      return;
    }
    finalTranscriptRef.current = '';
    setFinalTranscript('');
    setInterimText('');
    setOutputText('');
    isRecordingRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (_) {
      try { recognitionRef.current.stop(); } catch(__) {}
      setTimeout(() => { try { recognitionRef.current.start(); } catch(__) {} }, 300);
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    try { recognitionRef.current?.stop(); } catch(_) {}
    setStatus('ready');
    setInterimText('');
    if (finalTranscriptRef.current.trim()) {
      doTranslation(finalTranscriptRef.current.trim(), currentLang);
    }
  };

  const toggleRecording = () => {
    isRecording ? stopRecording() : startRecording();
  };

  // Language selection
  const selectLang = (lang: string) => {
    setCurrentLang(lang);
    if (finalTranscript.trim()) {
      doTranslation(finalTranscript.trim(), lang);
    } else {
      setOutputText('');
    }
  };

  // Copy
  const handleCopy = async () => {
    if (!outputText) { toast('⚠️ Nothing to copy yet.', 'warning'); return; }
    try {
      await navigator.clipboard.writeText(outputText);
      toast('✅ Copied to clipboard!', 'success');
    } catch {
      toast('⚠️ Failed to copy.', 'error');
    }
  };

  // Share
  const handleShare = async () => {
    if (!outputText) { toast('⚠️ Nothing to share yet.', 'warning'); return; }
    const shareData = {
      title: 'Voice Translator',
      text: `Malayalam: ${finalTranscript}\n${LANG_META[currentLang].name}: ${outputText}`,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); } catch (e: any) {
        if (e.name !== 'AbortError') toast('⚠️ Share failed.', 'error');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast('📋 Copied to clipboard (Share not supported).', 'info');
      } catch { toast('⚠️ Share not supported.', 'error'); }
    }
  };

  // Clear
  const handleClear = () => {
    if (isRecording) stopRecording();
    cancelTTS();
    finalTranscriptRef.current = '';
    setFinalTranscript('');
    setInterimText('');
    setOutputText('');
    if (translateTimerRef.current) clearTimeout(translateTimerRef.current);
    toast('🗑️ Cleared.', 'info');
  };

  // TTS Listen
  const handleListen = () => {
    if (!outputText) { toast('⚠️ Nothing to read yet.', 'warning'); return; }
    if (!('speechSynthesis' in window)) { toast('❌ TTS not supported.', 'error'); return; }

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const trySpeak = () => {
      const locale = TTS_LANG[currentLang] || 'en-US';
      const utterance = new SpeechSynthesisUtterance(outputText);
      const voice = getBestVoice(locale);
      utterance.lang = locale;
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        setIsSpeaking(false);
        if (e.error !== 'interrupted') toast(`⚠️ TTS error: ${e.error}`, 'error');
      };
      speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length) {
      trySpeak();
    } else {
      speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.onvoiceschanged = null;
        trySpeak();
      };
      setTimeout(() => { if (!isSpeaking) trySpeak(); }, 300);
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        toggleRecording();
      }
      if (e.code === 'Escape' && isRecordingRef.current) {
        stopRecording();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const langList = ['manglish', 'english', 'tamil', 'hindi', 'arabic'] as const;

  return (
    <div className="relative min-h-full">
      {/* Scoped CSS */}
      <style>{`
        .vt-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: vtBlobFloat 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .vt-blob-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, hsl(255, 80%, 55%), transparent 70%);
          top: -120px; left: -80px;
        }
        .vt-blob-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, hsl(190, 90%, 50%), transparent 70%);
          bottom: -80px; right: -60px;
          animation-delay: -4s;
        }
        .vt-blob-3 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, hsl(320, 80%, 55%), transparent 70%);
          top: 40%; left: 50%;
          transform: translateX(-50%);
          animation-delay: -8s;
        }
        @keyframes vtBlobFloat {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(30px, -20px) scale(1.15); }
        }

        .vt-card {
          background: hsla(240, 20%, 14%, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid hsla(255, 60%, 70%, 0.18);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 8px 40px hsla(255, 80%, 30%, 0.15);
        }

        .vt-mic-btn {
          width: 80px; height: 80px;
          border-radius: 50%;
          border: 2px solid hsla(255, 80%, 65%, 0.5);
          background: linear-gradient(135deg, hsl(255, 80%, 55%), hsl(280, 80%, 55%));
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 2;
        }
        .vt-mic-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 0 30px hsla(255, 80%, 55%, 0.5);
        }
        .vt-mic-btn.recording {
          background: linear-gradient(135deg, hsl(0, 75%, 55%), hsl(340, 80%, 55%));
          border-color: hsla(0, 75%, 60%, 0.7);
          animation: vtMicPulse 1.5s ease-in-out infinite;
        }
        @keyframes vtMicPulse {
          0%, 100% { box-shadow: 0 0 15px hsla(0, 75%, 55%, 0.5); }
          50% { box-shadow: 0 0 40px hsla(0, 75%, 60%, 0.7); }
        }

        .vt-ripple {
          position: absolute;
          border-radius: 50%;
          border: 2px solid hsla(255, 80%, 65%, 0.3);
          pointer-events: none;
          opacity: 0;
          width: 100px; height: 100px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
        }
        .vt-ripples-active .vt-ripple {
          animation: vtRipple 2s ease-out infinite;
        }
        .vt-ripple:nth-child(2) { animation-delay: 0.5s; }
        .vt-ripple:nth-child(3) { animation-delay: 1s; }
        @keyframes vtRipple {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }

        .vt-lang-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          padding: 0.6rem 1rem;
          border-radius: 14px;
          border: 1px solid hsla(255, 60%, 70%, 0.15);
          background: hsla(240, 20%, 16%, 0.6);
          color: hsl(240, 10%, 65%);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          flex: 1;
          min-width: 80px;
          font-family: 'Outfit', system-ui, sans-serif;
        }
        .vt-lang-chip:hover {
          background: hsla(255, 80%, 40%, 0.2);
          border-color: hsla(255, 80%, 65%, 0.4);
          color: hsl(255, 80%, 80%);
          transform: translateY(-2px);
        }
        .vt-lang-chip.active {
          background: linear-gradient(135deg, hsla(255, 80%, 55%, 0.3), hsla(280, 80%, 55%, 0.15));
          border-color: hsla(255, 80%, 65%, 0.6);
          color: white;
          box-shadow: 0 4px 20px hsla(255, 80%, 50%, 0.25);
        }

        .vt-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.65rem 0.8rem;
          border-radius: 12px;
          border: 1px solid hsla(255, 60%, 70%, 0.18);
          background: hsla(240, 20%, 18%, 0.6);
          color: hsl(240, 10%, 65%);
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .vt-action-btn:hover { transform: translateY(-2px); }
        .vt-action-btn:active { transform: translateY(0) scale(0.97); }

        .vt-listen:hover {
          background: hsla(145, 70%, 35%, 0.25);
          border-color: hsla(145, 70%, 55%, 0.5);
          color: hsl(145, 70%, 55%);
          box-shadow: 0 4px 20px hsla(145, 70%, 45%, 0.2);
        }
        .vt-listen.speaking {
          background: hsla(145, 70%, 30%, 0.35);
          border-color: hsla(145, 70%, 55%, 0.7);
          color: hsl(145, 70%, 55%);
          box-shadow: 0 0 20px hsla(145, 70%, 45%, 0.4);
          animation: vtListenPulse 1.2s ease-in-out infinite;
        }
        @keyframes vtListenPulse {
          0%, 100% { box-shadow: 0 0 14px hsla(145, 70%, 45%, 0.4); }
          50% { box-shadow: 0 0 28px hsla(145, 70%, 55%, 0.65); }
        }

        .vt-copy:hover {
          background: hsla(190, 90%, 40%, 0.25);
          border-color: hsla(190, 90%, 55%, 0.5);
          color: hsl(190, 90%, 55%);
        }
        .vt-share:hover {
          background: hsla(255, 80%, 40%, 0.25);
          border-color: hsla(255, 80%, 65%, 0.5);
          color: hsl(255, 80%, 75%);
        }
        .vt-clear:hover {
          background: hsla(0, 75%, 40%, 0.25);
          border-color: hsla(0, 75%, 60%, 0.5);
          color: hsl(0, 75%, 60%);
        }

        .vt-status-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: hsl(240, 10%, 45%);
        }
        .vt-status-dot.listening {
          background: hsl(145, 70%, 55%);
          box-shadow: 0 0 10px hsla(145, 70%, 55%, 0.6);
          animation: vtDotBlink 1s ease-in-out infinite;
        }
        .vt-status-dot.error {
          background: hsl(0, 75%, 60%);
        }
        @keyframes vtDotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .vt-spinner {
          width: 16px; height: 16px;
          border: 2px solid hsla(255, 80%, 65%, 0.3);
          border-top-color: hsl(255, 80%, 65%);
          border-radius: 50%;
          animation: vtSpin 0.8s linear infinite;
        }
        @keyframes vtSpin {
          to { transform: rotate(360deg); }
        }

        .vt-transcript-box {
          background: hsla(240, 20%, 10%, 0.5);
          border: 1px solid hsla(255, 60%, 70%, 0.1);
          border-radius: 14px;
          padding: 1rem 1.2rem;
        }

        .vt-output-box {
          background: hsla(240, 20%, 10%, 0.5);
          border: 1px solid hsla(255, 60%, 70%, 0.1);
          border-radius: 14px;
          padding: 1.2rem;
          min-height: 80px;
          font-size: 1.05rem;
          line-height: 1.7;
        }
      `}</style>

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="vt-blob vt-blob-1" />
        <div className="vt-blob vt-blob-2" />
        <div className="vt-blob vt-blob-3" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-5 p-4 pt-2 pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗣️</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                Voice Translator
              </h2>
              <p className="text-xs text-zinc-500" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                Malayalam · Real-time Translation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'hsla(240, 20%, 16%, 0.6)', border: '1px solid hsla(255, 60%, 70%, 0.12)' }}>
            <div className={`vt-status-dot ${status}`} />
            <span className="text-xs font-medium text-zinc-400" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
              {status === 'listening' ? 'Listening...' : status === 'error' ? 'Error' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Mic Card */}
        <div className="vt-card">
          <div className="flex items-center gap-2 mb-4 text-xs font-medium text-zinc-400" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
            <span>🎙️</span>
            <span>Voice Input</span>
          </div>

          <div className="flex flex-col items-center gap-3 mb-5">
            <div className={`relative ${isRecording ? 'vt-ripples-active' : ''}`}>
              <div className="vt-ripple" />
              <div className="vt-ripple" />
              <div className="vt-ripple" />
              <button
                className={`vt-mic-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor" />
                    <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-zinc-500" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
              {isRecording ? 'Tap to stop recording' : 'Tap or press Space to speak in Malayalam'}
            </p>
          </div>

          {/* Transcript */}
          <div className="vt-transcript-box">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: 'hsla(255, 80%, 55%, 0.2)', color: 'hsl(255, 80%, 75%)', fontFamily: "'Noto Sans Malayalam', sans-serif" }}>
                മലയാളം
              </span>
              <span className="text-xs text-zinc-500" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                {finalTranscript.length} chars
              </span>
            </div>
            <div className="text-sm text-white min-h-[40px]" style={{ fontFamily: "'Noto Sans Malayalam', 'Outfit', sans-serif", lineHeight: 1.8 }}>
              {finalTranscript || <span className="text-zinc-600">Your Malayalam speech will appear here...</span>}
            </div>
            {interimText && (
              <div className="text-sm text-zinc-500 italic mt-1" style={{ fontFamily: "'Noto Sans Malayalam', 'Outfit', sans-serif" }}>
                {interimText}
              </div>
            )}
          </div>
        </div>

        {/* Language Selector Card */}
        <div className="vt-card">
          <div className="flex items-center gap-2 mb-3 text-xs font-medium text-zinc-400" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
            <span>🌐</span>
            <span>Target Language</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {langList.map(lang => (
              <button
                key={lang}
                className={`vt-lang-chip ${currentLang === lang ? 'active' : ''}`}
                onClick={() => selectLang(lang)}
                aria-pressed={currentLang === lang}
              >
                <span className="text-lg">{LANG_META[lang].flag}</span>
                <span className="text-xs font-semibold">{LANG_META[lang].name}</span>
                <span className="text-[10px] opacity-60">{lang === 'manglish' ? 'Transliteration' : 'Translation'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Output Card */}
        <div className="vt-card">
          <div className="flex items-center gap-2 mb-3 text-xs font-medium text-zinc-400" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
            <span>✨</span>
            <span>Translation</span>
            {translating && (
              <div className="flex items-center gap-1.5 ml-2">
                <div className="vt-spinner" />
                <span className="text-[11px] text-indigo-400">Translating...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background: 'hsla(255, 80%, 55%, 0.15)', color: 'hsl(255, 80%, 80%)', fontFamily: "'Outfit', system-ui, sans-serif" }}>
              <span>{LANG_META[currentLang].flag}</span>
              <span>{LANG_META[currentLang].name}</span>
            </span>
          </div>

          <div className="vt-output-box text-white" style={{ fontFamily: currentLang === 'arabic' ? "'Noto Sans Arabic', sans-serif" : "'Outfit', 'Noto Sans Malayalam', sans-serif", direction: currentLang === 'arabic' ? 'rtl' : 'ltr' }}>
            {outputText || <span className="text-zinc-600 text-sm">Translation will appear here...</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button className={`vt-action-btn vt-listen ${isSpeaking ? 'speaking' : ''}`} onClick={handleListen} aria-label={isSpeaking ? 'Stop speaking' : 'Listen'}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>
            <button className="vt-action-btn vt-copy" onClick={handleCopy} aria-label="Copy">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy</span>
            </button>
            <button className="vt-action-btn vt-share" onClick={handleShare} aria-label="Share">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>Share</span>
            </button>
            <button className="vt-action-btn vt-clear" onClick={handleClear} aria-label="Clear">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="flex flex-col gap-2 px-4 py-3 rounded-2xl text-xs text-zinc-500" style={{ background: 'hsla(240, 20%, 12%, 0.5)', border: '1px solid hsla(255, 60%, 70%, 0.1)', fontFamily: "'Outfit', system-ui, sans-serif" }}>
          <div className="flex items-start gap-2"><span>💡</span><span>Speak clearly in Malayalam. Works best in Chrome or Edge browsers.</span></div>
          <div className="flex items-start gap-2"><span>⚡</span><span>All 5 languages work instantly — no API key or account needed.</span></div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTranslator;
