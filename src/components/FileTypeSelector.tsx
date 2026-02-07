'use client';

type FileType = 'pdf' | 'ppt' | 'image' | 'text' | 'others';

interface FileTypeSelectorProps {
  selected: FileType | null;
  onSelect: (type: FileType) => void;
}

const fileTypes: { type: FileType; label: string; icon: string; desc: string }[] = [
  { type: 'pdf', label: 'PDF', icon: '📄', desc: 'PDF documents' },
  { type: 'ppt', label: 'PPT', icon: '📊', desc: 'Slide decks' },
  { type: 'image', label: 'IMAGE', icon: '🖼️', desc: 'Screenshots' },
  { type: 'text', label: 'TEXT', icon: '📝', desc: 'Raw text' },
  { type: 'others', label: 'OTHER', icon: '📎', desc: 'Any other file' },
];

export default function FileTypeSelector({ selected, onSelect }: FileTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {fileTypes.map(({ type, label, icon, desc }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={`nf-card flex flex-col items-center justify-center p-6 min-h-[150px] cursor-pointer ${
            selected === type ? 'selected' : ''
          }`}
        >
          <span className="text-4xl mb-3">{icon}</span>
          <span className="text-sm font-bold mb-1" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px' }}>{label}</span>
          <span className="text-[var(--text-muted)] mt-1" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>{desc}</span>
        </button>
      ))}
    </div>
  );
}
