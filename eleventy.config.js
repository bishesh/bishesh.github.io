import * as yaml from "js-yaml";
import markdownIt from "markdown-it";

const md = markdownIt({ html: false, linkify: true, typographer: true });
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addFilter("md", (s) => (s ? md.render(String(s)) : ""));
  eleventyConfig.addFilter("mdInline", (s) => (s ? md.renderInline(String(s)) : ""));
  // "2024-08-27" | "2024-08" | "2024" -> "27 Aug 2024" | "Aug 2024" | "2024"
  eleventyConfig.addFilter("fuzzyDate", (d) => {
    if (!d) return "";
    const [y, m, day] = String(d).split("-");
    return [day ? +day : null, m ? MONTHS[+m - 1] : null, y].filter(Boolean).join(" ");
  });
  eleventyConfig.addFilter("year", (d) => String(d || "").slice(0, 4));
  // accepts a bare id or any youtube url
  eleventyConfig.addFilter("youtubeId", (v) => {
    if (!v) return "";
    const m = String(v).match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
    return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : "";
  });
  eleventyConfig.addFilter("visible", (xs) => (xs || []).filter((x) => !x.hidden));
  eleventyConfig.addFilter("groupBy", (xs, key) => {
    const g = new Map();
    for (const x of xs || []) {
      const k = key === "year" || key === "date" ? String(x[key]).slice(0, 4) : String(x[key]);
      if (!g.has(k)) g.set(k, []);
      g.get(k).push(x);
    }
    return [...g.entries()].map(([k, items]) => ({ key: k, items }));
  });
  eleventyConfig.addFilter("where", (xs, k, v) => (xs || []).filter((x) => x[k] === v));
  eleventyConfig.addFilter("whereIn", (xs, k, v) => (xs || []).filter((x) => (x[k] || []).includes(v)));
  eleventyConfig.addFilter("sortDesc", (xs, k) => [...(xs || [])].sort((a, b) => String(b[k]).localeCompare(String(a[k]))));
  // featured first, then newest
  eleventyConfig.addFilter("featuredFirst", (xs, k = "date") =>
    [...(xs || [])].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || String(b[k]).localeCompare(String(a[k]))));
  eleventyConfig.addFilter("pubLink", (p) =>
    p.url || (p.doi ? `https://doi.org/${p.doi}` : p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : ""));
  eleventyConfig.addFilter("themeCount", (pubs) => new Set((pubs || []).flatMap((p) => p.themes || []).filter((t) => t !== "other")).size);
  eleventyConfig.addFilter("count", (xs) => (xs || []).length);

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
