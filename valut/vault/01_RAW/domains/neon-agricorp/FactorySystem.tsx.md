---
title: "FactorySystem.tsx"
type: repo
source_url: "src/FactorySystem.tsx"
created: 2026-05-26
tags: [source, neon-agricorp]
processed: true
wikified: true
---

# FactorySystem.tsx

Fabrika (Otomasyon Tesisi) bileşeni. Çiftlik ürünlerini işleyerek daha değerli ürünlere dönüştürür.

## Üretim Zincirleri

| ID | Girdiler | Çıktı | Süre | Enerji/s |
|----|----------|-------|------|----------|
| chain-wheat-flour | 2 Raw Flour Base | 1 Flour Pack | 15s | 3 |
| chain-potato-starch | 2 Raw Starch | 1 Potato Starch | 20s | 4 |
| chain-flour-dough | 1 Flour Pack + 1 Water | 1 Nutrient Dough | 25s | 5 |
| chain-dough-pizza | 1 Nutrient Dough | 1 Cyber Pizza | 35s | 6 |
| chain-paste-gel | 2 Raw Paste | 1 Refined Gel | 40s | 8 |
| chain-gel-core | 10 Refined Gel + 20 Water | 1 Quantum Core | 80s | 15 |
| chain-berry-nutrient | 2 Glow Berry Batch | 1 Crystalized Nutrient | 60s | 10 |
| chain-lumina-serum | 2 Lumina Extract + 5 Water | 1 Quantum Serum | 90s | 12 |
| chain-nano-coating | 2 Nano Spores | 1 Nano Coating | 100s | 14 |
| chain-void-crystal | 3 Void Essence + 1 Quantum Core | 1 Void Crystal | 150s | 18 |

## Mekanik

- **İş kalıcılığı**: `localStorage` (`neon_factory_jobs`) — sayfa yenilense bile devam eder
- **Enerji kritik**: `isEnergyCritical` ise tüm üretim durur
- **Batch üretim**: 1-50 arası miktar seçimi, kaydırmalı çubuk ile
- **Enerji raporu**: Toplam enerji çekişi `onFactoryEnergyConsumptionReport` ile GameLoop'a bildirilir

## UI

- **Grid kartları**: 2-kolonlu grid, ürün ikonu + formül + neon glow (yeterli kaynak varsa)
- **Modal**: Girdiler (sol), üretim ihtiyacı (sağ — enerji çekişi + su tüketimi), miktar seçici
- **Aktif üretim**: 6-kolonlu grid, clipPath ile dolum animasyonu, ✅ tamamlananlar

## İlgili

- [[02_WIKI/concepts/fabrika-uretim-zincirleri]]
- [[02_WIKI/concepts/enerji-sistemi]]
- [[02_WIKI/concepts/su-sistemi]]