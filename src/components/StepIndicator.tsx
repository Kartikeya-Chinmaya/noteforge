'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ['TYPE', 'UPLOAD', 'STYLE', 'NOTES'];

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i + 1 === currentStep;
        const isComplete = i + 1 < currentStep;

        return (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2 px-2 py-1">
              <div
                className="w-7 h-7 flex items-center justify-center text-xs"
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: '8px',
                  background: isActive
                    ? 'var(--pacman-yellow)'
                    : isComplete
                      ? 'var(--minecraft-green)'
                      : 'var(--bg-card)',
                  color: isActive || isComplete ? '#000' : 'var(--text-muted)',
                  border: `3px solid ${isActive ? 'var(--pacman-yellow)' : isComplete ? 'var(--minecraft-green)' : 'var(--maze-blue)'}`,
                }}
              >
                {isComplete ? '✓' : i + 1}
              </div>
              <span
                className="hidden md:inline text-xs"
                style={{
                  fontFamily: 'VT323, monospace',
                  fontSize: '16px',
                  color: isActive ? 'var(--pacman-yellow)' : isComplete ? 'var(--minecraft-green)' : 'var(--text-muted)',
                }}
              >
                {stepLabels[i]}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div className="flex items-center gap-1 mx-1">
                <div className="w-2 h-2 rounded-full" style={{
                  background: isComplete ? 'var(--dot-color)' : 'var(--text-muted)',
                  opacity: isComplete ? 1 : 0.3,
                }} />
                <div className="w-2 h-2 rounded-full" style={{
                  background: isComplete ? 'var(--dot-color)' : 'var(--text-muted)',
                  opacity: isComplete ? 1 : 0.3,
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
