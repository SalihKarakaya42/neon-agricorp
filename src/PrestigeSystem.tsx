import type React from 'react';
import { useLanguage } from './i18n';

interface PrestigeSystemProps {
  currentCredits: number;
  onCreditsChange: (newCredits: number) => void;
  onResetGame: () => void;
  onPermanentStatBoost: (statName: string, boostValue: number) => void;
  unlockedPrestigeLevel: number;
  researchState: { techs: { id: string; level: number; isResearched: boolean }[]; timers: { [key: string]: number } };
}

const PrestigeSystem: React.FC<PrestigeSystemProps> = ({ currentCredits, onCreditsChange, onResetGame, onPermanentStatBoost, unlockedPrestigeLevel, researchState }) => {
  const { t } = useLanguage();
  const cost = Math.round(50000 * Math.pow(unlockedPrestigeLevel + 1, 2));
  const canPrestige = currentCredits >= cost && researchState.techs.find(t => t.id === 'prestige-1' && t.isResearched);

  const initiatePrestige = () => {
    if (!canPrestige) return;
    onCreditsChange(currentCredits - cost);
    onPermanentStatBoost('baseEnergyProduction', 5);
    onResetGame();
    alert(`Prestige Cycle ${unlockedPrestigeLevel + 1} Completed!`);
  };

  return (
    <div className="glass-panel rounded-xl p-4 border-l-2 border-l-pink-500">
      <h3 className="font-mono text-[10px] text-pink-400 uppercase tracking-widest font-extrabold mb-2">{t('prestige.title')}</h3>
      <p className="text-xs text-[#b9cacb] mb-1">{t('prestige.currentLevel')}: <strong className="text-white">{unlockedPrestigeLevel}</strong></p>
      <p className="text-xs text-[#b9cacb] mb-1">{t('prestige.nextCost')}: <strong className="text-[#00f3ff]">{cost}</strong></p>
      <p className="text-[10px] text-[#b9cacb]/70 mb-1">{t('prestige.nextBonus')}</p>
      <button onClick={initiatePrestige} disabled={!canPrestige}
        className={`w-full py-2 mt-2 rounded font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
          canPrestige ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(255,36,228,0.3)] active:scale-95' : 'border border-white/10 text-[#3a494b] cursor-not-allowed'
        }`}>
        {canPrestige ? `${t('prestige.enterCycle')} ${unlockedPrestigeLevel + 1}` : t('prestige.prerequisitesNotMet')}
      </button>
    </div>
  );
};

export default PrestigeSystem;
