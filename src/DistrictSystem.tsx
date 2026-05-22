import { useState } from 'react';
import { useLanguage } from './i18n';
import { MapPin, KeyRound } from 'lucide-react';

interface District { id: string; name: string; bonus: string; bonusStat: string; bonusValue: number; cost: number; }

const ALL_DISTRICTS: District[] = [
  { id: 'humid-cave', name: 'Humid Cave', bonus: '+Su Verimi', bonusStat: 'waterEfficiency', bonusValue: 0.2, cost: 2000 },
  { id: 'reactor-zone', name: 'Reactor Zone', bonus: '+Enerji Üretimi', bonusStat: 'baseEnergyProduction', bonusValue: 5, cost: 4000 },
  { id: 'abandoned-lab', name: 'Abandoned Lab', bonus: '+Araştırma Hızı', bonusStat: 'researchSpeed', bonusValue: 0.15, cost: 8000 },
  { id: 'toxic-layer', name: 'Toxic Layer', bonus: 'Nadir Mutasyon', bonusStat: 'rareDropChance', bonusValue: 0.1, cost: 15000 },
  { id: 'megacorp-ruins', name: 'MegaCorp Ruins', bonus: 'Yüksek Risk/Ödül', bonusStat: 'blackMarketAccess', bonusValue: 1, cost: 30000 },
];

interface DistrictSystemProps { credits: number; onDistrictUnlock: (districtId: string, stat: string, value: number, cost: number) => void; }

const DistrictSystem: React.FC<DistrictSystemProps> = ({ credits, onDistrictUnlock }) => {
  const { t } = useLanguage();
  const [unlocked, setUnlocked] = useState<string[]>(['humid-cave']);
  const tname = (key: string) => t(`districts.${key}`) || key;

  const handleUnlock = (d: District) => {
    if (unlocked.includes(d.id) || credits < d.cost) return;
    onDistrictUnlock(d.id, d.bonusStat, d.bonusValue, d.cost);
    setUnlocked(prev => [...prev, d.id]);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest">{t('district.title')}</h3>

      <div className="flex flex-col gap-2">
        {ALL_DISTRICTS.map(d => {
          const isUnlocked = unlocked.includes(d.id);
          return (
            <div key={d.id} className={`glass-panel rounded-xl p-3 flex items-center justify-between ${isUnlocked ? 'border-l-2 border-l-green-500' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#0e0e0f] flex items-center justify-center border border-white/10">
                  {isUnlocked ? <MapPin className="w-4 h-4 text-[#00f3ff]" /> : <KeyRound className="w-4 h-4 text-[#849495]" />}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{tname(d.name)}</h4>
                  {isUnlocked ? (
                    <span className="text-[9px] font-mono text-green-400">+{d.bonusValue} {d.bonusStat}</span>
                  ) : (
                    <span className="text-[9px] font-mono text-[#849495]">{t('district.unlock')}: {d.cost}₿</span>
                  )}
                </div>
              </div>
              {!isUnlocked && (
                <button onClick={() => handleUnlock(d)} disabled={credits < d.cost}
                  className={`px-3 py-1.5 rounded font-mono text-[9px] font-bold uppercase cursor-pointer transition-all ${
                    credits >= d.cost ? 'bg-[#00f3ff] text-neutral-950' : 'border border-white/10 text-[#3a494b] cursor-not-allowed'
                  }`}>{t('district.unlock')}</button>
              )}
              {isUnlocked && <span className="text-[10px] font-mono text-green-400 font-bold">✓ {t('district.unlocked')}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DistrictSystem;
