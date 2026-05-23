# NEON AGRICORP — LLM Knowledge Base Vault

Bu projenin iki yüzü var:
1. **NEON AGRICORP oyunu** — `src/`, `dist/`, `supabase/` altında
2. **LLM Knowledge Base vault** — `valut/vault/` altında

## Vault ile çalışma prensipleri

Bu vault, LLM'ler tarafından yönetilen bir wiki. Sen (LLM) veriyi yaz ve düzenle, ben nadiren elle dokunurum.

### Veri akışı

```
00_INBOX → 01_RAW → 02_WIKI (derlenmiş bilgi) ↔ 03_OUTPUTS (sorgu sonuçları)
                                        ↕
                                  04_LINTS (sıhhat kontrolleri)
                                        ↕
                                  05_TOOLS (CLI araçları, arama motoru)
```

### Kurallar

1. **00_INBOX** — Ham girdi. Web clippings, makaleler, notlar. LLM burayı işler ve RAW'a taşır.
2. **01_RAW** — İndekslenmiş kaynak dokümanlar. Domain'lere göre klasörlenir. Her kaynağa frontmatter eklenir.
3. **02_WIKI** — LLM tarafından derlenmiş wiki. Buradaki her şeyi LLM yazar ve günceller:
   - `concepts/` — Temel kavram makaleleri (1 kavram = 1 dosya)
   - `articles/` — Uzun form wiki makaleleri
   - `references/` — Referans notları, alıntılar
   - `people/` — Önemli kişiler ve bağlantılar
   - `_meta/` — İndeks dosyaları, backlink haritaları
   - `_index.md` — Ana indeks (tüm dokümanların kısa özetleri)
4. **03_OUTPUTS** — LLM sorgularının çıktıları. Her sorgu bir dosya üretir:
   - `reports/` — Markdown raporlar
   - `slides/` — Marp formatı sunumlar (`---` slide ayırıcılı)
   - `visualizations/` — Matplotlib görselleri
5. **04_LINTS** — Wiki sağlık kontrolleri. Tutarsızlık, eksik veri, bağlantı önerileri.
6. **05_TOOLS** — Vault üzerinde çalışan araçlar ve CLI scriptleri.

### Yazım kuralları

- Her .md dosyası YAML frontmatter ile başlar: `title`, `tags`, `created`, `updated`, `sources`
- `[[wikilink]]` formatı kullan (Obsidian native)
- Görseller için `![alt](path/to/image.png)` formatı kullan
- Kaynaklara backlink ver: `[[01_RAW/domains/...]]`
- Çıktıları üretirken her zaman 03_OUTPUTS altına yaz

### Sık yapılan işlemler

- **Yeni kaynak işle:** INBOX'ı tara → RAW'a taşı → WIKI'de ilgili makaleyi güncelle veya yeni makale oluştur
- **Wiki derle:** RAW'daki yeni veriyi tara → eksik konseptleri bul → makale yaz → _index.md'i güncelle
- **Sorgu çalıştır:** WIKI'yi tara → 03_OUTPUTS/ altına rapor/slayt/görsel üret → varsa WIKI'ye geri besle
- **Sağlık kontrolü:** WIKI'nin tutarlılığını kontrol et → 04_LINTS'e raporla → hataları düzelt
- **İndeks güncelle:** _meta/ altındaki indeks dosyalarını yeniden oluştur