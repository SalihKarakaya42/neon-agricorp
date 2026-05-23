---
title: "Araştırma Sistemi"
tags: [concept, active]
created: 2026-05-26
updated: 2026-05-26
sources: [[01_RAW/domains/neon-agricorp/ResearchSystem.tsx]]
status: active
---

# Araştırma Sistemi

NEON AGRICORP'ta araştırma sayfası, kredi ve ham madde yatırımı yaparak kalıcı güçlendirmeler (stat boost) açılmasını sağlar. Her araştırma seviyelidir, maliyet `baseCost × (level ^ 1.45)` formülü ile artar.

## UI Yapısı

### Grid Kartı (Her Teknoloji)

Teknolojiler 2-kolonlu gridde (`grid grid-cols-2 gap-3`) kart olarak görünür:

```
┌─────────────────┐
│ Teknoloji Adı   │
│ ┌────┐ ● Kategori│
│ │    │ 3× Ham Marul 🥬│
│ │icon│ 2× Un Paketi 📦│
│ └────┘             │
│   💰 500 | ⏱️ 12s  │
│ [TAMAMLANDI]       │
└─────────────────┘
```

**Title** — Tam genişlik, `font-mono text-[11px]`, `researchNames` anahtarından çevrilir

**Görsel + Bilgi** — Sol: 56×56px ikon (neon glow wrapper, duruma göre). Sağ:
- Kategori noktası + isim (renk kodlu: Agriculture=cyan, Water=mavi, Energy=sarı, District=eflatun)
- Girdi kaynakları: Her satır `{miktar}× {kaynak adı} {ikon}` formatında. Kaynak adı `crops.{resource}` anahtarından çevrilir. Yetersiz stok kırmızı.

**Kredi + Süre** — Tek satırda ortalanmış:
- `💰 {cost}` — `#00f3ff` renkli
- `|` ayraç
- `⏱️ {süre}s` — sarı renkli

**Durum Çubuğu** — En altta:
- Tamamlandı: yeşil `✓ TAMAMLANDI`
- Araştırılıyor: sarı progress bar + kalan süre
- Hiçbiri: görünmez

### Modal (Teknoloji Seçildiğinde)

Karta tıklanınca açılan modal:

```
┌──────────────────────────┐
│ [icon] Teknoloji Adı  ✕  │
│        ● Kategori        │
│                          │
│ GEREKSİNİMLER            │
│ 💰 Kredi        500 (1200)│
│ 📦 Ham Marul    3/3      │
│ 📦 Un Paketi    2/5      │
│ ⏱️ Süre          12s     │
│                          │
│ ÖDÜL                     │
│ 🌱 +0.1 farmCropGrowth.. │
│   Ekinlerin büyüme h..   │
│                          │
│ [   ARAŞTIR (500)   ]    │
└──────────────────────────┘
```

- **Gereksinimler**: Kredi (mevcut miktar parantez içinde), girdi kaynakları (ikon + ad + ihtiyaç/mevcut), süre
- **Ödül**: Stat adı + değer, açıklama metni (`statDescription` fonksiyonu)
- **Buton**: Yeterli kaynak varsa cyan "ARAŞTIR", yoksa gri "YETERSİZ KAYNAK"

## Araştırma Tanımları

| ID | İsim | Kategori | Taban Maliyet | Süre | Girdiler |
|----|------|----------|:------------:|:----:|----------|
| agri-1 | Hidroponik Verimlilik I | Agriculture | 500 | 2s | 3 Ham Marul |
| water-1 | Derin Kuyu Pompalama I | Water | 800 | 3s | 3 Ham Nişasta |
| energy-1 | Temel Reaktör Çekirdeği I | Energy | 1000 | 4s | 2 Ham Un Bazı |
| water-2 | Hidroponik Su Yönetimi I | Water | 1500 | 6s | 5 Ham Macun |
| energy-2 | Kondansatör Bankası V1 | Energy | 2000 | 8s | 3 Parlak Meyve Partisi |
| district-1 | Jeotermal Kullanım | Energy | 3500 | 14s | 3 Un Paketi + 2 Patates Nişastası |
| agri-2 | Laboratuvar Sistemleri | Agriculture | 4000 | 16s | 5 Un Paketi + 3 Besin Hamuru |
| agri-3 | Genişletilmiş Sektörler I | Agriculture | 6000 | 24s | 2 Siber Pizza + 3 Rafine Jel |
| agri-4 | Genetik Mühendisliği | Agriculture | 20000 | 80s | 3 Kuantum Çekirdek + 2 Kristalize Besin |
| district-2 | Kazı Protokolü I | District | 5000 | 20s | 5 Siber Pizza + 5 Besin Hamuru |
| prestige-1 | Medeniyet Planı | District | 15000 | 60s | 3 Kuantum Çekirdek + 5 Rafine Jel |

**Süre hesaplaması**: `round(baseCost / 250)` saniye

## Güçlendirmeler (Stat Boost)

| Stat | Etki |
|------|------|
| `farmCropGrowthSpeed` | Ekin büyüme hızı +%10 |
| `pumpPower` | Pompa üretimi +1/su/sn |
| `baseEnergyProduction` | Enerji üretimi +5 |
| `waterEfficiency` | Su verimliliği +%10 |
| `maxEnergyCapacity` | Maksimum enerji +500 |
| `tier3CropUnlock` | Tier 3 ekinleri açar |
| `podCapacity` | Parsel kapasitesi +4 |
| `tier4CropUnlock` | Tier 4 ekinleri açar |
| `unlockedT3Factories` | T3 fabrikalarını açar |
| `unlockedPrestige` | Prestij sistemini açar |

## İsimlendirme Notları

- Girdi kaynakları grid kartında **isimleriyle** gösterilir: `{miktar}× {kaynak adı}` (ör. `3× Ham Marul`). Eski hali sadece ikon+adetti.
- Araştırma isimleri `researchNames` anahtarından çevrilir
- Kategori isimleri `categories` anahtarından çevrilir
- Kaynak isimleri `crops.{resource}` anahtarından çevrilir, Türkçe/İngilizce uyumludur

## İlgili Bağlantılar

- [[02_WIKI/concepts/fabrika-uretim-zincirleri|Fabrika Üretim Zincirleri]] — Aynı grid+modal UI desenini kullanır
- [[02_WIKI/concepts/ciftlik-urunleri|Çiftlik Ürünleri]] — Araştırma girdilerinin kaynağı
- [[02_WIKI/concepts/enerji-sistemi|Enerji Sistemi]] — Araştırmalarla güçlendirilir
- [[02_WIKI/concepts/su-sistemi|Su Sistemi]] — Araştırmalarla güçlendirilir

## Kaynak

- [[01_RAW/domains/neon-agricorp/ResearchSystem.tsx]]