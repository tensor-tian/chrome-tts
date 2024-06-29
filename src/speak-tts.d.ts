// speak-tts.d.ts

declare module "speak-tts" {
  export interface SpeakOptions {
    text: string;
    queue?: boolean;
    listeners?: {
      onstart?: () => void;
      onend?: () => void;
      onerror?: (error: unknown) => void;
    };
  }

  export interface InitOptions {
    volume?: number;
    lang?: string;
    voice: string;
    pitch?: number;
    rate?: number;
  }

  export default class Speaker {
    constructor();

    hasBrowserSupport(): boolean;

    init(options: InitOptions): void;
    setVolume(volume: number): void;
    setLanguage(lang: string): void;
    setPitch(pitch: number): void;
    setRate(rate: number): void;
    speak({ text: string }): void;
    cancel(): void;
  }
}
