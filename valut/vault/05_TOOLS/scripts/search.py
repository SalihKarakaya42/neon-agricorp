#!/usr/bin/env python3
"""
Naif wiki arama motoru.
Kullanım: python search.py <sorgu> [--dir <vault-yolu>]
"""

import re
import sys
import json
import argparse
from pathlib import Path
from collections import Counter
from typing import List, Tuple


def index_vault(vault_dir: Path) -> List[dict]:
    """Vault'taki tüm .md dosyalarını tara ve indeksle."""
    docs = []
    for md_file in sorted(vault_dir.rglob("*.md")):
        # _README, indeks ve config dosyalarını atla
        if md_file.stem.startswith("_") or md_file.stem.startswith("."):
            continue
        try:
            text = md_file.read_text(encoding="utf-8")
        except Exception:
            continue

        # Basit frontmatter çıkarımı
        frontmatter = {}
        fm_match = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
        if fm_match:
            for line in fm_match.group(1).strip().split("\n"):
                if ":" in line:
                    key, val = line.split(":", 1)
                    frontmatter[key.strip()] = val.strip().strip('"').strip("'")

            text = text[fm_match.end():]

        docs.append({
            "path": str(md_file.relative_to(vault_dir)),
            "title": frontmatter.get("title", md_file.stem),
            "tags": frontmatter.get("tags", ""),
            "text": text,
        })

    return docs


def search(docs: List[dict], query: str) -> List[Tuple[float, dict]]:
    """Basit kelime eşleştirme ile arama yap."""
    words = query.lower().split()
    results = []

    for doc in docs:
        score = 0
        text_lower = doc["text"].lower()
        title_lower = doc["title"].lower()

        for w in words:
            # Başlıkta geçiyorsa bonus
            title_count = title_lower.count(w)
            score += title_count * 10

            # Metinde geçiyorsa
            text_count = text_lower.count(w)
            score += text_count

            # Etiketlerde geçiyorsa bonus
            tag_count = doc["tags"].lower().count(w)
            score += tag_count * 5

        if score > 0:
            results.append((score, doc))

    results.sort(key=lambda x: -x[0])
    return results


def main():
    parser = argparse.ArgumentParser(description="Wiki arama motoru")
    parser.add_argument("query", help="Arama sorgusu")
    parser.add_argument("--dir", default=".", help="Vault dizini")
    parser.add_argument("--json", action="store_true", help="JSON çıktı")
    parser.add_argument("--limit", type=int, default=10, help="Maksimum sonuç")

    args = parser.parse_args()
    vault_dir = Path(args.dir)

    if not vault_dir.is_dir():
        print(f"Hata: {args.dir} bir dizin değil", file=sys.stderr)
        sys.exit(1)

    docs = index_vault(vault_dir)
    results = search(docs, args.query)

    if args.json:
        output = [
            {
                "path": r["path"],
                "title": r["title"],
                "score": round(s, 2),
                "snippet": r["text"][:200].strip(),
            }
            for s, r in results[:args.limit]
        ]
        print(json.dumps({"results": output, "total": len(results)}, indent=2))
    else:
        print(f"\"{args.query}\" için {len(results)} sonuç bulundu\n")
        for score, doc in results[:args.limit]:
            snippet = doc["text"].strip()[:150].replace("\n", " ")
            print(f"  [{doc['title']}]({doc['path']})  (puan: {score:.0f})")
            print(f"  {snippet}...\n")


if __name__ == "__main__":
    main()