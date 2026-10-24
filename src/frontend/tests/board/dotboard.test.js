// A dot board is a pad per hole: copper exists only where a solder run joins
// two neighbouring pads. Its strip cuts stay underneath for the auto-layouter,
// and the runs it needs come from that strip layout.
const path = require("path");
const Module = require("module");
const OUT = path.join(__dirname, "out");
// the copper modules import through the "@/" alias, as the solver tests do
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(OUT, request.slice(2));
  return origResolve.call(this, request, ...rest);
};
const dotBoard = require(path.join(OUT, "components/stripboard/dotBoard.js"));
const { computeStripSegments } = require(path.join(OUT, "components/stripboard/stripSegments.js"));
const { computeConnectivity } = require(path.join(OUT, "components/stripboard/connectivity.js"));
const { getComponentPinPositions, holeCenter, HOLE_SPACING } = require(path.join(OUT, "components/stripboard/boardLayout.js"));
const { DEFAULT_COMPONENTS } = require(path.join(OUT, "data/defaultComponents.js"));
const {
  boardBridges, linksFromStrips, linksAfterInsert, linksAfterDelete, linksWithin, nearestLinkTarget, stripView, linkBetween,
} = dotBoard;

let failed = 0;
function ok(cond, label) {
  console.log(`  ${cond ? "ok  " : "FAIL"} ${label}`);
  if (!cond) failed++;
}
const def = (id) => DEFAULT_COMPONENTS.find((d) => d.id === id);
const comp = (id, defId, boardPos) =>
  ({ id, defId, label: id, schematicPos: { x: 0, y: 0 }, schematicRotation: 0, boardPos, rotation: 0 });
const board = (extra = {}) => ({ rows: 4, cols: 10, cuts: [], wires: [], ...extra });
const show = (links) => links.map((l) => `${l.dir}${l.row},${l.col}`).sort().join(" ");
const groupsOf = (b, comps = [], asg = []) => {
  const segs = computeStripSegments(b, comps, DEFAULT_COMPONENTS, asg);
  return { segs, groups: computeConnectivity(segs, boardBridges(b)) };
};
const groupAt = ({ segs, groups }, row, col) => {
  const i = segs.findIndex((s) => s.row === row && col >= s.startCol && col <= s.endCol);
  return groups.findIndex((g) => g.segmentIndices.includes(i));
};

console.log("\nthe copper of a dot board");
{
  const bare = groupsOf(board({ type: "dot", links: [] }));
  ok(bare.segs.length === 40, "with no runs every pad is a segment of its own");
  ok(bare.segs.every((s) => s.startCol === s.endCol), "and no segment is wider than one pad");

  const cutsIgnored = groupsOf(board({ type: "dot", links: [], cuts: [{ row: 0, col: 3, kind: "between" }] }));
  ok(cutsIgnored.segs.length === 40, "cuts change nothing on it");

  const runs = board({ type: "dot", links: [{ row: 0, col: 1, dir: "h" }, { row: 0, col: 2, dir: "h" }, { row: 0, col: 3, dir: "v" }] });
  const g = groupsOf(runs);
  ok(g.segs.some((s) => s.row === 0 && s.startCol === 1 && s.endCol === 3), "runs across join pads into one segment");
  ok(groupAt(g, 0, 1) === groupAt(g, 1, 3), "a run down joins the pads above and below");
  ok(groupAt(g, 0, 1) !== groupAt(g, 1, 2), "and nothing else");

  const wire = board({ type: "dot", links: [], wires: [{ id: "w", from: { row: 0, col: 0 }, to: { row: 3, col: 9 } }] });
  ok(groupAt(groupsOf(wire), 0, 0) === groupAt(groupsOf(wire), 3, 9), "link wires still join what they end on");
}

console.log("\nthe strip view underneath");
{
  const b = board({ type: "dot", links: [{ row: 0, col: 0, dir: "v" }], cuts: [{ row: 0, col: 4, kind: "between" }] });
  const strip = stripView(b);
  ok(strip.type === undefined && strip.links === undefined && strip.cuts.length === 1, "drops the board type and the runs, keeps the cuts");
  ok(computeStripSegments(strip, [], DEFAULT_COMPONENTS, []).length === 5, "and is a stripboard again: 4 strips, one cut");
  ok(stripView(board()) !== undefined && boardBridges(board({ wires: [] })).length === 0, "a stripboard has no runs to bridge");
}

console.log("\nruns from the strip layout");
{
  const ic = comp("ic", "def-555", { row: 0, col: 2 });
  const pins = getComponentPinPositions(ic, def("def-555"));
  const cols = [...new Set(pins.map((p) => p.col))].sort((a, b) => a - b);
  const rows = [...new Set(pins.map((p) => p.row))].sort((a, b) => a - b);
  const [left, right] = cols;
  const span = right - left;

  const plain = linksFromStrips(board(), [ic], DEFAULT_COMPONENTS, []);
  ok(plain.length === rows.length * span && plain.every((l) => l.dir === "h"), "each uncut strip joins its pins, from first to last only");
  ok(plain.every((l) => l.col >= left && l.col < right), "no copper beyond the outermost pins");

  const cut = linksFromStrips(board({ cuts: [{ row: rows[0], col: left, kind: "between" }] }), [ic], DEFAULT_COMPONENTS, []);
  ok(!cut.some((l) => l.row === rows[0]), "a cut strip with one pin each side gets no run");

  const wired = board({ wires: [{ id: "w", from: { row: rows[1], col: 8 }, to: { row: 3, col: 9 } }] });
  const withWire = linksFromStrips(wired, [ic], DEFAULT_COMPONENTS, []);
  ok(withWire.filter((l) => l.row === rows[1]).length === 8 - left, "a wire end counts as a used hole");

  const dotted = linksFromStrips(board({ type: "dot", links: [{ row: 3, col: 0, dir: "h" }] }), [ic], DEFAULT_COMPONENTS, []);
  ok(show(dotted) === show(plain), "the runs already laid make no difference");
}

console.log("\nboard edits");
{
  const v = { row: 1, col: 4, dir: "v" };
  const h = { row: 2, col: 4, dir: "h" };
  ok(show(linksAfterInsert([v, h], "row", 2)) === "h3,4 v1,4 v2,4", "a row inserted under a run down gets one more run over it");
  ok(show(linksAfterInsert([v, h], "col", 5)) === "h2,4 h2,5 v1,4", "the same across for a column");
  ok(show(linksAfterInsert([v, h], "row", 0)) === "h3,4 v2,4", "everything past the line moves on");

  const chain = [{ row: 0, col: 4, dir: "v" }, { row: 1, col: 4, dir: "v" }, { row: 2, col: 4, dir: "v" }];
  ok(show(linksAfterDelete(chain, "row", 1)) === "v0,4 v1,4", "a run straight through a deleted row closes up");
  ok(show(linksAfterDelete([{ row: 0, col: 4, dir: "v" }], "row", 1)) === "", "a run that ended on it goes");
  ok(show(linksAfterDelete([h, { row: 1, col: 1, dir: "h" }], "row", 2)) === "h1,1", "runs on the deleted row go");
  ok(show(linksAfterDelete([h], "col", 0)) === "h2,3", "a column deleted before a run moves it back");

  ok(show(linksWithin([v, h, { row: 0, col: 8, dir: "h" }], 3, 9)) === "h2,4 v1,4", "a smaller board keeps only the runs that fit");
}

console.log("\nwhere the run tool acts");
{
  const a = holeCenter(1, 1);
  ok(show([nearestLinkTarget(a.x + HOLE_SPACING / 2, a.y, 4, 10)]) === "h1,1", "between two pads across");
  ok(show([nearestLinkTarget(a.x, a.y + HOLE_SPACING / 2, 4, 10)]) === "v1,1", "between two pads down");
  ok(show([nearestLinkTarget(a.x + 4, a.y + 9, 4, 10)]) === "v1,1", "the nearer gap wins");
  const last = holeCenter(3, 9);
  ok(nearestLinkTarget(last.x + HOLE_SPACING / 2, last.y, 4, 10) === null, "never past the board edge");
  ok(linkBetween({ row: 0, col: 0 }, { row: 1, col: 1 }) === null, "pads that only touch corners have no run");
}

const { BOARD_PRESETS, BOARD_TYPES, copperLinks, fixedLinks, fixedLinkKeys } = require(path.join(OUT, "components/stripboard/boardTypes.js"));

console.log("\nboards with copper of their own");
{
  const tri = board({ type: "tripad", links: [], cols: 9 });
  const g = groupsOf(tri);
  ok(g.segs.filter((s) => s.row === 0).map((s) => `${s.startCol}-${s.endCol}`).join(" ") === "0-2 3-5 6-8", "a tripad row is pads in threes");
  const bridged = groupsOf({ ...tri, links: [{ row: 0, col: 2, dir: "h" }] });
  ok(bridged.segs.some((s) => s.row === 0 && s.startCol === 0 && s.endCol === 5), "a run joins two threes");
  ok(copperLinks({ ...tri, links: [{ row: 0, col: 0, dir: "h" }] }).length === fixedLinks("tripad", 4, 9).length, "a run on the board's own copper adds nothing");

  const bb = { rows: 17, cols: 30, cuts: [], wires: [], type: "breadboard", links: [] };
  const b = groupsOf(bb);
  ok(groupAt(b, 0, 0) === groupAt(b, 0, 29) && groupAt(b, 16, 0) === groupAt(b, 16, 29), "the rails run the whole width");
  ok(groupAt(b, 0, 0) !== groupAt(b, 1, 0), "the two rails of a pair are apart");
  ok(groupAt(b, 3, 4) === groupAt(b, 7, 4) && groupAt(b, 9, 4) === groupAt(b, 13, 4), "each column has two blocks of five");
  ok(groupAt(b, 7, 4) !== groupAt(b, 9, 4) && groupAt(b, 3, 4) !== groupAt(b, 3, 5), "apart from each other and from the next column");
  ok(groupAt(b, 2, 4) !== groupAt(b, 3, 4) && groupAt(b, 8, 4) !== groupAt(b, 9, 4), "the free rows join nothing");

  ok(fixedLinks("dot", 4, 9).length === 0 && fixedLinks(undefined, 4, 9).length === 0, "a dot board and a stripboard have no fixed links");
  ok(fixedLinkKeys(tri).has("h:0:0") && !fixedLinkKeys(tri).has("h:0:2"), "fixed copper is told apart by key");
}

console.log("\nboard presets");
{
  const types = new Set(BOARD_TYPES.map((t) => t.id));
  ok(BOARD_PRESETS.every((p) => types.has(p.type) && p.rows > 0 && p.cols > 0), "every preset is a known kind with a size");
  ok(new Set(BOARD_PRESETS.map((p) => p.id)).size === BOARD_PRESETS.length, "and has its own id");
  const measured = BOARD_PRESETS.find((p) => p.id === "dot-7x9");
  ok(measured && measured.rows === 26 && measured.cols === 31, "the 7 x 9 cm board is the counted 26 x 31");
}

console.log("\nthe parts the power controller uses");
{
  const pico = def("def-rpi-pico");
  ok(pico && pico.pins.length === 40 && pico.width === 8, "Raspberry Pi Pico: 40 pins, rows 0.7 in apart");
  const pin = (id) => pico.pins.find((p) => p.id === id);
  ok(pin("1").name === "GP0" && pin("1").offsetRow === 0 && pin("1").offsetCol === 0, "pin 1 GP0 at the top left");
  ok(pin("40").name === "VBUS" && pin("40").offsetRow === 0 && pin("40").offsetCol === 7, "pin 40 VBUS at the top right");
  ok(pin("21").name === "GP16" && pin("21").offsetRow === 19, "pin 21 GP16 at the bottom right");
  const blxa = def("def-fuse-holder-blxa");
  ok(blxa && blxa.pins.map((p) => `${p.offsetRow},${p.offsetCol}`).join(" ") === "2,0 2,10" && blxa.bodyCells.length === 53, "BLX-A fuse holder as drawn for the project");
  ok(def("def-lm2596-module")?.pins.length === 4 && def("def-rocker-dpst")?.pins.length === 4, "LM2596 module and DPST rocker switch");
}

console.log(failed === 0 ? "\nall passed" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
