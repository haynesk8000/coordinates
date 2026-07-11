import { Compass, FlaskConical, Gamepad2, GraduationCap } from 'lucide-react';

export type Mode = 'explore' | 'explain' | 'quiz' | 'fun';

type Props = {
  mode: Mode;
  onChange: (mode: Mode) => void;
  includeFunZone?: boolean;
};

const coreModes: Array<{ id: Mode; label: string; icon: typeof Compass }> = [
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'explain', label: 'Explain', icon: GraduationCap },
  { id: 'quiz', label: 'Quiz', icon: FlaskConical },
];

const funMode = { id: 'fun' as const, label: 'Fun Zone', icon: Gamepad2 };

export function ModeSwitcher({ mode, onChange, includeFunZone = false }: Props) {
  const modes = includeFunZone ? [...coreModes, funMode] : coreModes;

  return (
    <div className="mode-switcher" role="tablist" aria-label="Learning mode">
      {modes.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            className={mode === item.id ? 'active' : ''}
            onClick={() => onChange(item.id)}
          >
            <Icon aria-hidden="true" size={18} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
