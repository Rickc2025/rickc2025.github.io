#!/usr/bin/env python3
"""Rebuild i18n/en.json from index.html.

English is authored directly in the page, so this keeps the translation source
in sync with it. Run after editing any copy in index.html, then hand the diff to
whoever updates the other languages.

    python tools/extract-strings.py
"""
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "index.html"
OUT = ROOT / "i18n" / "en.json"


def extract(markup: str) -> dict:
    strings: dict[str, str] = {}

    # <tag data-i18n="key">text</tag>
    for m in re.finditer(r'data-i18n="([^"]+)"[^>]*>(.*?)</', markup, re.S):
        strings.setdefault(m.group(1), m.group(2).strip())

    # <tag data-i18n-attr="attr:key" attr="text">
    for m in re.finditer(r'data-i18n-attr="([^:]+):([^"]+)"\s+\1="([^"]*)"', markup):
        strings.setdefault(m.group(2), m.group(3))

    # head tags, which are set as plain text rather than markup
    def head(pattern: str) -> str:
        found = re.search(pattern, markup, re.S)
        return html.unescape(found.group(1).strip()) if found else ""

    strings["meta.title"] = head(r"<title>(.*?)</title>")
    strings["meta.description"] = head(r'name="description" content="(.*?)"')
    strings["meta.ogDescription"] = head(r'property="og:description" content="(.*?)"')
    return strings


def nest(flat: dict) -> dict:
    tree: dict = {}
    for key in sorted(flat):
        parts = key.split(".")
        node = tree
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = flat[key]
    return tree


def main() -> int:
    flat = extract(PAGE.read_text(encoding="utf-8"))
    empty = sorted(k for k, v in flat.items() if not v)
    if empty:
        print(f"error: these keys resolved to an empty string: {', '.join(empty)}", file=sys.stderr)
        return 1

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(nest(flat), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(flat)} strings -> {OUT.relative_to(ROOT)}")

    # warn about languages that would fall back to English on some keys
    for path in sorted(OUT.parent.glob("*.json")):
        if path.name == "en.json":
            continue
        other = json.loads(path.read_text(encoding="utf-8"))
        flat_other = {}

        def walk(obj, prefix=""):
            for k, v in obj.items():
                key = f"{prefix}.{k}" if prefix else k
                walk(v, key) if isinstance(v, dict) else flat_other.setdefault(key, v)

        walk(other)
        missing = sorted(set(flat) - set(flat_other))
        extra = sorted(set(flat_other) - set(flat))
        if missing or extra:
            print(f"  {path.stem}: {len(missing)} missing, {len(extra)} stale")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
