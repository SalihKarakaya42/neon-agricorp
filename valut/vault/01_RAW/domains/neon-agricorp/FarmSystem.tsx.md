---
title: "FarmSystem.tsx"
type: repo
source_url: "src/FarmSystem.tsx"
created: 2026-05-26
tags: [source, neon-agricorp]
processed: true
wikified: true
---

# FarmSystem.tsx

Çiftlik (Yeraltı Hidroponiği) bileşeni. Pod bazında ürün ekimi, büyüme ve hasat mekaniğini yönetir.

## Ürünler (crops)

| ID | İsim | Çıktı | Büyüme | Su | Enerji | Su/s | Enerji/s |
|----|------|-------|--------|----|--------|------|----------|
| hydro-lettuce | Hydro Lettuce | Raw Lettuce | 30s | 10 | 5 | 0.5 | 1 |
| rad-potato | Rad Potato | Raw Starch | 45s | 15 | 7 | 0.6 | 1.5 |
| synthetic-wheat | Synthetic Wheat | Raw Flour Base | 40s | 12 | 6 | 0.55 | 1.2 |
| neon-tomato | Neon Tomato | Raw Paste | 60s | 20 | 10 | 0.8 | 2.5 |
| glow-berry | Glow Berry | Glow Berry Batch | 120s | 30 | 18 | 1.1 | 4 |
| bio-lumina-fruit | Bio Lumina Fruit | Lumina Extract | 200s | 40 | 25 | 1.5 | 6 |
| nano-orchid | Nano Orchid | Nano Spores | 250s | 50 | 30 | 1.8 | 7 |
| void-melon | Void Melon | Void Essence | 300s | 60 | 35 | 2.0 | 8 |

## Mekanik

- **Pod**: 4 pod, her pod tek tip ürün ekebilir
- **Seviye sistemi**: Su/enerji seviyesine göre büyüme çarpanı (0.75→1×, 0.50→1.25×, 0.25→1.5×, altı→2×)
- **Radyasyon**: Büyüme hızını etkiler
- **Gübre**: Büyüme hızını artırır, tükenir

## Props

| Prop | Açıklama |
|------|----------|
| `podCapacity` | Pod başına maksimum ürün sayısı |
| `cropGrowthModifier` | Araştırma çarpanı |
| `tier4Unlocked` | Tier 4 ürünleri kilit açma |
| `radiationLevel` | Radyasyon seviyesi |

## İlgili

- [[02_WIKI/concepts/ciftlik-urunleri]]
- [[02_WIKI/concepts/enerji-sistemi]]
- [[02_WIKI/concepts/su-sistemi]]