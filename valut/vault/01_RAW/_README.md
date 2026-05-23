---
title: "Raw Sources"
created: 2026-05-24
tags: [meta, raw]
---

# Raw Sources — İndekslenmiş Kaynaklar

Bu dizin, işlenmiş ham kaynakları domain'lere göre klasörlenmiş şekilde tutar.

## Domain'ler

### neon-agricorp

Oyun kaynak kodundan alınan dokümanlar:

| Dosya | Açıklama |
|-------|----------|
| [[FarmSystem.tsx]] | Çiftlik sistemi: ekim, büyüme, hasat |
| [[FactorySystem.tsx]] | Fabrika üretim zincirleri |
| [[ResearchSystem.tsx]] | Araştırma sistemi ve güçlendirmeler |
| [[EnergySystem.tsx]] | Enerji gösterge paneli |
| [[WaterSystem.tsx]] | Su gösterge paneli |



## Dosya standardı

Her kaynak frontmatter içerir:
```yaml
---
title: "Orijinal Kaynak Adı"
type: article | paper | repo | dataset | image
source_url: ""
author: ""
created: YYYY-MM-DD
tags: [source]
processed: true
wikified: true | false
---
```

## Not

RAW'daki dosyalar değişmez — kaynak olarak kalırlar.
WIKI'deki makaleler RAW'a backlink verir: `[[01_RAW/domains/...]]`