# Drive Dark Mode

A Firefox extension that gives Google Docs, Sheets, Slides and Drive a dark mode, including the page in Docs and the
grid in Sheets.

| Where  | Interface (toolbars, menus, dialogs, panels) | Content                                  |
| ------ | -------------------------------------------- | ---------------------------------------- |
| Docs   | dark                                         | the page, dark grey                      |
| Sheets | dark                                         | the grid, dark grey                      |
| Slides | dark                                         | unchanged: a deck keeps its real colours |
| Drive  | dark (Drive's own dark theme, switched on)   | thumbnails of Docs and Sheets files      |

Nothing leaves the browser: no remote code, no network requests, and the only permission is `storage` for the
settings. It runs only on `docs.google.com/document`, `/spreadsheets`, `/presentation`, the Share and file picker dialogs
of those, and `drive.google.com`.

## Install

The extension is not signed, so it is loaded as a temporary add-on and has to be loaded again each time Firefox
starts.

1. Open `about:debugging` in Firefox and choose "This Firefox".
2. Press "Load Temporary Add-on…" and pick `manifest.json` in this folder.
3. Open or reload a document, sheet, deck or Drive.

After changing a file here, press "Reload" on the extension in `about:debugging`, then reload the Google tabs.

Drive has a light and a dark theme of its own (the cog → Settings → Appearance). With "Drive – Interface" on, the
extension shows Drive in its dark theme whatever that setting says, without changing the setting. It uses the same
colours as the editors.

## Settings

The popup opens from the extension's toolbar button (the puzzle piece, then "Drive Dark Mode"). Every switch applies
at once, without reloading the page.

| Switch                  | What it does                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Main switch (top right) | Everything on or off.                                                                 |
| Docs – Interface        | Dark toolbars, menus, dialogs and side panels in Docs.                                |
| Docs – Content          | Dark page in Docs, and dark thumbnails of Docs and Word files in Drive.               |
| Sheets – Interface      | The same as for Docs, plus the formula bar and the area around the grid.              |
| Sheets – Content        | Dark grid and cell editor in Sheets, and dark thumbnails of Sheets and Excel files.   |
| Slides – Interface      | Dark interface around the slides, and readable speaker notes. Slides are never changed. |
| Drive – Interface       | Drive in its own dark theme, even when Drive is set to Light. Off: Drive's setting decides. |

Colours are in [src/styles/palette.css](src/styles/palette.css). How dark the content gets is one number there
(`--ddm-content-filter`: `0.88` gives dark grey, `1` gives black).

## How it works

- **Interface.** The editors' own style sheet already holds a complete dark theme, under a class called
  `docsDarkMode`, that Google does not switch on. [src/content/boot.js](src/content/boot.js) switches it on, and
  [src/styles/editor-tokens.css](src/styles/editor-tokens.css) carries a copy of its colours as a fallback. The
  other style sheets only fix what that theme leaves light.
- **Content.** Docs and Sheets draw their content on a canvas, where CSS cannot reach single colours. So the whole
  page or grid gets a filter that inverts the lightness and keeps the hue: white paper becomes dark grey, black text
  light grey, and a yellow cell a dark yellow one.
- **No white flash.** The style sheets are injected before the page draws and are written as "dark unless switched
  off", so the script only has to mark what is off.

## Known limits

- Pictures in a document are inverted along with the page where Docs draws them into the same canvas as the text.
- The frozen-row and frozen-column bars in the corner of a sheet are light: Sheets draws them on the canvas in its
  dark colour, and the filter turns that light.
- A thumbnail in Drive is one picture, so pictures inside it are inverted too. Word and Excel files are recognised
  by their file ending, so one renamed without its ending keeps a light thumbnail.

## What is most likely to break

Google changes its markup without notice. From most to least likely to break:

| What                                 | Depends on                                                                 | If it breaks                                      |
| ------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------- |
| Drive's dark interface               | two generated class names, `KkxPLb` (light) and `LgGVmb` (dark), in `content/boot.js` | a Drive set to Light stays light; set Drive itself to Dark |
| Drive thumbnails                     | the type icon's colour (`#3186FF` Docs, `#00AF57` Sheets) and `data-drive-has-thumbnail` | thumbnails stay light                |
| Side panel icons                     | `.app-switcher-button-icon-container` and `_black_` in the icon's address   | the "Get add-ons" plus goes dark again            |
| Slides filmstrip icons, notes        | `#grid-view-icon`, `#collapse-filmstrip`, `#speakernotes`                   | those icons or the notes are hard to read         |
| Share dialog, file picker            | the frame addresses `/drivesharing/` and `/picker/`, and `[role="dialog"]`   | those dialogs are light again                     |
| Sheets formula bar and grid edges    | `#formula-bar`, `#t-formula-bar-input`, `.grid-shim-*`, `.default-formula-text-color` | white areas or black text return        |
| Docs page                            | `.kix-page-paginated`                                                       | the page stays light                              |
| Sheets grid                          | `#waffle-grid-container canvas`                                             | the grid stays light                              |
| The whole editor interface           | the class `docsDarkMode` and the `--gm3-sys-color-*` variables              | the fallback colours still apply; if the variables go too, the interface is light |

## Checking it

- `web-ext lint` checks the manifest and files.
- `node tools/ff.mjs <url> <screenshot.png> <script.js>` opens a page in a real, headless Firefox with the extension
  installed, saves a screenshot and prints what the script returns. It is signed out, so it only reaches public files
  in view mode. `tools/probe-light.js` is a script for it that lists light backgrounds and borders left on a page.

What has been checked, surface by surface, is in [docs/checked.md](docs/checked.md).
