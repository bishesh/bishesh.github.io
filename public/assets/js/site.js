// theme toggle · mobile nav · chip filters (data-filter-group). No dependencies.
(() => {
  const root = document.documentElement;
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
  const nt = document.querySelector("[data-nav-toggle]"), nav = document.getElementById("nav");
  nt?.addEventListener("click", () => { const o = nav.classList.toggle("open"); nt.setAttribute("aria-expanded", o); });

  // Filters: <div data-filters="pubs"> with .chip[data-key][data-value] (data-single: one value at a time, like tabs); items [data-filterable="pubs"] carry data-<key>="a b c".
  // Within a key: OR. Across keys: AND. value "*" clears the key.
  document.querySelectorAll("[data-filters]").forEach((box) => {
    const scope = box.dataset.filters, state = {};
    const items = [...document.querySelectorAll(`[data-filterable="${scope}"]`)];
    const groups = [...document.querySelectorAll(`[data-filter-group="${scope}"]`)];
    const counter = document.querySelector(`[data-filter-count="${scope}"]`);
    const apply = () => {
      let shown = 0;
      items.forEach((el) => {
        const ok = Object.entries(state).every(([k, vals]) => !vals.size || (el.dataset[k] || "").split(" ").some((v) => vals.has(v)));
        el.hidden = !ok; if (ok) shown++;
      });
      groups.forEach((g) => {
        const n = g.querySelectorAll(`[data-filterable="${scope}"]:not([hidden])`).length;
        g.hidden = !n; const c = g.querySelector("[data-group-count]"); if (c) c.textContent = n;
      });
      if (counter) counter.textContent = shown;
      // live counts on [data-live] chips: what that value would show, given every other key's current choice
      box.querySelectorAll("[data-live][data-key]").forEach((c) => {
        const k = c.dataset.key, v = c.dataset.value, n = c.querySelector(".n"); if (!n || v === "*") return;
        n.textContent = items.filter((el) => Object.entries(state).every(([kk, vals]) => kk === k || !vals.size ||
          (el.dataset[kk] || "").split(" ").some((x) => vals.has(x))) && (el.dataset[k] || "").split(" ").includes(v)).length;
      });
    };
    const press = (k) => box.querySelectorAll(`[data-key="${k}"]`).forEach((x) =>
      x.setAttribute("aria-pressed", x.dataset.value === "*" ? String(!state[k]?.size) : String(!!state[k]?.has(x.dataset.value))));
    box.addEventListener("click", (e) => {
      const c = e.target.closest("[data-key]"); if (!c) return;
      const k = c.dataset.key, v = c.dataset.value; state[k] ??= new Set();
      if (v === "*") state[k].clear();
      else if ("single" in c.dataset) { state[k].clear(); state[k].add(v); }
      else state[k].has(v) ? state[k].delete(v) : state[k].add(v);
      press(k);
      // rows that refine one value of this key (data-for-key/data-for): show only under it, reset when hidden
      box.querySelectorAll(`[data-for-key="${k}"]`).forEach((row) => {
        row.hidden = !state[k].has(row.dataset.for);
        if (row.hidden) row.querySelectorAll("[data-key]").forEach((x) => { state[x.dataset.key]?.clear(); press(x.dataset.key); });
      });
      apply();
    });
    // deep link: ?theme=ultrasound
    const q = new URLSearchParams(location.search);
    q.forEach((v, k) => box.querySelector(`[data-key="${k}"][data-value="${v}"]`)?.click());
  });
})();
