// The popup: one row of switches per app, built from DDM.APPS, plus the main
// switch. Every switch saves at once; open pages pick the change up through
// storage.onChanged (see content/boot.js).

(async () => {
  const settings = await DDM.load();

  function makeSwitch(key, title) {
    const label = document.createElement("label");
    label.className = "switch";
    label.title = title;
    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.setting = key;
    const track = document.createElement("span");
    track.className = "track";
    label.append(input, track);
    return label;
  }

  const rows = document.querySelector("#apps tbody");
  for (const [app, { label, content }] of Object.entries(DDM.APPS)) {
    const row = rows.insertRow();
    row.insertCell().textContent = label;
    row.insertCell().append(makeSwitch(`${app}Ui`, `${label}: dark interface`));
    const contentCell = row.insertCell();
    if (content) {
      contentCell.append(makeSwitch(`${app}Content`, `${label}: dark content`));
    } else {
      contentCell.textContent = "–";
      contentCell.className = "none";
    }
  }

  for (const input of document.querySelectorAll("input[data-setting]")) {
    const key = input.dataset.setting;
    input.checked = settings[key];
    input.addEventListener("change", () => {
      settings[key] = input.checked;
      DDM.save({ [key]: input.checked });
      if (key === "enabled") showEnabled();
    });
  }

  function showEnabled() {
    document.body.classList.toggle("off", !settings.enabled);
  }
  showEnabled();
})();
