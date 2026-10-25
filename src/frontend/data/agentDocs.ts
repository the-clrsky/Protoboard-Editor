// Markdown twins of the public pages, served for agents alongside the HTML
// (llms.txt spec v2). GUIDE_MD, AUTO_LAYOUT_MD, INDEX_MD and PRIVACY_MD are
// written by hand and must be updated when their page changes; scripts/
// checkAgentDocs.js fails the check when a page moves without its twin.
// UPDATES_MD is generated from data/updates.ts, so it cannot drift.
import { UPDATES, PLANNED } from "@/data/updates";
import { SITE_URL } from "@/lib/site";

export const SITE = SITE_URL;

export const INDEX_MD = `# Protoboard Editor

> Free, open-source layout editor for prototyping boards: stripboard, dot board
> (perfboard), tripad board and breadboard PCB. Draw a schematic, place the
> parts on a virtual board, or let the automatic layouter place them and lay
> the strip cuts or solder runs. This is the markdown version of ${SITE}.

Plan a circuit on the board you will really solder: stripboard, dot board, tripad board or a breadboard-style PCB. Draw the schematic once. Then place the parts by hand, with every net in its own colour, or let auto-layout place them and lay the cuts or solder runs for you.

The editor is free and open source (GPL-3.0). Use it in the browser or host it on your own server. There are no ads.

## Board kinds

Each kind opens a new project from the home page; the editor can change it later.

- **Stripboard:** copper strips along every row. Cut them where two nets must part. Auto-layout works here.
- **Dot board:** a lone pad per hole. Solder runs join the pads you choose. Auto-layout works here.
- **Tripad board:** pads joined in threes along each row. Bridge the groups with solder. Hand layout.
- **Breadboard PCB:** the breadboard pattern in copper: power rails and joined columns. Hand layout.

The home page shows a demo: a 555 LED flasher that auto-layout put on a 7 x 18 dot board, each net in its own colour and joined by solder runs.

## From idea to board

1. **Draw.** Build the schematic from the symbol library or your own parts. The wires make the nets.
2. **Choose the board.** Pick the kind of board on your bench and its size. Presets cover the common perfboard sizes.
3. **Lay it out.** Drag the parts onto the board. Every net gets its own colour, and a short or an open connection shows at once. Or use auto-layout: on stripboard and dot board the router places every part and lays the cuts or solder runs.
4. **Print and solder.** Print the 1:1 sheets, push the parts through the paper, then follow the cut or run sheet. When the prototype works, export a KiCad netlist and draw the real PCB.

## What you get

Design:

- Schematic editor with a standard symbol library and automatic net detection
- IC pinouts from the KiCad symbol library, plus your own custom parts
- Parts drawn as real packages at true size: choose the body you have
- Editable footprints and flexible leads for passives

Lay out:

- Four board kinds: stripboard, dot board, tripad board, breadboard PCB
- Auto-layout for stripboard and dot board: placement, board size, cuts and runs
- Lock the board size or single parts, and the router works around them
- Off-board parts such as pots and jacks get pads or a connector

Build and share:

- 1:1 print: placement sheet, mirrored cut or run sheet, parts list
- KiCad-compatible netlist export
- JSON export and import, full undo history
- Edit and view-only links when you host it yourself

## Print and build

The printout is a true-scale build guide: a placement sheet for the component side, a mirrored cut sheet (stripboard) or solder-run sheet (dot board) for the copper side, and a parts list.

## Where to go next

- Guide: ${SITE}/guide.md
- How the automatic layouter works: ${SITE}/how-auto-layout-works.md
- Changelog: ${SITE}/updates.md
- Privacy policy: ${SITE}/privacy.md

Protoboard Editor is a project by the-clrsky (https://github.com/the-clrsky), a fork of Stripboard Editor that adds dot boards, tripad boards and breadboard PCBs.
`;

export const PRIVACY_MD = `# Privacy Policy

> The privacy policy of Protoboard Editor: what data is stored and where.

## About this project

Protoboard Editor is a personal, non-commercial hobby project by the-clrsky. It is not affiliated with or operated by any company, does not generate revenue and is free of charge.

## Where your data is

The editor runs on your own computer. Projects, accounts and feedback are stored in a local SQLite database next to the program and never leave your computer.

## What is stored

Your projects (components, nets, board layout). If you create an account: your username, a hashed version of your password and, if you add one, your email address. A single session cookie keeps you logged in.

## What is shared

Nothing. There is no analytics, no tracking and no ads. Only if you set up an email provider yourself (RESEND_API_KEY in the backend settings) is your email address passed to it, to send a password reset link you asked for.

## Contact

Open an issue on GitHub: https://github.com/the-clrsky/Protoboard-Editor/issues
`;

function updatesMarkdown(): string {
  const entries = UPDATES.map((u) => {
    const items = u.items.map((i) => `- ${i}`).join("\n");
    const link = u.link ? `\n\n${u.link.lead} [${u.link.text}](${SITE}${u.link.href})` : "";
    return `### ${u.date}\n\n${items}${link}`;
  }).join("\n\n");
  const planned = PLANNED.map((p) => `- ${p}`).join("\n");
  return `# Protoboard Editor: What's New

> The changelog for Protoboard Editor (${SITE}), newest first, followed by
> what is planned next. Dates are ISO (YYYY-MM-DD). This is the markdown
> version of ${SITE}/updates.

## Recent updates

${entries}

## Planned

${planned}

Planned items have no firm dates yet.
`;
}

export const UPDATES_MD = updatesMarkdown();

/** Newest dated changelog entry, used as the sitemap lastModified for /updates. */
export const LAST_UPDATE_DATE = UPDATES[0].date;

export const GUIDE_MD = `# Protoboard Editor: Quick Guide

> The user guide for Protoboard Editor (${SITE}), a free
> browser-based editor that pairs a schematic editor with a stripboard
> (Veroboard) layout editor and an automatic layouter. This is the markdown
> version of ${SITE}/guide.

## Workflow

1. **Design the schematic** on the left. Add components from the library and draw wires between pins to define nets.
2. **Place components on the stripboard** on the right. Drag them from the unplaced tray onto the board, or run auto-layout.
3. **Resolve conflicts.** Place cuts to isolate strips and add wires to connect separated nets.
4. **Done.** When all nets are complete and there are no conflicts, the board is ready to solder.

## Schematic editor (left pane)

### Adding parts and wires

- Drag components from the library onto the canvas. "Create Custom Component" at the bottom of the library makes your own; it is saved with the project.
- Click a pin end to start a wire, then click pins, wires or grid points to route it. The wire tool (W) also starts wires on empty grid.
- Click a component label or a pin label to rename it. Labels can be dragged out of the way.

### What counts as connected

- Whatever touches is connected: a wire end on a wire, a pin on a wire, two pins on one point. Wires that merely cross stay separate.
- A filled dot marks a junction; a small hollow square marks a loose wire end.
- Connected pins form a net. Nets can be renamed and recoloured in the sidebar.

### Flags and net labels

- Ground flags (G), power flags (P) and net labels (L) join everything of the same name into a single net, so GND and VCC need no wires across the sheet. Double-click a flag to rename it.

### Selecting and editing

- Click selects; Ctrl+click toggles; Shift+click adds. Wires are selected and moved like parts.
- A selection box dragged left-to-right selects what it fully encloses; dragged right-to-left it selects everything it touches.

### Parts that are not on the board

- **Mount off board** (floating menu) is for pots, switches and jacks mounted on an enclosure. The board gets solder pads or a connector for their wires instead of the part itself.
- **Exclude** (E) keeps a part in the schematic but ignores it on the board and in net checks, so you can draw a full circuit and build only part of it.

### Legacy wiring rules

Schematics drawn before the "touching means connected" rule set follow the rules they were drawn under, where only wire ends connect. Drawings that mean the same thing under both rule sets were converted automatically. The rest show a "Classic wiring" link in the schematic header that previews every change the switch would make before applying it. The switch is optional and undoable.

## Stripboard editor (right pane)

### Placing parts

- Drag components from the Unplaced tray onto the board. Strips take the colour of the net on them; a red strip carries two nets and needs a cut.
- Two-pin parts such as resistors and LEDs have flexible leads. Drag a single pin to reshape them.
- A part that puts two of its pins on one strip, such as an IC, brings the cuts between them when placed. Those cuts move with the part and leave with it.
- Hovering an incomplete net in the sidebar highlights its strips.

### Tools: select, wire, cut

- The tools on the left edge of the board decide what a click does. Escape always returns to select.
- **Wire** (W): click a hole, then another. Wires already in a hole are ignored, so a chain can start from the same hole.
- **Cut** (C): click a hole to drill it out, or click between two holes to cut the copper there. Cuts work under parts. Clicking a cut again removes it.
- **Select**: move parts, and click a wire or cut to drag or delete it. Dragging a wire end moves just that end.

### Rows and columns

- Right-click anywhere on the board to insert or delete the row or column there. Deleting unplaces parts sitting on that line; parts that merely span it shrink.

### Footprints and packages

- Select a placed part and use the floating menu. **Package** picks the real body (for example a 1/4 W or 1/2 W resistor, TO-92 or TO-220). **Edit Footprint** resizes the grid and moves the pins of ICs and connectors to match a physical part.

## Auto-layout

Click **Auto-layout** above the unplaced tray. The layouter places every part, picks the board size, and adds the cuts and link wires. If anything cannot be completed, a pop-up explains what and why.

- **Lock the board size.** Click the padlock next to Rows or Cols to keep exactly that many. A locked board cannot grow, so a few slanted or crossing wires may remain.
- **Lock parts.** Select placed parts and press L to keep them where they are. Layouts containing locked parts come out somewhat larger.
- **Settings** (gear beside the button): new layouts every run, drilled cuts only, no stacked wires, allow standing parts, extra room between parts, effort, and processor threads. Effort (Quick, Normal, Thorough, Very thorough, Exhaustive) sets how many layouts are tried and how long each one searches, scaled to the size of the circuit; the panel shows how long a run will take on the machine. Processor threads sets how many layouts run at the same time; it changes how long a run takes, not the board.

Full explanation of the algorithm: ${SITE}/how-auto-layout-works.md

## Printing and assembly

- **Print** in the project toolbar builds an assembly guide. Print at 100% and check the calibration ruler so the holes match real stripboard.
- The **component sheet** shows the top side: lay it on the board and push the leads through. The **cut sheet** is mirrored for the copper side and marks every cut.
- The **BOM** lists quantities, values and reference labels; off-board parts get a wiring table.
- Options: colour or black and white, reference and pin labels, and a view or edit QR code linking back to the project.

## Exporting

- **Export > Raw project** downloads the whole project as JSON. It can be restored from the Import menu.
- **Export > Netlist** writes a KiCad netlist containing parts, values, pin numbers and nets, so a prototype can become a PCB. Most parts map to stock KiCad footprints; the rest ship as a small footprint library in the same zip, added once under Preferences > Manage Footprint Libraries using the nickname shown in the pop-up.
- A netlist holds connections, not drawings. Netlist import is not supported.

## Saving and sharing

- No account is required. The first save returns a unique link; bookmark it to return to the project.
- An account collects projects in one dashboard and adds sharing: an edit link for full access and a view-only link.
- Anyone viewing a shared project can fork it into their own editable copy.

## Keyboard shortcuts

### Both editors

| Key | Action |
| --- | --- |
| W | Wire tool on and off |
| R | Rotate the selection |
| Delete | Remove the selection |
| Escape | Cancel, then clear the selection, then put the tool away |
| Arrow keys | Move the selection one step (Shift: five) |
| Ctrl+Z | Undo |
| Ctrl+Y or Ctrl+Shift+Z | Redo |
| Right-click drag | Pan the canvas |
| Scroll wheel | Zoom in and out |

### Schematic

| Key | Action |
| --- | --- |
| G / P | Ground flag / power flag at the cursor |
| L | Net label at the cursor |
| M | Mirror the selection |
| E | Exclude or include the selected parts on the stripboard |
| Enter / Backspace | While drawing a wire: finish it / undo the last segment |
| Alt+Delete | Remove whole wires, all segments included |
| Ctrl+click / Shift+click | Toggle / add to the selection |
| Ctrl+A | Select everything |
| Ctrl+C / Ctrl+V / Ctrl+D | Copy, paste at the cursor, duplicate |

### Stripboard

| Key | Action |
| --- | --- |
| C | Cut tool on and off |
| L | Lock or unlock the selected parts for auto-layout |
| Right-click | Insert or delete the row or column under the pointer |
`;

export const AUTO_LAYOUT_MD = `# How Auto-layout Works

> A plain-language explanation of the automatic stripboard layouter used by
> Protoboard Editor (${SITE}): a simulated-annealing
> search over a compact, coordinate-free description of a board, decoded
> exactly and finished by a real router. This is the markdown version of
> ${SITE}/how-auto-layout-works. That page carries
> interactive figures and playable demos of every stage; each is described
> here in a "Figure" note saying what it shows and what it demonstrates, so
> this version is self-contained.

Even a modest circuit has an enormous number of valid stripboard arrangements — ten components alone can be ordered and rotated in nearly four trillion ways. Trying them one by one is out of the question, and there is no formula that produces the best one directly. So the layouter searches: it describes a board in a compact form, scores it, changes the description a little, scores it again, and repeats this tens of thousands to millions of times, slowly creating a better and better layout. The method is simulated annealing, named after the way slowly cooled metal settles into an orderly crystal.

## 0. What is stripboard?

Stripboard, also called Veroboard, is a sheet of insulating board drilled with a grid of holes a tenth of an inch apart, with parallel strips of copper glued to the back, one strip per row of holes. Every hole in a row is already connected to every other hole in that row. Nothing else is connected to anything.

Building on it means pushing component legs through holes and soldering them to the copper underneath. Two legs in the same row are connected, which is how you make a connection and also how you make a mistake. So the board is shaped in two further ways:

- Where one strip would join two things that must stay apart, the copper is broken, either by drilling the copper away at a spare hole or by cutting it with a knife.
- Where two rows must be joined, a short piece of wire is soldered from a hole in one row to a hole in the other. This is a **link wire**.

*Figure (photograph): a bare board, showing that each row of holes is one continuous strip of copper, so anything soldered into the same row is joined whether you meant it or not.*

*Figure (photographs): a finished board from both sides. On the component side the parts and their coloured link wires are pushed through a printout of the layout from the editor, which shows where everything goes. On the copper side every leg is soldered to its strip, and in a few places a hole is drilled out to break the strip.*

A stripboard layout is therefore three interdependent decisions at once: where each component sits, where the strips are cut, and where the link wires run.

## 1. Annealing, by example

The page demonstrates annealing on a smaller problem with the same flavour: eight blocks of different sizes placed on a small grid, some pairs joined by wires. A placement scores the area of the bounding rectangle plus 1.5 times total wire length; lower is better. Blocks may not overlap or leave the grid.

### Only ever improving

The obvious search takes the current placement, changes it a little (shift one block by one cell, or swap two blocks), keeps the change if the score improved or held, and otherwise discards it.

*Figure (playable, "improvements only"): the eight-block problem run under the greedy rule. Each step proposes one small change, coloured green when it is better and kept, red when it is worse and rejected, grey when the placement is not valid. A dashed rectangle marks the area being scored and a chart tracks the score over the run. Pressing "New start" repeatedly freezes at a different placement and a different score every time.*

It improves quickly and then stops dead, well short of the best placement. Once frozen, every single small change makes the score worse, so nothing is ever accepted again, even though a few changes in a row would lead somewhere much better. Two blocks may need to trade places through a temporarily wider board, or one block has to make room for another before it can move itself. This is a **local minimum**: a placement better than all its neighbours, but not the best overall.

### Accepting the occasional setback

Simulated annealing changes exactly one thing. A change that makes the score worse is not always rejected; it is kept with a probability depending on how much worse it is and on a control value called the **temperature**. Small setbacks are kept often, large ones rarely, and the temperature scales what counts as small. At high temperature almost anything is kept and the search wanders freely; at low temperature only tiny setbacks pass and the search behaves like the improvements-only rule. The run starts hot and cools slowly.

*Figure (chart): the acceptance rule. An improving move is always kept; a move that worsens the score by some amount is kept with probability e^(-worse/T), plotted for T = 10 (hot), T = 3 and T = 0.5 (cold). At high temperature almost anything passes, at low temperature only the smallest setbacks do, and as T approaches zero the rule becomes "improvements only".*

*Figure (playable, "annealing"): the same problem from the same starting placement, with only the acceptance rule changed. Moves kept despite being worse are orange, and a dashed orange line shows the temperature falling from 6 to 0.5 over the run. Early on the search happily makes the board worse and the score chart is a jagged mess; as the temperature falls the chart calms down and the search settles on one arrangement and polishes it. A green line tracks the best placement seen so far, which is what a run returns. The run length is adjustable: cooled four times faster it usually ends a little worse, and the longest run a little better.*

Why it works: early on, a setback costs almost nothing, so the search climbs straight back out of the local minima that trapped the greedy rule, and keeps moving between quite different placements. Improvements are still always kept, so the wandering is not aimless — it spends its time where good placements are common. As the temperature falls, larger setbacks stop passing, the search can no longer leave the arrangement it has arrived at, and the rest of the run refines that one. Cool slowly enough and what it commits to is very likely a good arrangement. Cool too fast and it commits early to whatever it happened to hold. Cooling infinitely slowly provably finds the optimum, which is useless in practice, so real runs choose a length and accept a good placement rather than the best one.

The name comes from metallurgy: metal cooled quickly freezes its atoms in a disordered, stressed jumble, while metal cooled slowly gives them time to settle into an orderly crystal of lowest energy. The search borrows the word, the temperature, and the formula for how often a setback is accepted.

## 2. What it takes to anneal well

Annealing only works well on a problem prepared for it. Four things must hold, and most of the engineering in the layouter is about making them true for stripboards.

1. **Scoring must be very fast.** A run makes a great many proposals and every one must be scored. The layouter needs to score a board in a fraction of a millisecond.
2. **Small changes must mostly cause small score changes.** Annealing walks between neighbouring states, which only helps if neighbours usually have similar scores. Picture the score as a landscape: annealing copes well with broad valleys and ridges, and badly with a saw blade, where the state next door is as likely to be terrible as excellent, because then no step carries information. Stripboards are not naturally smooth, but they do not have to be. A landscape anneals well if it has structure of the right kind — picture a river valley: steep walls on most sides, but a floor between them that keeps going downhill: long flat stretches, then a step down, now and then a waterfall. A hot search crosses the walls freely and stumbles into different valleys; a cooling one is caught by a valley and follows it downstream.
*Figure (chart): two landscapes over a row of neighbouring states, one bar per state, lower is better. On the left a small change mostly changes the score a little, so the walk can feel its way downhill, and the dip the ball sits in is a local minimum a warm run can step out of. On the right the state next door is as likely to be terrible as excellent, no step carries information, and every dip holds the ball equally well. One state on the right is as good as the valley floor on the left, but nothing around it gives it away. How the problem is encoded decides which landscape the annealer sees.*

*Figure (picture): canyon country as a block model, what most real problems offer at best. Walls on most sides, and canyons between them whose floors run flat and then step down, now and then over a waterfall, so a search that finds a canyon can follow it a long way down. The canyons branch, some of them split, and they reach very different depths.*

3. **The description must rule out nonsense, or price it.** Rejecting invalid proposals outright would waste most of a run. Better is a description in which every possible value is a real, overlap-free board, so no proposal is wasted.
4. **The description must be able to express the good boards.** The search can only find boards its description can write down. If the best board needs a resistor placed horizontally and the description only knows vertical resistors, the run can never find it.

## 3. What a good board looks like

A stripboard layout is good when a person is happy to build it. The properties that matter most:

- **Complete.** Every connection of the schematic made, nothing else connected, no two components colliding or closer than is buildable.
- **Small**, and rather wide than tall, but optimally squarish.
- **Few link wires**, and short ones.
- **Few cuts**, preferably drilled.
- **Connectors on an edge.**
- **Clean wires.** Every link wire straight along one column or a spare strip, crossing no component and no other wire. A wire that is off axis (slanted) or crosses something is called **wire mess**; it makes a board much harder to read, and a large part of the development effort went into fighting it.

*Figure (screenshot): a board with all of these properties, the guitar pedal benchmark circuit of appendix A as laid out by the layouter. Three short link wires, each straight along a column, every cut drilled, and solder pads on the edges for everything wired off the board. The pots and the switch sit on the case of a pedal rather than on the board, so each of their pins is a solder pad for a wire, as are the jacks and the supply.*

## 4. Describing a board without coordinates

Writing a board down as a list of coordinates sounds reasonable but is not, because a component on a stripboard is not defined by where it sits but by **which strips its pins touch**. Move it one row and every pin lands on a different strip: nets that shared a strip are torn apart, others are suddenly shorted, and the cuts and wires belong somewhere else. The board after such a step has little in common with the board before it. That is the saw blade.

So the layouter never records where a component is. It records how components relate to each other and lets positions follow. The core of the description is a **pair of orderings**: two lists of component names.

### Reading a packing into two orders

Start from a finished packing of rectangles. For each component, draw a line: from its lower-left corner walk down to the bottom of the board, and whenever another component is in the way, slide left along that component's top edge until you can go down again; from its upper-right corner walk up to the top the same way, sliding right along the bottom edge of anything in the way. Join the two halves through the component. Because these lines all climb from lower-left to upper-right and slide around obstacles in the same direction, no two ever cross, so they can be read left to right. That order is the first order. The mirror image — lines climbing from lower-right to upper-left, again read left to right — is the second order.

*Figure (playable): the step lines being drawn one by one over a finished packing, first the lower-left-to-upper-right family that gives the first order, then the mirrored family that gives the second. Hovering a component highlights it against the drawing so each pair relation can be checked by eye.*

The two orders are the whole description of the packing. For any two components A and B: if A comes before B in both orders, A is left of B; if A comes before B in the first order but after B in the second, A is above B. Every pair gets exactly one of left, right, above, below, and because they were read off a real packing they are mutually consistent.

### And back: from two orders to a packing

This works in reverse from any two orders at all. Write the components in some order, then again in another order, apply the rule to every pair, and push each component as far up and as far left as its relations allow. The result is an overlap-free packing, whatever the two orders were.

*Figure (interactive): the decoding run in reverse. Entries of the two orders can be swapped directly and the packing follows, demonstrating that any two orders at all produce a valid, overlap-free packing.*

This is a classic trick from chip floorplanning, introduced by Murata and colleagues in 1995 as the **sequence pair**. Its virtues are exactly the four requirements of section 2: turning two orders into positions is a short computation, so scoring stays fast; swapping two entries is a small change that usually produces a small change in the packing; every pair of orders is a valid packing, so no move is wasted; and every compact packing can be written as a pair of orders, so nothing good is out of reach.

### The rest of the description

Stripboard needs more than a packing of rectangles. Once components are placed, almost everything else is forced: which strips carry which nets, where cuts go, which segments need a link wire. But that means the packing alone decides the electrical quality of the board, and a packing of bare rectangles knows nothing about it. Two pins of one net land on the same strip or on different strips by accident, and a small change can turn one link wire into three. The sequence pair's real strength is that it can be combined with further entries, so the electrical choices stop being accidents and become explicit parts of the description:

- **Rotation** of every rigid component, in four steps.
- **Flat or upright** for every two-legged component with flexible leads (resistor, diode), and **how far its leads span**, within the range its package allows.
- **Which end goes where** for those components, since a resistor can be turned around.
- **Strip groups.** For every net, which of its pins are asked to share one copper strip. Pins in the same group are forced onto the same row while the board is built; pins in different groups get their own rows and are joined by a link wire later.
- **Reserved blank lines.** A component can ask for a blank row below it or a blank column beside it. Those are the rows and columns the wiring will use, and reserving them lets the annealer trade area against wiring room.

For a typical circuit this is a few hundred small choices, and any combination of choices is a board. That is the state the annealer walks through.

*Figure (screenshot and data): the example circuit as drawn in the editor, followed by the complete description the annealer holds for it, listing the two orders, the rotation of the rigid components, the flat-or-upright and lead-span choices for the flexible ones, the strip groups and the reserved blank lines.*

### The worked example

The page follows one complete description throughout: a 555 timer blinking a load, in its one-resistor astable form, with a capacitor and resistor setting the pace and a second resistor feeding a transistor that switches whatever hangs on the connector. Six components, six nets.

## 5. The moves

A step edits the description, changing one or a few entries. Each step proposes one of these at random with fixed odds:

- Swap two nearby entries in the first order, in the second, or in both.
- Pull a component next to another component of the same net, in both orders at once.
- Pull and tie: the same pull, and the pulled component's pin on that net joins the strip group of the other, so the two are asked to share a strip. This is the most frequent move, about a third of all steps.
- Flip a flexible component between flat and upright, turn it around, or change how far its leads span.
- Merge two strip groups of a net, or split a pin off into a group of its own.
- Open or close a reserved blank row or column beside a component.
- Rotate a rigid component by a quarter turn.
- Throw a connector to the far end of both orders, so it can reach the opposite board edge.

*Figure (playable): one move of each kind on the example description, stepped through one at a time. Every move is a proposal of the layouter's own move generator and starts from the same description; each frame marks the changed entries and shows the board before and after, with mess priced as it would be at the end of a run. Most make the score worse, some by hundreds of points; one, merging two strip groups of the timing net, makes the board a row shorter and the score better.*

Most single edits of a decent description make the score jump by hundreds of points. Those jumps are the steep walls of the river valleys; late in a run, the annealer spends its time finding the few moves that follow a valley down.

## 6. From description to board

Decoding turns a description into positions, strips, cuts and wires. It must come close to the finished board, since a score based on a rough guess would steer the search wrong. It is also the most time-critical piece, because it runs once per step.

### Relations

The two orders become relations: before in both orders means left of; before in the first and after in the second means above.

*Figure (playable, recording of the real decoder): the six components of the example in their two orders, and the relation each pair receives. Fifteen relations in total.*

### Building rows from the relations

Rows come first, because the strips run along the rows: which row a pin lands on is the electrical decision, while columns only decide how much space lies between. Every above-relation becomes an arrow from the upper component to the lower one saying "at least this many rows apart", namely the upper component's height plus the clearance between them. Pins that a strip group asks to share a strip tie their components together at a fixed distance, so from then on they move as one. The arrows are then checked one after another, in the sequence of the first order, and every arrow that does not hold pushes its target down. After a few sweeps nothing moves, and those are the rows.

*Figure (playable): the row solve, with one lane per component in the sequence of the first order and the row on the vertical axis. Amber marks the arrow being applied, dashed lines mark pins tied to one strip, and red marks a contradiction of the kind described next.*

Sometimes the ties and arrows ask for the impossible: the orders put one component above another, but a strip group wants pins of the two on the same strip. When that happens to the random description a run starts from, or to the example, the decoder splits one pin out of its strip group, writes that back into the description so the annealer state gets it too, and restarts the row solve. That pin gets a link wire instead. Once the run is under way the decoder is stricter: a move whose orders contradict a strip group is thrown away, so the groups the search has built up are not dissolved by accident.

### Columns

With rows known, the components can be drawn. Each left-of relation becomes an arrow on the board: at least the left component's width plus the gap, further right.

*Figure (playable): components start in column 0 and are pushed right until every arrow holds, leaving the board as tight as the relations allow.*

### Strips, cuts and bus rows

The board is now a grid with one blank line of margin on each side and a copper strip on every row. Each row is read left to right. Where pins of two different nets sit on one strip, a cut goes between them, drilled through a spare hole if there is one and knife-cut between two holes if not. What remains are strip segments, each carrying one net. Rows with no pins at all are **bus rows**: spare copper any net may borrow to travel sideways.

*Figure (playable): the strips being read, with a dashed row marking the row under inspection, blue bands marking bus rows, and an X on every cut.*

### Link wires

Every net whose pins ended up on more than one segment is joined up. For two segments the decoder looks for a column with a free hole on both, giving a straight vertical wire. Where no such column exists it looks for a relay: a hop to a bus row and a hop back. Only when neither exists does it record a slanted wire, and charge for it.

*Figure (playable): the nets being joined. One net finds no free column and takes the detour over a bus row, ending as two straight wires and a stretch of borrowed copper where a slanted wire would otherwise have been.*

For a board of forty components the decoder takes about a tenth of a millisecond.

## 7. The score

The score of a decoded board is a weighted sum. The weights were tuned by running the layouter over many boards and adjusting until further adjustment stopped helping. The order of magnitude between terms matters more than the exact numbers. The same score runs the finish: a line the finish adds or takes away is kept only when it lowers the score.

- **Area**, about a third of a point per cell.
- **Shape.** Rows beyond the width are charged extra, and a ribbon more than twice as wide as tall is charged too.
- **Link wires**, a few points each plus a little per unit of length. Cuts are almost free; a knife cut between two holes costs more than a drilled one, and much more when drilled cuts only has been requested.
- **Connectors not on a board edge**, so plugs end up where an external wire can reach them.
- **Wire mess**, priced mildly at the start of the run and prohibitively at the end. Forbidding it from the first step would leave the search nowhere to go, because every rough early arrangement is messy, so the coarse arrangement is allowed to form first and then the price rises until no such wire survives.
- **Unreachable pins**, at a price no saving in area can pay for.

*Figure (playable): the whole weighted sum collapsed for the decoded board of section 6 into what the annealer actually receives back, which is one number.*

## 8. The run

The temperature falls geometrically from 150 to 0.15 over the run, and the price of a slanted or crossing wire rises geometrically from 25 to 400 over the same run.

*Figure (chart): the score trace of a real run against those two falling and rising curves.*

*Figure (playable): everything from sections 4 to 8 in one place, the layouter's own loop run on the example for twenty-five thousand steps and replayed. A random description, the moves of section 5, the decoder of section 6, the score of section 7, a falling temperature and a rising price of mess. Early on the board is a mess and the annealer does not care; as the price of mess rises the wires straighten, and as the temperature falls the board packs. A finished run shows the best board found, scored at the full price.*

## 9. Finishing the board

The decoded board of a run is complete in principle, but its wiring is a fast approximation, and two of the editor's rules are not in it at all: no link wire may lie on top of another (where that is asked for), and none may run over the body of a part. So the best board of a run is finished properly before you see it, in two ways, and the cheaper result wins:

- **Start over.** Keep only where the parts stand and let a slower, more thorough router work out the cuts and wires again from the strips up. It may pick quite different wires, and it adds a blank row or column wherever a wire needs one to stay straight.
- **Repair.** Keep the decoder's board as the annealer scored it and fix only what the rules reject. A wire lying on another or crossing a part moves to another column of the same two strips, or gets a blank column of its own.

The repair is quick enough to run on every better board the second half of a run finds, not only on the last one, and now and then one of those finishes cheaper than the last. How often each finish delivers the board you get, at the Normal setting:

| Circuit (connected pins) | Start over | Repair | Repair of an earlier board |
| --- | --- | --- | --- |
| under 25 | 65% | 22% | 13% |
| 25 to 49 | 47% | 30% | 23% |
| 50 to 99 | 25% | 39% | 36% |
| 100 to 199 | 32% | 15% | 52% |

Starting over wins most boards under 25 pins. From about 50 pins on, the annealer's own wiring, repaired, delivers three boards in four.

### Why the search cannot use them

If these two follow the real rules, why does the search not use them at every step? Because each is hundreds of times slower than a decode, so a run that takes a minute would take many hours. That is the whole reason the decoder is allowed to be approximate.

Before either finish starts, the board gains blank lines around it for the wires to use, and a connector that belongs on an edge is pinned to that new edge rather than carried along with everything else. Every other part stays exactly where the annealer left it.

*Figure (playable): the finishes of the description the section 8 run ended with, stage by stage, with a switch between starting over and the repair. Starting over ends at a price of 78, the repair at 77, so here the repaired board is the one you get.*

Under a locked row or column count the board cannot grow, so this stage does what it can within the limit; locked components are treated the same way, and nothing may shift.

## 10. Many runs

A run ends where its canyon took it, and a different random start means a different canyon. Nothing marks the board a run found as the deepest available, so the layouter does not make one run. It makes several from different starts and keeps the best board of the lot.

*Figure (picture): four runs on the landscape of section 2, each drawn from a random start on the plateau to where it ended.*

Each of the four starts out hot and wanders over the plateau, where every direction is about as good as any other. As it cools, it is caught by a canyon and follows it down. One run even fell into a small canyon early on and, still hot, climbed back out and crossed over to a bigger one. The four end at four very different depths, and only that one found the deepest canyon. Its board is the one you get.

How many runs are made, and how long each one searches, is what the Effort setting controls.

## 11. What it cannot do

- **Locked boards and locked components.** Expect a run containing locked pieces or dimensions to come out somewhat larger, or to keep a few slanted wires. Locking takes freedom away from the solver.
- **Time.** Hardly a limit any more: most circuits are done in seconds. Only the largest boards of several hundred pins may still take a few minutes.
- **Taste.** The score encodes basic properties such as size, wire length and count. It does not know that you wanted the LEDs in a row. Place those components yourself, lock them, and let it arrange the rest around them.

## 12. How well it works

To see how it does in practice, the layouter was run on every circuit saved in the editor so far, over a thousand of them, each at the Normal setting exactly as the editor would by default. It completed all, and every one of its boards came out clean: no slanted wire, no wire crossing a part or another wire, and none lying on top of another. Most circuits were done in a couple of seconds; those with hundreds of connected pins took five minutes at most.

Compared with the boards people had saved for the same circuits, it usually lays out a smaller board, with fewer link wires and fewer cuts. That is a trend rather than a score: many of the saved boards were drawn under older clearance rules, about half of them were laid out by an earlier version of this layouter at some point, and not every saved board was meant to be as small as possible. But it shows that the layouter performs reasonably well.

What people do with the result may say the most. Since version 5 came out, about half of the boards it laid out have been kept exactly as delivered, without a single part moved or wire changed, and that share has grown with every update. An untouched board can also be a project someone walked away from, so this too is a trend rather than a score, but it points the same way: on the whole, the layouter builds boards that work, are tight and are clean.

## References

The layouter is work in progress and the numbers above are the state at the time of writing. Most of the ideas are not new: simulated annealing, the sequence pair, solving spacing constraints as a longest path and spanning trees for wiring are all well-known tools from other fields. What is new is applying them to stripboards: a description with the four properties of section 2, a decoder fast enough to run in a browser, and a score that matches what people build by hand.

- S. Kirkpatrick, C. D. Gelatt Jr. and M. P. Vecchi, "Optimization by simulated annealing", Science 220, 1983.
- H. Murata, K. Fujiyoshi, S. Nakatake and Y. Kajitani, "VLSI module placement based on rectangle-packing by the sequence-pair", IEEE Transactions on Computer-Aided Design 15, 1996, first presented at ICCAD 1995.
- T. H. Cormen, C. E. Leiserson, R. L. Rivest and C. Stein, Introduction to Algorithms, chapter on single-source shortest paths, section on difference constraints. The spacing rules are difference constraints, solved as a longest path by Bellman-Ford.
- R. C. Prim, "Shortest connection networks and some generalizations", Bell System Technical Journal 36, 1957. The spanning tree that joins the segments of a net.

## Appendix A: Related work

Surprisingly little has been published on this problem. PCB tools place components and then draw tracks wherever they like on an empty copper plane; chip floorplanning packs rectangles and measures wire length. A stripboard is neither: the copper is already there, in one direction only, and the question is where to break it.

- **Vero Designer** by GitHub user blazethablunt is the closest match. Like this site it turns a schematic into a complete board with parts, cuts and link wires, and lets you edit the result. Its layouter works in the opposite order: it first decides which copper row each net lives on, with ICs fixed in the middle as anchors and a short annealing run moving the other nets up and down, then places components onto those rows one after another over a range of board sizes, judging candidates by a quick estimate before working out the full board. Annealing is a helper there, polishing boards built by other means; here it is the whole search, tens of thousands to millions of steps on a description of the complete board, each decoded and scored with its cuts and wires in place. The two projects were made independently.
- **Fang Li, "Declarative Synthesis and Multi-Objective Optimization of Stripboard Circuit Layouts Using Answer Set Programming" (2025)** is the only published paper on placing the components automatically. It writes the placement rules as logical constraints and hands them to a general constraint solver, and ships five benchmark circuits. Strip cuts and link wires are not part of that model, which is why every net needs a strip of its own; the paper names both as future work. This site's layouter solves the same guitar pedal circuit in a few seconds, cuts and link wires included, with the pots and switch wired off the board the way a pedal is usually built.
*Figures (screenshots): the guitar pedal benchmark circuit from Li's paper as drawn in the editor, 18 components and 12 nets, and the same circuit laid out by this site's layouter with the three pots and the switch wired off the board. The project is public and can be opened in the viewer from the HTML page.*

- **Pepijn de Vos, "Thoughts about generating stripboard layouts" (2012)** sketches the same constraint-solving idea much earlier: components as lists of pins, each pin's strip as an unknown, the netlist as the rule that pins of one net share a strip. It is a sketch rather than a program, and lists the same open ends: cuts under components, and wires between strips.
- **Roger Dahl's Stripboard Autorouter** takes components as already placed and searches for the cuts and wires that connect them, using a genetic algorithm over the routing order, since its bare wires block the space they cross.
- **VeroRoute** by Alex Lawrow is the most complete interactive stripboard editor otherwise available, with a router that redraws tracks between pins while components are moved; its documentation says laying out the circuit is up to the user.
- **Fritzing** can hold a piece of veroboard, but components, cuts and wires are all placed by hand; its autorouter belongs to the PCB view.

Apart from Vero Designer, each of these covers at most one half of the job: the solver approaches place components but do not model cuts and wires, and the routing tools place cuts and wires but leave components to the person.
`;

/** Every markdown twin, in reading order, for llms-full.txt. */
export const AGENT_DOCS: { path: string; body: string }[] = [
  { path: "/index.md", body: INDEX_MD },
  { path: "/guide.md", body: GUIDE_MD },
  { path: "/how-auto-layout-works.md", body: AUTO_LAYOUT_MD },
  { path: "/updates.md", body: UPDATES_MD },
  { path: "/privacy.md", body: PRIVACY_MD },
];

export function markdownResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${SITE}/llms.txt>; rel="describedby"`,
    },
  });
}

// The llms.txt index (llmstxt.org), served by app/llms.txt/route.ts so its links follow SITE.
export const LLMS_TXT = `# Protoboard Editor

> A free, browser-based editor for designing circuits on stripboard (also
> called Veroboard). It pairs a schematic editor with a stripboard layout
> editor and an automatic layouter that turns a schematic into a complete,
> buildable board: placement, board size, strip cuts and link wires. Every
> part is drawn as its real package at true size, so the board on screen is
> the board you build. No install, and no account needed to use it or to
> save a project. Runs at ${SITE}.

Stripboard is prototyping board made of a grid of holes over parallel copper
strips, where every hole on a strip is already electrically connected.
Building a circuit on it means placing components, cutting strips to separate
nets, and adding link wires to bridge connections a strip cannot carry.
Protoboard Editor supports doing this by hand, by automatic layout, or by any
mix of the two.

**Schematic editor.** Standard symbol library, wiring and nets. Whatever
touches is connected: a wire end on a wire, a pin on a wire, two pins on one
point; wires that merely cross stay separate. A filled dot marks a junction, a
hollow square a loose wire end. Ground flags, power flags and net labels join
everything of the same name into one net, so GND and VCC need no wires across
the sheet. Parts can be excluded from the board (kept in the schematic but
ignored by the board and its net checks), or mounted off board — pots,
switches and jacks that live on the enclosure, for which the board gets solder
pads or a connector instead of the part.

**Stripboard editor.** Live strip colouring shows nets and conflicts in real
time: a strip takes the colour of the net on it, and a red strip carries two
nets and needs a cut. Select, wire and cut tools; cuts are drilled-out holes or
knife cuts between two holes, they work under parts, and ICs bring the cuts
between their own pins along when placed. Wires and cuts can be selected,
dragged and deleted, and wires can run in parallel on the same strip column.
Rows and columns can be inserted or deleted at any position. Footprints are
editable: the grid and pin positions of ICs and connectors can be matched to a
physical part.

**True-size packages.** Every part is drawn as its real package at true size,
and each part lets you pick the package you actually have — a 1/4 W or 1/2 W
resistor, TO-92 or TO-220. The package sets the body, how far apart the pins
may sit, and how the part is drawn on screen, in the layouter and in the print.

**Automatic layout.** Simulated annealing over a compact, coordinate-free
description of the board (a sequence pair plus rotations, lead spans, strip
groups and reserved blank lines), decoded exactly and finished by the editor's
real router. It places every component, sizes the board, and generates the
strip cuts and link wires. On a free board the result has no slanted link wires
and no wire crossing a component — the layouter buys blank rows or columns
instead. Connectors are kept on a board edge, and cuts are drilled-out holes
lined up in shared columns wherever possible. Several layouts are solved from
different random starts, in parallel on the processor threads, and compared on
completeness first, then on the annealer's own score; the effort setting sets
how many and how long each one searches, scaled to the size of the circuit.
The same circuit and settings give the same board again, whatever the number of
threads, unless "new layouts every run" is enabled. Settings: new layouts every
run, drilled cuts only, no stacked wires, allow standing parts, extra room
between parts, effort, and processor threads. Board dimensions can be locked to a board you already own,
and individual components can be locked in place for the layouter to design
around; both come out somewhat larger, or may keep a few slanted wires.

**Parts.** Built-ins: resistor, capacitor, polarized capacitor, LED, diode,
zener diode, inductor, fuse, transformer, potentiometer (a trimmer is one of
its packages), toggle and momentary switches, NPN and PNP transistors, N- and
P-channel MOSFETs, 555 timer, connectors from 1 to 20 pins, three ESP32 dev
boards and the Arduino Nano. Plus 94 named ICs, searchable and grouped into
logic, op amps and comparators, regulators and references, drivers and sensors,
optocouplers, microcontrollers and modules, audio and timers; op amps, voltage
regulators and optocouplers are picked as real part numbers from this list
rather than as generic symbols. Their pin numbers, pin names and descriptions
come from the KiCad symbol library by the KiCad Library Team, licensed
CC-BY-SA 4.0. A custom component editor covers parts outside the library, and a
per-user parts library keeps custom parts in an account, usable in every
project, shareable as a file, with edits carried into every project that uses
the part.

**Output.** A printable 1:1 build template: a component-side placement sheet to
lay on the board and push leads through, a mirrored copper-side cut sheet
marking every cut, and a bill of materials with a wiring table for off-board
parts. A calibration ruler confirms the print came out at true scale. Colour or
black and white, with an optional QR code back to the project. KiCad-compatible
netlist export carries components, values, pin numbers and nets, so a prototype
can become a PCB; most built-in parts map to stock KiCad symbols and
footprints, and the rest ship as a small footprint library in the same zip.
Netlist import is not supported yet but planned. The whole project also exports as JSON and can
be imported again.

**Saving and sharing.** No account is required; the first save returns a unique
link to bookmark, and unsaved work is kept in the browser and can be restored.
An account collects projects in a dashboard and adds an edit link and a
view-only link, and anyone viewing a shared project can fork it into their own
editable copy. Projects can carry a description and notes.

Every page below is also served as clean markdown at the same URL with .md
appended, which is what the links point to. The whole set concatenated into
one document is at ${SITE}/llms-full.txt (about 50 kB).

Scraping, quoting and citing these pages is welcome.

## Docs

- [Quick guide](${SITE}/guide.md): workflow, both editors, placing and wiring by hand, auto-layout settings, printing, exporting, saving and sharing, and every keyboard shortcut. HTML version at ${SITE}/guide
- [How auto-layout works](${SITE}/how-auto-layout-works.md): full explanation of the layouter — what simulated annealing is, the four properties a problem needs for it, what makes a stripboard layout good, the coordinate-free board description and its moves, decoding, scoring, the run schedule, the finishing router, and related work. Every interactive figure on the page is described in the text. HTML version at ${SITE}/how-auto-layout-works has the playable versions

## Site

- [Protoboard Editor](${SITE}/index.md): what the editor does, the four-step workflow, the feature list, and how a printed template becomes a soldered board. The editor itself is at ${SITE}
- [What's new](${SITE}/updates.md): dated changelog, newest first, and what is planned next. HTML version at ${SITE}/updates

## Optional

- [Everything in one file](${SITE}/llms-full.txt): all of the above concatenated, for agents that would rather make one fetch than five
- [Privacy policy](${SITE}/privacy.md): what data is collected, where it is stored and how it is used. HTML version at ${SITE}/privacy
- [the-clrsky](https://github.com/the-clrsky): the author of Protoboard Editor
`;
