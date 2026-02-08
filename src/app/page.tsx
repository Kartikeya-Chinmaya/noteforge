'use client';

import { useState, useEffect, useCallback } from 'react';
import FileTypeSelector from '@/components/FileTypeSelector';
import FileUpload from '@/components/FileUpload';
import OutputStyleSelector from '@/components/OutputStyleSelector';
import ResultsDisplay from '@/components/ResultsDisplay';
import StepIndicator from '@/components/StepIndicator';
import PacManGame from '@/components/PacManGame';

type FileType = 'pdf' | 'ppt' | 'image' | 'text' | 'others';
type OutputStyle = 'short' | 'standard' | 'detailed' | 'learn';

export default function Home() {
  const [step, setStep] = useState(1);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [outputStyle, setOutputStyle] = useState<OutputStyle | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Konami code: ↑↑↓↓←→←→BA
  useEffect(() => {
    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    const handler = (e: KeyboardEvent) => {
      if (e.key === konamiCode[pos]) {
        pos++;
        if (pos === konamiCode.length) {
          setShowEasterEgg(true);
          pos = 0;
        }
      } else {
        pos = 0;
      }
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEasterEgg(false);
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keydown', escHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keydown', escHandler);
    };
  }, []);

  const handleFileTypeSelect = (type: FileType) => {
    setFileType(type);
    setStep(2);
  };

  const handleFileSelect = (selectedFile: File | null, text?: string) => {
    if (text) {
      setTextContent(text);
      setFile(null);
    } else if (selectedFile) {
      setFile(selectedFile);
      setTextContent('');
    }
    setStep(3);
  };

  const handleOutputStyleSelect = (style: OutputStyle) => {
    setOutputStyle(style);
  };

  const handleGenerate = async () => {
    if (!outputStyle) return;

    setStep(4);
    setIsLoading(true);

    try {
      const formData = new FormData();

      if (file) {
        formData.append('file', file);
      } else if (textContent) {
        formData.append('text', textContent);
      }

      formData.append('fileType', fileType || 'text');
      formData.append('outputStyle', outputStyle);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setNotes(`ERROR: ${data.error || `Server error (${response.status})`}`);
        } catch {
          setNotes(`ERROR: Server returned ${response.status}. The API may have timed out or crashed.`);
        }
        return;
      }

      const data = await response.json();

      if (data.error) {
        setNotes(`ERROR: ${data.error}`);
      } else {
        setNotes(data.notes);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setNotes('ERROR: Request timed out. The server took too long to respond.');
      } else {
        setNotes(`ERROR: Failed to generate notes. ${error instanceof Error ? error.message : 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFileType(null);
    setFile(null);
    setTextContent('');
    setOutputStyle(null);
    setNotes('');
    setIsLoading(false);
  };

  return (
    <main className="relative z-10 min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 md:px-12 py-6 flex items-center justify-between border-b-4 border-[var(--maze-blue)]">
        <div className="flex items-center gap-4">
          {/* Pac-Man icon */}
          <div className="w-10 h-10 bg-[var(--pacman-yellow)] rounded-full"
            style={{ clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%, 0% 100%, 0% 0%)' }}
          />
          <div>
            <h1 className="text-sm md:text-base glow-yellow">NOTEFORGE</h1>
            <p className="text-[var(--text-muted)] text-xs mt-1" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
              Turn any mess into mastery
            </p>
          </div>
        </div>
        <StepIndicator currentStep={step} totalSteps={4} />
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full px-6 md:px-12 lg:px-20 py-10">
        <div className="max-w-5xl mx-auto w-full">
          {/* Step Title */}
          <div className="mb-10">
            {step === 1 && (
              <>
                <h2 className="text-lg md:text-xl mb-4 leading-relaxed">
                  WHAT ARE YOU <span className="text-[var(--pacman-yellow)] glow-yellow">UPLOADING</span>?
                </h2>
                <p className="text-[var(--text-secondary)] text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                  Choose the type of content you want to turn into notes.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-lg md:text-xl mb-4 leading-relaxed">
                  UPLOAD YOUR <span className="text-[var(--ghost-cyan)] glow-cyan">CONTENT</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                  Drop your file below or click to browse.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-lg md:text-xl mb-4 leading-relaxed">
                  CHOOSE YOUR <span className="text-[var(--ghost-pink)] glow-yellow">STYLE</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                  How detailed do you want your notes?
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <h2 className="text-lg md:text-xl mb-4 leading-relaxed">
                  {isLoading ? (
                    <>GENERATING<span className="dot-blink">...</span></>
                  ) : (
                    <>YOUR <span className="text-[var(--pacman-yellow)] glow-yellow">NOTES</span></>
                  )}
                </h2>
                <p className="text-[var(--text-secondary)] text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                  {isLoading ? 'Generating your notes, hang tight...' : 'Here are your generated notes.'}
                </p>
              </>
            )}
          </div>

          {/* Step Content */}
          {step === 1 && (
            <FileTypeSelector selected={fileType} onSelect={handleFileTypeSelect} />
          )}

          {step === 2 && fileType && (
            <FileUpload fileType={fileType} onFileSelect={handleFileSelect} onBack={() => setStep(1)} />
          )}

          {step === 3 && (
            <OutputStyleSelector
              selected={outputStyle}
              onSelect={handleOutputStyleSelect}
              onBack={() => setStep(2)}
              onGenerate={handleGenerate}
            />
          )}

          {step === 4 && (
            <ResultsDisplay notes={notes} isLoading={isLoading} onReset={handleReset} onBack={() => setStep(3)} />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 md:px-12 py-6 border-t-4 border-[var(--maze-blue)] flex items-center justify-between">
        <p className="text-[var(--text-muted)] text-sm" style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}>
          &copy; NOTEFORGE 2025 &bull; POWERED BY GROQ
        </p>
        <p className="text-[var(--text-muted)] opacity-45" style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}>
          ↑↑↓↓←→←→BA
        </p>
      </footer>

      {/* Easter Egg - Pac-Man Game (Konami Code) */}
      {showEasterEgg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(4px)' }}
        >
          <div className="relative">
            <button
              onClick={() => setShowEasterEgg(false)}
              className="absolute -top-10 right-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              style={{ fontFamily: 'VT323, monospace', fontSize: '20px' }}
            >
              ESC TO CLOSE
            </button>
            <PacManGame />
          </div>
        </div>
      )}
    </main>
  );
}
