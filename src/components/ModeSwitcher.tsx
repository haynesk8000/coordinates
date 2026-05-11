import { Compass, FlaskConical, GraduationCap } from 'lucide-react';

export type Mode = 'explore' | 'explain' | 'quiz';

type Props = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const modes: Array<{ id: Mode; label: string; icon: typeof Compass }> = [
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'explain', label: 'Explain', icon: GraduationCap },
  { id: 'quiz', label: 'Quiz', icon: FlaskConical },
];

export function ModeSwitcher({ mode, onChange }: Props) {
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
