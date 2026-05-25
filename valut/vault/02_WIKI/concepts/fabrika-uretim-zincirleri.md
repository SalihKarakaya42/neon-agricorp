---
title: "Fabrika Üretim Zincirleri"
tags: [concept, active]
created: 2026-05-24
updated: 2026-05-25
sources: [[01_RAW/domains/neon-agricorp/FactorySystem.tsx]]
status: active
---

# Fabrika Üretim Zincirleri

NEON AGRICORP'ta fabrika sayfasında (Otomasyon Tesisi) çiftlikten gelen ham ürünler işlenerek daha değerli ürünlere dönüştürülür. Her zincir belirli girdiler tüketir, enerji çeker ve süre sonunda çıktı üretir. Her üretim ayrıca **Posa** (pulp) yan ürünü çıkarır.

## Üretim Zincirleri

| Zincir | Girdiler | Çıktı | Posa | Süre | Enerji/s |
|--------|----------|-------|------|------|----------|
| **Ham Un Bazı → Un Paketi** | 2 Ham Un Bazı | 1 Un Paketi | 1 | 15s | 3 |
| **Ham Nişasta → Patates Nişastası** | 2 Ham Nişasta | 1 Patates Nişastası | 1 | 20s | 4 |
| **Un Paketi → Besin Hamuru** | 1 Un Paketi + 1 Su | 1 Besin Hamuru | 1 | 25s | 5 |
| **Besin Hamuru → Siber Pizza** | 1 Besin Hamuru | 1 Siber Pizza | 1 | 35s | 6 |
| **Ham Macun → Rafine Jel** | 2 Ham Macun | 1 Rafine Jel | 1 | 40s | 8 |
| **Rafine Jel → Kuantum Çekirdek** | 10 Rafine Jel + 20 Su | 1 Kuantum Çekirdek | 2 | 80s | 15 |
| **Parlak Meyve → Kristalize Besin** | 2 Parlak Meyve Partisi | 1 Kristalize Besin | 1 | 60s | 10 |
| **Lumina Özütü → Kuantum Serumu** | 2 Lumina Özütü + 5 Su | 1 Kuantum Serumu | 2 | 90s | 12 |
| **Nano Sporlar → Nano Kaplama** | 2 Nano Sporlar | 1 Nano Kaplama | 2 | 100s | 14 |
| **Void Özü → Void Kristali** | 3 Void Özü + 1 Kuantum Çekirdek | 1 Void Kristali | 3 | 150s | 18 |

### Gübre Üretimi

Posa, ikinci kademe bir üretim zinciri ile Gübre'ye dönüştürülebilir:

| Zincir | Girdiler | Çıktı | Süre | Enerji/s |
|--------|----------|-------|------|----------|
| **Posa → Gübre** | 5 Posa | 1 Gübre | 30s | 3 |

## UI Yapısı

### Grid Kartı (Her Zincir)

Her üretim zinciri 2-kolonlu gridde bir kart olarak görünür:

```
┌─────────────────────┐
│ Zincir Adı        ⏱️│
│ ┌────┐              │
│ │    │ Açıklama      │
│ │icon│ 2 🥬 + 1 💧 → 1 📦
│ └────┘              │
└─────────────────────┘
```

- **İsim**: `{tname(chain.name)}` ile `productionChains` anahtarından çevrilir
- **Açıklama**: Girdi→Çıktı formülü, oyundaki gerçek kaynak adlarını kullanır (örn. "2 Ham Un Bazı → 1 Un Paketi")
- **Formül satırı**: Sadece miktar + ikon gösterir, kaynak ismi metin olarak gösterilmez
- **Timer**: Sağ üstte `⏱️ 15s` formatında

### Modal (Zincir Seçildiğinde)

Fabrikada bir zincir seçildiğinde açılan modalda şunlar gösterilir:

- **Girdiler (birim)** — Sol kolon. Her girdinin ikonu, Türkçe/İngilizce adı (`tcrop` veya `resourceLabels.Water`), mevcut stok/ihtiyaç miktarı. Su için `Droplet` ikonu, yetersiz stok kırmızı.
- **Üretim İhtiyacı** — Sağ kolon. Enerji çekişi (`Zap` ikonu) ve su tüketimi (`Droplet` ikonu)
- **Çıktılar** — Grid+Enerji satırlarının altında tam genişlik bir satır. Ana ürün (yeşil kutu) ve Posa yan ürünü (amber kutu) miktarları ile birlikte gösterilir. Adet slider'ına göre çarpan otomatik güncellenir.
- **Miktar seçici** — Kaydırmalı çubuk ile 1–50 arası adet seçimi
- **İPTAL / N ADET ÜRET** butonları

### Aktif Üretim Listesi (Yeni Tasarım)

Çalışan üretimler progress bar stili bir listede gösterilir:
- Aynı ürün türü bir araya gruplandırılır
- Her grup için genel bir ilerleme çubuğu ve hazır/toplam iş sayısı gösterilir
- Tamamlanan gruplar için yeşil (emerald) glow efekti
- Her üretim işi için detaylı mini butonlar:
  - Üretim sırasında: Cyan renkli mini progress bar + kalan süre
  - Tamamlandığında: Yeşil renkli "✓ Hazır" etiketi
- Ürün isimleri `tcrop()` ile Türkçe olarak yazdırılır

## Mekanik Detaylar

- Enerji kritik seviyedeyse (`isEnergyCritical`) tüm üretim durur
- Birden çok üretim aynı anda çalışabilir, her biri kendi `baseEnergyDraw` kadar enerji çeker
- Toplam enerji çekişi `onFactoryEnergyConsumptionReport` ile üst sisteme bildirilir
- Tamamlanan üretimler "TOPLA" butonuyla veya tek tek toplanabilir
- Üretim işleri `localStorage`'a (`neon_factory_jobs`) kaydedilir, sayfa yenilense bile devam eder
- Her üretim zinciri, ana çıktıya ek olarak `byProduct` olarak Posa üretir. Gelişmiş ürünler daha çok posa verir (1-3 arası).
- Posa, ikinci kademe üretim zinciri olan "Posa → Gübre" ile Gübre'ye dönüştürülür (5 Posa → 1 Gübre, 30sn)
- Gübre, çiftlikte ekim sırasında manuel olarak kullanılır (envanterde değil, ayrı `fertilizer` state'inde tutulur)

## İsimlendirme Notları

- Üretim zincirlerinin `description` alanı oyundaki **gerçek kaynak adlarını** kullanır. Eski kısa/kaynak adıyla uyuşmayan isimler (örn. "2 Buğday" yerine "2 Ham Un Bazı") düzeltilmiştir.
- Çıktı ürünlerinin adı `tcrop()` ile `crops` sözlüğünden çevrilir
- Su kaynağı `resourceLabels.Water` anahtarından çevrilir (Türkçe: "Su", İngilizce: "Water"), hardcoded değildir
- Posa ve Gübre için `crops.Posa` ve `crops.Gübre` çeviri anahtarları eklenmiştir (Türkçe: "Posa"/"Gübre", İngilizce: "Pulp"/"Fertilizer")
- "Posa → Gübre" zinciri için `productionChains.Posa → Gübre` çeviri anahtarı eklenmiştir

## İlgili Bağlantılar

- [[02_WIKI/concepts/ciftlik-urunleri|Çiftlik Ürünleri]]
- [[02_WIKI/concepts/enerji-sistemi|Enerji Sistemi]]
- [[02_WIKI/concepts/su-sistemi|Su Sistemi]]
- [[02_WIKI/concepts/arastirma-sistemi|Araştırma Sistemi]]

## Kaynak

- [[01_RAW/domains/neon-agricorp/FactorySystem.tsx]]