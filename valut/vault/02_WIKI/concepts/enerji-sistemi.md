---
title: "Enerji Sistemi"
tags: [concept, active]
created: 2026-05-26
updated: 2026-05-26
sources: [[01_RAW/domains/neon-agricorp/EnergySystem.tsx]]
status: active
---

# Enerji Sistemi

NEON AGRICORP'ta enerji, tüm üretim faaliyetleri için kritik kaynaktır. Enerji seviyesi `GameLoop.tsx`'te merkezi olarak her saniye güncellenir.

## Mekanik

- **Net üretim**: `baseEnergyProduction - totalConsumption`
- **Tick**: Her saniye `setInterval` ile güncellenir, `GameLoop.tsx`'te yönetilir
- **Sınır**: `[0, maxEnergyCapacity]` aralığında kalır
- **Kritik seviye**: Enerji maksimumun %10'unun altındaysa (`isEnergyCritical`), fabrika üretimi durur

## UI Göstergesi

`EnergySystem.tsx` bileşeni tek bir panel olarak görünür:

```
┌──────────────────────────────╡ ⚡ ┆
│ ENERGY                  +2.1/s │
│ 1,234 / 5,000                  │
│ ██████████░░░░░░░░░░░░░░░░░░  │
└────────────────────────────────┘
```

- **Sarı ikon**: Normal durum
- **Kırmızı pulse**: %10'un altında (kritik)
- **Net rate**: Pozitifse yeşil, negatifse kırmızı
- **Progress bar**: Sarı-turuncu gradient

## Enerji Tüketen Sistemler

| Sistem | Tüketim |
|--------|---------|
| Çiftlik (ekili pod'lar) | `farmEnergyDraw` — her pod ektiği ürünün enerji/s değeri kadar çeker |
| Fabrika (aktif üretim) | `factoryEnergyDraw` — her zincirin `baseEnergyDraw` değeri kadar çeker |
| Etkinlikler | `eventEnergyDraw` — etkinlik bazlı |

## Güçlendirmeler (Araştırma)

| Araştırma | Etki |
|-----------|------|
| Temel Reaktör Çekirdeği I | Üretim +5 |
| Kondansatör Bankası V1 | Maksimum kapasite +500 |
| Jeotermal Kullanım | Üretim +10 |

## İlgili Bağlantılar

- [[02_WIKI/concepts/su-sistemi|Su Sistemi]] — Paralel kaynak yönetimi
- [[02_WIKI/concepts/ciftlik-urunleri|Çiftlik Ürünleri]] — Enerji tüketen sistem
- [[02_WIKI/concepts/fabrika-uretim-zincirleri|Fabrika Üretim Zincirleri]] — Enerji tüketen sistem
- [[02_WIKI/concepts/arastirma-sistemi|Araştırma Sistemi]] — Enerji güçlendirme kaynağı

## Kaynak

- [[01_RAW/domains/neon-agricorp/EnergySystem.tsx]]