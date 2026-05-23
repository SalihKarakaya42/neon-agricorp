---
title: "Backlink Map"
created: 2026-05-24
tags: [meta, index]
---

# Backlink Map

Bu dosya, vault'taki dokümanlar arası bağlantıların haritasını tutar.

## Bağlantı grafiği

```
ciftlik-urunleri → fabrika-uretim-zincirleri, enerji-sistemi, su-sistemi
fabrika-uretim-zincirleri → ciftlik-urunleri, enerji-sistemi, su-sistemi, arastirma-sistemi
arastirma-sistemi → fabrika-uretim-zincirleri, ciftlik-urunleri, enerji-sistemi, su-sistemi
enerji-sistemi → su-sistemi, ciftlik-urunleri, fabrika-uretim-zincirleri, arastirma-sistemi
su-sistemi → enerji-sistemi, ciftlik-urunleri, fabrika-uretim-zincirleri, arastirma-sistemi

RAW → WIKI:
FarmSystem.tsx → ciftlik-urunleri
FactorySystem.tsx → fabrika-uretim-zincirleri
ResearchSystem.tsx → arastirma-sistemi
EnergySystem.tsx → enerji-sistemi
WaterSystem.tsx → su-sistemi
```

## Eksik bağlantı adayları

> LLM sağlık kontrolleri sırasında buraya bağlantı önerileri eklenir.

---

*Bu harita LLM tarafından otomatik güncellenir.*