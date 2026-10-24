import { Board, BoardType, Link } from "@/types";

// The kinds of prototyping board. A stripboard is copper strips along the
// rows, split by cuts. Every other kind is a pad per hole, joined by copper
// the board comes with (fixed, nothing to do) and solder runs the builder
// lays (the board's `links`).

export interface BoardTypeInfo {
  id: BoardType;
  name: string;
  description: string;
  // The board joins some pads by itself
  fixedCopper: boolean;
  // The auto-layouter can solve it: it lays out strips, and a dot board's
  // runs come from them. Fixed copper groups it cannot work around yet.
  autoLayout: boolean;
}

export const BOARD_TYPES: BoardTypeInfo[] = [
  {
    id: "strip", name: "Stripboard", fixedCopper: true, autoLayout: true,
    description: "Veroboard: copper strips along the rows. Separate them with cuts.",
  },
  {
    id: "dot", name: "Dot board", fixedCopper: false, autoLayout: true,
    description: "Perfboard, single or double sided: a pad per hole, nothing between. Join pads with solder runs.",
  },
  {
    id: "tripad", name: "Tripad board", fixedCopper: true, autoLayout: false,
    description: "A pad per hole, joined in threes along each row. Join groups with solder runs.",
  },
  {
    id: "breadboard", name: "Breadboard PCB", fixedCopper: true, autoLayout: false,
    description: "Laid out like a solderless breadboard: two power rails along the top and the bottom, and two blocks of pads joined down each column with a gap between.",
  },
];

export const boardTypeInfo = (type: BoardType | undefined): BoardTypeInfo =>
  BOARD_TYPES.find((t) => t.id === (type ?? "strip"))!;

/** A pad per hole, joined by links: every kind but the stripboard */
export const isPadBoard = (board: Pick<Board, "type">): boolean =>
  board.type !== undefined && board.type !== "strip";

const keyOf = (l: Link): string => `${l.dir}:${l.row}:${l.col}`;

/**
 * The breadboard pattern for any size: rails on the two outer rows at the
 * top and the bottom, a free row inside each pair, and the rows between in
 * two blocks joined down each column, with a free row between the blocks
 * when the count is odd. A board too short for rails is one block.
 */
function breadboardLinks(rows: number, cols: number): Link[] {
  const links: Link[] = [];
  const rail = (row: number) => {
    for (let col = 0; col < cols - 1; col++) links.push({ row, col, dir: "h" });
  };
  const block = (from: number, to: number) => {
    for (let row = from; row < to; row++) {
      for (let col = 0; col < cols; col++) links.push({ row, col, dir: "v" });
    }
  };
  if (rows < 8) {
    block(0, rows - 1);
    return links;
  }
  rail(0); rail(1); rail(rows - 2); rail(rows - 1);
  const first = 3;
  const last = rows - 4;
  const count = last - first + 1;
  const half = Math.floor(count / 2);
  if (count % 2 === 1) {
    block(first, first + half - 1);
    block(first + half + 1, last);
  } else {
    block(first, first + half - 1);
    block(first + half, last);
  }
  return links;
}

const fixedCache = new Map<string, Link[]>();

/** The copper the board comes with between its pads. */
export function fixedLinks(type: BoardType | undefined, rows: number, cols: number): Link[] {
  if (type !== "tripad" && type !== "breadboard") return [];
  const key = `${type}:${rows}:${cols}`;
  let links = fixedCache.get(key);
  if (!links) {
    links = [];
    if (type === "tripad") {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols - 1; col++) if (col % 3 !== 2) links.push({ row, col, dir: "h" });
      }
    } else {
      links = breadboardLinks(rows, cols);
    }
    fixedCache.set(key, links);
  }
  return links;
}

/** Keys of the fixed copper, to tell it apart from the runs. */
export function fixedLinkKeys(board: Pick<Board, "type" | "rows" | "cols">): Set<string> {
  return new Set(fixedLinks(board.type, board.rows, board.cols).map(keyOf));
}

const copperCache = new WeakMap<Board, Link[]>();

/** All copper between pads: what the board comes with, then the runs laid on it. */
export function copperLinks(board: Board): Link[] {
  if (!isPadBoard(board)) return [];
  let links = copperCache.get(board);
  if (!links) {
    const fixed = fixedLinks(board.type, board.rows, board.cols);
    const keys = new Set(fixed.map(keyOf));
    links = [...fixed, ...(board.links ?? []).filter((l) => !keys.has(keyOf(l)))];
    copperCache.set(board, links);
  }
  return links;
}

// ── Board sizes ─────────────────────────────────────────

export interface BoardPreset {
  id: string;
  name: string;
  type: BoardType;
  rows: number;
  cols: number;
}

// Green double-sided prototype boards (plated through, 2.54 mm pitch) in the
// common outline sizes. The 7 x 9 cm count is measured on a real board; the
// other counts are the usual ones for that outline and vary by maker: count
// your board's holes and correct the rows and columns if they differ.
export const BOARD_PRESETS: BoardPreset[] = [
  { id: "dot-2x8", name: "2 x 8 cm", type: "dot", rows: 8, cols: 28 },
  { id: "dot-3x7", name: "3 x 7 cm", type: "dot", rows: 10, cols: 24 },
  { id: "dot-4x6", name: "4 x 6 cm", type: "dot", rows: 14, cols: 20 },
  { id: "dot-5x7", name: "5 x 7 cm", type: "dot", rows: 18, cols: 24 },
  { id: "dot-7x9", name: "7 x 9 cm", type: "dot", rows: 26, cols: 31 },
  { id: "dot-8x12", name: "8 x 12 cm", type: "dot", rows: 28, cols: 42 },
  { id: "dot-9x15", name: "9 x 15 cm", type: "dot", rows: 34, cols: 52 },
  { id: "dot-12x18", name: "12 x 18 cm", type: "dot", rows: 43, cols: 65 },
  { id: "dot-15x20", name: "15 x 20 cm", type: "dot", rows: 55, cols: 73 },
  { id: "breadboard-half", name: "Half size", type: "breadboard", rows: 17, cols: 30 },
  { id: "breadboard-full", name: "Full size", type: "breadboard", rows: 17, cols: 63 },
];
