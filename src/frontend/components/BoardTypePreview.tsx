import type { BoardType } from "@/types";

// A small drawing of a bare board of each kind, for the home page cards.
// Not to scale and not the real copper rules (see boardTypes.ts): just
// enough pattern to tell the kinds apart at a glance.

const ROWS = 9;
const COLS = 13;
const P = 10; // hole pitch in viewBox units
const PAD = 3.6; // half the copper width

const at = (i: number) => P / 2 + i * P;

// Copper the board comes with, as runs from one hole to another: [row, col, row2, col2]
function fixedCopper(type: BoardType): [number, number, number, number][] {
  const runs: [number, number, number, number][] = [];
  if (type === "strip") {
    for (let r = 0; r < ROWS; r++) runs.push([r, 0, r, COLS - 1]);
  } else if (type === "tripad") {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c + 2 < COLS; c += 3) runs.push([r, c, r, c + 2]);
    }
  } else if (type === "breadboard") {
    // a rail along the top and the bottom, two blocks of columns between
    runs.push([0, 0, 0, COLS - 1], [ROWS - 1, 0, ROWS - 1, COLS - 1]);
    for (let c = 0; c < COLS; c++) runs.push([2, c, 3, c], [5, c, 6, c]);
  }
  return runs;
}

// A few solder runs a builder could lay on a dot board
const SAMPLE_RUNS: [number, number, number, number][] = [
  [2, 1, 2, 5],
  [2, 5, 6, 5],
  [6, 5, 6, 10],
  [4, 8, 4, 11],
];

export default function BoardTypePreview({ type, className }: { type: BoardType; className?: string }) {
  const runs = fixedCopper(type);
  const holes: [number, number][] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) holes.push([r, c]);
  const covered = new Set<string>();
  for (const [r1, c1, r2, c2] of runs) {
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) covered.add(`${r}:${c}`);
  }

  return (
    <svg viewBox={`0 0 ${COLS * P} ${ROWS * P}`} className={className} aria-hidden="true">
      <rect width={COLS * P} height={ROWS * P} rx={4} className="fill-[#efe3c4] dark:fill-[#2a251c]" />
      {runs.map(([r1, c1, r2, c2], i) => (
        <rect
          key={`f${i}`}
          x={at(c1) - PAD} y={at(r1) - PAD}
          width={at(c2) - at(c1) + 2 * PAD} height={at(r2) - at(r1) + 2 * PAD}
          rx={PAD}
          className="fill-[var(--copper)] opacity-80"
        />
      ))}
      {holes.filter(([r, c]) => !covered.has(`${r}:${c}`)).map(([r, c]) => (
        <circle key={`p${r}:${c}`} cx={at(c)} cy={at(r)} r={PAD} className="fill-[var(--copper)] opacity-80" />
      ))}
      {type === "dot" && SAMPLE_RUNS.map(([r1, c1, r2, c2], i) => (
        <line
          key={`s${i}`}
          x1={at(c1)} y1={at(r1)} x2={at(c2)} y2={at(r2)}
          strokeWidth={3.2} strokeLinecap="round"
          className="stroke-[#9ca3af] dark:stroke-[#d4d4d4]"
        />
      ))}
      {holes.map(([r, c]) => (
        <circle key={`h${r}:${c}`} cx={at(c)} cy={at(r)} r={1.3} className="fill-[#fafafa] dark:fill-[#121212]" />
      ))}
    </svg>
  );
}
