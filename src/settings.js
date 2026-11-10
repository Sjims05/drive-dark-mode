// Settings shared by the content script and the popup.
// Loaded as a plain script in both, so it puts one object on the global scope.

/* exported DDM */
const DDM = (() => {
  // The apps the extension covers. `content` says whether the app has a
  // content dark mode (the page in Docs, the grid in Sheets). Slides and
  // Drive only get a dark UI.
  const APPS = {
    drive: { label: "Drive", content: false },
    docs: { label: "Docs", content: true },
    sheets: { label: "Sheets", content: true },
    slides: { label: "Slides", content: false },
  };

  const DEFAULTS = {
    enabled: true,
    driveUi: true,
    docsUi: true,
    docsContent: true,
    sheetsUi: true,
    sheetsContent: true,
    slidesUi: true,
  };

  /** Which app a page belongs to, or null when it is none of them. */
  function detectApp(location) {
    if (location.hostname === "drive.google.com") return "drive";
    if (location.hostname !== "docs.google.com") return null;
    if (location.pathname.startsWith("/document/")) return "docs";
    if (location.pathname.startsWith("/spreadsheets/")) return "sheets";
    if (location.pathname.startsWith("/presentation/")) return "slides";
    return null;
  }

  /** The stored settings, with defaults for anything not stored yet. */
  async function load() {
    return browser.storage.local.get(DEFAULTS);
  }

  function save(changes) {
    return browser.storage.local.set(changes);
  }

  /** What is switched on for one app: `{ ui, content }`. */
  function stateFor(app, settings) {
    return {
      ui: settings.enabled && settings[`${app}Ui`],
      content:
        settings.enabled && APPS[app].content && settings[`${app}Content`],
    };
  }

  return { APPS, DEFAULTS, detectApp, load, save, stateFor };
})();
