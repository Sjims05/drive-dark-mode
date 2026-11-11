# Changelog

## 0.7.0

- The Share dialog uses Drive's own dark theme instead of a filter, in Drive
  and in the editors.
- Drive set to Light: the search box is dark too.

## 0.6.0

- Drive – Interface now does something: with it on, a Drive that is set to
  Light is shown in Drive's own dark theme. With it off, Drive's own setting
  decides.

## 0.5.0

- The Share dialog and the file picker ("Open a file") are dark in Docs,
  Sheets and Slides. They are pages of their own inside a frame, so they get
  their own rule.
- README, and docs/checked.md listing what has been checked on each surface.

## 0.4.0

- Drive: thumbnails of Docs and Sheets files, and of Word and Excel files,
  are dark, following the Docs and Sheets content switches.
- Sheets: readable formula text in the formula input (operators, numbers).
- All editors: light "Get add-ons" icon and divider in the side panel.

## 0.3.0

- Content is dark grey instead of black (one number in palette.css sets it).
- Docs: the page goes dark in Firefox too (the filter is on the whole page,
  not only the canvas).
- Sheets: dark formula bar, cell editor, and the strips and edges around the
  scrollbars.
- Slides: readable speaker notes, and light icons under the filmstrip.
- Docs: a darker line around the page.

Known: the frozen-row and frozen-column bars in the corner of a sheet are
light. Sheets draws them on the canvas in its dark colour, which the filter
turns light.

## 0.2.0

- Dark interface in Docs, Sheets and Slides: toolbars, menus, right-click
  menus and dialogs. It switches on the dark theme that Google's own style
  sheet already holds, with a copy of its colours as a fallback.

## 0.1.0

- The extension's frame: manifest, settings, and a popup with a main switch and
  a switch per app for the interface and the content.
- Dark page in Docs and dark grid in Sheets (a filter on the canvas).
- Switches apply at once, without reloading the page.
