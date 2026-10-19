import React, { useState, useEffect, useRef, useCallback } from 'react';
import { extractTextFromImage, OCR_LANGUAGES, OcrProgress } from '../services/imageOcr';

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
  manglish: 'en',
  english: 'en',
  malayalam: 'ml',
  tamil: 'ta',
  hindi: 'hi',
  arabic: 'ar',
};

async function translateText(text: string, targetLang: string, sourceLang: string = 'ml'): Promise<string> {
  const langCode = TRANSLATE_LANG_CODES[targetLang] || 'en';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Translation service error (HTTP ${resp.status})`);
  const data = await resp.json();
  return data[0].map((chunk: any) => chunk[0]).filter(Boolean).join('');
}

async function getManglish(text: string, sourceLang: string = 'ml'): Promise<string> {
  try {
    // If text is not Malayalam, first translate to Malayalam
    let mlText = text;
    if (sourceLang !== 'ml') {
      mlText = await translateText(text, 'malayalam', sourceLang);
    }
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ml&tl=en&dt=t&dt=rm&q=${encodeURIComponent(mlText)}`;
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
  manglish: 'en-IN',
  english: 'en-US',
  malayalam: 'ml-IN',
  tamil: 'ta-IN',
  hindi: 'hi-IN',
  arabic: 'ar-SA',
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
   LANGUAGE METADATA
   ───────────────────────────────────────────── */
interface InputLangOption {
  code: string;
  name: string;
  sub: string;
  flag: string;
  gtxCode: string;
}

const INPUT_LANGUAGES: InputLangOption[] = [
  { code: 'ml-IN', name: 'Malayalam', sub: 'മലയാളം', flag: '🇮🇳', gtxCode: 'ml' },
  { code: 'en-IN', name: 'English', sub: 'India/Global', flag: '🇬🇧', gtxCode: 'en' },
  { code: 'ta-IN', name: 'Tamil', sub: 'தமிழ்', flag: '🇮🇳', gtxCode: 'ta' },
  { code: 'hi-IN', name: 'Hindi', sub: 'हिन्दी', flag: '🇮🇳', gtxCode: 'hi' },
  { code: 'ar-SA', name: 'Arabic', sub: 'العربية', flag: '🇦🇪', gtxCode: 'ar' },
];

const TARGET_LANG_META: Record<string, { flag: string; name: string; desc: string }> = {
  manglish:  { flag: '🔤', name: 'Manglish', desc: 'Transliteration' },
  english:   { flag: '🇬🇧', name: 'English', desc: 'Translation' },
  malayalam: { flag: '🇮🇳', name: 'Malayalam', desc: 'മലയാളം' },
  tamil:     { flag: '🇮🇳', name: 'Tamil', desc: 'தமிழ்' },
  hindi:     { flag: '🇮🇳', name: 'Hindi', desc: 'हिन्दी' },
  arabic:    { flag: '🇦🇪', name: 'Arabic', desc: 'العربية' },
};

type StatusType = 'ready' | 'listening' | 'error';

interface VoiceTranslatorProps {
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const VoiceTranslator: React.FC<VoiceTranslatorProps> = ({ showToast }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [inputLang, setInputLang] = useState('ml-IN');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [currentLang, setCurrentLang] = useState('manglish');
  const [outputText, setOutputText] = useState('');
  const [translating, setTranslating] = useState(false);
  const [status, setStatus] = useState<StatusType>('ready');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [browserSupport, setBrowserSupport] = useState<boolean>(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micTestResult, setMicTestResult] = useState<string | null>(null);
  const [mode, setMode] = useState<'voice' | 'text' | 'image'>('voice');

  // Image OCR state
  const [ocrImageFile, setOcrImageFile] = useState<File | null>(null);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [ocrImageInfo, setOcrImageInfo] = useState<{ name: string; size: string } | null>(null);
  const [ocrLang, setOcrLang] = useState<string>('mal+eng');
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [extractedImageText, setExtractedImageText] = useState<string>('');
  const [ocrTargetLang, setOcrTargetLang] = useState<string>('english');
  const [translatedOcrText, setTranslatedOcrText] = useState<string>('');
  const [isTranslatingOcr, setIsTranslatingOcr] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [copiedOcrExtracted, setCopiedOcrExtracted] = useState<boolean>(false);
  const [copiedOcrTranslated, setCopiedOcrTranslated] = useState<boolean>(false);
  const [copiedBoth, setCopiedBoth] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const imageTranslateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const translateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const resumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toast = useCallback((msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    showToast?.(msg, type);
  }, [showToast]);

  // Check browser speech recognition support on mount
  useEffect(() => {
    const hasSR = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setBrowserSupport(hasSR);
    if (!hasSR) {
      setStatus('error');
      setMode('text');
    }
  }, []);

  // Cancel TTS
  const cancelTTS = useCallback(() => {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }
  }, []);

  // Translation function
  const currentInputMeta = INPUT_LANGUAGES.find(l => l.code === inputLang) || INPUT_LANGUAGES[0];

  const doTranslation = useCallback(async (text: string, targetLang: string, srcLangGtx: string = currentInputMeta.gtxCode) => {
    if (!text.trim()) {
      setOutputText('');
      return;
    }
    cancelTTS();
    setTranslating(true);
    try {
      let result = '';
      if (targetLang === 'manglish') {
        result = await getManglish(text, srcLangGtx);
      } else {
        result = await translateText(text, targetLang, srcLangGtx);
      }
      setOutputText(result);
    } catch (err: any) {
      toast(`⚠️ Translation failed: ${err.message}`, 'error');
    } finally {
      setTranslating(false);
    }
  }, [cancelTTS, currentInputMeta.gtxCode, toast]);

  // Debounced translation
  const scheduleTranslation = useCallback((text: string, targetLang: string) => {
    if (translateTimerRef.current) clearTimeout(translateTimerRef.current);
    if (!text.trim()) {
      setOutputText('');
      return;
    }
    translateTimerRef.current = setTimeout(() => {
      doTranslation(text, targetLang);
    }, 600);
  }, [doTranslation]);

  // Auto-translate on transcript or language changes
  useEffect(() => {
    if (finalTranscript.trim()) {
      scheduleTranslation(finalTranscript.trim(), currentLang);
    }
  }, [finalTranscript, currentLang, scheduleTranslation]);

  // Clean up audio feedback
  const stopAudioFeedback = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  // Stop recording cleanly
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setStatus('ready');
    setInterimText('');
    stopAudioFeedback();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (finalTranscriptRef.current.trim()) {
      doTranslation(finalTranscriptRef.current.trim(), currentLang);
    }
  }, [currentLang, doTranslation, stopAudioFeedback]);

  // Start fresh SpeechRecognition engine
  const startSpeechEngine = useCallback((langCode: string) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
        recognitionRef.current = null;
      }

      const recognition = new SR();
      recognition.lang = langCode;

      // Safari handles continuous = true poorly, single sentence is much safer on Safari
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      recognition.continuous = !isSafari;
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
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'no-speech') {
          // Normal pause in speech, don't crash
          return;
        }
        if (event.error === 'aborted') {
          return;
        }
        if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
          toast('🎤 Microphone access was blocked. Please allow mic access in your browser or macOS settings.', 'error');
          stopRecording();
          return;
        }
        if (event.error === 'network') {
          toast('🌐 Network error: Voice recognition requires an active internet connection in Chrome.', 'error');
          stopRecording();
          return;
        }
        toast(`⚠️ Speech error: ${event.error}`, 'error');
        stopRecording();
      };

      recognition.onend = () => {
        // If still supposed to be recording, restart cleanly (handles Safari or Chrome sentence timeouts)
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (_) {
            // Re-instantiate if needed
            setTimeout(() => {
              if (isRecordingRef.current) {
                const next = startSpeechEngine(langCode);
                try { next?.start(); } catch (__) {}
              }
            }, 150);
          }
        } else {
          setIsRecording(false);
          setStatus('ready');
          setInterimText('');
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    } catch (err: any) {
      console.error('Failed to create SpeechRecognition:', err);
      toast('❌ Could not start speech recognition.', 'error');
      return null;
    }
  }, [stopRecording, toast]);

  // Start recording process
  const startRecording = async () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast('❌ Speech Recognition is not supported by your browser. You can type or use Chrome/Edge.', 'error');
      setBrowserSupport(false);
      setMode('text');
      return;
    }

    finalTranscriptRef.current = '';
    setFinalTranscript('');
    setInterimText('');
    setOutputText('');
    setMicPermissionDenied(false);

    // 1. Request microphone permission explicitly & set up audio level meter
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!isRecordingRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      }
    } catch (err: any) {
      console.warn('Microphone permission check failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermissionDenied(true);
        toast('🎤 Microphone blocked! Click the lock/settings icon in the address bar to Allow microphone.', 'error');
        return;
      }
    }

    // 2. Start speech recognition engine
    isRecordingRef.current = true;
    const recognition = startSpeechEngine(inputLang);
    if (recognition) {
      try {
        recognition.start();
      } catch (e: any) {
        console.warn('Recognition start exception, retrying:', e);
        try { recognition.stop(); } catch (_) {}
        setTimeout(() => {
          try { recognition.start(); } catch (__) {}
        }, 200);
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Switch input language
  const handleInputLangChange = (code: string) => {
    if (isRecording) stopRecording();
    setInputLang(code);
    const meta = INPUT_LANGUAGES.find(l => l.code === code);
    toast(`🎙️ Input set to ${meta?.name || code}`, 'info');
  };

  // Switch target language
  const selectTargetLang = (lang: string) => {
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
      text: `${currentInputMeta.name}: ${finalTranscript}\n${TARGET_LANG_META[currentLang]?.name || currentLang}: ${outputText}`,
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

  // TTS Speech Reader
  const handleSpeak = (textToSpeak: string, langKey: string) => {
    if (!textToSpeak.trim()) { toast('⚠️ Nothing to read yet.', 'warning'); return; }
    if (!('speechSynthesis' in window)) { toast('❌ Text-to-speech not supported.', 'error'); return; }

    if (isSpeaking) {
      cancelTTS();
      return;
    }

    cancelTTS();

    const trySpeak = () => {
      const locale = TTS_LANG[langKey] || 'en-US';
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voice = getBestVoice(locale);
      utterance.lang = locale;
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (resumeIntervalRef.current) {
          clearInterval(resumeIntervalRef.current);
          resumeIntervalRef.current = null;
        }
      };
      utterance.onerror = (e) => {
        setIsSpeaking(false);
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          toast(`⚠️ TTS error: ${e.error}`, 'error');
        }
      };

      // Chrome 15s pause workaround
      resumeIntervalRef.current = setInterval(() => {
        if (!speechSynthesis.speaking) {
          if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
        } else {
          speechSynthesis.pause();
          speechSynthesis.resume();
        }
      }, 10000);

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

  // 1-Click Mic Diagnostic Test
  const runMicDiagnostic = async () => {
    setIsTestingMic(true);
    setMicTestResult(null);

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasSR = !!SR;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicTestResult('❌ MediaDevices API not available in this browser environment.');
        setIsTestingMic(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tracks = stream.getAudioTracks();

      if (!tracks.length || !tracks[0].enabled) {
        setMicTestResult('⚠️ Microphone connected but no audio stream track found.');
        tracks.forEach(t => t.stop());
        setIsTestingMic(false);
        return;
      }

      const trackName = tracks[0].label || 'Default Microphone';
      tracks.forEach(t => t.stop());

      let msg = `✅ Microphone working: "${trackName}".`;
      if (hasSR) {
        msg += ' Speech Recognition engine is READY!';
      } else {
        msg += ' ⚠️ Browser does not support Web Speech Recognition (try Chrome or Edge).';
      }
      setMicTestResult(msg);
      toast(msg, 'success');
      setMicPermissionDenied(false);
    } catch (err: any) {
      console.error('Mic test error:', err);
      let errorMsg = `❌ Mic Test Failed: ${err.message || err.name}`;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = '❌ Microphone Permission Denied! Check your browser address bar & macOS System Settings → Privacy & Security → Microphone.';
      }
      setMicTestResult(errorMsg);
      toast(errorMsg, 'error');
    } finally {
      setIsTestingMic(false);
    }
  };

  /* ─────────────────────────────────────────────
     IMAGE OCR & SEPARATE TRANSLATION HANDLERS
     ───────────────────────────────────────────── */
  const doOcrTranslation = useCallback(async (text: string, targetLang: string) => {
    if (!text.trim()) {
      setTranslatedOcrText('');
      return;
    }
    cancelTTS();
    setIsTranslatingOcr(true);
    try {
      let result = '';
      if (targetLang === 'manglish') {
        result = await getManglish(text, 'auto');
      } else {
        result = await translateText(text, targetLang, 'auto');
      }
      setTranslatedOcrText(result);
    } catch (err: any) {
      console.error('OCR Translation error:', err);
      toast(`⚠️ Translation error: ${err.message}`, 'error');
    } finally {
      setIsTranslatingOcr(false);
    }
  }, [cancelTTS, toast]);

  const processSelectedImage = useCallback(async (file: File, langOverride?: string) => {
    const activeLang = langOverride || ocrLang;
    setOcrImageFile(file);
    setOcrImageInfo({
      name: file.name || 'Pasted Image',
      size: `${(file.size / 1024).toFixed(1)} KB`,
    });

    const previewUrl = URL.createObjectURL(file);
    setOcrImagePreview(previewUrl);

    setExtractedImageText('');
    setTranslatedOcrText('');
    setOcrError(null);
    setIsOcrProcessing(true);
    setOcrProgress({ status: 'Starting OCR Engine...', progress: 10 });

    try {
      const text = await extractTextFromImage(file, activeLang, (p) => {
        setOcrProgress(p);
      });

      const trimmed = text.trim();
      setExtractedImageText(trimmed);

      if (!trimmed) {
        toast('⚠️ No text detected in this image. Try another image or change OCR language.', 'warning');
      } else {
        toast('✨ Text extracted! Translating now...', 'success');
        doOcrTranslation(trimmed, ocrTargetLang);
      }
    } catch (err: any) {
      console.error('Image OCR extraction error:', err);
      setOcrError(err.message || 'Failed to extract text from image');
      toast(`❌ OCR Failed: ${err.message || 'Could not read image'}`, 'error');
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(null);
    }
  }, [ocrLang, ocrTargetLang, toast, doOcrTranslation]);

  // Listen for clipboard image paste anywhere on the page
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setMode('image');
            processSelectedImage(file);
            toast('📋 Image pasted from clipboard!', 'success');
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processSelectedImage, toast]);

  // Debounced re-translation when user edits extractedImageText or switches target language
  useEffect(() => {
    if (mode === 'image' && extractedImageText.trim()) {
      if (imageTranslateTimerRef.current) clearTimeout(imageTranslateTimerRef.current);
      imageTranslateTimerRef.current = setTimeout(() => {
        doOcrTranslation(extractedImageText.trim(), ocrTargetLang);
      }, 500);
    }
  }, [mode, extractedImageText, ocrTargetLang, doOcrTranslation]);

  // Copy original extracted text
  const handleCopyExtractedText = async () => {
    if (!extractedImageText.trim()) {
      toast('⚠️ No extracted text to copy.', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(extractedImageText);
      setCopiedOcrExtracted(true);
      setTimeout(() => setCopiedOcrExtracted(false), 2000);
      toast('📋 Original text copied! (ഇമേജിലെ കണ്ടന്റ് കോപ്പി ചെയ്തു)', 'success');
    } catch {
      toast('⚠️ Failed to copy extracted text.', 'error');
    }
  };

  // Copy translated OCR text
  const handleCopyTranslatedOcrText = async () => {
    if (!translatedOcrText.trim()) {
      toast('⚠️ No translation to copy.', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(translatedOcrText);
      setCopiedOcrTranslated(true);
      setTimeout(() => setCopiedOcrTranslated(false), 2000);
      toast('📋 Translation copied! (ട്രാൻസ്‌ലേഷൻ കോപ്പി ചെയ്തു)', 'success');
    } catch {
      toast('⚠️ Failed to copy translation.', 'error');
    }
  };

  // Copy both original text and translation together
  const handleCopyBothOcrText = async () => {
    if (!extractedImageText.trim() && !translatedOcrText.trim()) {
      toast('⚠️ Nothing to copy yet.', 'warning');
      return;
    }
    const combined = `📄 ORIGINAL IMAGE TEXT (ഇമേജ് കണ്ടന്റ്):\n${extractedImageText}\n\n🌐 TRANSLATION (${TARGET_LANG_META[ocrTargetLang]?.name || ocrTargetLang}):\n${translatedOcrText}`;
    try {
      await navigator.clipboard.writeText(combined);
      setCopiedBoth(true);
      setTimeout(() => setCopiedBoth(false), 2000);
      toast('📑 Extracted content & translation copied!', 'success');
    } catch {
      toast('⚠️ Failed to copy.', 'error');
    }
  };

  // Share OCR content
  const handleShareOcr = async () => {
    if (!translatedOcrText.trim() && !extractedImageText.trim()) {
      toast('⚠️ Nothing to share yet.', 'warning');
      return;
    }
    const shareData = {
      title: 'Image Text Translation',
      text: `📄 Original Text:\n${extractedImageText}\n\n🌐 Translation (${TARGET_LANG_META[ocrTargetLang]?.name || ocrTargetLang}):\n${translatedOcrText}`,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (e: any) {
        if (e.name !== 'AbortError') toast('⚠️ Share failed.', 'error');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast('📋 Copied to clipboard (Share not supported).', 'info');
      } catch {
        toast('⚠️ Share not supported.', 'error');
      }
    }
  };

  // Clear image OCR state
  const handleClearImageOcr = () => {
    if (ocrImagePreview) {
      URL.revokeObjectURL(ocrImagePreview);
    }
    setOcrImageFile(null);
    setOcrImagePreview(null);
    setOcrImageInfo(null);
    setExtractedImageText('');
    setTranslatedOcrText('');
    setOcrError(null);
    setOcrProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    toast('🗑️ Image & text cleared.', 'info');
  };

  // Keyboard shortcut (Space = record/stop, Esc = stop)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        toggleRecording();
      }
      if (e.code === 'Escape' && isRecordingRef.current) {
        stopRecording();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggleRecording, stopRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      stopAudioFeedback();
      cancelTTS();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
    };
  }, [stopAudioFeedback, cancelTTS]);

  const targetLangKeys = Object.keys(TARGET_LANG_META).filter(k => {
    // If input is Malayalam, don't show Malayalam as target; if input is English, show Malayalam!
    if (inputLang === 'ml-IN' && k === 'malayalam') return false;
    if (inputLang === 'en-IN' && k === 'english') return false;
    return true;
  });

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
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.08); }
          100% { transform: translate(-20px, 35px) scale(0.95); }
        }

        .vt-card {
          background: hsla(240, 20%, 12%, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid hsla(255, 60%, 70%, 0.12);
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
          padding: 0.6rem 0.9rem;
          border-radius: 14px;
          border: 1px solid hsla(255, 60%, 70%, 0.15);
          background: hsla(240, 20%, 16%, 0.6);
          color: hsl(240, 10%, 65%);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          flex: 1;
          min-width: 75px;
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
      {/* Hidden file inputs for Image OCR */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processSelectedImage(file);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processSelectedImage(file);
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto space-y-4 p-4 pt-2 pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗣️</span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                Voice &amp; Image Translator
              </h2>
              <p className="text-xs text-zinc-400" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                Live Speech, Type &amp; Image OCR Translation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTroubleshooter(!showTroubleshooter)}
              className="text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-amber-300 hover:text-amber-200"
              style={{ background: 'hsla(38, 80%, 20%, 0.4)', border: '1px solid hsla(38, 80%, 50%, 0.3)' }}
              title="Voice not working? Click for troubleshooting"
            >
              <span>🛠️</span>
              <span className="hidden sm:inline font-medium">Mic Help</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'hsla(240, 20%, 16%, 0.6)', border: '1px solid hsla(255, 60%, 70%, 0.12)' }}>
              <div className={`vt-status-dot ${status}`} />
              <span className="text-xs font-medium text-zinc-400" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                {mode === 'image' ? (isOcrProcessing ? 'Reading...' : 'OCR Ready') : status === 'listening' ? 'Listening...' : status === 'error' ? 'Check Mic' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex items-center justify-between p-1 rounded-2xl bg-black/40 border border-white/10">
          <div className="text-xs font-semibold text-zinc-400 px-3 py-1 flex items-center gap-1.5">
            <span>✨</span>
            <span>Mode:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode('voice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                mode === 'voice'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🎙️ Voice</span>
            </button>
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                mode === 'text'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>✍️ Type</span>
            </button>
            <button
              onClick={() => setMode('image')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === 'image'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>📷 Image OCR</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-bold">New</span>
            </button>
          </div>
        </div>

        {/* Warning Banner if Mic Denied or Browser Unsupported in Voice Mode */}
        {mode === 'voice' && (!browserSupport || micPermissionDenied) && (
          <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-950/40 text-red-200 text-xs space-y-2">
            <div className="flex items-start gap-2 font-semibold">
              <span className="text-base">⚠️</span>
              <div>
                {!browserSupport
                  ? 'Speech recognition is not supported in this browser (e.g. Firefox).'
                  : 'Microphone permission is blocked.'}
              </div>
            </div>
            <p className="text-red-300/80 leading-relaxed pl-6">
              {!browserSupport ? (
                <>Please open this app in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Safari</strong> on macOS. Meanwhile, you can switch to <strong>Type Mode</strong> or <strong>Image OCR</strong>!</>
              ) : (
                <>To enable mic: Click the <strong>lock / tune icon</strong> on the left side of your browser address bar &gt; set <strong>Microphone</strong> to <strong>Allow</strong> &gt; refresh the page.</>
              )}
            </p>
            <div className="flex gap-2 pl-6 pt-1">
              <button
                onClick={runMicDiagnostic}
                disabled={isTestingMic}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-white font-medium transition-all"
              >
                {isTestingMic ? 'Testing...' : '🔄 Test Microphone Again'}
              </button>
              <button
                onClick={() => setMode('text')}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
              >
                ✍️ Use Type Mode
              </button>
            </div>
          </div>
        )}

        {/* Interactive Troubleshooter Panel (Toggleable) */}
        {showTroubleshooter && (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-zinc-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-amber-300 text-sm">
                <span>🔧</span>
                <span>Voice Work Aunilla? (Quick Fix Guide)</span>
              </div>
              <button onClick={() => setShowTroubleshooter(false)} className="text-zinc-400 hover:text-white text-base">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-300">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>1️⃣</span> <span>Browser Permission</span>
                </div>
                <p className="text-zinc-400">
                  Click the <strong>padlock/tune icon</strong> on the left of your URL bar (next to localhost or domain), and set <strong>Microphone</strong> to <strong>Allow</strong>.
                </p>
              </div>

              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>2️⃣</span> <span>Mac System Settings</span>
                </div>
                <p className="text-zinc-400">
                  Open <strong>System Settings &gt; Privacy &amp; Security &gt; Microphone</strong> and make sure your browser (Chrome/Safari) toggle is <strong>ON</strong>.
                </p>
              </div>

              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>3️⃣</span> <span>Recommended Browser</span>
                </div>
                <p className="text-zinc-400">
                  Google Chrome or Microsoft Edge provide the highest quality Malayalam speech recognition.
                </p>
              </div>

              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>4️⃣</span> <span>Image OCR Alternative</span>
                </div>
                <p className="text-zinc-400">
                  You can also switch to <strong>Image OCR</strong> to extract text from screenshots, signs, or photos and translate directly!
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <div className="text-zinc-400">
                {micTestResult ? (
                  <span className="font-medium text-white">{micTestResult}</span>
                ) : (
                  <span>Click test to verify if browser can hear your mic:</span>
                )}
              </div>
              <button
                onClick={runMicDiagnostic}
                disabled={isTestingMic}
                className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-xl text-amber-200 font-semibold transition-all flex items-center gap-1.5"
              >
                <span>🎙️</span>
                <span>{isTestingMic ? 'Testing...' : 'Test Mic Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            MODE 1 & 2: VOICE & TYPE MODE
            ══════════════════════════════════════════════════════════ */}
        {(mode === 'voice' || mode === 'text') && (
          <>
            {/* Input Selector Card: Spoken / Source Language */}
            <div className="vt-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <span>🎙️</span>
                  <span>Spoken / Source Language</span>
                </div>
              </div>

              {/* Input language selection chips */}
              <div className="flex gap-2 flex-wrap">
                {INPUT_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleInputLangChange(lang.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      inputLang === lang.code
                        ? 'bg-indigo-500/20 border-indigo-400/60 text-white shadow-sm'
                        : 'bg-black/20 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    <span className="text-[10px] opacity-60">({lang.sub})</span>
                  </button>
                ))}
              </div>

              {/* Voice Input Section */}
              {mode === 'voice' && (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className={`relative ${isRecording ? 'vt-ripples-active' : ''}`}>
                    <div className="vt-ripple" />
                    <div className="vt-ripple" />
                    <div className="vt-ripple" />
                    <button
                      className={`vt-mic-btn ${isRecording ? 'recording' : ''}`}
                      onClick={toggleRecording}
                      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                      style={{
                        transform: isRecording && audioLevel > 5 ? `scale(${1 + (audioLevel / 200)})` : undefined,
                      }}
                    >
                      {isRecording ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
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

                  {/* Real-time volume wave bar when recording */}
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-1 w-full max-w-xs">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Listening in {currentInputMeta.name}... Speak now</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-75"
                          style={{ width: `${Math.max(8, audioLevel)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500">Tap mic to stop or press Space</span>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                      Tap mic or press Space to speak in {currentInputMeta.name}
                    </p>
                  )}
                </div>
              )}

              {/* Transcript / Input Box (Editable) */}
              <div className="vt-transcript-box space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1"
                    style={{ background: 'hsla(255, 80%, 55%, 0.2)', color: 'hsl(255, 80%, 75%)' }}
                  >
                    <span>{currentInputMeta.flag}</span>
                    <span>{currentInputMeta.name}</span>
                    <span className="text-[10px] opacity-70">({mode === 'voice' ? 'Spoken / Editable' : 'Direct Typing'})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {finalTranscript.length} chars
                    </span>
                    {finalTranscript && (
                      <button
                        onClick={() => handleSpeak(finalTranscript, inputLang === 'ml-IN' ? 'malayalam' : 'english')}
                        className="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
                        title="Listen to original speech"
                      >
                        🔊 Listen
                      </button>
                    )}
                  </div>
                </div>

                {/* Editable textarea so users can type or edit voice transcripts */}
                <textarea
                  value={finalTranscript}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFinalTranscript(val);
                    finalTranscriptRef.current = val;
                  }}
                  placeholder={
                    mode === 'voice'
                      ? `Your ${currentInputMeta.name} speech will appear here... (You can also edit or type directly)`
                      : `Type or paste text in ${currentInputMeta.name} here...`
                  }
                  rows={3}
                  className="w-full bg-transparent text-white placeholder-zinc-600 border-none outline-none resize-none text-sm leading-relaxed"
                  style={{
                    fontFamily: inputLang === 'ml-IN' ? "'Noto Sans Malayalam', sans-serif" : "'Outfit', system-ui, sans-serif",
                  }}
                />

                {interimText && (
                  <div className="text-xs text-indigo-400/80 italic pt-1 border-t border-white/5">
                    🎙️ {interimText}
                  </div>
                )}
              </div>
            </div>

            {/* Target Language Selector Card */}
            <div className="vt-card">
              <div className="flex items-center gap-2 mb-3 text-xs font-medium text-zinc-400" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                <span>🌐</span>
                <span>Target Language</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {targetLangKeys.map((lang) => {
                  const meta = TARGET_LANG_META[lang];
                  if (!meta) return null;
                  return (
                    <button
                      key={lang}
                      className={`vt-lang-chip ${currentLang === lang ? 'active' : ''}`}
                      onClick={() => selectTargetLang(lang)}
                      aria-pressed={currentLang === lang}
                    >
                      <span className="text-lg">{meta.flag}</span>
                      <span className="text-xs font-semibold">{meta.name}</span>
                      <span className="text-[10px] opacity-60">{meta.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Output Card */}
            <div className="vt-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
                  <span>✨</span>
                  <span>Translation</span>
                  {translating && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <div className="vt-spinner" />
                      <span className="text-[11px] text-indigo-400">Translating...</span>
                    </div>
                  )}
                </div>

                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5" style={{ background: 'hsla(255, 80%, 55%, 0.15)', color: 'hsl(255, 80%, 80%)' }}>
                  <span>{TARGET_LANG_META[currentLang]?.flag}</span>
                  <span>{TARGET_LANG_META[currentLang]?.name || currentLang}</span>
                </span>
              </div>

              <div
                className="vt-output-box text-white"
                style={{
                  fontFamily: currentLang === 'arabic' ? "'Noto Sans Arabic', sans-serif" : "'Outfit', 'Noto Sans Malayalam', sans-serif",
                  direction: currentLang === 'arabic' ? 'rtl' : 'ltr',
                }}
              >
                {outputText || <span className="text-zinc-600 text-sm">Translation will appear here...</span>}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  className={`vt-action-btn vt-listen ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => handleSpeak(outputText, currentLang)}
                  aria-label={isSpeaking ? 'Stop speaking' : 'Listen'}
                >
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
          </>
        )}

        {/* ══════════════════════════════════════════════════════════
            MODE 3: IMAGE OCR (TEXT EXTRACTION & LIVE TRANSLATION)
            ══════════════════════════════════════════════════════════ */}
        {mode === 'image' && (
          <div className="space-y-4">
            {/* Upload & Setup Card */}
            <div className="vt-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <span>📷</span>
                  <span>Image OCR &amp; Dual Content Separation</span>
                </div>
                {ocrImageFile && (
                  <button
                    onClick={handleClearImageOcr}
                    className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center gap-1"
                  >
                    <span>✕</span>
                    <span>Clear Image</span>
                  </button>
                )}
              </div>

              {/* Drag & Drop Upload Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    processSelectedImage(file);
                  } else {
                    toast('⚠️ Please drop a valid image file.', 'warning');
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                    : ocrImagePreview
                    ? 'border-indigo-500/40 bg-black/30'
                    : 'border-white/15 bg-black/20 hover:border-emerald-400/50 hover:bg-white/[0.02]'
                }`}
              >
                {ocrImagePreview ? (
                  <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 max-h-48 max-w-xs bg-black/50">
                      <img
                        src={ocrImagePreview}
                        alt="Uploaded preview"
                        className="object-contain max-h-48 w-auto rounded-xl mx-auto"
                      />
                    </div>
                    <div className="flex-1 text-left space-y-2">
                      <div>
                        <div className="text-sm font-semibold text-white break-all">{ocrImageInfo?.name}</div>
                        <div className="text-xs text-zinc-400">{ocrImageInfo?.size}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                          <span>📁</span> Change Image
                        </button>
                        <button
                          onClick={() => cameraInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                          <span>📸</span> Take Photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/10">
                      🖼️
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-tight">
                        Drop image here, paste screenshot (⌘V / Ctrl+V), or browse
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                        Extracts text from screenshots, signs, book pages, receipts, and photos in Malayalam, English, Arabic, etc.
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                      >
                        <span>📁</span> Upload Image
                      </button>
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
                      >
                        <span>📸</span> Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OCR Language Selector Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Image Language (ഇമേജിലെ ഭാഷ):</span>
                  <span className="text-zinc-500 text-[11px]">Select before extracting</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {OCR_LANGUAGES.map((lang) => {
                    const isSelected = ocrLang === lang.code;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setOcrLang(lang.code);
                          if (ocrImageFile) {
                            processSelectedImage(ocrImageFile, lang.code);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400/70 text-emerald-200 shadow-sm'
                            : 'bg-black/20 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        <span className="text-[10px] opacity-60">({lang.sub})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress bar when extracting */}
              {isOcrProcessing && ocrProgress && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <div className="vt-spinner" style={{ width: 14, height: 14 }} />
                      <span>{ocrProgress.status}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">{ocrProgress.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full transition-all duration-200"
                      style={{ width: `${Math.max(10, ocrProgress.progress)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {ocrError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                  <span>⚠️</span>
                  <div className="flex-1">{ocrError}</div>
                </div>
              )}

              {/* Extract Button if image selected */}
              {ocrImageFile && !isOcrProcessing && (
                <button
                  onClick={() => processSelectedImage(ocrImageFile)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>⚡</span>
                  <span>{extractedImageText ? 'Re-extract Text (വീണ്ടും ടെക്സ്റ്റ് എടുക്കുക)' : 'Extract Text (ടെക്സ്റ്റ് എടുക്കുക)'}</span>
                </button>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════
                TWO DISTINCT PANELS:
                1) ORIGINAL EXTRACTED CONTENT (ഇമേജ് കണ്ടന്റ്)
                2) TRANSLATED CONTENT (ട്രാൻസ്‌ലേഷൻ)
                ══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 gap-4">
              {/* PANEL 1: ORIGINAL EXTRACTED CONTENT */}
              <div className="vt-card border-emerald-500/30 bg-emerald-950/15 space-y-3 shadow-lg shadow-emerald-950/30">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-sm">📄</span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Original Content</span>
                        <span className="text-[11px] font-normal text-emerald-400">(ഇമേജിലെ കണ്ടന്റ്)</span>
                      </h3>
                      <p className="text-[11px] text-zinc-400">Directly extracted text from your image</p>
                    </div>
                  </div>

                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/40 text-emerald-400 border border-emerald-500/20 font-medium">
                    {extractedImageText
                      ? `${extractedImageText.split(/\s+/).filter(Boolean).length} words • ${extractedImageText.length} chars`
                      : '0 chars'}
                  </span>
                </div>

                <textarea
                  value={extractedImageText}
                  onChange={(e) => setExtractedImageText(e.target.value)}
                  placeholder={
                    isOcrProcessing
                      ? 'Reading text from image...'
                      : 'Upload or drop an image above to extract text here. You can also edit it...'
                  }
                  rows={5}
                  className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-600 focus:border-emerald-500/60 focus:outline-none transition-all text-sm leading-relaxed resize-y font-sans"
                />

                {/* Dedicated Action Bar for Original Extracted Content */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleCopyExtractedText}
                    disabled={!extractedImageText.trim()}
                    className={`vt-action-btn flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      copiedOcrExtracted
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    title="Copy only the extracted text from the image"
                  >
                    <span>{copiedOcrExtracted ? '✓' : '📋'}</span>
                    <span>{copiedOcrExtracted ? 'Copied Original Text!' : 'Copy Extracted Text (ടെക്സ്റ്റ് കോപ്പി ചെയ്യുക)'}</span>
                  </button>

                  <button
                    onClick={() => handleSpeak(extractedImageText, ocrLang.includes('mal') ? 'malayalam' : 'english')}
                    disabled={!extractedImageText.trim()}
                    className="vt-action-btn px-3 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Listen to original text"
                  >
                    <span>🔊</span>
                    <span>Listen</span>
                  </button>

                  <button
                    onClick={() => ocrImageFile && processSelectedImage(ocrImageFile)}
                    disabled={!ocrImageFile || isOcrProcessing}
                    className="vt-action-btn px-3 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Re-extract"
                  >
                    <span>🔄</span>
                    <span>Re-scan</span>
                  </button>
                </div>
              </div>

              {/* PANEL 2: TRANSLATED CONTENT */}
              <div className="vt-card border-indigo-500/30 bg-indigo-950/15 space-y-3 shadow-lg shadow-indigo-950/30">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm">🌐</span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Translated Content</span>
                        <span className="text-[11px] font-normal text-indigo-400">(ട്രാൻസ്‌ലേഷൻ)</span>
                      </h3>
                      <p className="text-[11px] text-zinc-400">Live translation of the extracted image text</p>
                    </div>
                  </div>

                  {isTranslatingOcr && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px]">
                      <div className="vt-spinner" style={{ width: 12, height: 12 }} />
                      <span>Translating...</span>
                    </div>
                  )}
                </div>

                {/* Target Language Chips */}
                <div className="flex gap-1.5 flex-wrap">
                  {Object.keys(TARGET_LANG_META).map((key) => {
                    const meta = TARGET_LANG_META[key];
                    const isActive = ocrTargetLang === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setOcrTargetLang(key)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                            : 'bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                        }`}
                      >
                        <span>{meta.flag}</span>
                        <span>{meta.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Translated Box */}
                <div
                  className="vt-output-box text-white bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm leading-relaxed min-h-[110px]"
                  style={{
                    fontFamily:
                      ocrTargetLang === 'arabic'
                        ? "'Noto Sans Arabic', sans-serif"
                        : "'Outfit', 'Noto Sans Malayalam', sans-serif",
                    direction: ocrTargetLang === 'arabic' ? 'rtl' : 'ltr',
                  }}
                >
                  {translatedOcrText || (
                    <span className="text-zinc-600 text-xs italic">
                      {extractedImageText
                        ? `Translating to ${TARGET_LANG_META[ocrTargetLang]?.name || ocrTargetLang}...`
                        : 'Translation will appear here after extracting text from an image...'}
                    </span>
                  )}
                </div>

                {/* Dedicated Action Bar for Translated Content */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleCopyTranslatedOcrText}
                    disabled={!translatedOcrText.trim()}
                    className={`vt-action-btn flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      copiedOcrTranslated
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    title="Copy only the translated text"
                  >
                    <span>{copiedOcrTranslated ? '✓' : '📋'}</span>
                    <span>{copiedOcrTranslated ? 'Copied Translation!' : 'Copy Translation (ട്രാൻസ്‌ലേഷൻ കോപ്പി ചെയ്യുക)'}</span>
                  </button>

                  <button
                    onClick={() => handleSpeak(translatedOcrText, ocrTargetLang)}
                    disabled={!translatedOcrText.trim()}
                    className="vt-action-btn px-3 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Listen to translation"
                  >
                    <span>🔊</span>
                    <span>Listen</span>
                  </button>

                  <button
                    onClick={handleCopyBothOcrText}
                    disabled={!extractedImageText.trim() && !translatedOcrText.trim()}
                    className={`vt-action-btn px-3 py-2 rounded-xl text-xs border flex items-center gap-1.5 transition-all ${
                      copiedBoth
                        ? 'bg-cyan-500 text-black border-cyan-400 font-semibold'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    title="Copy both original text and translation together"
                  >
                    <span>{copiedBoth ? '✓' : '📑'}</span>
                    <span>Copy Both (രണ്ടും)</span>
                  </button>

                  <button
                    onClick={handleShareOcr}
                    disabled={!translatedOcrText.trim()}
                    className="vt-action-btn px-3 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Share to WhatsApp, Telegram, etc."
                  >
                    <span>📤</span>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="flex flex-col gap-2 px-4 py-3 rounded-2xl text-xs text-zinc-500" style={{ background: 'hsla(240, 20%, 12%, 0.5)', border: '1px solid hsla(255, 60%, 70%, 0.1)', fontFamily: "'Outfit', system-ui, sans-serif" }}>
          <div className="flex items-start gap-2"><span>💡</span><span>Works in Google Chrome, Microsoft Edge, and Safari. If mic is blocked, click the lock icon in the URL bar.</span></div>
          <div className="flex items-start gap-2"><span>✍️</span><span>Can't speak or mic silent? Switch to <strong>Type Mode</strong> to type Malayalam or English and translate instantly.</span></div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTranslator;
