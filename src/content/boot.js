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

  function apply(settings) {
    const state = DDM.stateFor(app, settings);
    root.setAttribute("data-ddm-app", app);
    root.setAttribute("data-ddm-ui", state.ui ? "on" : "off");
    root.setAttribute("data-ddm-content", state.content ? "on" : "off");
  }

  async function refresh() {
    apply(await DDM.load());
  }

  refresh();
  browser.storage.onChanged.addListener((_changes, area) => {
    if (area === "local") refresh();
  });
})();
