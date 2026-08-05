import { Target } from 'lucide-react';
import { CannonGame } from './CannonGame';
import {
  FunZoneHero,
  GameSelectorNav,
  useFunZoneStats,
  type GameMeta,
} from './FunZoneShared';

type GameId = 'cannon';
const gameIds: GameId[] = ['cannon'];

const games: Array<GameMeta<GameId>> = [
  { id: 'cannon', title: 'Cannon Game', tagline: 'Hit the hidden target', skill: 'Projectile artillery', icon: Target, color: 'coral', showDifficulty: false },
];

export function ProjectileFunZone() {
  const activeGame: GameId = 'cannon';
  const override = 'auto' as const;
  const { allStats, recordResult } = useFunZoneStats('physics-motion-lab-projectile-motion-funzone-v1', gameIds);
  const stats = allStats.cannon;

  return (
    <div className="fun-zone-layout">
      <FunZoneHero
        eyebrow="Trajectory Arcade • 1 game"
        totalCorrect={stats.correct}
        totalAttempts={stats.attempts}
        description="Fire a cannon at a hidden target and use projectile motion to hit the mark. Your score is saved in this browser."
        override={override}
        onOverrideChange={() => undefined}
        showDifficulty={false}
      />
      <GameSelectorNav games={games} activeGame={activeGame} onSelect={() => undefined} allStats={allStats} />
      <CannonGame stats={stats} override={override} onResult={(correct) => recordResult('cannon', correct)} />
    </div>
  );
}
