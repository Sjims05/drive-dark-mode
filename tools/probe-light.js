(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\/ ]+/).filter(Boolean).map(Number);
    return { v: (p[0] + p[1] + p[2]) / 3, a: p[3] === undefined ? 1 : p[3] };
  };
  const nm = (e) => e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/).slice(0, 4).join(".") : "");
  const out = [];
  for (const e of document.querySelectorAll("body *")) {
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue;
    const cs = getComputedStyle(e);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    const hits = [];
    const bg = parse(cs.backgroundColor);
    if (bg && bg.a > 0.5 && bg.v > 170) hits.push("bg=" + cs.backgroundColor);
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      if (parseFloat(cs["border" + side + "Width"]) > 0 && cs["border" + side + "Style"] !== "none") {
        const b = parse(cs["border" + side + "Color"]);
        if (b && b.a > 0.5 && b.v > 200) hits.push("border" + side + "=" + cs["border" + side + "Color"] + " " + cs["border" + side + "Width"]);
      }
    }
    if (hits.length) out.push(nm(e) + " < " + nm(e.parentElement) + " | " + hits.join(" ") + " | " + Math.round(r.left) + "," + Math.round(r.top) + " " + Math.round(r.width) + "x" + Math.round(r.height));
  }
  return out.slice(0, 50).join("\n");
})();
