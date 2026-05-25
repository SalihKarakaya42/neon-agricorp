---
title: "Çiftlik Ürünleri"
tags: [concept, active]
created: 2026-05-24
updated: 2026-05-25
sources: [[01_RAW/domains/neon-agricorp/FarmSystem.tsx]]
status: active
---

# Çiftlik Ürünleri

NEON AGRICORP'ta çiftlik sayfasında (Yeraltı Hidroponiği) ekilebilen ürünler. Her ürün belirli su ve enerji karşılığında ekilir, büyüme süresi sonunda hasat edilerek bir çıktı ürünü elde edilir.

## Bölge Sistemi

Ürünler **bölge** bazında ekilir. Her bölge farklı bir yeraltı lokasyonunu temsil eder:

| Bölge | Bonus |
|-------|-------|
| [[bolge-sistemi#Nemli Mağara\|Nemli Mağara]] | +Su Verimi |
| [[bolge-sistemi#Reaktör Bölgesi\|Reaktör Bölgesi]] | +Enerji Üretimi |
| [[bolge-sistemi#Terk Edilmiş Lab\|Terk Edilmiş Lab]] | +Araştırma Hızı |
| [[bolge-sistemi#Toksik Katman\|Toksik Katman]] | Nadir Mutasyon |

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

- Her bölgeye tek tip ürün ekilebilir (karışık ekim yok)
- Bölge kapasitesi kadar ürün aynı anda büyüyebilir
- Büyüme hızı; enerji seviyesi, radyasyon, gübre ve araştırma çarpanlarından etkilenir
- Büyüme formülü: `baseTime / (cropGrowthModifier × energyMultiplier × radiationMultiplier × fertilizeMultiplier)`
- Hasat edilen ürünler fabrikada işlenmek üzere envantere gider

## Gübre Sistemi

Gübre, fabrikada Posa yan ürününden üretilir ve çiftlikte ekim sırasında manuel olarak kullanılır.

### Gübre Kullanımı

> **Eski sistem (kaldırıldı):** Gübre otomatik olarak uygulanırdı, varsa ×1.3 çarpan verir ve hasat başına 1 tüketirdi.
>
> **Yeni sistem:** Ekim modalında "Gübre Kullan" toggle'ı ile manuel olarak aktifleştirilir. Her bitkiye 1 gübre gider, büyüme süresi %1 hızlanır (`×1.01` çarpan).

### Gübre Üretimi

1. Fabrikada her üretim zinciri **Posa** yan ürünü çıkarır (gelişmiş ürünler daha çok posa verir)
2. Posa → Gübre dönüşümü: 5 Posa → 1 Gübre, 30sn işlem süresi, 3 enerji/s
3. Gübre, envanterden ayrı bir `fertilizer` state'inde tutulur
4. Çiftlik ekim modalında "🧪 Gübre Kullan" butonu ile aktifleştirilir

### Ekim Modalı UI

```
┌──────────────────────────────┐
│ Adet: [1] [2] [3] [4] [5]   │
│                              │
│ 🧪 Gübre Kullan  [Kullan]   │ ← toggle
│ 🌱 1 gübre = %1 hızlanma     │
│                              │
│ Ürün grid (5 kolon)          │
│                              │
│ [hovered crop info]          │
│ [N ADET EK + N GÜBRE]       │
└──────────────────────────────┘
```

- **Gübre toggle**: Eğer `fertilizer > 0` ise aktif, değilse devre dışı
- **Toggle açıkken**: Her ekilen bitki 1 gübre tüketir, `fertilized: true` işareti alır
- **Büyüme çarpanı**: `crop.fertilized ? 1.01 : 1.0` — her gübre %1 hızlandırır
- **Grid göstergesi**: Gübrelenmiş bitkiler grid listesinde 🧪 simgesiyle işaretlenir
- **Ekim butonu**: `"N ADET EK + M GÜBRE"` şeklinde kaç gübre kullanılacağını gösterir

## İlgili Bağlantılar

- [[02_WIKI/concepts/bolge-sistemi|Bölge Sistemi]]
- [[02_WIKI/concepts/fabrika-uretim-zincirleri|Fabrika Üretim Zincirleri]]
- [[02_WIKI/concepts/enerji-sistemi|Enerji Sistemi]]
- [[02_WIKI/concepts/su-sistemi|Su Sistemi]]

## Kaynak

- [[01_RAW/domains/neon-agricorp/FarmSystem.tsx]]