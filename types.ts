
export interface SrtBlock {
  id: string;
  timestamp: string;
  content: string;
}

export interface TranslationState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  currentChunkIndex: number;
  totalChunks: number;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'th', name: 'ไทย (Thai)' }
];
