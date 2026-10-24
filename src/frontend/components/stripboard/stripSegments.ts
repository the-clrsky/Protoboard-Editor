import { pinKey } from "./keys";
import { Board, Component, ComponentDef, NetAssignment } from "@/types";
import { resolveComponentDef } from "@/utils/resolveComponentDef";
import { getComponentPinPositions } from "./boardLayout";
import { copperLinks, isPadBoard } from "./boardTypes";

export interface StripSegment {
  row: number;
  startCol: number;
  endCol: number; // inclusive
  netIds: string[];
}

/** Find which segment a hole belongs to, or -1 if none */
export function findSegmentIndex(
  segments: StripSegment[],
  row: number,
  col: number
): number {
  return segments.findIndex(
    (s) => s.row === row && col >= s.startCol && col <= s.endCol
  );
}

/** Compute all strip segments for the board, split by cuts, with net assignments */
export function computeStripSegments(
  board: Board,
  components: Component[],
  componentDefs: ComponentDef[],
  netAssignments: NetAssignment[]
): StripSegment[] {
  // Pre-compute pin positions (with resolved nets) per row, and cuts per row,
  // so the per-segment work below stays linear.
  const netOfPin = new Map<string, string>();
  for (const a of netAssignments) {
    netOfPin.set(pinKey(a.componentId, a.pinId), a.netId);
  }
  const pinsByRow = new Map<number, { col: number; netId: string | undefined }[]>();
  for (const comp of components) {
    if (!comp.boardPos) continue;
    const def = resolveComponentDef(comp, componentDefs);
    if (!def) continue;
    const pins = getComponentPinPositions(comp, def);
    for (const pin of pins) {
      if (!pinsByRow.has(pin.row)) pinsByRow.set(pin.row, []);
      pinsByRow.get(pin.row)!.push({ col: pin.col, netId: netOfPin.get(pinKey(comp.id, pin.pinId)) });
    }
  }
  const cutsByRow = new Map<number, Board["cuts"]>();
  for (const cut of board.cuts) {
    if (!cutsByRow.has(cut.row)) cutsByRow.set(cut.row, []);
    cutsByRow.get(cut.row)!.push(cut);
  }
  // A pad board has no strips: its cuts mean nothing, and a pad joins the
  // next one across only where copper (the board's own, or a solder run)
  // lies between them.
  const dot = isPadBoard(board);
  const runsByRow = new Map<number, Set<number>>();
  if (dot) {
    for (const link of copperLinks(board)) {
      if (link.dir !== "h") continue;
      if (!runsByRow.has(link.row)) runsByRow.set(link.row, new Set());
      runsByRow.get(link.row)!.add(link.col);
    }
  }

  const segments: StripSegment[] = [];

  for (let row = 0; row < board.rows; row++) {
    const rowCuts = cutsByRow.get(row) ?? [];

    // Build segment boundaries. A boundary value B starts a new segment at col B.
    // - between-cut at col X: severs X | X+1, so a boundary at X+1.
    // - hole-cut at col X: isolates the hole, so boundaries at X and X+1.
    // - dot board: a boundary at every col B with no run from B-1.
    const boundarySet = new Set<number>([0]);
    if (dot) {
      const runs = runsByRow.get(row);
      for (let col = 1; col < board.cols; col++) {
        if (!runs?.has(col - 1)) boundarySet.add(col);
      }
    } else {
      for (const cut of rowCuts) {
        if (cut.kind === "hole") {
          boundarySet.add(cut.col);
          boundarySet.add(cut.col + 1);
        } else {
          boundarySet.add(cut.col + 1);
        }
      }
    }
    const boundaries = Array.from(boundarySet).sort((a, b) => a - b);

    // Each boundary starts a segment that ends at the next boundary - 1 (or board.cols - 1)
    for (let i = 0; i < boundaries.length; i++) {
      const startCol = boundaries[i];
      const endCol = i + 1 < boundaries.length ? boundaries[i + 1] - 1 : board.cols - 1;
      if (startCol > endCol) continue;

      // Nets of the pins on this segment
      const netIdSet = new Set<string>();
      for (const pin of pinsByRow.get(row) ?? []) {
        if (pin.col >= startCol && pin.col <= endCol && pin.netId !== undefined) {
          netIdSet.add(pin.netId);
        }
      }

      segments.push({
        row,
        startCol,
        endCol,
        netIds: Array.from(netIdSet),
      });
    }
  }

  return segments;
}
