# NEON AGRICORP — Agent Takip

## Çalışma Durumu
- Dev server: `npx vite --host` → `http://localhost:5173/`
- TypeScript: `npx tsc --noEmit` = 0 hata
- Build: `npx vite build` (chunk size uyarısı harici sorunsuz)
- Supabase: olbbyqyrgkgwrodjbeka.supabase.co
- Client-Server: localStorage + Supabase çift yedekli save (60sn aralıkla)
- Edge Functions: harvest (batch), start-factory, contract-validate (güncel kod deploy edilmedi)

## Mimari Notlar
- **Dil**: React + TypeScript + Vite
- **Stil**: Tailwind CSS v4, lucide-react, motion (framer-motion)
- **Backend**: Supabase Auth + Database + Edge Functions
- **UI**: Layout component (alt tab nav), glass-panel, neon tema
- **Save**: localStorage (anlık) + Supabase (60sn aralıkla)
- **Sync**: syncService.ts (optimistic + rollback) — harvest rollback kaldırıldı

## Önemli Dosyalar
- `src/GameLoop.tsx` — Ana oyun döngüsü, state yönetimi, save/load
- `src/FarmSystem.tsx` — Pod bazlı ekim/hasat + su/enerji grid hücreleri
- `src/FactorySystem.tsx` — Grid bazlı üretim zincirleri (6-col aktif, 2-col chain list)
- `src/ResearchSystem.tsx` — Araştırma ağacı
- `src/MarketSystem.tsx` — Pazar (talep dalgalanması)
- `src/ContractSystem.tsx` — MegaCorp sözleşmeleri
- `src/AuthScreen.tsx` — Giriş/Kayıt + avatar seçimi
- `src/Layout.tsx` — Alt tab navigasyonlu iskelet
- `src/syncService.ts` — Edge function çağrıları
- `src/i18n/` — Çoklu dil sistemi (tr, en)
- `src/index.css` — Tailwind + neon-glow-wrapper, vignette, arkaplan.jpg
- `sql/factory_jobs_migration.sql` — Factory jobs sütunu
- `public/images/factory/` — 10 adet fabrika ürün SVG'si
- `public/images/avatars/` — 20 adet profil avatarı
- `public/images/backgrounds/` — arkaplan, tarım, su, enerji, depo resimleri

## SQL
- `player_data` tablosu: water, energy, credits, inventory, pump_power, base_energy_production, crop_growth_modifier, water_efficiency, max_water_capacity, max_energy_capacity, unlocked_t3_factories, unlocked_prestige, pod_capacity, tier4_unlocked, research_state, factory_jobs, last_saved
