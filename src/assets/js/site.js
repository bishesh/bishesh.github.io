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

  // Filters: <div data-filters="pubs"> with .chip[data-key][data-value]; items [data-filterable="pubs"] carry data-<key>="a b c".
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
      groups.forEach((g) => (g.hidden = !g.querySelector(`[data-filterable="${scope}"]:not([hidden])`)));
      if (counter) counter.textContent = shown;
    };
    box.addEventListener("click", (e) => {
      const c = e.target.closest(".chip[data-key]"); if (!c) return;
      const k = c.dataset.key, v = c.dataset.value; state[k] ??= new Set();
      if (v === "*") state[k].clear(); else state[k].has(v) ? state[k].delete(v) : state[k].add(v);
      box.querySelectorAll(`.chip[data-key="${k}"]`).forEach((x) =>
        x.setAttribute("aria-pressed", x.dataset.value === "*" ? String(!state[k].size) : String(state[k].has(x.dataset.value))));
      apply();
    });
    // deep link: ?theme=ultrasound
    const q = new URLSearchParams(location.search);
    q.forEach((v, k) => box.querySelector(`.chip[data-key="${k}"][data-value="${v}"]`)?.click());
  });
})();
