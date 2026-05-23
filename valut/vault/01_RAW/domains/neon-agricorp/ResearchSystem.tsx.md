---
title: "ResearchSystem.tsx"
type: repo
source_url: "src/ResearchSystem.tsx"
created: 2026-05-26
tags: [source, neon-agricorp]
processed: true
wikified: true
---

# ResearchSystem.tsx

Araştırma sistemi bileşeni. Kredi ve ham madde yatırımı ile kalıcı güçlendirmeler açar.

## Araştırma Tanımları

| ID | Kategori | Taban Maliyet | Süre (sn) | Girdiler | Kilit |
|----|----------|:------------:|:---------:|----------|-------|
| agri-1 | Agriculture | 500 | 2 | 3 Raw Lettuce | farmCropGrowthSpeed +0.1 |
| water-1 | Water | 800 | 3 | 3 Raw Starch | pumpPower +2 |
| energy-1 | Energy | 1000 | 4 | 2 Raw Flour Base | baseEnergyProduction +5 |
| water-2 | Water | 1500 | 6 | 5 Raw Paste | waterEfficiency +0.1 |
| energy-2 | Energy | 2000 | 8 | 3 Glow Berry Batch | maxEnergyCapacity +500 |
| district-1 | Energy | 3500 | 14 | 3 Flour Pack + 2 Potato Starch | baseEnergyProduction +10 |
| agri-2 | Agriculture | 4000 | 16 | 5 Flour Pack + 3 Nutrient Dough | tier3CropUnlock |
| agri-3 | Agriculture | 6000 | 24 | 2 Cyber Pizza + 3 Refined Gel | podCapacity +4 |
| agri-4 | Agriculture | 20000 | 80 | 3 Quantum Core + 2 Crystalized Nutrient | tier4CropUnlock |
| district-2 | District | 5000 | 20 | 5 Cyber Pizza + 5 Nutrient Dough | unlockedT3Factories |
| prestige-1 | District | 15000 | 60 | 3 Quantum Core + 5 Refined Gel | unlockedPrestige |

## Mekanik

- **Maliyet**: `baseCost × (level ^ 1.45)` — her seviyede artar
- **Süre**: `round(baseCost / 250)` saniye
- **Timer**: localStorage üzerinden kalıcı, araştırma devam ederken sayfa kapatılsa bile
- **UI**: 2-kolonlu grid, her teknoloji için kart + detay modalı

## İlgili

- [[02_WIKI/concepts/arastirma-sistemi]]
- [[02_WIKI/concepts/ciftlik-urunleri]]
- [[02_WIKI/concepts/enerji-sistemi]]
- [[02_WIKI/concepts/su-sistemi]]