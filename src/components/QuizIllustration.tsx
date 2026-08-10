type QuizIllustrationProps = {
  moduleId: string;
  prompt: string;
};

const Arrow = ({ id }: { id: string }) => (
  <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" />
  </marker>
);

const CoordinateFigure = ({ prompt }: { prompt: string }) => {
  const lower = prompt.toLowerCase();
  const swapped = lower.includes('x points vertically') || lower.includes('vertical coordinate is named x');
  const left = lower.includes('left');
  const down = lower.includes('down');
  const rotated = lower.includes('rotat') || lower.includes('theta') || lower.includes('orthogonal');
  const wall = lower.includes('wall');
  const landing = lower.includes('landing');
  const ground = lower.includes('ground');
  const above = lower.includes('above the launch');
  const below = lower.includes('below the launch');
  const origin = wall ? { x: 270, y: 116 } : landing ? { x: 410, y: 190 } : (ground || below) ? { x: 105, y: 190 } : above ? { x: 105, y: 45 } : { x: 105, y: 82 };
  const angle = rotated ? -28 : 0;
  const axis1Label = swapped ? 'y' : lower.includes('a right') || lower.includes('a left') ? 'a' : lower.includes('named r') ? 's' : 'x';
  const axis2Label = swapped ? 'x' : lower.includes('b up') || lower.includes('b down') ? 'b' : lower.includes('named r') ? 'r' : 'y';
  const horizontalEnd = left ? origin.x - 75 : origin.x + 75;
  const verticalEnd = down ? origin.y + 65 : origin.y - 65;
  return <svg viewBox="0 0 520 230" role="img" aria-label={`Coordinate-system diagram for: ${prompt}`}>
    <defs><Arrow id="quiz-coordinate-arrow" /></defs>
    <rect className="quiz-sky" width="520" height="230" />
    <path className="quiz-land" d="M25 82 H105 V190 H495" />
    <rect className="quiz-wall" x="260" y="116" width="20" height="74" />
    <path className="quiz-trajectory" d="M105 82 Q250 82 410 190" />
    <circle className="quiz-object" cx="105" cy="82" r="7" />
    <g transform={`rotate(${angle} ${origin.x} ${origin.y})`}>
      <line className="quiz-axis axis-one" x1={origin.x} y1={origin.y} x2={horizontalEnd} y2={origin.y} markerEnd="url(#quiz-coordinate-arrow)" />
      <line className="quiz-axis axis-two" x1={origin.x} y1={origin.y} x2={origin.x} y2={verticalEnd} markerEnd="url(#quiz-coordinate-arrow)" />
      <text className="quiz-label" x={horizontalEnd + (left ? -10 : 10)} y={origin.y - 8}>{axis1Label}</text>
      <text className="quiz-label" x={origin.x + 9} y={verticalEnd + (down ? 16 : -6)}>{axis2Label}</text>
    </g>
    <circle className="quiz-origin" cx={origin.x} cy={origin.y} r="5" /><text className="quiz-muted-label" x={origin.x + 8} y={origin.y + 17}>origin</text>
    <line className="quiz-vector velocity" x1="105" y1="82" x2="165" y2="82" markerEnd="url(#quiz-coordinate-arrow)" />
    <line className="quiz-vector gravity" x1="195" y1="50" x2="195" y2="102" markerEnd="url(#quiz-coordinate-arrow)" />
    <text className="quiz-muted-label" x="202" y="78">gravity</text>
  </svg>;
};

const ProjectileFigure = ({ prompt }: { prompt: string }) => (
  <svg viewBox="0 0 520 230" role="img" aria-label={`Projectile-motion diagram for: ${prompt}`}>
    <defs><Arrow id="quiz-projectile-arrow" /></defs><rect className="quiz-sky" width="520" height="230" />
    <line className="quiz-ground" x1="25" y1="196" x2="495" y2="196" /><path className="quiz-trajectory" d="M65 170 Q245 12 460 196" />
    <path className="quiz-cannon" d="M45 177 l35 -28 l9 12 l-34 28 z" /><circle className="quiz-object" cx="255" cy="75" r="7" />
    <line className="quiz-vector velocity" x1="255" y1="75" x2="315" y2="95" markerEnd="url(#quiz-projectile-arrow)" />
    <line className="quiz-vector gravity" x1="255" y1="75" x2="255" y2="135" markerEnd="url(#quiz-projectile-arrow)" />
    <line className="quiz-guide" x1="65" y1="170" x2="150" y2="170" /><path className="quiz-angle" d="M98 170 A33 33 0 0 0 89 148" />
    <text className="quiz-muted-label" x="270" y="129">g</text><text className="quiz-muted-label" x="112" y="158">launch</text>
  </svg>
);

const MotionFigure = ({ prompt }: { prompt: string }) => {
  const graph = prompt.toLowerCase().includes('graph') || prompt.toLowerCase().includes('distance');
  return <svg viewBox="0 0 520 230" role="img" aria-label={`Motion representation for: ${prompt}`}>
    <defs><Arrow id="quiz-motion-arrow" /></defs><rect className="quiz-paper" width="520" height="230" />
    {graph ? <><line className="quiz-axis" x1="70" y1="185" x2="460" y2="185" markerEnd="url(#quiz-motion-arrow)" /><line className="quiz-axis" x1="70" y1="185" x2="70" y2="35" markerEnd="url(#quiz-motion-arrow)" /><path className="quiz-graph" d="M70 175 C155 165 220 132 290 103 S405 65 450 45" /><text className="quiz-muted-label" x="455" y="205">time</text><text className="quiz-muted-label" x="38" y="35">position</text></> : <><line className="quiz-track" x1="45" y1="155" x2="475" y2="155" />{[75,115,165,230,315,420].map((x, index) => <g key={x}><circle className="quiz-motion-dot" cx={x} cy="145" r={5 + index * .35} /><text className="quiz-muted-label" x={x - 5} y="180">t{index}</text></g>)}<line className="quiz-vector velocity" x1="230" y1="105" x2="315" y2="105" markerEnd="url(#quiz-motion-arrow)" /><line className="quiz-vector acceleration" x1="230" y1="75" x2="175" y2="75" markerEnd="url(#quiz-motion-arrow)" /><text className="quiz-muted-label" x="260" y="98">velocity</text><text className="quiz-muted-label" x="177" y="66">acceleration</text></>}
  </svg>;
};

const RelativeFigure = ({ prompt }: { prompt: string }) => {
  const train = prompt.toLowerCase().includes('train') || prompt.toLowerCase().includes('passenger');
  return <svg viewBox="0 0 520 230" role="img" aria-label={`Relative-motion diagram for: ${prompt}`}>
    <defs><Arrow id="quiz-relative-arrow" /></defs><rect className="quiz-sky" width="520" height="230" />
    {train ? <><line className="quiz-ground" x1="25" y1="185" x2="495" y2="185" /><rect className="quiz-vehicle" x="95" y="90" width="300" height="80" rx="14" /><circle className="quiz-wheel" cx="150" cy="176" r="15" /><circle className="quiz-wheel" cx="340" cy="176" r="15" /><circle className="quiz-person" cx="240" cy="115" r="9" /><path className="quiz-person-line" d="M240 124 v23 m0 -15 l-15 12 m15 -12 l17 9" /><line className="quiz-vector velocity" x1="155" y1="65" x2="365" y2="65" markerEnd="url(#quiz-relative-arrow)" /><line className="quiz-vector secondary" x1="220" y1="105" x2="290" y2="105" markerEnd="url(#quiz-relative-arrow)" /><text className="quiz-muted-label" x="205" y="51">train / ground</text><text className="quiz-muted-label" x="235" y="96">passenger / train</text></> : <><rect className="quiz-river" x="35" y="30" width="450" height="170" /><line className="quiz-bank" x1="35" y1="30" x2="485" y2="30" /><line className="quiz-bank" x1="35" y1="200" x2="485" y2="200" /><path className="quiz-boat" d="M205 172 l18 -32 l18 32 z" /><line className="quiz-vector velocity" x1="223" y1="155" x2="223" y2="70" markerEnd="url(#quiz-relative-arrow)" /><line className="quiz-vector secondary" x1="223" y1="155" x2="335" y2="155" markerEnd="url(#quiz-relative-arrow)" /><path className="quiz-guide" d="M223 155 L335 70" /><text className="quiz-muted-label" x="345" y="160">current</text><text className="quiz-muted-label" x="232" y="83">across</text></>}
  </svg>;
};

const CircularFigure = ({ prompt }: { prompt: string }) => (
  <svg viewBox="0 0 520 230" role="img" aria-label={`Uniform-circular-motion diagram for: ${prompt}`}>
    <defs><Arrow id="quiz-circular-arrow" /></defs><rect className="quiz-paper" width="520" height="230" />
    <circle className="quiz-orbit" cx="260" cy="120" r="82" /><circle className="quiz-center" cx="260" cy="120" r="5" /><circle className="quiz-object" cx="330" cy="77" r="9" />
    <line className="quiz-radius" x1="260" y1="120" x2="330" y2="77" /><line className="quiz-vector velocity" x1="330" y1="77" x2="375" y2="150" markerEnd="url(#quiz-circular-arrow)" /><line className="quiz-vector acceleration" x1="330" y1="77" x2="275" y2="111" markerEnd="url(#quiz-circular-arrow)" />
    <text className="quiz-muted-label" x="285" y="111">radius</text><text className="quiz-muted-label" x="375" y="159">tangent</text><text className="quiz-muted-label" x="255" y="137">center</text>
  </svg>
);

export function QuizIllustration({ moduleId, prompt }: QuizIllustrationProps) {
  const figure = moduleId === 'coordinate-systems' ? <CoordinateFigure prompt={prompt} />
    : moduleId === 'projectile-motion' ? <ProjectileFigure prompt={prompt} />
      : moduleId === 'motion-diagrams' ? <MotionFigure prompt={prompt} />
        : moduleId === 'relative-motion' ? <RelativeFigure prompt={prompt} />
          : <CircularFigure prompt={prompt} />;
  return <figure className={`quiz-illustration quiz-illustration-${moduleId}`}>{figure}</figure>;
}
