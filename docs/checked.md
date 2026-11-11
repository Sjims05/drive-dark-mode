# What has been checked

Surface by surface, for version 0.7.0 (2026-11-11). "Seen" means looked at in dark mode, by eye and with a script that
lists light backgrounds and dark-on-dark text.

- **Firefox** – real Firefox 159, headless, with the extension installed (`tools/ff.mjs`). Signed out, so public
  sample files in view mode only.
- **Pane** – the Chromium browser inside Claude, signed in, with the same colours and rules applied by hand. Chromium
  draws the Docs page differently from Firefox, so this shows the interface, not the content, reliably.
- **User** – reported from a signed-in Firefox in everyday use.

## Docs

| Surface                         | Status        | Where          | Notes                                                    |
| ------------------------------- | ------------- | -------------- | -------------------------------------------------------- |
| Title bar, menu bar, toolbar    | seen          | Firefox, Pane, User |                                                    |
| Page (content)                  | seen          | Firefox, User | dark grey, light text                                    |
| Pictures in a document          | seen, limited | User          | drawn into the page, so inverted with it                 |
| Document tabs / outline panel   | seen          | Firefox        |                                                          |
| Menus                           | seen          | Pane           | File menu                                                |
| Submenus                        | not verified  |                | same component as menus                                  |
| Right-click menu                | seen          | Pane           |                                                          |
| Find and replace                | seen          | Pane           |                                                          |
| Share dialog                    | partly seen   | Pane           | a page in a frame with Drive's theme class, which is swapped to dark. Seen dark in Drive; in the editors the same class was seen, the swap itself not |
| File picker ("Open a file")     | seen          | Pane           | a page in a frame; darkened with a filter. Not yet seen in Firefox |
| Side panel on the right         | seen          | Pane           | icons and divider; the opened Calendar/Keep/Tasks panels not verified |
| Comments panel                  | not verified  |                | could not be opened reliably in the pane                 |
| Version history                 | not verified  |                |                                                          |
| Gemini panel                    | not verified  |                |                                                          |
| Print preview                   | not verified  |                | Docs prints through the browser's own dialog             |
| Pageless layout                 | not verified  |                | the page rule targets `.kix-page-paginated`              |
| Ruler                           | seen          | Pane           |                                                          |

## Sheets

| Surface                            | Status       | Where          | Notes                                              |
| ---------------------------------- | ------------ | -------------- | -------------------------------------------------- |
| Title bar, menu bar, toolbar       | seen         | Firefox, Pane, User |                                              |
| Grid (content)                     | seen         | Firefox, User | dark grey; cell colours keep their hue             |
| Column and row headers             | seen         | Firefox, User |                                                    |
| Formula bar, name box              | seen         | Firefox, User | view mode in Firefox; edit mode by the user           |
| Formula text (operators, numbers)  | fixed, not re-seen |          | rule taken from Sheets' own style sheet in Firefox |
| Cell editor                        | seen         | Pane           | not yet seen in Firefox                            |
| Selection border and fill handle   | seen         | User          | visible in screenshots                         |
| Sheet tabs                         | seen         | Firefox, User |                                                    |
| Strips and edges by the scrollbars | seen         | Firefox        | checked by script: none light left                 |
| Frozen-row / column bars (corner)  | known issue  | User          | light; drawn on the canvas, see README             |
| Error tooltip on a cell            | seen         | User          | visible in a screenshot                          |
| Menus, right-click menu            | not verified |                | same components as Docs                            |
| Find and replace                   | not verified |                | same component as Docs                             |
| Conditional formatting panel       | not verified |                |                                                    |
| Data validation panel              | not verified |                |                                                    |
| Filter views, pivot table editor   | not verified |                |                                                    |
| Charts and pictures over the grid  | not verified |                | may be inverted or may sit outside the canvas      |
| Print preview                      | not verified |                |                                                    |
| Side panel on the right            | seen         | Pane           | "Get add-ons" plus is light                        |

## Slides

| Surface                         | Status       | Where          | Notes                                  |
| ------------------------------- | ------------ | -------------- | -------------------------------------- |
| Title bar, menu bar, toolbar    | seen         | Firefox, Pane, User |                                  |
| Slide (content)                 | seen         | Firefox, User | unchanged, as intended                 |
| Filmstrip                       | seen         | Firefox, User | thumbnails unchanged                   |
| Speaker notes                   | seen         | Firefox        | light text                             |
| Icons under the filmstrip       | seen         | Firefox        |                                        |
| Right rail (Image, Media, …)    | seen         | Pane, User    |                                        |
| Menus, right-click menu         | not verified |                | same components as Docs                |
| Theme, layout, transition panels | not verified |               |                                        |
| Grid view                       | not verified |                |                                        |
| Presenting (slideshow)          | not verified |                | must stay in real colours              |

## Drive

Drive's interface is Drive's own dark theme. When Drive is set to Light, the extension switches that theme on.

| Surface                              | Status       | Where | Notes                                                   |
| ------------------------------------ | ------------ | ----- | ------------------------------------------------------- |
| File grid, sidebar, top bar          | seen         | Pane  | Drive's own theme                                       |
| A light Drive turned dark            | seen         | Pane  | light set by hand, then turned dark and back by the same code. Not yet seen in Firefox, nor with the account really set to Light |
| A Drive really set to Light, turned dark | seen     | Pane  | grid, sidebar, top bar, logo, search box and suggestions: no light areas left (script and by eye) |
| Share dialog in a Drive set to Light | seen         | Pane  | Drive's own dark theme                                   |
| Thumbnails of Docs and Sheets files  | seen         | Pane  | dark; photos, PDFs, Slides untouched. Confirmed by the user in Firefox |
| Thumbnails of Word and Excel files   | not verified |       | found by file ending                                    |
| List view                            | not verified |       | has no thumbnails                                       |
| Home page (suggested files)          | not verified |       | its cards may be marked up differently                  |
| File preview overlay                 | not verified |       | not changed by the extension                            |
| Details pane, right-click menu       | not verified |       | Drive's own theme                                       |

## The extension itself

| Check                                             | Status       | Notes                                             |
| ------------------------------------------------- | ------------ | ------------------------------------------------- |
| `web-ext lint`                                    | passed       | 0 errors, 0 warnings                              |
| Loads as a temporary add-on in Firefox 159        | passed       | headless, and by the user                            |
| Content script runs on Docs, Sheets, Slides, Drive | passed      | attributes and classes seen on the page in Firefox |
| No white flash on load                            | not measured | dark from the first screenshot; no frame-by-frame check |
| Popup and switches applying live                  | User        | not reachable from the headless check             |
| Content script in the Share and picker frames     | not verified | needs a signed-in Firefox; the logic was run by hand in the pane |
