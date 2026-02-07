'use client';

type OutputStyle = 'short' | 'standard' | 'detailed' | 'learn';

interface OutputStyleSelectorProps {
  selected: OutputStyle | null;
  onSelect: (style: OutputStyle) => void;
  onBack: () => void;
  onGenerate: () => void;
}

const outputStyles: { style: OutputStyle; label: string; icon: string; description: string; color: string }[] = [
  {
    style: 'short',
    label: 'SHORT',
    icon: '⚡',
    description: 'Key points only',
    color: 'var(--minecraft-green)',
  },
  {
    style: 'standard',
    label: 'STANDARD',
    icon: '📋',
    description: 'Balanced notes',
    color: 'var(--pacman-yellow)',
  },
  {
    style: 'detailed',
    label: 'DETAILED',
    icon: '📚',
    description: 'In-depth notes',
    color: 'var(--ghost-red)',
  },
  {
    style: 'learn',
    label: 'LEARN',
    icon: '🎓',
    description: 'Notes + Q&A',
    color: 'var(--ghost-cyan)',
  },
];

export default function OutputStyleSelector({
  selected,
  onSelect,
  onBack,
  onGenerate
}: OutputStyleSelectorProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {outputStyles.map(({ style, label, icon, description, color }) => (
          <button
            key={style}
            onClick={() => onSelect(style)}
            className={`nf-card flex flex-col items-center justify-center p-6 min-h-[160px] cursor-pointer ${
              selected === style ? 'selected' : ''
            }`}
          >
            <span className="text-4xl mb-3">{icon}</span>
            <span className="mb-1" style={{
              fontFamily: "'Press Start 2P', cursive",
              fontSize: '11px',
              color: selected === style ? 'var(--pacman-yellow)' : color,
            }}>
              {label}
            </span>
            <span className="text-[var(--text-muted)] mt-1" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
              {description}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button className="nf-btn nf-btn-secondary" onClick={onBack}>
          &lt; BACK
        </button>
        <button
          className="nf-btn nf-btn-primary"
          onClick={onGenerate}
          disabled={!selected}
        >
          FORGE NOTES!
        </button>
      </div>
    </div>
  );
}
