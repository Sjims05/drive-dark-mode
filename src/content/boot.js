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

  // What this page is:
  // - a page of its own in a tab;
  // - a dialog that Google loads as a page inside a frame (the Share dialog,
  //   the file picker), which belongs to the app of the page around it and
  //   follows that app's interface switch;
  // - a document or sheet shown inside another Google page, such as Drive's
  //   file preview, which is treated like the file opened in a tab.
  const inFrame = window.top !== window;
  const dialog = !inFrame
    ? null
    : location.pathname.startsWith("/picker/")
      ? "picker"
      : location.pathname.startsWith("/drivesharing/")
        ? "share"
        : null;
  const embedded = inFrame && !dialog;

  let where = location;
  if (dialog) where = parentLocation();
  if (embedded && !embeddedByGoogle()) where = null;
  const app = where && DDM.detectApp(where);

  if (!app) {
    // Inside a page that is not ours (a document embedded in some other
    // website, say): leave it alone.
    root.setAttribute("data-ddm-ui", "off");
    root.setAttribute("data-ddm-content", "off");
    return;
  }
  if (dialog) root.setAttribute("data-ddm-frame", dialog);

  function embeddedByGoogle() {
    // The page around a frame on another site cannot be read; the referrer
    // says where the frame was opened from. No referrer at all is let
    // through, since Google's own pages sometimes withhold it.
    if (!document.referrer) return true;
    try {
      const host = new URL(document.referrer).hostname;
      return host === "drive.google.com" || host === "docs.google.com";
    } catch {
      return false;
    }
  }

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
    app === "drive" || dialog
      ? []
      : ["docsDarkMode", "modeElementsDark", "peoplekitThemeDark"];

  // Drive and the Share dialog have a light and a dark theme, marked by a
  // class on <body> and on the layers added for menus and dialogs. A light
  // one is turned dark by swapping that class, and put back when switched
  // off. The two class names are Google's generated ones and the most likely
  // thing in the extension to change.
  const usesDriveTheme = (app === "drive" && !dialog) || dialog === "share";
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

  // A sheet's preview page is a plain table with no dark theme of its own;
  // the style sheet filters it as a whole, like content. So it must not also
  // get the dark interface colours, or the filter would turn them light.
  const plainPreview = app === "sheets" && isPreviewPath(location.pathname);

  const nestedPreview =
    plainPreview && inFrame && isPreviewPath(parentLocation()?.pathname ?? "");

  function isPreviewPath(path) {
    return /\/preview(\/|$)/.test(path);
  }

  function apply(settings) {
    const state = DDM.stateFor(app, settings);
    if (plainPreview) {
      state.ui = false;
      // The preview holds the sheet in a frame of the same kind; the outer
      // page's filter already covers it, and a second one would undo it.
      if (nestedPreview) state.content = false;
    }
    root.setAttribute("data-ddm-app", app);
    root.setAttribute("data-ddm-ui", state.ui ? "on" : "off");
    root.setAttribute(
      "data-ddm-content",
      state.content && !dialog ? "on" : "off",
    );
    for (const name of EDITOR_DARK_CLASSES) {
      root.classList.toggle(name, state.ui);
    }
    if (usesDriveTheme) driveTheme.want(state.ui);
    if (app === "drive" && !dialog) {
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
