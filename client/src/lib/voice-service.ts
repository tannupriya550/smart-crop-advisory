export interface VoiceServiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private isSupported = false;
  private voicesLoaded = false;

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
    }

    // Speech synthesis is more widely supported
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      
      // Handle voice loading - voices are often not available immediately
      if (this.synthesis.getVoices().length > 0) {
        this.voicesLoaded = true;
      } else {
        this.synthesis.onvoiceschanged = () => {
          this.voicesLoaded = true;
        };
      }
    }
  }

  isServiceSupported(): boolean {
    return this.isSupported && this.recognition !== null;
  }

  isSpeechSynthesisSupported(): boolean {
    return this.synthesis !== null;
  }

  configureRecognition(config: VoiceServiceConfig) {
    if (!this.recognition) return;

    this.recognition.lang = this.getLanguageCode(config.language);
    this.recognition.continuous = config.continuous;
    this.recognition.interimResults = config.interimResults;
    this.recognition.maxAlternatives = 1;
  }

  private getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'english': 'en-US',
      'hindi': 'hi-IN'
    };
    return languageMap[language.toLowerCase()] || 'en-US';
  }

  startListening(
    onResult: (result: SpeechResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    config: VoiceServiceConfig = { language: 'en', continuous: false, interimResults: true }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.configureRecognition(config);

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('Speech recognition started');
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        
        if (lastResult) {
          const transcript = lastResult[0].transcript;
          const confidence = lastResult[0].confidence || 0;
          const isFinal = lastResult.isFinal;

          onResult({
            transcript: transcript.trim(),
            confidence,
            isFinal
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = 'Speech recognition failed';
        switch (event.error) {
          case 'network':
            errorMessage = 'Network error occurred';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition aborted';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        onError(errorMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Speech recognition ended');
        onEnd();
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  speak(
    text: string, 
    language: string = 'en',
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voice?: string;
    } = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      utterance.lang = this.getLanguageCode(language);
      
      // Set voice options
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Try to find a voice for the specified language
      const voices = this.synthesis.getVoices();
      const langCode = this.getLanguageCode(language);
      
      let selectedVoice = voices.find(voice => voice.lang === langCode);
      
      // Fallback to any voice that starts with the language code
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
      }

      // Use specific voice if provided
      if (options.voice) {
        const namedVoice = voices.find(voice => voice.name.includes(options.voice!));
        if (namedVoice) selectedVoice = namedVoice;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        console.log('Speech synthesis finished');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
    const voices = this.getAvailableVoices();
    const langCode = this.getLanguageCode(language);
    
    return voices.filter(voice => 
      voice.lang === langCode || 
      voice.lang.startsWith(langCode.split('-')[0])
    );
  }

  // Check if currently listening
  getIsListening(): boolean {
    return this.isListening;
  }

  // Get browser compatibility info
  getCompatibilityInfo(): {
    speechRecognition: boolean;
    speechSynthesis: boolean;
    voiceCount: number;
  } {
    return {
      speechRecognition: this.isServiceSupported(),
      speechSynthesis: this.isSpeechSynthesisSupported(),
      voiceCount: this.getAvailableVoices().length
    };
  }
}

// Create singleton instance
export const voiceService = new VoiceService();

// Browser compatibility check
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}