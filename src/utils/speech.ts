/**
 * Pronunciation utility utilizing browser SpeechSynthesis API.
 * Dynamically selects voices according to the learning language locale.
 * Designed as a clean abstraction so audio sources can later be swapped
 * with high-fidelity native cloud TTS (e.g. Gemini Audio / ElevenLabs / Google Cloud TTS).
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

export const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  mr: 'mr-IN',
  marathi: 'mr-IN',
  Marathi: 'mr-IN',
  hi: 'hi-IN',
  hindi: 'hi-IN',
  Hindi: 'hi-IN',
  bn: 'bn-IN',
  bengali: 'bn-IN',
  Bengali: 'bn-IN',
  te: 'te-IN',
  telugu: 'te-IN',
  Telugu: 'te-IN',
  ta: 'ta-IN',
  tamil: 'ta-IN',
  Tamil: 'ta-IN',
  gu: 'gu-IN',
  gujarati: 'gu-IN',
  Gujarati: 'gu-IN',
  sa: 'hi-IN', // Sanskrit fallback to Hindi/Devanagari phonetics
  sanskrit: 'hi-IN',
  Sanskrit: 'hi-IN',
  en: 'en-IN',
  english: 'en-IN',
  English: 'en-IN',
  kn: 'kn-IN',
  kannada: 'kn-IN',
  Kannada: 'kn-IN',
  ml: 'ml-IN',
  malayalam: 'ml-IN',
  Malayalam: 'ml-IN',
};

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public speak(text: string, options: SpeechOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('SpeechSynthesis is not supported in this environment.');
        options.onError?.(new Error('SpeechSynthesis not supported'));
        resolve(false);
        return;
      }

      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      utterance.rate = options.rate ?? 0.85;
      utterance.pitch = options.pitch ?? 1.0;

      const targetLocale = options.lang || 'mr-IN';
      utterance.lang = targetLocale;

      // Match voice
      const voices = this.synth.getVoices();
      const prefix = targetLocale.split('-')[0].toLowerCase();
      
      const exactVoice = voices.find((v) => v.lang.toLowerCase() === targetLocale.toLowerCase());
      const prefixVoice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
      const indianVoice = voices.find((v) => v.lang.includes('IN'));

      if (exactVoice) {
        utterance.voice = exactVoice;
      } else if (prefixVoice) {
        utterance.voice = prefixVoice;
      } else if (indianVoice) {
        utterance.voice = indianVoice;
      }

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        options.onEnd?.();
        resolve(true);
      };

      utterance.onerror = (err) => {
        this.currentUtterance = null;
        options.onError?.(err);
        resolve(false);
      };

      this.synth.speak(utterance);
    });
  }
}

export const speechService = new SpeechService();

export const speakText = (text: string, languageKey: string = 'mr', options?: SpeechOptions) => {
  const targetLocale = LANGUAGE_LOCALE_MAP[languageKey] || options?.lang || 'mr-IN';
  return speechService.speak(text, { lang: targetLocale, rate: 0.85, ...options });
};

export const speakMarathi = (text: string, options?: SpeechOptions) => {
  return speakText(text, 'mr', options);
};
