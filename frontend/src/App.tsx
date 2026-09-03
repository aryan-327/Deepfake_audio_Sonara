import { useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import LandingUpload from './components/LandingUpload';
import AnalysisView from './components/AnalysisView';
import ResultReveal from './components/ResultReveal';
import HistorySidebar from './components/HistorySidebar';
import AmbientBackground from './components/AmbientBackground';

import type { ViewState, AnalysisResult, HistoryItem } from './types';

function App() {
  const { scrollYProgress } = useScroll();
  const [view, setView] = useState<ViewState>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('sonara_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Failed to parse history", error);
      }
    }
    return [];
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const saveToHistory = (res: AnalysisResult, currentFile: File) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      filename: currentFile.name,
      timestamp: Date.now(),
      verdict: res.verdict,
      confidence: res.confidence
    };
    const newHistory = [newItem, ...history].slice(0, 15);
    setHistory(newHistory);
    localStorage.setItem('sonara_history', JSON.stringify(newHistory));
  };

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setView('analyzing');
    setLogs([]);
    setResult(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      // Connect WebSocket
      const ws = new WebSocket(`ws://localhost:8000/ws/${data.job_id}`);

      ws.onmessage = (event) => {
        const msgData = JSON.parse(event.data);
        if (msgData.type === 'log') {
          setLogs(prev => [...prev, msgData.message]);
        } else if (msgData.type === 'result') {
          setResult(msgData.data);
          saveToHistory(msgData.data, uploadedFile);
          setTimeout(() => setView('result'), 800); // Small delay before transition
        } else if (msgData.type === 'error') {
          console.error("WS Error:", msgData.message);
          // Handle error state if needed
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

    } catch (error) {
      console.error(error);
      setView('upload');
      setFile(null);
    }
  };

  const resetState = () => {
    setView('upload');
    setFile(null);
    setLogs([]);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-molten-base relative flex">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-amber-500 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <AmbientBackground />
      {/* Global Grain/Noise overlay */}
      <div className="fixed inset-0 noise-bg pointer-events-none z-0" />
      {/* Global Vignette */}
      <div className="fixed inset-0 vignette pointer-events-none z-10" />

      {/* Main Content Area */}
      <main className="flex-1 relative z-20 flex flex-col items-center min-h-screen">

        {/* Minimal Header */}
        <header className="absolute top-0 w-full p-6 flex justify-between items-center z-30">
          <div className="font-mono text-xl tracking-[0.2em] font-medium text-molten-textPrimary">SONARA</div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-molten-textSecondary hover:text-white transition-colors duration-200 font-mono text-sm uppercase tracking-wider"
          >
            History
          </button>
        </header>

        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center relative">
          {view === 'upload' && (
            <LandingUpload onUpload={handleUpload} />
          )}

          {view === 'analyzing' && file && (
            <AnalysisView file={file} logs={logs} />
          )}

          {view === 'result' && result && (
            <ResultReveal result={result} onReset={resetState} />
          )}
        </div>
      </main>

      <HistorySidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        history={history}
      />
    </div>
  );
}

export default App;
