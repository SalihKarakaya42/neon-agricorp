# NEON AGRICORP — Oyun Rehberi

> Yeraltındaki son çiftlik. Neon ışıkları altında bir tarım imparatorluğu kur.

---

## 📖 Hikaye

Yeryüzü radyasyon nedeniyle yaşanmaz hale geldi. Şirketler ve devletler çöktü. Geriye kalan bir avuç insan, yerin altında Neon Agricorp'u kurdu. Görevin: bu yeraltı tesisini yönetmek, ekin yetiştirmek, fabrikalarda işlemek, bölgeleri keşfetmek ve hayatta kalmak.

---

## 🎮 Oynanışa Genel Bakış

Oyun 6 ana sekmeden oluşur: **Çiftlik, Fabrika, Araştırma, Pazar, Bölgeler, Sistem**.
Her sekme, imparatorluğunuzun farklı bir yönünü yönetmenizi sağlar.
Üst çubukta anlık kredi, su, enerji, seviye ve tecrübe bilgilerinizi görebilirsiniz.

---

## 🔹 Çiftlik (Farm)

**Ekin yetiştir & hasat et.**

Çiftlikte 5 çeşit ekin ekebilirsin:

| Ekin | Su | Enerji | Süre (saniye) |
|------|:--:|:------:|:-------------:|
| Hydro Lettuce | 10 | 5 | 30 |
| Rad Potato | 15 | 7 | 45 |
| Synthetic Wheat | 12 | 6 | 40 |
| Neon Tomato | 20 | 10 | 60 |
| Glow Berry | 30 | 18 | 120 |

**Büyüme hızını etkileyen faktörler:**

- **Araştırma bonusu**: Büyümeyi hızlandırır
- **Radyasyon seviyesi**: 0-40 arası %20 hız, 40-70 normal, 70+ %50 yavaşlama
- **Enerji durumu**: Kritik enerji (max'ın %10'u altında) büyümeyi %80 yavaşlatır
- **Gübre (Fertilizer)**: %30 hızlandırır, hasatta tükenir

Radyasyon her 30 saniyede bir dalgalanır. Yeşil = güvenli, turuncu = riskli, kırmızı = tehlikeli.

---

## 🔹 Fabrika (Factory)

**Çiftlik ürünlerini işle & katma değerli ürünler yap.**

Fabrikalar hammaddeleri daha değerli ürünlere dönüştürür.

| Üretim Zinciri | Girdi | Çıktı | Süre | Kullandığı Fabrika |
|---------------|-------|-------|:----:|--------------------|
| Wheat → Flour | 10 Raw Flour Base | 5 Flour Pack | 15s | Nano Press |
| Potato → Starch | 15 Raw Starch | 7 Potato Starch | 20s | Bio Reactor |
| Flour → Dough | 8 Flour Pack + 10 Su | 10 Nutrient Dough | 25s | Quantum Kitchen |
| Dough → Pizza | 10 Nutrient Dough | 8 Cyber Pizza | 35s | Quantum Kitchen |
| Paste → Gel | 5 Raw Paste | 3 Refined Gel | 40s | Chemical Processor |
| Gel → Core | 10 Refined Gel + 20 Su | 1 Quantum Core | 80s | Fusion Refinery |
| Berry → Nutrient | 5 Glow Berry Batch | 2 Crystalized Nutrient | 60s | Chemical Processor |

Fabrikalar enerji kritik olduğunda otomatik durur. Üretim bitince çıktı envantere eklenir.

---

## 🔹 Araştırma (Research)

**Teknolojileri aç & tesisini güçlendir.**

Kredi karşılığı araştırma başlat, belirli süre sonra teknoloji açılır. Her teknolojinin seviyesi yükseldikçe maliyeti artar.

| Teknoloji | Kategori | Temel Maliyet | Bonus |
|-----------|:--------:|:-------------:|-------|
| Hydroponic Efficiency I | Tarım | 500 | Büyüme hızı +0.1 |
| Deep Well Pumping I | Su | 800 | Pompa gücü +2 |
| Basic Reactor Core I | Enerji | 1000 | Enerji üretimi +5 |
| Hydroponic Water Mgmt I | Su | 1500 | Su verimi +0.1 |
| Capacitor Bank V1 | Enerji | 2000 | Enerji kapasitesi +500 |
| Geothermal Tapping | Enerji | 3500 | Enerji üretimi +10 |
| Laboratory Systems | Tarım | 4000 | 3. kademe ekinler açılır |
| Excavation Protocol I | Bölge | 5000 | T3 fabrikaları açılır |
| Civilization Blueprint | Bölge | 15000 | Prestij sistemi açılır |

---

## 🔹 Pazar (Market)

**Ürünleri sat & kredi kazan.**

Her ürünün baz fiyatı vardır ve talep dalgalanmasına göre değişir:
- Talep her 10 saniyede bir güncellenir (%30 ila %300 arası)
- Satış yapınca o ürüne talep düşer (%5)
- 1, 10 veya 100 adetlik satış yapabilirsin

| Ürün | Baz Fiyat |
|------|:---------:|
| Raw Lettuce | 8 |
| Raw Starch | 10 |
| Raw Flour Base | 12 |
| Raw Paste | 20 |
| Glow Berry Batch | 80 |
| Flour Pack | 30 |
| Potato Starch | 25 |
| Nutrient Dough | 50 |
| Cyber Pizza | 100 |
| Refined Gel | 60 |
| Quantum Core | 400 |
| Crystalized Nutrient | 200 |

**İpucu**: Talebin yüksek olduğu ürünleri satmak çok daha kârlıdır.

---

## 🔹 Bölgeler (Districts)

**Yeraltı bölgelerini keşfet & kalıcı bonuslar kazan.**

| Bölge | Maliyet | Bonus |
|-------|:------:|-------|
| Nemli Mağara | 2.000 | Su verimi +0.2 |
| Reaktör Bölgesi | 4.000 | Enerji üretimi +5 |
| Terk Edilmiş Laboratuvar | 8.000 | Araştırma hızı +0.15 |
| Toksik Katman | 15.000 | Nadir düşüş şansı +0.1 |
| MegaCorp Harabeleri | 30.000 | Karaborsa erişimi |

Her bölge bir kere açılır ve bonusu **oyun boyunca kalıcıdır** (prestij sıfırlamasından etkilenmez).

---

## 🔹 Sistem (System)

**Envanter, olaylar ve prestij yönetimi.**

### Rastgele Olaylar
Her 60 saniyede bir rastgele olay tetiklenebilir:

| Olay | Etki |
|------|------|
| Radyasyon Sızıntısı | Enerji -5/s, Su -10/s |
| Boru Yoğuşma Dalgası | Su +5/s |
| Hacker Saldırısı | -100 Kredi |
| Karaborsa Fırsatı | +500 Kredi |

Olaylar geçicidir ve süresi dolunca etkisi kaybolur.

### Prestij Sistemi
"Civilization Blueprint" araştırması açıldıktan sonra kullanılabilir.
- **Maliyet**: 50.000 × (seviye+1)² kredi
- **Etkisi**: Enerji üretimine +5 kalıcı bonus verir, oyun sıfırlanır (krediler, envanter, ekinler, fabrika işlemleri gider)
- **Saklananlar**: Açılmış bölgeler, araştırma seviyeleri, prestij seviyesi

---

## 💠 EXP ve Seviye Sistemi

- Satışlardan EXP kazanırsın (fiyat × 0.1)
- Araştırma tamamlayınca EXP kazanırsın (25 × mevcut seviye)
- Her seviye için gereken EXP: **100 × Seviye^1.5**
- Seviye atlayınca yeni seviyenin EXP barı sıfırlanır

---

## ⚡ Su ve Enerji Yönetimi

İki kritik kaynağın sürekli takip edilmesi gerekir:

**Su Üretimi**: Pompa Gücü × Su Verimi - Kaçak (2/s)
**Su Tüketimi**: Ekili ekinlerin su kullanımı + olaylar
**Enerji Üretimi**: Baz üretim (başlangıç 15/s)
**Enerji Tüketimi**: Çiftlik aydınlatması + fabrikalar + olaylar

- Su ve enerji seviyeleri üst çubuktan takip edilir
- Enerji %10'un altına düşerse kritik uyarısı verilir
- Kritik enerjide büyüme yavaşlar ve fabrikalar durur

---

## 💡 Başlangıç İpuçları

1. **Çiftlik'te ekin ek** — Hydro Lettuce en hızlı büyüyen ekin
2. Hasat edince **Pazar'da sat** — talebi yüksek ürünleri tercih et
3. Kazandığın kredilerle **Araştırma'ya yatır** — önce Hydroponic Efficiency
4. Biriktirdikçe **Bölgeleri aç** — Nemli Mağara'dan başla
5. Fabrikaları kullanarak ürünlerinin değerini katla
6. Radyasyon seviyesini takip et, yüksekken ekin ekme
7. Prestij için en az 50.000 kredi biriktir

---

*NEON AGRICORP v0.1 — Yeraltı parlasın.*
