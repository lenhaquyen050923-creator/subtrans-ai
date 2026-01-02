
import React, { useState, useCallback, useRef } from 'react';
import { TranslationState, SrtBlock } from './types';
import { parseSrt, stringifySrt, downloadSrt } from './utils/srtUtils';
import { translateSrtBlocks } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector';
import EditorPanel from './components/EditorPanel';

const App: React.FC = () => {
  const [sourceSrt, setSourceSrt] = useState<string>('');
  const [targetSrt, setTargetSrt] = useState<string>('');
  const [targetLang, setTargetLang] = useState<string>('Tiếng Việt');
  const [fileName, setFileName] = useState<string>('translated.srt');
  const [state, setState] = useState<TranslationState>({
    isProcessing: false,
    progress: 0,
    error: null,
    currentChunkIndex: 0,
    totalChunks: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name.replace('.srt', `_${targetLang}.srt`));
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setSourceSrt(text);
      };
      reader.readAsText(file);
    }
  };

  const handleTranslate = async () => {
    if (!sourceSrt.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter or upload an SRT content first.' }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, progress: 0, error: null }));
    setTargetSrt('');

    try {
      const blocks = parseSrt(sourceSrt);
      if (blocks.length === 0) {
        throw new Error('Invalid SRT format. Could not find any subtitle blocks.');
      }

      const translated = await translateSrtBlocks(
        blocks,
        targetLang,
        (progress) => setState(prev => ({ ...prev, progress }))
      );

      const resultText = stringifySrt(translated);
      setTargetSrt(resultText);
      setState(prev => ({ ...prev, isProcessing: false, progress: 100 }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: err.message || 'An unexpected error occurred during translation.' 
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 py-4 px-8 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <i className="fas fa-closed-captioning text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">SubTrans AI</h1>
              <p className="text-xs text-slate-500 font-medium">Professional Subtitle Translation</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Help</a>
            <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all">
              Pro Version
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8">
        {/* Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end bg-blue-50/50 p-6 md:p-8 rounded-3xl border border-blue-100/50">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Source Input</label>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              >
                <i className="fas fa-upload text-blue-500"></i>
                Upload SRT
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".srt"
                className="hidden"
              />
            </div>
          </div>

          <LanguageSelector
            value={targetLang}
            onChange={setTargetLang}
            disabled={state.isProcessing}
          />

          <button
            onClick={handleTranslate}
            disabled={state.isProcessing || !sourceSrt}
            className={`flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-200/50 ${
              state.isProcessing || !sourceSrt
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {state.isProcessing ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i>
                Translating...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                Start Translation
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {state.isProcessing && (
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3">
            <i className="fas fa-exclamation-circle"></i>
            <p className="font-medium">{state.error}</p>
          </div>
        )}

        {/* Editor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
          <EditorPanel
            title="Source SRT"
            value={sourceSrt}
            onChange={setSourceSrt}
            placeholder="Paste your SRT content here or upload a file..."
            onCopy={() => copyToClipboard(sourceSrt)}
            showActions={!!sourceSrt}
          />
          <EditorPanel
            title={`Translated SRT (${targetLang})`}
            value={targetSrt}
            readOnly
            placeholder="Translated content will appear here..."
            onCopy={() => copyToClipboard(targetSrt)}
            onDownload={() => downloadSrt(targetSrt, fileName)}
            showActions={!!targetSrt}
          />
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <i className="fas fa-clock"></i>
            </div>
            <h4 className="font-bold text-slate-800">Timestamp Safety</h4>
            <p className="text-sm text-slate-500 leading-relaxed">We strictly preserve all timing information. Your subtitles will remain perfectly synced with the original video.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <i className="fas fa-brain"></i>
            </div>
            <h4 className="font-bold text-slate-800">Contextual Accuracy</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Our AI understands dialogue, terminology, and cultural nuances to provide natural-sounding translations.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <i className="fas fa-file-code"></i>
            </div>
            <h4 className="font-bold text-slate-800">Standard Format</h4>
            <p className="text-sm text-slate-500 leading-relaxed">Generated SRT files follow the universal SubRip standard, compatible with all major video players like VLC.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <i className="fas fa-closed-captioning"></i>
            </div>
            <span className="text-white font-bold text-lg">SubTrans AI</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs">© 2024 SubTrans AI. Powered by Gemini Pro.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
