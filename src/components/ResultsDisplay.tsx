'use client';

import { useState } from 'react';

interface ResultsDisplayProps {
  notes: string;
  isLoading: boolean;
  onReset: () => void;
  onBack: () => void;
}

export default function ResultsDisplay({ notes, isLoading, onReset, onBack }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'noteforge-notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="output-container min-h-[350px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {/* Pac-Man eating dots animation */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-12 h-12 bg-[var(--pacman-yellow)] rounded-full loading-chomp"
              />
              <div className="pac-dots">
                <div className="pac-dot" />
                <div className="pac-dot" />
                <div className="pac-dot" />
                <div className="pac-dot" />
                <div className="pac-dot" />
              </div>
            </div>
            <p style={{ fontFamily: 'VT323, monospace', fontSize: '22px', color: 'var(--pacman-yellow)' }}>
              GENERATING YOUR NOTES...
            </p>
            <p className="text-[var(--text-muted)] mt-2" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
              PLEASE WAIT
            </p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', lineHeight: 1.7 }}>{notes}</pre>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <div className="flex gap-3">
          <button className="nf-btn nf-btn-secondary" onClick={onReset}>
            START OVER
          </button>
          <button className="nf-btn nf-btn-secondary" onClick={onBack} disabled={isLoading}>
            &lt; CHANGE STYLE
          </button>
        </div>
        <div className="flex gap-3">
          <button
            className="nf-btn"
            onClick={handleCopy}
            disabled={isLoading || !notes}
          >
            {copied ? 'COPIED!' : 'COPY'}
          </button>
          <button
            className="nf-btn nf-btn-primary"
            onClick={handleDownload}
            disabled={isLoading || !notes}
          >
            DOWNLOAD
          </button>
        </div>
      </div>
    </div>
  );
}
