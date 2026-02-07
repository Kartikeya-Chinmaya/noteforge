'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

type FileType = 'pdf' | 'ppt' | 'image' | 'text' | 'others';

interface FileUploadProps {
  fileType: FileType;
  onFileSelect: (file: File | null, textContent?: string) => void;
  onBack: () => void;
}

const acceptTypes: Record<FileType, string> = {
  pdf: '.pdf',
  ppt: '.ppt,.pptx',
  image: '.png,.jpg,.jpeg,.gif,.webp',
  text: '.txt,.md,.doc,.docx',
  others: '*',
};

export default function FileUpload({ fileType, onFileSelect, onBack }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleContinue = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onFileSelect(null, textInput);
    }
  };

  if (fileType === 'text') {
    return (
      <div className="w-full">
        <textarea
          className="nf-textarea"
          placeholder="Paste your text here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <div className="flex justify-between mt-6">
          <button className="nf-btn nf-btn-secondary" onClick={onBack}>
            &lt; BACK
          </button>
          <button
            className="nf-btn nf-btn-primary"
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
          >
            NEXT &gt;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes[fileType]}
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="text-center px-4">
            <span className="text-5xl mb-4 block text-[var(--pacman-yellow)]">&#9733;</span>
            <p className="text-lg break-all" style={{ fontFamily: 'VT323, monospace' }}>{selectedFile.name}</p>
            <p className="text-[var(--text-muted)] mt-2" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>CLICK TO CHANGE FILE</p>
          </div>
        ) : (
          <div className="text-center px-4">
            <span className="text-5xl mb-4 block">&#9660;</span>
            <p className="text-lg mb-1" style={{ fontFamily: 'VT323, monospace' }}>
              DROP FILE HERE OR CLICK TO BROWSE
            </p>
            <p className="text-[var(--text-muted)]" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
              ACCEPTS: {acceptTypes[fileType]}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button className="nf-btn nf-btn-secondary" onClick={onBack}>
          &lt; BACK
        </button>
        <button
          className="nf-btn nf-btn-primary"
          onClick={handleContinue}
          disabled={!selectedFile}
        >
          NEXT &gt;
        </button>
      </div>
    </div>
  );
}
