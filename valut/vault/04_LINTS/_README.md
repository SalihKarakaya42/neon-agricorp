---
title: "Lints & Health Checks"
created: 2026-05-24
tags: [meta, lint]
---

# Lints — Sağlık Kontrolleri

Bu dizin, WIKI'nin periyodik sağlık kontrollerinin sonuçlarını içerir.

## Kontrol tipleri

| Kontrol | Açıklama |
|---------|----------|
| **Bağlantı kontrolü** | Kopuk/kayıp [[wikilink]]'leri bul |
| **Frontmatter kontrolü** | Eksik frontmatter alanlarını düzelt |
| **Tutarlılık kontrolü** | Çelişkili veya güncel olmayan bilgileri bul |
| **Boşluk analizi** | Henüz yazılmamış konsept/makale adaylarını bul |
| **Bağlantı önerileri** | Birbiriyle bağlantılı olması gereken ama olmayan makaleleri bul |

## Çıktı formatı

Her sağlık kontrolü `health_checks/` altına tarihli bir rapor yazar:
```
health-check-YYYY-MM-DD.md
```

## Düzeltme döngüsü

- LLM lint raporunu okur
- Bulunan sorunları giderir
- Bir sonraki lint'te aynı hatalar olmadığını doğrular