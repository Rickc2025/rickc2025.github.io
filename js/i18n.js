/* Sonexa Game Studios — language switching.
   English lives in the HTML; other languages are fetched from /i18n/<code>.json
   only when picked, so the default visit downloads no translation data. */
(() => {
  "use strict";

  const LANGS = [
    { code: "en",     name: "English" },
    { code: "de",     name: "Deutsch" },
    { code: "es",     name: "Español" },
    { code: "es-419", name: "Español Latinoamérica" },
    { code: "fr",     name: "Français" },
    { code: "it",     name: "Italiano" },
    { code: "ja",     name: "日本語" },
    { code: "ko",     name: "한국어" },
    { code: "pl",     name: "Polski" },
    { code: "pt-BR",  name: "Português do Brasil" },
    { code: "ru",     name: "Русский" },
    { code: "zh-TW",  name: "繁體中文" },
    { code: "zh-CN",  name: "简体中文" },
  ];
  const BY_CODE = Object.fromEntries(LANGS.map((l) => [l.code, l]));
  const STORE_KEY = "sonexa-lang";

  const btn = document.getElementById("langBtn");
  const menu = document.getElementById("langMenu");
  const current = document.getElementById("langCurrent");
  if (!btn || !menu || !current) return;

  /* ---------- capture the English copy already in the page ---------- */
  const nodes = [...document.querySelectorAll("[data-i18n]")];
  const attrNodes = [...document.querySelectorAll("[data-i18n-attr]")];
  const EN = {};
  for (const el of nodes) EN[el.dataset.i18n] = el.innerHTML;
  for (const el of attrNodes) {
    const [attr, key] = el.dataset.i18nAttr.split(":");
    EN[key] = EN[key] ?? el.getAttribute(attr);
  }
  const metaDesc = document.querySelector('meta[name="description"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  EN["meta.title"] = document.title;
  EN["meta.description"] = metaDesc ? metaDesc.content : "";
  EN["meta.ogDescription"] = ogDesc ? ogDesc.content : "";

  /* ---------- pick a starting language ---------- */
  // "pt-BR" wins over "pt"; "es-MX" falls to Latin American Spanish; "zh-HK" to Traditional.
  function normalise(tag) {
    if (!tag) return null;
    const t = tag.replace("_", "-");
    if (BY_CODE[t]) return t;
    const lower = t.toLowerCase();
    const base = lower.split("-")[0];
    const region = lower.split("-")[1];
    if (base === "pt") return "pt-BR";
    if (base === "es") return !region || region === "es" ? "es" : "es-419";
    if (base === "zh") {
      if (["tw", "hk", "mo", "hant"].includes(region)) return "zh-TW";
      return "zh-CN";
    }
    const exact = LANGS.find((l) => l.code.toLowerCase() === lower);
    if (exact) return exact.code;
    const byBase = LANGS.find((l) => l.code.toLowerCase().split("-")[0] === base);
    return byBase ? byBase.code : null;
  }

  function initialLang() {
    const url = normalise(new URLSearchParams(location.search).get("lang"));
    if (url) return url;
    let saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch {}
    if (normalise(saved)) return normalise(saved);
    for (const tag of navigator.languages || [navigator.language]) {
      const hit = normalise(tag);
      if (hit) return hit;
    }
    return "en";
  }

  /* ---------- applying a dictionary ---------- */
  const cache = { en: EN };

  function setText(dict) {
    for (const el of nodes) {
      const v = dict[el.dataset.i18n];
      if (typeof v === "string") el.innerHTML = v;
    }
    for (const el of attrNodes) {
      const [attr, key] = el.dataset.i18nAttr.split(":");
      const v = dict[key];
      if (typeof v === "string") el.setAttribute(attr, v);
    }
    if (dict["meta.title"]) document.title = dict["meta.title"];
    if (metaDesc && dict["meta.description"]) metaDesc.content = dict["meta.description"];
    if (ogDesc && dict["meta.ogDescription"]) ogDesc.content = dict["meta.ogDescription"];
  }

  // JSON files are nested ({games:{title:"..."}}) — flatten to dotted keys.
  function flatten(obj, prefix = "", out = {}) {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
      else out[key] = v;
    }
    return out;
  }

  async function load(code) {
    if (cache[code]) return cache[code];
    const res = await fetch(`/i18n/${code}.json`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`missing ${code}`);
    const dict = flatten(await res.json());
    cache[code] = dict;
    return dict;
  }

  let active = "en";

  async function apply(code, { persist = true, updateUrl = true } = {}) {
    const lang = BY_CODE[code] ? code : "en";
    let dict;
    try {
      dict = await load(lang);
    } catch {
      dict = EN; // a missing file must never blank the page
      return applyResolved("en", dict, { persist, updateUrl });
    }
    return applyResolved(lang, dict, { persist, updateUrl });
  }

  function applyResolved(lang, dict, { persist, updateUrl }) {
    setText(dict);
    active = lang;
    document.documentElement.lang = lang;
    current.textContent = BY_CODE[lang].name;
    for (const li of menu.querySelectorAll("[role='option']")) {
      const on = li.dataset.lang === lang;
      li.setAttribute("aria-selected", String(on));
      li.classList.toggle("on", on);
    }
    if (persist) { try { localStorage.setItem(STORE_KEY, lang); } catch {} }
    if (updateUrl) {
      const u = new URL(location.href);
      if (lang === "en") u.searchParams.delete("lang");
      else u.searchParams.set("lang", lang);
      history.replaceState(null, "", u);
    }
    document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
  }

  /* ---------- the picker ---------- */
  menu.innerHTML = LANGS.map(
    (l) => `<li><button type="button" role="option" data-lang="${l.code}" aria-selected="false" lang="${l.code}">${l.name}</button></li>`
  ).join("");

  const closeMenu = () => {
    menu.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  };
  const openMenu = () => {
    menu.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.contains("open") ? closeMenu() : openMenu();
  });
  menu.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-lang]");
    if (!opt) return;
    apply(opt.dataset.lang);
    closeMenu();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-lang")) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) { closeMenu(); btn.focus(); }
  });

  window.addEventListener("popstate", () => {
    const fromUrl = normalise(new URLSearchParams(location.search).get("lang")) || "en";
    if (fromUrl !== active) apply(fromUrl, { updateUrl: false });
  });

  const start = initialLang();
  if (start === "en") applyResolved("en", EN, { persist: false, updateUrl: false });
  else apply(start, { persist: false });
})();
