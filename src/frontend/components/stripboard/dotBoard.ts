import { Board, Component, ComponentDef, Link, NetAssignment, Wire } from "@/types";
import { resolveComponentDef } from "@/utils/resolveComponentDef";
import { getComponentPinPositions, holeCenter, HOLE_SPACING } from "./boardLayout";
import { computeStripSegments } from "./stripSegments";
import { copperLinks, isPadBoard } from "./boardTypes";

// A dot board (perfboard) is a pad per hole and no copper in between: what
// joins two pads is a solder run the builder lays. Horizontal runs make the
// board's segments the way uncut copper does on a strip; vertical runs bridge
// segments the way link wires do. The strip cuts are kept underneath, so the
// auto-layouter solves the board as a stripboard and its strips become runs.

export const isDotBoard = (board: Pick<Board, "type">): boolean => board.type === "dot";

export const sameLink = (a: Link, b: Link): boolean =>
  a.row === b.row && a.col === b.col && a.dir === b.dir;

export const linkKey = (l: Link): string => `${l.dir}:${l.row}:${l.col}`;

/** The pad at the far end of a run. */
export const linkEnd = (l: Link): { row: number; col: number } =>
  l.dir === "h" ? { row: l.row, col: l.col + 1 } : { row: l.row + 1, col: l.col };

/** The board as a stripboard: what the solver and the strip tools work on. */
export function stripView(board: Board): Board {
  if (board.type === undefined && board.links === undefined) return board;
  const rest = { ...board };
  delete rest.type;
  delete rest.links;
  return rest;
}

// Each vertical run as a one-hole link wire, so connectivity joins the
// segments it bridges. The ids keep them apart from the board's real wires.
const RUN_WIRE = "run:";
export const isRunWire = (wireId: string): boolean => wireId.startsWith(RUN_WIRE);

/** What bridges segments: the link wires, and on a pad board its copper down. */
export function boardBridges(board: Board): Wire[] {
  if (!isPadBoard(board)) return board.wires;
  const runs = copperLinks(board)
    .filter((l) => l.dir === "v")
    .map((l) => ({ id: RUN_WIRE + linkKey(l), from: { row: l.row, col: l.col }, to: linkEnd(l) }));
  return runs.length === 0 ? board.wires : [...board.wires, ...runs];
}

/**
 * The solder runs that build the board's strip layout: along each strip
 * segment, only from its first to its last used hole (a pin or a wire end).
 * Copper past those carries nothing, so it is not laid.
 */
export function linksFromStrips(
  board: Board,
  components: Component[],
  componentDefs: ComponentDef[],
  netAssignments: NetAssignment[],
): Link[] {
  const strip = stripView(board);
  const usedByRow = new Map<number, number[]>();
  const mark = (row: number, col: number) => {
    if (!usedByRow.has(row)) usedByRow.set(row, []);
    usedByRow.get(row)!.push(col);
  };
  for (const comp of components) {
    if (!comp.boardPos) continue;
    const def = resolveComponentDef(comp, componentDefs);
    if (!def) continue;
    for (const pin of getComponentPinPositions(comp, def)) mark(pin.row, pin.col);
  }
  for (const w of strip.wires) {
    mark(w.from.row, w.from.col);
    mark(w.to.row, w.to.col);
  }

  const links: Link[] = [];
  for (const seg of computeStripSegments(strip, components, componentDefs, netAssignments)) {
    const cols = (usedByRow.get(seg.row) ?? []).filter((c) => c >= seg.startCol && c <= seg.endCol);
    if (cols.length < 2) continue;
    const from = Math.min(...cols);
    const to = Math.max(...cols);
    for (let col = from; col < to; col++) links.push({ row: seg.row, col, dir: "h" });
  }
  return links;
}

/** The gap between two neighbouring pads nearest a point, across or down. */
export function nearestLinkTarget(svgX: number, svgY: number, rows: number, cols: number): Link | null {
  const origin = holeCenter(0, 0);
  const fx = (svgX - origin.x) / HOLE_SPACING;
  const fy = (svgY - origin.y) / HOLE_SPACING;
  const h: Link = { row: Math.round(fy), col: Math.floor(fx), dir: "h" };
  const v: Link = { row: Math.floor(fy), col: Math.round(fx), dir: "v" };
  const dh = Math.hypot(fx - (h.col + 0.5), fy - h.row);
  const dv = Math.hypot(fx - v.col, fy - (v.row + 0.5));
  const valid = (l: Link) =>
    l.row >= 0 && l.col >= 0 &&
    (l.dir === "h" ? l.row < rows && l.col < cols - 1 : l.row < rows - 1 && l.col < cols);
  const best = dh <= dv ? h : v;
  if (Math.min(dh, dv) > 0.5 || !valid(best)) return null;
  return best;
}

/** The run between two pads that touch across or down, or null. */
export function linkBetween(a: { row: number; col: number }, b: { row: number; col: number }): Link | null {
  if (a.row === b.row && Math.abs(a.col - b.col) === 1) return { row: a.row, col: Math.min(a.col, b.col), dir: "h" };
  if (a.col === b.col && Math.abs(a.row - b.row) === 1) return { row: Math.min(a.row, b.row), col: a.col, dir: "v" };
  return null;
}

/** The runs after a blank line goes in at `at`: a run across the new line is laid over it. */
export function linksAfterInsert(links: Link[], axis: "row" | "col", at: number): Link[] {
  const out: Link[] = [];
  for (const l of links) {
    const coord = axis === "row" ? l.row : l.col;
    const along = (axis === "row") === (l.dir === "v");
    const shifted = coord >= at ? (axis === "row" ? { ...l, row: l.row + 1 } : { ...l, col: l.col + 1 }) : l;
    out.push(shifted);
    // the run crossed the gap the new line opens: one more run spans it
    if (along && coord === at - 1) out.push(axis === "row" ? { ...l, row: at } : { ...l, col: at });
  }
  return out;
}

/** The runs after line `at` goes: runs on it go, a straight run through it closes up. */
export function linksAfterDelete(links: Link[], axis: "row" | "col", at: number): Link[] {
  const keys = new Set(links.map(linkKey));
  const out: Link[] = [];
  for (const l of links) {
    const coord = axis === "row" ? l.row : l.col;
    const along = (axis === "row") === (l.dir === "v");
    if (along) {
      // joins the line to its neighbour: gone, unless the run carries on
      // through the line, in which case the one before it closes the gap
      if (coord === at) continue;
      if (coord === at - 1) {
        const next = axis === "row" ? { ...l, row: at } : { ...l, col: at };
        if (!keys.has(linkKey(next))) continue;
      }
    } else if (coord === at) {
      continue;
    }
    out.push(coord > at ? (axis === "row" ? { ...l, row: l.row - 1 } : { ...l, col: l.col - 1 }) : l);
  }
  return out;
}

/** The runs that still fit a board of this size. */
export function linksWithin(links: Link[], rows: number, cols: number): Link[] {
  return links.filter((l) => {
    const end = linkEnd(l);
    return end.row < rows && end.col < cols;
  });
}
