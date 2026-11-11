// Runs at document_start on every covered page.
//
// The style sheets are always injected (by the manifest) and are written as
// "dark unless switched off": every rule sits under
//   :root:not([data-ddm-ui="off"])        for the UI, or
//   :root:not([data-ddm-content="off"])   for the page or grid.
// So a page is dark from its first paint, and this script only has to mark
// what is switched off. Changing a setting changes the attributes, which
// applies at once without a reload.

(() => {
  const root = document.documentElement;

  // Some dialogs are pages of their own that Google loads inside a frame:
  // the Share dialog and the file picker. They belong to the app of the page
  // around them and follow that app's interface switch.
  const frame =
    window.top === window
      ? null
      : location.pathname.startsWith("/picker/")
        ? "picker"
        : "share";
  const where = frame ? parentLocation() : location;
  const app = where && DDM.detectApp(where);

  if (!app) {
    // A frame inside a page that is not ours: leave it alone.
    root.setAttribute("data-ddm-ui", "off");
    root.setAttribute("data-ddm-content", "off");
    return;
  }
  if (frame) root.setAttribute("data-ddm-frame", frame);

  function parentLocation() {
    try {
      return window.parent.location.href ? window.parent.location : null;
    } catch {
      return null; // a frame on another site
    }
  }

  // --- Google's own dark themes ---------------------------------------------

  // The editors' style sheet holds a dark theme that Google has not switched
  // on: these classes on <html> switch it on.
  const EDITOR_DARK_CLASSES =
    app === "drive" || frame
      ? []
      : ["docsDarkMode", "modeElementsDark", "peoplekitThemeDark"];

  // Drive and the Share dialog have a light and a dark theme, marked by a
  // class on <body> and on the layers added for menus and dialogs. A light
  // one is turned dark by swapping that class, and put back when switched
  // off. The two class names are Google's generated ones and the most likely
  // thing in the extension to change.
  const usesDriveTheme = (app === "drive" && !frame) || frame === "share";
  const driveTheme = (() => {
    const LIGHT = "KkxPLb";
    const DARK = "LgGVmb";
    const swapped = new Set(); // elements this script turned dark
    let wanted = false;

    function sync() {
      if (!document.body) return;
      if (wanted) {
        for (const el of document.querySelectorAll("." + LIGHT)) {
          el.classList.replace(LIGHT, DARK);
          swapped.add(el);
        }
      } else {
        for (const el of swapped) el.classList.replace(DARK, LIGHT);
        swapped.clear();
      }
    }

    return {
      watch() {
        // <body> does not exist yet at document_start, and the page sets
        // the class again and adds layers later.
        new MutationObserver(sync).observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class"],
        });
      },
      want(on) {
        wanted = on;
        sync();
      },
    };
  })();
  if (usesDriveTheme) driveTheme.watch();

  // --- Applying the settings --------------------------------------------------

  function apply(settings) {
    const state = DDM.stateFor(app, settings);
    root.setAttribute("data-ddm-app", app);
    root.setAttribute("data-ddm-ui", state.ui ? "on" : "off");
    root.setAttribute(
      "data-ddm-content",
      state.content && !frame ? "on" : "off",
    );
    for (const name of EDITOR_DARK_CLASSES) {
      root.classList.toggle(name, state.ui);
    }
    if (usesDriveTheme) driveTheme.want(state.ui);
    if (app === "drive" && !frame) {
      // Drive shows thumbnails of Docs and Sheets files, which follow those
      // apps' content switches.
      for (const other of ["docs", "sheets"]) {
        const on = DDM.stateFor(other, settings).content;
        root.setAttribute(`data-ddm-${other}-content`, on ? "on" : "off");
      }
    }
  }

  async function refresh() {
    apply(await DDM.load());
  }

  // Dark straight away (the defaults), then whatever the settings say.
  apply(DDM.DEFAULTS);
  refresh();
  browser.storage.onChanged.addListener((_changes, area) => {
    if (area === "local") refresh();
  });
})();
