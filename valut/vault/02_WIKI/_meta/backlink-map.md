---
title: "Backlink Map"
created: 2026-05-24
updated: 2026-05-25
tags: [meta, index]
---

# Backlink Map

Bu dosya, vault'taki dokümanlar arası bağlantıların haritasını tutar.

## Bağlantı grafiği

```
ciftlik-urunleri → bolge-sistemi, fabrika-uretim-zincirleri, enerji-sistemi, su-sistemi
bolge-sistemi → ciftlik-urunleri, arastirma-sistemi, enerji-sistemi, su-sistemi
fabrika-uretim-zincirleri → ciftlik-urunleri, enerji-sistemi, su-sistemi, arastirma-sistemi
arastirma-sistemi → bolge-sistemi, fabrika-uretim-zincirleri, ciftlik-urunleri, enerji-sistemi, su-sistemi
enerji-sistemi → su-sistemi, ciftlik-urunleri, bolge-sistemi, fabrika-uretim-zincirleri, arastirma-sistemi
su-sistemi → enerji-sistemi, ciftlik-urunleri, bolge-sistemi, fabrika-uretim-zincirleri, arastirma-sistemi

RAW → WIKI:
FarmSystem.tsx → ciftlik-urunleri, bolge-sistemi
FactorySystem.tsx → fabrika-uretim-zincirleri
ResearchSystem.tsx → arastirma-sistemi
EnergySystem.tsx → enerji-sistemi
WaterSystem.tsx → su-sistemi
GameLoop.tsx → enerji-sistemi, su-sistemi (merkezi tick yönetimi)
```

## Seviye Mekanikler (2026-05-24 eklendi)

**Enerji Sistemi — 4 Seviye:**
- Seviye 1 (75%+): ×1.0 çarpan
- Seviye 2 (50-75%): ×1.25 çarpan
- Seviye 3 (25-50%): ×1.5 çarpan
- Seviye 4 (<25%): ×2.0 çarpan, kritik flag

**Su Sistemi — 4 Seviye:**
- Seviye 1 (75%+): ×1.0 çarpan
- Seviye 2 (50-75%): ×1.25 çarpan
- Seviye 3 (25-50%): ×1.5 çarpan
- Seviye 4 (<25%): ×2.0 çarpan, kırmızı uyarı

**Radyasyon Etkisi:**
- >70: ×0.5 (çok yüksek)
- 40-70: ×0.8 (yüksek)
- <40: ×1.2 (normal/düşük)

**Gübre Etkisi:**
- Eski sistem (kaldırıldı): ×1.3 otomatik hızlanma, hasat başı 1 tüketim
- Yeni sistem: Her gübre birimi ×1.01 hızlanma (manuel uygulama)
- Posa → Gübre dönüşümü: Fabrikada 5 Posa → 1 Gübre (30sn, 3 enerji/s)

## Eksik bağlantı adayları

> LLM sağlık kontrolleri sırasında buraya bağlantı önerileri eklenir.

---

*Bu harita LLM tarafından otomatik güncellenir. Son güncelleme: 2026-05-24*