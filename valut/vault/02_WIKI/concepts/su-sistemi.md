---
title: "Su Sistemi"
tags: [concept, active]
created: 2026-05-26
updated: 2026-05-26
sources: [[01_RAW/domains/neon-agricorp/WaterSystem.tsx]]
status: active
---

# Su Sistemi

NEON AGRICORP'ta su, çiftlik ve fabrika üretimi için temel kaynaktır. Su seviyesi `GameLoop.tsx`'te merkezi olarak her saniye güncellenir.

## Mekanik

- **Net üretim**: `(pumpPower × efficiency × waterEfficiency) - leakage - totalConsumption`
  - `pumpPower`: Pompa üretim gücü (başlangıç: 5, araştırmalarla artar)
  - `efficiency`: Baz verimlilik sabiti = 1.0
  - `waterEfficiency`: Araştırma çarpanı
  - `leakage`: Sistem kaçağı = 2/s
- **Tick**: Her saniye `setInterval` ile güncellenir, `GameLoop.tsx`'te yönetilir
- **Sınır**: `[0, maxWater]` aralığında kalır

## UI Göstergesi

`WaterSystem.tsx` bileşeni tek bir panel olarak görünür:

```
┌──────────────────────────────╡ 💧 ┆
│ WATER                   +0.5/s │
│ 890 / 2,000                    │
│ ████████░░░░░░░░░░░░░░░░░░░░  │
└────────────────────────────────┘
```

- **Mavi ikon**: Normal durum
- **Kırmızı**: Su 50 birimin altındaysa
- **Net rate**: Pozitifse yeşil, negatifse kırmızı
- **Progress bar**: Mavi-cyan gradient

## Su Tüketen Sistemler

| Sistem | Açıklama |
|--------|----------|
| Çiftlik | Ekili her pod, ürünün su/s değeri kadar tüketir |
| Fabrika | Su girdisi olan zincirler (örn. Besin Hamuru, Kuantum Çekirdek, Kuantum Serumu) |
| Etkinlikler | Etkinlik bazlı su tüketimi |

## Güçlendirmeler (Araştırma)

| Araştırma | Etki |
|-----------|------|
| Derin Kuyu Pompalama I | Pompa üretimi +1/su/sn |
| Hidroponik Su Yönetimi I | Su verimliliği +%10 |

## İlgili Bağlantılar

- [[02_WIKI/concepts/enerji-sistemi|Enerji Sistemi]] — Paralel kaynak yönetimi
- [[02_WIKI/concepts/ciftlik-urunleri|Çiftlik Ürünleri]] — Su tüketen sistem
- [[02_WIKI/concepts/fabrika-uretim-zincirleri|Fabrika Üretim Zincirleri]] — Su tüketen üretimler
- [[02_WIKI/concepts/arastirma-sistemi|Araştırma Sistemi]] — Su güçlendirme kaynağı

## Kaynak

- [[01_RAW/domains/neon-agricorp/WaterSystem.tsx]]