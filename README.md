# Protoboard Editor

A layout editor for prototyping boards, with a built-in schematic editor. Draw a schematic, place the parts on a virtual board, and the copper takes the colour of your nets with live conflict detection and a list of what still needs to be connected. When the layout is done, print a true-scale template and build it.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="src/frontend/public/demo-circuit-dark.png">
  <img alt="Protoboard Editor with schematic and board layout side by side" src="src/frontend/public/demo-circuit.png">
</picture>

## Board types

| Type | Copper | Auto-layout |
|---|---|---|
| Stripboard | copper strips along the rows, separated with cuts | yes |
| Dot board (single or double sided) | a pad per hole, joined with solder runs you lay | yes: it lays out strips and turns each one into runs, only from its first to its last used hole |
| Tripad board | pads joined in threes along each row, plus your runs | no |
| Breadboard PCB | power rails at the top and the bottom, blocks of five pads down each column, plus your runs | no |

- **Run tool (S):** click between two pads, across or down, to join them; drag from pad to pad to lay a run along the way. Click a run again to remove it. The copper a board comes with stays as it is.
- **Board sizes:** presets for the common green double-sided boards (2 x 8 cm to 15 x 20 cm) and breadboard PCBs, or any custom size. Only the 7 x 9 cm hole count (26 x 31) is counted on a real board; count yours and correct the rows and columns if they differ.
- **Print:** on pad boards the copper-side sheet is a run sheet: every run to solder, mirrored for the underside.

## Parts

The library has the common passives, semiconductors, connectors and ICs, plus Raspberry Pi Pico, ESP32 and Arduino Nano boards, an LM2596 buck module, a BLX-A 5 x 20 mm fuse holder and a DPST rocker switch.

## Run it on Windows

Needs [Node.js](https://nodejs.org) 20 or newer and [Python](https://www.python.org) 3.12 or newer.

One time:

```bat
cd src\frontend
npm ci
copy .env.example .env.local

cd ..\backend
python -m venv venv
venv\Scripts\python -m pip install -r requirements.txt
copy .env.example .env
venv\Scripts\python manage.py migrate
venv\Scripts\python manage.py createcachetable
```

Set your own random `DJANGO_SECRET_KEY` and `BACKUP_TOKEN` in `src\backend\.env`.

Then double-click `start-editor.bat`. It starts the backend (port 8000) and the editor (port 3000) in their own windows and opens http://localhost:3000. Close the two windows to stop them.

To log in, make a user once:

```bat
cd src\backend
venv\Scripts\python manage.py create_dev_admin --username admin --password <your password>
```

## Tests

```bat
cd src\frontend
npm run test:board
npm run test:solver
```

## Tech stack

- **Frontend:** Next.js
- **Backend:** Python Django, SQLite

## Feedback

Open an [issue](https://github.com/the-clrsky/Protoboard-Editor/issues).

## Credits and licence

Protoboard Editor is a fork of [Stripboard Editor](https://github.com/KarloFunke/stripboard-editor) by Karl Funke and is licensed under the [GNU General Public License v3.0](LICENSE), like the original. The fork adds the pad-board types, the board presets and the extra parts.

The built-in IC pinouts (pin numbers, pin names and descriptions) come from the [KiCad symbol library](https://gitlab.com/kicad/libraries/kicad-symbols) by the KiCad Library Team, licensed under [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). They were selected, renamed and shortened for this editor by `src/frontend/scripts/importKicadIcs.js`. The resulting `src/frontend/data/icLibrary.ts` is licensed under CC-BY-SA 4.0 as well.
