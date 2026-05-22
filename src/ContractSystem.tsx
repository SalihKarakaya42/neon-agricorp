import { useLanguage } from './i18n';
import { Clock, Award, TrendingUp, Package } from 'lucide-react';
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
  contractState: ContractState;
  onContractUpdate: (state: ContractState) => void;
  onCreditsChange: (credits: number) => void;
  onExpGain: (amount: number) => void;
  onNotification: (text: string, type: 'success' | 'alert' | 'info') => void;
}

const TIER_CONTRACTS: Record<number, Contract[]> = {
  1: [
    { id: 'contract-t1-1', name: 'Taze Mahsul', description: 'Temel gıda tedariki', requiredItems: { 'Raw Lettuce': 10 }, rewardCredits: 500, rewardExp: 50, timeLimit: 300, tier: 1 },
    { id: 'contract-t1-2', name: 'Kök Sebze', description: 'Nişasta bazlı ürün talebi', requiredItems: { 'Raw Starch': 8 }, rewardCredits: 600, rewardExp: 60, timeLimit: 300, tier: 1 },
    { id: 'contract-t1-3', name: 'Hububat Sevkiyatı', description: 'Un bazı tedarik acil', requiredItems: { 'Raw Flour Base': 12 }, rewardCredits: 550, rewardExp: 55, timeLimit: 300, tier: 1 },
  ],
  2: [
    { id: 'contract-t2-1', name: 'İşlenmiş Gıda', description: 'Fabrika çıktısı talebi', requiredItems: { 'Flour Pack': 5, 'Potato Starch': 5 }, rewardCredits: 2000, rewardExp: 150, timeLimit: 600, tier: 2 },
    { id: 'contract-t2-2', name: 'Domates İşleme', description: 'Macun bazlı ürünler', requiredItems: { 'Raw Paste': 10 }, rewardCredits: 1800, rewardExp: 120, timeLimit: 600, tier: 2 },
    { id: 'contract-t2-3', name: 'Parlak Parti', description: 'Özel meyve talebi', requiredItems: { 'Glow Berry Batch': 3 }, rewardCredits: 2500, rewardExp: 200, timeLimit: 600, tier: 2 },
  ],
  3: [
    { id: 'contract-t3-1', name: 'Siber Ziyafet', description: 'Yüksek teknoloji gıda zinciri', requiredItems: { 'Cyber Pizza': 3, 'Nutrient Dough': 5 }, rewardCredits: 8000, rewardExp: 500, timeLimit: 900, tier: 3 },
    { id: 'contract-t3-2', name: 'Kuantum Tedarik', description: 'İleri düzey bileşen talebi', requiredItems: { 'Quantum Core': 2, 'Refined Gel': 5 }, rewardCredits: 10000, rewardExp: 600, timeLimit: 900, tier: 3 },
    { id: 'contract-t3-3', name: 'Tam Donanım', description: 'Tüm ürün gruplarından örnek', requiredItems: { 'Flour Pack': 3, 'Potato Starch': 3, 'Cyber Pizza': 1, 'Refined Gel': 2 }, rewardCredits: 12000, rewardExp: 750, timeLimit: 900, tier: 3 },
  ],
};

const RESOURCE_IMG: Record<string, string> = {
  'Raw Lettuce': '/images/hydro-lettuce.png',
  'Raw Starch': '/images/rad-potato.png',
  'Raw Flour Base': '/images/synthetic-wheat.png',
  'Raw Paste': '/images/neon-tomato.png',
  'Glow Berry Batch': '/images/glow-berry.png',
};

const ContractSystem: React.FC<ContractSystemProps> = ({ userId, inventory, contractState, onContractUpdate, onCreditsChange, onExpGain, onNotification }) => {
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

    const result = await syncWithServer('contract-validate', {
      userId,
      contractId: contractState.active.id,
      requiredItems: contractState.active.requiredItems,
      rewardCredits: contractState.active.rewardCredits,
      rewardExp: contractState.active.rewardExp,
    });

    if (result.success) {
      onCreditsChange(contractState.active.rewardCredits);
      onExpGain(contractState.active.rewardExp);
      onContractUpdate({ active: null, completedCount: contractState.completedCount + 1, expiresAt: null });
      onNotification(`Sözleşme tamamlandı! +${contractState.active.rewardCredits}₿ +${contractState.active.rewardExp} EXP`, 'success');
    } else {
      // Fallback: client-side completion
      onCreditsChange(contractState.active.rewardCredits);
      onExpGain(contractState.active.rewardExp);
      onContractUpdate({ active: null, completedCount: contractState.completedCount + 1, expiresAt: null });
      onNotification(`Sözleşme tamamlandı! +${contractState.active.rewardCredits}₿ +${contractState.active.rewardExp} EXP`, 'success');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider">MegaCorp Sözleşmeleri</span>
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-[#00f3ff]" />
          <span className="font-mono text-[9px] text-[#849495]">Seviye {tier}</span>
          <span className="font-mono text-[9px] text-[#849495]">|</span>
          <span className="font-mono text-[9px] text-[#849495]">{contractState.completedCount} tamam</span>
        </div>
      </div>

      {!contractState.active ? (
        <div className="glass-panel rounded-xl p-4 text-center">
          <Package className="w-8 h-8 text-[#3a494b] mx-auto mb-2" />
          <p className="font-mono text-[10px] text-[#849495]">Yeni sözleşme hazırlanıyor...</p>
        </div>
      ) : expired ? (
        <div className="glass-panel rounded-xl p-4 text-center border-l-2 border-l-red-500">
          <p className="font-mono text-[10px] text-red-400 font-bold uppercase">Süresi doldu</p>
          <p className="font-mono text-[9px] text-[#849495] mt-1">Yeni sözleşme bekleniyor...</p>
        </div>
      ) : (
        <div className={`glass-panel rounded-xl p-3.5 flex flex-col gap-3 border-l-2 ${canDeliver ? 'border-l-emerald-500' : 'border-l-[#00f3ff]'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-mono text-[11px] text-white font-bold">{contractState.active.name}</h4>
              <p className="font-mono text-[9px] text-[#849495] mt-0.5">{contractState.active.description}</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] text-[#00f3ff] font-bold">Kademe {contractState.active.tier}</span>
            </div>
          </div>

          {/* Gerekli ürünler */}
          <div className="bg-[#0e0e0f]/60 rounded-lg p-2.5">
            <span className="font-mono text-[8px] text-[#849495] uppercase tracking-wider">Gerekli Ürünler</span>
            <div className="flex flex-col gap-1.5 mt-1.5">
              {Object.entries(contractState.active.requiredItems).map(([item, qty]) => {
                const owned = inventory[item] || 0;
                const enough = owned >= qty;
                return (
                  <div key={item} className="flex items-center gap-2">
                    {RESOURCE_IMG[item] ? (
                      <img src={RESOURCE_IMG[item]} alt="" className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <span className="text-[10px]">📦</span>
                    )}
                    <span className="font-mono text-[9px] text-white/80 flex-1">{tname(item)}</span>
                    <span className={`font-mono text-[9px] font-bold ${enough ? 'text-emerald-400' : 'text-red-400'}`}>
                      {owned}/{qty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ödül + Süre */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#00f3ff]/10 px-2 py-0.5 rounded">
                <span className="font-mono text-[9px] text-[#00f3ff] font-bold">+{contractState.active.rewardCredits}₿</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                <span className="font-mono text-[9px] text-emerald-400 font-bold">+{contractState.active.rewardExp} EXP</span>
              </div>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#849495]" />
                <span className={`font-mono text-[9px] font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-[#849495]'}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Teslim butonu */}
          <button onClick={handleDeliver} disabled={!canDeliver}
            className={`w-full py-2 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
              canDeliver
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-neutral-800 text-[#3a494b] cursor-not-allowed'
            }`}>
            {canDeliver ? 'TESLİM ET' : 'YETERSİZ ÜRÜN'}
          </button>
        </div>
      )}

      {/* İstatistik */}
      <div className="glass-panel rounded-xl p-3 flex items-center gap-3">
        <TrendingUp className="w-4 h-4 text-[#00f3ff]" />
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-[#849495] uppercase">Tamamlanan Sözleşme</span>
            <span className="font-mono text-[10px] text-white font-bold">{contractState.completedCount}</span>
          </div>
          <div className="progress-bar-container mt-1">
            <div className="progress-bar-fill bg-gradient-to-r from-[#006b71] to-[#00f3ff]" style={{ width: `${Math.min(100, (contractState.completedCount / 9) * 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSystem;
export type { Contract, ContractState };
export { TIER_CONTRACTS };