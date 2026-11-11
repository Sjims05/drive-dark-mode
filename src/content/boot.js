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
  // Dialogs that Google loads as a page of their own inside a frame (the
  // Share dialog) belong to the app of the page around them.
  const isDialogFrame = window.top !== window;
  const where = isDialogFrame ? parentLocation() : location;
  const app = where && DDM.detectApp(where);

  const root = document.documentElement;

  if (!app || (isDialogFrame && app === "drive")) {
    // Not ours, or a dialog inside Drive, which Drive's own dark theme
    // already covers.
    root.setAttribute("data-ddm-ui", "off");
    root.setAttribute("data-ddm-content", "off");
    return;
  }

  // The editors' own style sheet holds a dark theme that Google has not
  // switched on: these classes switch it on. Drive has a dark theme of its
  // own in its settings and does not use them, and a dialog frame has no
  // such theme at all.
  const GOOGLE_DARK_CLASSES =
    app === "drive" || isDialogFrame
      ? []
      : ["docsDarkMode", "modeElementsDark", "peoplekitThemeDark"];

  function parentLocation() {
    try {
      return window.parent.location.href ? window.parent.location : null;
    } catch {
      return null; // a frame on another site
    }
  }

  // Which dialog a frame holds; set before the first paint because the
  // style sheet needs it to pick its rules.
  if (isDialogFrame) {
    const kind = location.pathname.startsWith("/picker/") ? "picker" : "share";
    root.setAttribute("data-ddm-frame", kind);
  }

  function apply(settings) {
    const state = DDM.stateFor(app, settings);
    root.setAttribute("data-ddm-app", app);
    root.setAttribute("data-ddm-ui", state.ui ? "on" : "off");
    root.setAttribute(
      "data-ddm-content",
      state.content && !isDialogFrame ? "on" : "off",
    );
    for (const name of GOOGLE_DARK_CLASSES) {
      root.classList.toggle(name, state.ui);
    }
    if (app === "drive") {
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
