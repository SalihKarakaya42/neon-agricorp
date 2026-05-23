---
title: "Outputs"
created: 2026-05-24
tags: [meta, output]
---

# Outputs — Sorgu Çıktıları

Bu dizin, LLM sorgularının ürettiği çıktıları içerir.

## Dizinler

- `reports/` — Markdown raporlar, analizler, araştırma sentezleri
- `slides/` — Marp formatı sunum slaytları
- `visualizations/` — Matplotlib/Plotly görselleri (PNG, SVG)
- `datasets/` — Üretilmiş veri setleri (CSV, JSON)

## Süreç

1. Kullanıcı bir soru sorar
2. LLM ilgili WIKI makalelerini okur
3. Çıktıyı uygun formatta üretir
4. Gerekirse WIKI'ye geri besler (yeni bağlantılar, güncellemeler)

## Kurallar

- Her çıktı anlamlı bir dosya adı alır: `konu-aciklama-YYYY-MM-DD.md`
- Frontmatter eklenir (title, tags, created, sources)
- Raporlar WIKI'deki ilgili makalelere backlink verir