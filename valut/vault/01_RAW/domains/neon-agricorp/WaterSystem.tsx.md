---
title: "WaterSystem.tsx"
type: repo
source_url: "src/WaterSystem.tsx"
created: 2026-05-26
tags: [source, neon-agricorp]
processed: true
wikified: true
---

# WaterSystem.tsx

Gösterge paneli bileşeni. Su seviyesini, net üretim/tüketim oranını ve maksimum tank kapasitesini görüntüler.

## Props (mevcut)

| Prop | Tip | Açıklama |
|------|-----|----------|
| `currentWater` | `number` | Anlık su miktarı |
| `totalConsumption` | `number` | Toplam su tüketimi |
| `pumpPower` | `number` | Pompa üretim gücü |
| `waterEfficiency` | `number` | Su verimlilik çarpanı (araştırma) |
| `maxWater` | `number` | Maksimum tank kapasitesi |

## Sabitler

- `initialEfficiency = 1.0` — Baz verimlilik
- `leakage = 2` — Sabit kaçak kaybı

## Notlar

- Net üretim: `(pumpPower * initialEfficiency * waterEfficiency) - leakage - totalConsumption`
- Su hesaplama mantığı `GameLoop.tsx`'e taşınmıştır. Bu bileşen sadece görsel gösterge sağlar.
- Kırmızı uyarı: su 50 birimin altındayken.
- Renk: mavi/mavi-cyan gradient.

## İlgili

- [[02_WIKI/concepts/su-sistemi]]
- [[02_WIKI/concepts/ciftlik-urunleri]]