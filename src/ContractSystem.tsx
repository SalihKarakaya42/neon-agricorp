import { useLanguage } from './i18n';
import { Clock, Award, TrendingUp, Package, Coins, Pizza, Atom, Diamond, ShieldCheck, Beaker, BoxSelect, Droplets } from 'lucide-react';
import { syncWithServer } from './syncService';

interface Contract {
  id: string;
  name: string;
  description: string;
  requiredItems: Record<string, number>;
  rewardCredits: number;
  rewardExp: number;
  timeLimit: number;
  tier: number;
}

interface ContractState {
  active: Contract | null;
  completedCount: number;
  expiresAt: number | null;
}

interface ContractSystemProps {
  userId: string;
  inventory: Record<string, number>;
  currentCredits: number;
  contractState: ContractState;
  onContractUpdate: (state: ContractState) => void;
  onCreditsChange: (credits: number) => void;
  onInventoryChange: (inventory: Record<string, number>) => void;
  onExpGain: (amount: number) => void;
  onNotification: (text: string, type: 'success' | 'alert' | 'info') => void;
}

const TIER_CONTRACTS: Record<number, Contract[]> = {
  1: [
    { id: 'contract-t1-1', name: 'Sektör-7 İaşesi', description: 'İşçi blokları için temel kalori paketi.', requiredItems: { 'Raw Lettuce': 15 }, rewardCredits: 800, rewardExp: 80, timeLimit: 300, tier: 1 },
    { id: 'contract-t1-2', name: 'Nişasta Sevkiyatı', description: 'Sentetik et laboratuvarları için ham madde.', requiredItems: { 'Raw Starch': 12 }, rewardCredits: 950, rewardExp: 100, timeLimit: 300, tier: 1 },
    { id: 'contract-t1-3', name: 'Un Rezervi', description: 'Alt katman fırınları için acil un takviyesi.', requiredItems: { 'Raw Flour Base': 20 }, rewardCredits: 1200, rewardExp: 120, timeLimit: 400, tier: 1 },
    { id: 'contract-t1-4', name: 'Biyo-Lümen Hasadı', description: 'Gece vardiyası işçileri için doğal aydınlatma meyvesi.', requiredItems: { 'Glow Berry Batch': 2 }, rewardCredits: 1500, rewardExp: 150, timeLimit: 300, tier: 1 },
    { id: 'contract-t1-5', name: 'Domates Konsantresi', description: 'Sıvı besin üretim hattı desteği.', requiredItems: { 'Raw Paste': 10 }, rewardCredits: 1100, rewardExp: 110, timeLimit: 300, tier: 1 },
  ],
  2: [
    { id: 'contract-t2-1', name: 'Mega-Pizza Zinciri', description: 'Üst katman restoranları için lüks pizza malzemesi.', requiredItems: { 'Cyber Pizza': 5, 'Raw Lettuce': 20 }, rewardCredits: 5500, rewardExp: 400, timeLimit: 600, tier: 2 },
    { id: 'contract-t2-2', name: 'Hamur Enjeksiyonu', description: 'Besin tüpleri için yüksek yoğunluklu hamur.', requiredItems: { 'Nutrient Dough': 10, 'Flour Pack': 5 }, rewardCredits: 4800, rewardExp: 350, timeLimit: 600, tier: 2 },
    { id: 'contract-t2-3', name: 'Kristalize Besin', description: 'Derin uzay madencileri için kompakt rasyon.', requiredItems: { 'Crystalized Nutrient': 8 }, rewardCredits: 6200, rewardExp: 450, timeLimit: 700, tier: 2 },
    { id: 'contract-t2-4', name: 'Rafine Jel Lojistiği', description: 'Sibernetik soğutma ve besleme jeli.', requiredItems: { 'Refined Gel': 12, 'Potato Starch': 10 }, rewardCredits: 7500, rewardExp: 500, timeLimit: 800, tier: 2 },
    { id: 'contract-t2-5', name: 'Biyo-Lümina Ekstraktı', description: 'İlaç sanayii için konsantre özüt.', requiredItems: { 'Lumina Extract': 5 }, rewardCredits: 5800, rewardExp: 400, timeLimit: 600, tier: 2 },
  ],
  3: [
    { id: 'contract-t3-1', name: 'Kuantum Çekirdek Ağı', description: 'Şehir ana bilgisayarı için işlemci yakıtı.', requiredItems: { 'Quantum Core': 5, 'Nano Coating': 2 }, rewardCredits: 25000, rewardExp: 1500, timeLimit: 1200, tier: 3 },
    { id: 'contract-t3-2', name: 'Void Kristal İletimi', description: 'Sıfır-noktası enerji araştırmaları.', requiredItems: { 'Void Crystal': 3, 'Void Essence': 10 }, rewardCredits: 35000, rewardExp: 2000, timeLimit: 1500, tier: 3 },
    { id: 'contract-t3-3', name: 'Nano-Kaplama İhalesi', description: 'Dış çeper kalkanları için zırh bileşeni.', requiredItems: { 'Nano Coating': 8, 'Nano Spores': 15 }, rewardCredits: 28000, rewardExp: 1800, timeLimit: 1200, tier: 3 },
    { id: 'contract-t3-4', name: 'Kuantum Serum Arzı', description: 'Elit koruma birlikleri için genetik stabilizatör.', requiredItems: { 'Quantum Serum': 5, 'Refined Gel': 20 }, rewardCredits: 42000, rewardExp: 2500, timeLimit: 1800, tier: 3 },
    { id: 'contract-t3-5', name: 'Tam Sistem Restorasyonu', description: 'Şehrin tüm gıda ve teknoloji ihtiyacı.', requiredItems: { 'Cyber Pizza': 10, 'Quantum Core': 2, 'Void Crystal': 1, 'Nano Coating': 3 }, rewardCredits: 60000, rewardExp: 5000, timeLimit: 3600, tier: 3 },
  ],
};

const RESOURCE_IMG: Record<string, string> = {
  'Raw Lettuce': '/images/hydro-lettuce.png',
  'Raw Starch': '/images/rad-potato.png',
  'Raw Flour Base': '/images/synthetic-wheat.png',
  'Raw Paste': '/images/neon-tomato.png',
  'Glow Berry Batch': '/images/glow-berry.png',
  'Lumina Extract': '/images/bio-lumina-fruit.svg',
  'Nano Spores': '/images/nano-orchid.svg',
  'Void Essence': '/images/void-melon.svg',
};

const ResourceIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 16 }) => {
  const iconProps = { size, className: "text-[#00f3ff]" };

  if (RESOURCE_IMG[name]) {
    return <img src={RESOURCE_IMG[name]} alt="" className="w-full h-full object-cover" />;
  }

  switch (name) {
    case 'Cyber Pizza': return <Pizza {...iconProps} />;
    case 'Nutrient Dough': return <BoxSelect {...iconProps} />;
    case 'Quantum Core': return <Atom {...iconProps} />;
    case 'Void Crystal': return <Diamond {...iconProps} />;
    case 'Nano Coating': return <ShieldCheck {...iconProps} />;
    case 'Quantum Serum': return <Beaker {...iconProps} className="text-emerald-400" />;
    case 'Refined Gel': return <Droplets {...iconProps} className="text-blue-400" />;
    case 'Flour Pack': return <Package {...iconProps} />;
    case 'Potato Starch': return <Package {...iconProps} />;
    case 'Crystalized Nutrient': return <Diamond {...iconProps} className="text-purple-400" />;
    default: return <Package {...iconProps} className="opacity-40" />;
  }
};

const ContractSystem: React.FC<ContractSystemProps> = ({ userId, inventory, currentCredits, contractState, onContractUpdate, onCreditsChange, onInventoryChange, onExpGain, onNotification }) => {
  const { t } = useLanguage();
  const tname = (key: string) => t(`crops.${key}`) || key;

  const tier = Math.min(3, Math.floor(contractState.completedCount / 3) + 1);
  const availableContracts = TIER_CONTRACTS[tier] || TIER_CONTRACTS[1];

  // Pick a random contract if none active
  if (!contractState.active) {
    const pick = availableContracts[Math.floor(Math.random() * availableContracts.length)];
    const newState: ContractState = {
      active: pick,
      completedCount: contractState.completedCount,
      expiresAt: pick.timeLimit > 0 ? Date.now() + pick.timeLimit * 1000 : null,
    };
    // Defer update to avoid setState during render
    setTimeout(() => onContractUpdate(newState), 0);
  }

  const canDeliver = contractState.active
    ? Object.entries(contractState.active.requiredItems).every(([item, qty]) => (inventory[item] || 0) >= qty)
    : false;

  const timeLeft = contractState.expiresAt ? Math.max(0, Math.ceil((contractState.expiresAt - Date.now()) / 1000)) : null;
  const expired = timeLeft !== null && timeLeft <= 0;

  const handleDeliver = async () => {
    if (!contractState.active || !canDeliver) return;

    const activeContract = contractState.active;

    const completeContract = () => {
      // Deduct items from inventory
      const newInv = { ...inventory };
      Object.entries(activeContract.requiredItems).forEach(([item, qty]) => {
        newInv[item] = (newInv[item] || 0) - qty;
        if (newInv[item] <= 0) delete newInv[item];
      });

      onInventoryChange(newInv);
      onCreditsChange(currentCredits + activeContract.rewardCredits);
      onExpGain(activeContract.rewardExp);
      onContractUpdate({ active: null, completedCount: contractState.completedCount + 1, expiresAt: null });
      onNotification(`Sözleşme tamamlandı! +${activeContract.rewardCredits}₿ +${activeContract.rewardExp} EXP`, 'success');
    };

    const result = await syncWithServer('contract-validate', {
      userId,
      contractId: activeContract.id,
      requiredItems: activeContract.requiredItems,
      rewardCredits: activeContract.rewardCredits,
      rewardExp: activeContract.rewardExp,
    });

    // Even if server fails (CORS error), complete locally to not block user
    completeContract();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0e0e0f]/80 rounded-t-lg border-x border-t border-[#00f3ff]/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#00f3ff] animate-pulse" />
          <span className="font-mono text-[10px] text-[#00f3ff] font-bold uppercase tracking-[0.2em]">MEGACORP CONTRACTS</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#00f3ff]" />
            <span className="font-mono text-[9px] text-[#849495] uppercase">Kademe {tier}</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
      </div>

      {!contractState.active ? (
        <div className="bg-[#0a0a0b]/90 border border-[#00f3ff]/10 rounded-b-lg p-8 text-center">
          <Package className="w-10 h-10 text-[#3a494b] mx-auto mb-3 opacity-20" />
          <p className="font-mono text-[10px] text-[#849495] uppercase tracking-widest">Yeni sözleşme şifreleniyor...</p>
        </div>
      ) : expired ? (
        <div className="bg-[#0a0a0b]/90 border border-red-500/20 rounded-b-lg p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
          <p className="font-mono text-[11px] text-red-400 font-bold uppercase tracking-widest mb-4">VERİ İLETİMİ KESİLDİ: SÜRE DOLDU</p>
          <button
            onClick={() => onContractUpdate({ ...contractState, active: null, expiresAt: null })}
            className="relative z-10 w-full py-3 bg-red-500 text-neutral-950 font-mono text-[10px] font-bold uppercase rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            Sözleşmeyi Temizle & Yenile
          </button>
        </div>
      ) : (
        <div className={`relative overflow-hidden rounded-b-lg border-x border-b border-[#00f3ff]/10 bg-gradient-to-br from-[#0e0e0f] to-[#0a0a0b] p-4 flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]`}>
          {/* Neon side indicator */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${canDeliver ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.5)]'}`} />

          <div className="flex justify-between items-start pl-2">
            <div>
              <h4 className="font-mono text-[13px] text-white font-bold tracking-tight">{contractState.active.name}</h4>
              <p className="font-mono text-[9px] text-[#849495] mt-1 leading-relaxed max-w-[200px]">{contractState.active.description}</p>
            </div>
            {timeLeft !== null && (
              <div className="flex flex-col items-end gap-1 bg-[#131314] px-3 py-1.5 rounded-lg border border-white/5">
                <span className="font-mono text-[8px] text-[#849495] uppercase">Kalan Süre</span>
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3 h-3 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-[#00f3ff]'}`} />
                  <span className={`font-mono text-[11px] font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* REQUIRED ITEMS GRID */}
          <div className="grid grid-cols-1 gap-2 pl-2">
            <span className="font-mono text-[8px] text-[#849495] uppercase tracking-wider mb-1">Gerekli Kaynaklar</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(contractState.active.requiredItems).map(([item, qty]) => {
                const owned = inventory[item] || 0;
                const enough = owned >= qty;
                return (
                  <div key={item} className={`flex items-center gap-3 p-2 rounded-xl border ${enough ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5'} transition-colors`}>
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-[#0e0e0f]/80 flex-shrink-0">
                      <ResourceIcon name={item} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[9px] text-[#b9cacb] truncate uppercase">{tname(item)}</p>
                      <p className={`font-mono text-[10px] font-bold ${enough ? 'text-emerald-400' : 'text-red-400'}`}>
                        {owned}/{qty}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REWARDS & ACTION */}
          <div className="flex flex-col gap-3 mt-1 pl-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#131314] border border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[8px] text-[#849495] uppercase">Kredi Ödülü</span>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#00f3ff]" />
                    <span className="font-mono text-[12px] text-[#00f3ff] font-bold">+{contractState.active.rewardCredits}₿</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-white/5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[8px] text-[#849495] uppercase">Deneyim</span>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-[12px] text-emerald-400 font-bold">+{contractState.active.rewardExp}</span>
                  </div>
                </div>
              </div>

              <button onClick={handleDeliver} disabled={!canDeliver}
                className={`px-6 py-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                  canDeliver
                    ? 'bg-[#00f3ff] text-neutral-950 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)]'
                    : 'bg-neutral-800 text-[#3a494b] cursor-not-allowed grayscale'
                }`}>
                {canDeliver ? 'TESLİM ET' : 'YETERSİZ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROGRESS SECTION */}
      <div className="bg-[#0e0e0f]/40 border border-white/5 rounded-xl p-3 flex items-center gap-4">
        <TrendingUp className="w-5 h-5 text-[#00f3ff] opacity-50" />
        <div className="flex-1">
          <div className="flex justify-between items-end mb-1.5">
            <span className="font-mono text-[8px] text-[#849495] uppercase tracking-[0.1em]">Sektörel Operasyon İlerlemesi</span>
            <span className="font-mono text-[10px] text-white font-bold">{contractState.completedCount} TAMAM</span>
          </div>
          <div className="h-1.5 w-full bg-[#131314] rounded-full overflow-hidden p-[1px] border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#006b71] via-[#00f3ff] to-[#00f3ff] rounded-full shadow-[0_0_8px_rgba(0,243,255,0.5)] transition-all duration-1000"
              style={{ width: `${Math.min(100, (contractState.completedCount / 9) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSystem;
export type { Contract, ContractState };
export { TIER_CONTRACTS };