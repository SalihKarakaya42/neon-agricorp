---
title: "Vault Configuration"
created: 2026-05-24
tags: [meta, config]
---

# Vault Configuration & Rules

## Frontmatter standardı

Tüm .md dosyaları şu frontmatter'ı içermelidir:

```yaml
---
title: "Başlık"
tags: [etiket1, etiket2]
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [[ilgili_raw_dosya]]
status: draft | active | archived
---
```

## İsimlendirme kuralları

- Dosya isimleri: `kisa-ve-aciklayici-isim.md` (kebab-case)
- Klasör isimleri: `BÜYÜK_HARF_ÖNEK_aciklama/` (metodun PARA varyasyonu)
- Görseller: `gorsel-aciklama-YYYY-MM-DD.png`

## Wiki yazım kuralları

1. Her konsept kendi dosyasında: `02_WIKI/concepts/konsept-adi.md`
2. Makaleler birden çok konsepti bağlar: `02_WIKI/articles/makale-adi.md`
3. Referanslar kaynak gösterir: `02_WIKI/references/`
4. [[Wikilink]]'ler zorunludur — her konsept en az bir backlink içermeli
5. `_index.md` tüm dokümanların kısa özetini içerir
6. `_meta/` altındaki indeksler otomatik güncellenir

## Çıktı kuralları

- Raporlar → `03_OUTPUTS/reports/` (markdown)
- Slaytlar → `03_OUTPUTS/slides/` (Marp format, `---` ile ayrılmış)
- Görseller → `03_OUTPUTS/visualizations/` (matplotlib PNG)
- Veri setleri → `03_OUTPUTS/datasets/` (CSV, JSON)

## Sağlık kontrolleri

Düzenli linting şunları kontrol eder:
- Kopuk bağlantılar (orphan notes)
- Eksik frontmatter
- Tutarsız veri
- Güncellenmemiş `updated` tarihleri
- Yeni bağlantı adayları

## Etiket standardı

- `meta` — vault yapısıyla ilgili
- `concept` — kavram makalesi
- `article` — uzun makale
- `reference` — referans notu
- `source` — ham kaynak
- `report` — sorgu raporu
- `draft` — taslak
- `active` — güncel
- `archived` — arşivlenmiş