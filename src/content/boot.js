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
  const app = DDM.detectApp(location);
  if (!app) return;

  const root = document.documentElement;

  // The editors' own style sheet holds a dark theme that Google has not
  // switched on: these classes switch it on. Drive has a dark theme of its
  // own in its settings and does not use them.
  const GOOGLE_DARK_CLASSES =
    app === "drive"
      ? []
      : ["docsDarkMode", "modeElementsDark", "peoplekitThemeDark"];

  function apply(state) {
    root.setAttribute("data-ddm-app", app);
    root.setAttribute("data-ddm-ui", state.ui ? "on" : "off");
    root.setAttribute("data-ddm-content", state.content ? "on" : "off");
    for (const name of GOOGLE_DARK_CLASSES) {
      root.classList.toggle(name, state.ui);
    }
  }

  async function refresh() {
    apply(DDM.stateFor(app, await DDM.load()));
  }

  // Dark straight away (the defaults), then whatever the settings say.
  apply(DDM.stateFor(app, DDM.DEFAULTS));
  refresh();
  browser.storage.onChanged.addListener((_changes, area) => {
    if (area === "local") refresh();
  });
})();
