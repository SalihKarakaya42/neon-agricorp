---
title: "LLM Knowledge Base"
created: 2026-05-24
tags: [meta, index]
---

# LLM Knowledge Base Vault

Bu vault, bir LLM tarafından yönetilen canlı bir wiki.

## Dizin yapısı

```
📂 00_INBOX/         → Ham girdi (web clippings, makaleler, kaynaklar)
📂 01_RAW/           → İndekslenmiş kaynak dokümanlar
📂 02_WIKI/          → Derlenmiş wiki (konseptler, makaleler, referanslar)
📂 03_OUTPUTS/       → Sorgu çıktıları (raporlar, slaytlar, görseller)
📂 04_LINTS/         → Sağlık kontrolleri ve veri bütünlüğü raporları
📂 05_TOOLS/         → Vault araçları ve CLI scriptleri
📂 templates/        → Obsidian şablonları
```

## Veri akışı

```
INBOX → RAW → WIKI ↔ OUTPUTS
                ↕
           LINTS ↔ TOOLS
```

## Kullanım

LLM'den istenecek tipik görevler:

- "Şu kaynağı işle ve WIKI'ye ekle"
- "WIKI'yi tara ve X hakkında bir rapor yaz (03_OUTPUTS/reports/)"
- "X konusunda bir slayt hazırla (Marp format, 03_OUTPUTS/slides/)"
- "WIKI'nin sağlık kontrolünü yap"
- "Şu iki konsept arasında bağlantı var mı? Eksikse makale yaz"

Detaylı kurallar için: [[_CONFIG]]
Ana indeks için: [[02_WIKI/_index]]