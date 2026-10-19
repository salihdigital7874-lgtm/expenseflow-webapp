/**
 * Client-side Image OCR Engine
 * Dynamically loads Tesseract.js v5 from CDN on-demand for zero bundle bloat.
 * Runs completely in the browser using WebAssembly & Web Workers.
 */

declare global {
  interface Window {
    Tesseract?: any;
  }
}

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

let scriptLoadingPromise: Promise<any> | null = null;

export async function loadTesseractLibrary(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('OCR is only available in browser environment');
  }

  if (window.Tesseract) {
    return window.Tesseract;
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    // Check if already injected
    const existing = document.querySelector(`script[src="${TESSERACT_CDN}"]`);
    if (existing && window.Tesseract) {
      resolve(window.Tesseract);
      return;
    }

    const script = document.createElement('script');
    script.src = TESSERACT_CDN;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
      } else {
        reject(new Error('Tesseract script loaded but window.Tesseract is undefined'));
      }
    };

    script.onerror = () => {
      scriptLoadingPromise = null;
      reject(new Error('Failed to load OCR engine. Please check your internet connection.'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface OcrLangOption {
  id: string;
  code: string;
  name: string;
  sub: string;
  flag: string;
}

export const OCR_LANGUAGES: OcrLangOption[] = [
  { id: 'eng', code: 'eng', name: 'English', sub: 'Global', flag: '🇬🇧' },
  { id: 'mal', code: 'mal', name: 'Malayalam', sub: 'മലയാളം', flag: '🇮🇳' },
  { id: 'mal+eng', code: 'mal+eng', name: 'Mal + Eng', sub: 'Mixed', flag: '🇮🇳' },
  { id: 'hin', code: 'hin', name: 'Hindi', sub: 'हिन्दी', flag: '🇮🇳' },
  { id: 'tam', code: 'tam', name: 'Tamil', sub: 'தமிழ்', flag: '🇮🇳' },
  { id: 'ara', code: 'ara', name: 'Arabic', sub: 'العربية', flag: '🇦🇪' },
];

/**
 * Extracts text from an image (File, Blob, or Data URL)
 * @param imageSource File, Blob, or base64 image URL
 * @param language Language code: 'eng', 'mal', 'mal+eng', 'hin', 'tam', 'ara'
 * @param onProgress Optional progress callback (0 - 100)
 */
export async function extractTextFromImage(
  imageSource: File | Blob | string,
  language: string = 'eng',
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  const Tesseract = await loadTesseractLibrary();

  // Language mapping
  const langCode =
    language === 'malayalam' || language === 'mal' ? 'mal'
    : language === 'malayalam+english' || language === 'mal+eng' ? 'mal+eng'
    : language === 'hindi' || language === 'hin' ? 'hin'
    : language === 'tamil' || language === 'tam' ? 'tam'
    : language === 'arabic' || language === 'ara' ? 'ara'
    : language || 'eng';

  try {
    onProgress?.({ status: 'Initializing OCR Engine...', progress: 10 });

    const worker = await Tesseract.createWorker(langCode, 1, {
      logger: (m: any) => {
        if (m.status && typeof m.progress === 'number') {
          const pct = Math.round(m.progress * 100);
          onProgress?.({
            status: m.status === 'recognizing text' ? `Reading text from image... ${pct}%` : `${m.status}...`,
            progress: pct,
          });
        }
      },
    });

    onProgress?.({ status: 'Processing image & extracting words...', progress: 60 });

    const result = await worker.recognize(imageSource);
    await worker.terminate();

    const extractedText = result.data.text ? result.data.text.trim() : '';

    onProgress?.({ status: 'Complete!', progress: 100 });

    return extractedText;
  } catch (err: any) {
    console.error('Tesseract recognition error:', err);
    throw new Error(err.message || 'Failed to extract text from image');
  }
}
