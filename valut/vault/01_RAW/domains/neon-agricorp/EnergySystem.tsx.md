---
title: "EnergySystem.tsx"
type: repo
source_url: "src/EnergySystem.tsx"
created: 2026-05-26
tags: [source, neon-agricorp]
processed: true
wikified: true
---

# EnergySystem.tsx

Gösterge paneli bileşeni. Enerji seviyesini, net üretim/ tüketim oranını ve maksimum kapasiteyi görüntüler.

## Props (mevcut)

| Prop | Tip | Açıklama |
|------|-----|----------|
| `currentEnergy` | `number` | Anlık enerji miktarı |
| `totalConsumption` | `number` | Toplam enerji tüketimi |
| `baseProduction` | `number` | Baz enerji üretimi |
| `maxEnergy` | `number` | Maksimum enerji kapasitesi |

## Notlar

- Enerji hesaplama mantığı `GameLoop.tsx`'e taşınmıştır. Bu bileşen sadece görsel gösterge sağlar.
- Kırmızı pulse efekti: enerji %10'un altındayken.
- Renk: sarı/sarı-turuncu gradient.

## İlgili

- [[02_WIKI/concepts/enerji-sistemi]]
- [[02_WIKI/concepts/fabrika-uretim-zincirleri]]