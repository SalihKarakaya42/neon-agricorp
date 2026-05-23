---
title: "Çiftlik Ürünleri"
tags: [concept, active]
created: 2026-05-24
updated: 2026-05-24
sources: [[01_RAW/domains/neon-agricorp/FarmSystem.tsx]]
status: active
---

# Çiftlik Ürünleri

NEON AGRICORP'ta çiftlik sayfasında (Yeraltı Hidroponiği) ekilebilen ürünler. Her ürün belirli su ve enerji karşılığında ekilir, büyüme süresi sonunda hasat edilerek bir çıktı ürünü elde edilir.

## Temel Ürünler

| Ürün | Çıktı | Büyüme | Su | Enerji | Su/s | Enerji/s |
|------|-------|--------|----|--------|------|----------|
| **Hidro Marul** | Ham Marul | 30s | 10 | 5 | 0.5 | 1 |
| **Radyo Patates** | Ham Nişasta | 45s | 15 | 7 | 0.6 | 1.5 |
| **Sentetik Buğday** | Ham Un Bazı | 40s | 12 | 6 | 0.55 | 1.2 |
| **Neon Domates** | Ham Macun | 60s | 20 | 10 | 0.8 | 2.5 |
| **Parlak Meyve** | Parlak Meyve Partisi | 120s | 30 | 18 | 1.1 | 4 |

## Tier 4 Ürünleri

Kademe 4 araştırması açıldıktan sonra kullanılabilir.

| Ürün | Çıktı | Büyüme | Su | Enerji | Su/s | Enerji/s |
|------|-------|--------|----|--------|------|----------|
| **Biyo Lumina Meyvesi** | Lumina Özütü | 200s | 40 | 25 | 1.5 | 6 |
| **Nano Orkide** | Nano Sporlar | 250s | 50 | 30 | 1.8 | 7 |
| **Void Karpuzu** | Void Özü | 300s | 60 | 35 | 2.0 | 8 |

## Mekanik Detaylar

- Her pod'a tek tip ürün ekilebilir (karışık ekim yok)
- Pod kapasitesi kadar ürün aynı anda büyüyebilir
- Büyüme hızı; enerji seviyesi, radyasyon, gübre ve araştırma çarpanlarından etkilenir
- Hasat edilen ürünler fabrikada işlenmek üzere envantere gider

## İlgili Bağlantılar

- [[02_WIKI/concepts/fabrika-uretim-zincirleri|Fabrika Üretim Zincirleri]]
- [[02_WIKI/concepts/enerji-sistemi|Enerji Sistemi]]
- [[02_WIKI/concepts/su-sistemi|Su Sistemi]]

## Kaynak

- [[01_RAW/domains/neon-agricorp/FarmSystem.tsx]]